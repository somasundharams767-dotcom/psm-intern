import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User
from app.models.student_profile import StudentProfile
from app.models.internship import Internship
from app.models.project import Project
from app.models.mentor_evaluation import MentorEvaluation
from app.models.certificate import Certificate, CertificateAuditLog
from app.models.enums import UserRole, CertificateStatus, ProjectStatus, EvaluationStatus, InternshipStatus
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    Token,
    UserResponse,
    PasswordResetRequest,
    PasswordResetConfirm,
    PasswordUpdate,
)
from app.api.deps import get_current_user

router = APIRouter()


def generate_unique_intern_id(db: Session) -> str:
    year = datetime.now().year
    count = db.query(StudentProfile).count() + 101
    intern_id = f"PSM-{year}-INT-{count:04d}"
    while db.query(StudentProfile).filter(StudentProfile.intern_id == intern_id).first():
        count += 1
        intern_id = f"PSM-{year}-INT-{count:04d}"
    return intern_id


def generate_unique_cert_id(db: Session) -> str:
    year = datetime.now().year
    count = db.query(Certificate).count() + 1001
    cert_id = f"CERT-PSM-{year}-{count:05d}"
    while db.query(Certificate).filter(Certificate.certificate_id == cert_id).first():
        count += 1
        cert_id = f"CERT-PSM-{year}-{count:05d}"
    return cert_id


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_student(user_in: UserRegister, db: Session = Depends(get_db)):
    if user_in.password != user_in.password_confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password and confirmation password do not match",
        )

    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists",
        )

    # Never allow registering as admin through public registration
    new_user = User(
        email=user_in.email.lower(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name.strip(),
        role=UserRole.STUDENT,
        is_active=True,
    )
    db.add(new_user)
    db.flush()

    # Generate initial student profile
    today = datetime.now().date()
    start_date = today - timedelta(days=60)
    end_date = today + timedelta(days=24)
    intern_id = generate_unique_intern_id(db)

    profile = StudentProfile(
        user_id=new_user.id,
        intern_id=intern_id,
        internship_domain="Full Stack Web Development",
        start_date=start_date,
        end_date=end_date,
        duration_weeks=12,
        company_name="PSM Technologies Inc.",
        mentor_name="Dr. A. Sharma",
        completion_percentage=45,
    )
    db.add(profile)
    db.flush()

    # Create associated default Internship record
    internship = Internship(
        student_profile_id=profile.id,
        domain="Full Stack Web Development",
        start_date=start_date,
        end_date=end_date,
        status=InternshipStatus.ACTIVE,
        mentor_name="Dr. A. Sharma",
        mentor_email="mentor.sharma@psmintern.com",
    )
    db.add(internship)
    db.flush()

    # Create associated Project record
    project = Project(
        student_profile_id=profile.id,
        title="Enterprise Certificate Verification Architecture",
        description="Developing a robust verification platform featuring cryptographic QR tokens, automated PDF certificate issuance, and role-based audit logging.",
        domain="Full Stack Web Development",
        technologies="React, TypeScript, FastAPI, PostgreSQL, Tailwind CSS",
        github_url="https://github.com/psm-intern/verification-portal",
        status=ProjectStatus.IN_PROGRESS,
    )
    db.add(project)

    # Create associated MentorEvaluation placeholder
    evaluation = MentorEvaluation(
        student_profile_id=profile.id,
        technical_skills=4,
        problem_solving=4,
        code_quality=4,
        communication=5,
        teamwork=5,
        overall_rating=4.4,
        feedback="Demonstrating solid commitment and strong proficiency in building modern web architectures.",
        mentor_name="Dr. A. Sharma",
        status=EvaluationStatus.DRAFT,
    )
    db.add(evaluation)

    # Create certificate record (Pending)
    cert_id = generate_unique_cert_id(db)
    token_str = secrets.token_urlsafe(32)
    certificate = Certificate(
        student_profile_id=profile.id,
        internship_id=internship.id,
        certificate_id=cert_id,
        verification_token=token_str,
        status=CertificateStatus.PENDING,
    )
    db.add(certificate)
    db.flush()

    # Add audit log
    audit_log = CertificateAuditLog(
        certificate_id=certificate.id,
        action="student_registered",
        performed_by_user_id=new_user.id,
        details=f"Student registered account and requested certificate eligibility.",
    )
    db.add(audit_log)

    db.commit()
    db.refresh(new_user)

    token = create_access_token(new_user.id, role=new_user.role.value)
    return Token(
        access_token=token,
        token_type="bearer",
        role=new_user.role,
        user_id=new_user.id,
        email=new_user.email,
        full_name=new_user.full_name,
    )


@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is deactivated. Please contact support.",
        )

    token = create_access_token(user.id, role=user.role.value)
    return Token(
        access_token=token,
        token_type="bearer",
        role=user.role,
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
    )


@router.post("/admin/login", response_model=Token)
def admin_login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect administrator credentials",
        )
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: administrative privileges required",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrator account is inactive",
        )

    token = create_access_token(user.id, role=user.role.value)
    return Token(
        access_token=token,
        token_type="bearer",
        role=user.role,
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
    )


@router.post("/forgot-password")
def forgot_password(req: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user:
        # Avoid user enumeration by returning standard positive response
        return {
            "message": "If this email exists in our system, password reset instructions have been generated.",
            "reset_token": None,
        }

    reset_token = secrets.token_urlsafe(32)
    user.reset_token = reset_token
    user.reset_token_expires_at = datetime.now(timezone.utc) + timedelta(hours=2)
    db.commit()

    return {
        "message": "Password reset token generated. In development, use this reset token to confirm your new password.",
        "reset_token": reset_token,
    }


@router.post("/reset-password")
def reset_password(req: PasswordResetConfirm, db: Session = Depends(get_db)):
    if req.new_password != req.new_password_confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match",
        )

    user = db.query(User).filter(User.reset_token == req.token).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token",
        )

    if user.reset_token_expires_at and user.reset_token_expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset token has expired",
        )

    user.hashed_password = get_password_hash(req.new_password)
    user.reset_token = None
    user.reset_token_expires_at = None
    db.commit()

    return {"message": "Password successfully reset. You may now log in with your new password."}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/change-password")
def change_password(
    req: PasswordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(req.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    current_user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    return {"message": "Password updated successfully"}
