import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from PIL import Image
from app.db.session import get_db
from app.api.deps import get_current_student
from app.models.user import User
from app.models.student_profile import StudentProfile
from app.models.project import Project
from app.models.mentor_evaluation import MentorEvaluation
from app.models.certificate import Certificate, CertificateAuditLog
from app.models.company_settings import CompanySettings
from app.models.enums import CertificateStatus, ProjectStatus
from app.schemas.student import StudentProfileResponse, StudentProfileUpdate, FullStudentInfoResponse
from app.schemas.project import ProjectResponse, ProjectSubmit
from app.schemas.evaluation import MentorEvaluationResponse
from app.schemas.certificate import CertificateResponse
from app.schemas.dashboard import StudentDashboardStats
from app.services.pdf_service import generate_certificate_pdf
from app.services.qr_service import generate_qr_code, generate_profile_qr_code
from app.core.config import settings

router = APIRouter()


@router.get("/dashboard", response_model=StudentDashboardStats)
def get_student_dashboard(
    db: Session = Depends(get_db),
    current_student: User = Depends(get_current_student),
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_student.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    project = db.query(Project).filter(Project.student_profile_id == profile.id).first()
    eval_record = db.query(MentorEvaluation).filter(MentorEvaluation.student_profile_id == profile.id).first()
    cert = db.query(Certificate).filter(Certificate.student_profile_id == profile.id).first()

    return StudentDashboardStats(
        intern_name=current_student.full_name,
        intern_id=profile.intern_id,
        internship_domain=profile.internship_domain,
        duration_weeks=profile.duration_weeks,
        profile_completion=profile.completion_percentage,
        profile_photo_url=profile.profile_photo_url,
        project_status=project.status.value if project else "not_started",
        evaluation_status=eval_record.status.value if eval_record else "draft",
        overall_rating=eval_record.overall_rating if eval_record else None,
        certificate_status=cert.status.value if cert else "pending",
        certificate_id=cert.certificate_id if cert else None,
        verification_token=cert.verification_token if cert else None,
        can_download_certificate=(cert.status == CertificateStatus.ISSUED) if cert else False,
    )


@router.get("/profile", response_model=StudentProfileResponse)
def get_student_profile(
    db: Session = Depends(get_db),
    current_student: User = Depends(get_current_student),
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_student.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return StudentProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        full_name=current_student.full_name,
        email=current_student.email,
        intern_id=profile.intern_id,
        internship_domain=profile.internship_domain,
        start_date=profile.start_date,
        end_date=profile.end_date,
        duration_weeks=profile.duration_weeks,
        company_name=profile.company_name,
        mentor_name=profile.mentor_name,
        profile_photo_url=profile.profile_photo_url,
        phone_number=profile.phone_number,
        college=profile.college,
        bio=profile.bio,
        github_url=profile.github_url,
        completion_percentage=profile.completion_percentage,
        created_at=profile.created_at,
        updated_at=profile.updated_at,
    )


@router.put("/profile", response_model=StudentProfileResponse)
def update_student_profile(
    payload: StudentProfileUpdate,
    db: Session = Depends(get_db),
    current_student: User = Depends(get_current_student),
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_student.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    if payload.phone_number is not None:
        profile.phone_number = payload.phone_number.strip()
    if payload.college is not None:
        profile.college = payload.college.strip()
    if payload.bio is not None:
        profile.bio = payload.bio.strip()
    if payload.profile_photo_url is not None:
        profile.profile_photo_url = payload.profile_photo_url.strip()
    if payload.github_url is not None:
        profile.github_url = payload.github_url.strip()

    # Recalculate profile completion percentage
    score = 30  # base
    if profile.phone_number:
        score += 15
    if profile.college:
        score += 15
    if profile.bio:
        score += 15
    if profile.github_url:
        score += 15
    if profile.profile_photo_url:
        score += 10
    profile.completion_percentage = min(score, 100)

    db.commit()
    db.refresh(profile)

    return StudentProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        full_name=current_student.full_name,
        email=current_student.email,
        intern_id=profile.intern_id,
        internship_domain=profile.internship_domain,
        start_date=profile.start_date,
        end_date=profile.end_date,
        duration_weeks=profile.duration_weeks,
        company_name=profile.company_name,
        mentor_name=profile.mentor_name,
        profile_photo_url=profile.profile_photo_url,
        phone_number=profile.phone_number,
        college=profile.college,
        bio=profile.bio,
        github_url=profile.github_url,
        completion_percentage=profile.completion_percentage,
        created_at=profile.created_at,
        updated_at=profile.updated_at,
    )


@router.get("/project", response_model=ProjectResponse)
def get_student_project(
    db: Session = Depends(get_db),
    current_student: User = Depends(get_current_student),
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_student.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    project = db.query(Project).filter(Project.student_profile_id == profile.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project record not found")

    return project


@router.put("/project", response_model=ProjectResponse)
def submit_student_project(
    payload: ProjectSubmit,
    db: Session = Depends(get_db),
    current_student: User = Depends(get_current_student),
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_student.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    project = db.query(Project).filter(Project.student_profile_id == profile.id).first()
    if not project:
        project = Project(student_profile_id=profile.id)
        db.add(project)

    project.title = payload.title.strip()
    project.description = payload.description.strip()
    project.domain = payload.domain.strip()
    project.technologies = payload.technologies.strip()
    project.github_url = payload.github_url.strip()
    project.live_demo_url = payload.live_demo_url.strip() if payload.live_demo_url else None
    project.documentation_url = payload.documentation_url.strip() if payload.documentation_url else None
    project.status = ProjectStatus.SUBMITTED
    db.commit()
    db.refresh(project)

    return project


@router.get("/evaluation", response_model=MentorEvaluationResponse)
def get_student_evaluation(
    db: Session = Depends(get_db),
    current_student: User = Depends(get_current_student),
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_student.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    evaluation = db.query(MentorEvaluation).filter(MentorEvaluation.student_profile_id == profile.id).first()
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")

    return evaluation


@router.get("/certificate", response_model=CertificateResponse)
def get_student_certificate(
    db: Session = Depends(get_db),
    current_student: User = Depends(get_current_student),
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_student.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    cert = db.query(Certificate).filter(Certificate.student_profile_id == profile.id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    verification_url = f"{settings.FRONTEND_URL}/verify/{cert.verification_token}"

    return CertificateResponse(
        id=cert.id,
        certificate_id=cert.certificate_id,
        verification_token=cert.verification_token,
        student_profile_id=profile.id,
        intern_name=current_student.full_name,
        intern_id=profile.intern_id,
        internship_domain=profile.internship_domain,
        company_name=profile.company_name,
        duration_weeks=profile.duration_weeks,
        status=cert.status,
        issue_date=cert.issue_date,
        revocation_reason=cert.revocation_reason,
        revoked_at=cert.revoked_at,
        rejection_reason=cert.rejection_reason,
        verification_url=verification_url,
        qr_code_image_path=cert.qr_code_image_path,
        pdf_path=cert.pdf_path,
        created_at=cert.created_at,
        updated_at=cert.updated_at,
    )


@router.get("/certificate/download")
def download_student_certificate(
    db: Session = Depends(get_db),
    current_student: User = Depends(get_current_student),
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_student.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    cert = db.query(Certificate).filter(Certificate.student_profile_id == profile.id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    if cert.status != CertificateStatus.ISSUED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Certificate cannot be downloaded because its status is {cert.status.value.upper()}. Only ISSUED certificates can be downloaded.",
        )

    # Ensure PDF exists or generate on-the-fly
    if not cert.pdf_path or not os.path.exists(cert.pdf_path):
        company_settings = db.query(CompanySettings).first()
        signatory_name = company_settings.authorized_signatory_name if company_settings else "Dr. Elena Vance"
        signatory_title = company_settings.authorized_signatory_title if company_settings else "Director of Internship & Talent"

        pdf_path = generate_certificate_pdf(
            certificate_id=cert.certificate_id,
            verification_token=cert.verification_token,
            intern_name=current_student.full_name,
            intern_id=profile.intern_id,
            internship_domain=profile.internship_domain,
            company_name=profile.company_name,
            duration_weeks=profile.duration_weeks,
            start_date_str=profile.start_date.strftime("%B %d, %Y") if profile.start_date else "",
            end_date_str=profile.end_date.strftime("%B %d, %Y") if profile.end_date else "",
            issue_date_str=cert.issue_date.strftime("%B %d, %Y") if cert.issue_date else "N/A",
            signatory_name=signatory_name,
            signatory_title=signatory_title,
        )
        cert.pdf_path = pdf_path
        db.commit()

    # Log audit entry
    audit = CertificateAuditLog(
        certificate_id=cert.id,
        action="student_pdf_download",
        performed_by_user_id=current_student.id,
        details=f"Student {current_student.full_name} downloaded issued certificate PDF.",
    )
    db.add(audit)
    db.commit()

    return FileResponse(
        cert.pdf_path,
        media_type="application/pdf",
        filename=f"PSM_Internship_Certificate_{cert.certificate_id}.pdf"
    )


@router.post("/profile/photo")
async def upload_student_profile_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_student: User = Depends(get_current_student),
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_student.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # 1. Validate file extension
    ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
    filename = file.filename or ""
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{ext}'. Allowed image formats are: JPG, JPEG, PNG, WEBP.",
        )

    # 2. Validate MIME type
    ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
    if file.content_type and file.content_type.lower() not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid content type '{file.content_type}'. Must be a valid image file.",
        )

    # 3. Read content and validate size (Max 5MB)
    MAX_SIZE = 5 * 1024 * 1024
    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the 5MB limit. Please upload an image under 5MB.",
        )
    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    # 4. Verify actual image payload using Pillow
    import io
    try:
        image = Image.open(io.BytesIO(content))
        image.verify()  # Verifies integrity without fully decoding
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is corrupted or not a valid image.",
        )

    # 5. Clean up previous uploaded avatar if it exists in local storage
    if profile.profile_photo_url and profile.profile_photo_url.startswith("/storage/avatars/"):
        old_filename = os.path.basename(profile.profile_photo_url)
        old_path = os.path.join(settings.AVATARS_DIR, old_filename)
        if os.path.exists(old_path):
            try:
                os.remove(old_path)
            except OSError:
                pass

    # 6. Save new avatar with unique safe filename
    safe_token = uuid.uuid4().hex[:10]
    safe_filename = f"avatar_{profile.intern_id}_{safe_token}{ext}"
    target_path = os.path.join(settings.AVATARS_DIR, safe_filename)

    with open(target_path, "wb") as f:
        f.write(content)

    # 7. Update database record
    avatar_url = f"/storage/avatars/{safe_filename}"
    profile.profile_photo_url = avatar_url

    # Update completion percentage if not already scored
    score = 40
    if profile.phone_number:
        score += 15
    if profile.college:
        score += 15
    if profile.bio:
        score += 15
    if profile.profile_photo_url:
        score += 15
    profile.completion_percentage = min(score, 100)

    db.commit()
    db.refresh(profile)

    return {
        "message": "Profile photo uploaded successfully.",
        "profile_photo_url": avatar_url,
        "completion_percentage": profile.completion_percentage,
    }


@router.delete("/profile/photo")
def delete_student_profile_photo(
    db: Session = Depends(get_db),
    current_student: User = Depends(get_current_student),
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_student.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    if profile.profile_photo_url and profile.profile_photo_url.startswith("/storage/avatars/"):
        old_filename = os.path.basename(profile.profile_photo_url)
        old_path = os.path.join(settings.AVATARS_DIR, old_filename)
        if os.path.exists(old_path):
            try:
                os.remove(old_path)
            except OSError:
                pass

    profile.profile_photo_url = None

    # Recalculate completion score
    score = 40
    if profile.phone_number:
        score += 15
    if profile.college:
        score += 15
    if profile.bio:
        score += 15
    profile.completion_percentage = min(score, 100)

    db.commit()
    db.refresh(profile)

    return {
        "message": "Profile photo removed successfully.",
        "profile_photo_url": None,
        "completion_percentage": profile.completion_percentage,
    }


@router.get("/profile/qr")
def get_student_own_profile_qr(
    db: Session = Depends(get_db),
    current_student: User = Depends(get_current_student),
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_student.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    qr_path = generate_profile_qr_code(profile.intern_id)
    if not os.path.exists(qr_path):
        raise HTTPException(status_code=500, detail="Failed to generate student profile QR code")

    return FileResponse(
        qr_path,
        media_type="image/png",
        filename=f"student_profile_qr_{profile.intern_id}.png",
        headers={"Content-Disposition": f'inline; filename="student_profile_qr_{profile.intern_id}.png"'}
    )


@router.get("/certificate/qr")
def get_student_own_certificate_qr(
    db: Session = Depends(get_db),
    current_student: User = Depends(get_current_student),
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_student.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    cert = db.query(Certificate).filter(Certificate.student_profile_id == profile.id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    qr_path = generate_qr_code(cert.verification_token)
    if not os.path.exists(qr_path):
        raise HTTPException(status_code=500, detail="Failed to generate certificate QR code")

    return FileResponse(
        qr_path,
        media_type="image/png",
        filename=f"certificate_qr_{cert.certificate_id}.png",
        headers={"Content-Disposition": f'inline; filename="certificate_qr_{cert.certificate_id}.png"'}
    )
