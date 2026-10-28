import os
import secrets
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from app.db.session import get_db
from app.api.deps import get_current_admin
from app.core.security import get_password_hash
from app.models.user import User
from app.models.student_profile import StudentProfile
from app.models.internship import Internship
from app.models.project import Project
from app.models.mentor_evaluation import MentorEvaluation
from app.models.certificate import Certificate, CertificateAuditLog
from app.models.company_settings import CompanySettings
from app.models.enums import UserRole, CertificateStatus, ProjectStatus, EvaluationStatus, InternshipStatus
from app.schemas.dashboard import AdminDashboardStats
from app.schemas.student import StudentProfileResponse, AdminStudentProfileUpdate, AdminCreateInternRequest
from app.schemas.project import ProjectResponse, ProjectAdminUpdate
from app.schemas.evaluation import MentorEvaluationResponse, MentorEvaluationCreateOrUpdate
from app.schemas.certificate import (
    CertificateResponse,
    CertificateRevokeRequest,
    CertificateRejectRequest,
    CertificateAuditLogResponse,
)
from app.schemas.settings import CompanySettingsResponse, CompanySettingsUpdate
from app.services.pdf_service import generate_certificate_pdf
from app.services.qr_service import generate_qr_code
from app.core.config import settings

router = APIRouter()


@router.get("/dashboard", response_model=AdminDashboardStats)
def get_admin_dashboard(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    total_interns = db.query(StudentProfile).count()
    active_internships = db.query(Internship).filter(Internship.status == InternshipStatus.ACTIVE).count()
    pending_project_reviews = db.query(Project).filter(
        Project.status.in_([ProjectStatus.SUBMITTED, ProjectStatus.IN_PROGRESS])
    ).count()
    pending_evaluations = db.query(MentorEvaluation).filter(
        MentorEvaluation.status == EvaluationStatus.DRAFT
    ).count()
    certificates_issued = db.query(Certificate).filter(Certificate.status == CertificateStatus.ISSUED).count()
    certificates_revoked = db.query(Certificate).filter(Certificate.status == CertificateStatus.REVOKED).count()
    certificates_pending = db.query(Certificate).filter(
        Certificate.status.in_([CertificateStatus.PENDING, CertificateStatus.APPROVED])
    ).count()

    # Domain breakdown
    profiles = db.query(StudentProfile.internship_domain).all()
    domain_counts = {}
    for (d,) in profiles:
        domain = d or "General Engineering"
        domain_counts[domain] = domain_counts.get(domain, 0) + 1

    # Recent activity logs
    audit_logs = db.query(CertificateAuditLog).order_by(desc(CertificateAuditLog.timestamp)).limit(10).all()
    recent_activities = []
    for log in audit_logs:
        recent_activities.append({
            "id": log.id,
            "certificate_id": log.certificate_id,
            "action": log.action,
            "details": log.details,
            "timestamp": log.timestamp.isoformat(),
        })

    return AdminDashboardStats(
        total_interns=total_interns,
        active_internships=active_internships,
        pending_project_reviews=pending_project_reviews,
        pending_evaluations=pending_evaluations,
        certificates_issued=certificates_issued,
        certificates_revoked=certificates_revoked,
        certificates_pending=certificates_pending,
        domain_breakdown=domain_counts,
        recent_activities=recent_activities,
    )


@router.get("/interns")
def list_interns(
    query: Optional[str] = None,
    domain: Optional[str] = None,
    cert_status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    q = db.query(StudentProfile).join(User, StudentProfile.user_id == User.id)

    if query:
        search_filter = or_(
            User.full_name.ilike(f"%{query}%"),
            User.email.ilike(f"%{query}%"),
            StudentProfile.intern_id.ilike(f"%{query}%"),
        )
        q = q.filter(search_filter)

    if domain:
        q = q.filter(StudentProfile.internship_domain == domain)

    if cert_status:
        q = q.join(Certificate, StudentProfile.id == Certificate.student_profile_id).filter(
            Certificate.status == cert_status
        )

    total = q.count()
    profiles = q.order_by(desc(StudentProfile.created_at)).offset(skip).limit(limit).all()

    results = []
    for p in profiles:
        cert = db.query(Certificate).filter(Certificate.student_profile_id == p.id).first()
        proj = db.query(Project).filter(Project.student_profile_id == p.id).first()
        ev = db.query(MentorEvaluation).filter(MentorEvaluation.student_profile_id == p.id).first()

        results.append({
            "id": p.id,
            "user_id": p.user_id,
            "full_name": p.user.full_name,
            "email": p.user.email,
            "is_active": p.user.is_active,
            "intern_id": p.intern_id,
            "internship_domain": p.internship_domain,
            "start_date": p.start_date,
            "end_date": p.end_date,
            "duration_weeks": p.duration_weeks,
            "company_name": p.company_name,
            "mentor_name": p.mentor_name,
            "phone_number": p.phone_number,
            "college": p.college,
            "github_url": p.github_url,
            "completion_percentage": p.completion_percentage,
            "project_status": proj.status.value if proj else "not_started",
            "evaluation_status": ev.status.value if ev else "draft",
            "overall_rating": ev.overall_rating if ev else None,
            "certificate_status": cert.status.value if cert else "pending",
            "certificate_id": cert.certificate_id if cert else None,
            "verification_token": cert.verification_token if cert else None,
            "created_at": p.created_at,
        })

    return {"total": total, "items": results}


@router.post("/interns", status_code=status.HTTP_201_CREATED)
def create_intern(
    req: AdminCreateInternRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    existing = db.query(User).filter(User.email == req.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    # Generate intern ID if not provided
    intern_id = req.intern_id
    if not intern_id:
        year = datetime.now().year
        count = db.query(StudentProfile).count() + 101
        intern_id = f"PSM-{year}-INT-{count:04d}"

    user = User(
        email=req.email.lower(),
        hashed_password=get_password_hash(req.password),
        full_name=req.full_name.strip(),
        role=UserRole.STUDENT,
        is_active=True,
    )
    db.add(user)
    db.flush()

    today = datetime.now().date()
    start_d = req.start_date or (today - timedelta(days=60))
    end_d = req.end_date or (today + timedelta(days=24))

    profile = StudentProfile(
        user_id=user.id,
        intern_id=intern_id,
        internship_domain=req.internship_domain,
        start_date=start_d,
        end_date=end_d,
        duration_weeks=req.duration_weeks,
        company_name=req.company_name,
        mentor_name=req.mentor_name,
        college=req.college,
        phone_number=req.phone_number,
        github_url=req.github_url,
        completion_percentage=60,
    )
    db.add(profile)
    db.flush()

    internship = Internship(
        student_profile_id=profile.id,
        domain=req.internship_domain,
        start_date=start_d,
        end_date=end_d,
        status=InternshipStatus.ACTIVE,
        mentor_name=req.mentor_name,
    )
    db.add(internship)

    project = Project(
        student_profile_id=profile.id,
        title=f"{req.internship_domain} Capstone Project",
        description="Comprehensive enterprise capstone project assigned by company administration.",
        domain=req.internship_domain,
        technologies="Modern Tech Stack, REST APIs, Git, Cloud",
        github_url="https://github.com/example/capstone-repo",
        status=ProjectStatus.IN_PROGRESS,
    )
    db.add(project)

    eval_rec = MentorEvaluation(
        student_profile_id=profile.id,
        technical_skills=4,
        problem_solving=4,
        code_quality=4,
        communication=4,
        teamwork=4,
        overall_rating=4.0,
        feedback="Intern demonstrated reliable execution and solid foundation throughout the milestones.",
        mentor_name=req.mentor_name,
        status=EvaluationStatus.DRAFT,
    )
    db.add(eval_rec)

    # Unique certificate record
    year = datetime.now().year
    count = db.query(Certificate).count() + 1001
    cert_id = f"CERT-PSM-{year}-{count:05d}"
    verification_token = secrets.token_urlsafe(32)

    cert = Certificate(
        student_profile_id=profile.id,
        internship_id=internship.id,
        certificate_id=cert_id,
        verification_token=verification_token,
        status=CertificateStatus.PENDING,
    )
    db.add(cert)
    db.flush()

    audit = CertificateAuditLog(
        certificate_id=cert.id,
        action="admin_created_intern",
        performed_by_user_id=admin.id,
        details=f"Admin {admin.full_name} created intern profile {intern_id}.",
    )
    db.add(audit)

    db.commit()
    return {"message": "Intern created successfully", "intern_id": intern_id, "profile_id": profile.id}


@router.get("/interns/{profile_id}")
def get_intern_details(
    profile_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    profile = db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Intern profile not found")

    user = profile.user
    project = db.query(Project).filter(Project.student_profile_id == profile.id).first()
    evaluation = db.query(MentorEvaluation).filter(MentorEvaluation.student_profile_id == profile.id).first()
    certificate = db.query(Certificate).filter(Certificate.student_profile_id == profile.id).first()
    audit_logs = db.query(CertificateAuditLog).filter(CertificateAuditLog.certificate_id == certificate.id).all() if certificate else []

    return {
        "profile": {
            "id": profile.id,
            "user_id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "is_active": user.is_active,
            "intern_id": profile.intern_id,
            "internship_domain": profile.internship_domain,
            "start_date": profile.start_date,
            "end_date": profile.end_date,
            "duration_weeks": profile.duration_weeks,
            "company_name": profile.company_name,
            "mentor_name": profile.mentor_name,
            "phone_number": profile.phone_number,
            "college": profile.college,
            "bio": profile.bio,
            "github_url": profile.github_url,
            "completion_percentage": profile.completion_percentage,
            "created_at": profile.created_at,
        },
        "project": project,
        "evaluation": evaluation,
        "certificate": {
            "id": certificate.id if certificate else None,
            "certificate_id": certificate.certificate_id if certificate else None,
            "verification_token": certificate.verification_token if certificate else None,
            "status": certificate.status.value if certificate else "pending",
            "issue_date": certificate.issue_date if certificate else None,
            "revocation_reason": certificate.revocation_reason if certificate else None,
            "revoked_at": certificate.revoked_at if certificate else None,
            "rejection_reason": certificate.rejection_reason if certificate else None,
            "verification_url": f"{settings.FRONTEND_URL}/verify/{certificate.verification_token}" if certificate else None,
            "pdf_path": certificate.pdf_path if certificate else None,
        } if certificate else None,
        "audit_logs": [
            {
                "id": log.id,
                "action": log.action,
                "details": log.details,
                "timestamp": log.timestamp,
            }
            for log in audit_logs
        ],
    }


@router.put("/interns/{profile_id}")
def update_intern(
    profile_id: int,
    req: AdminStudentProfileUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    profile = db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Intern profile not found")

    user = profile.user
    if req.full_name is not None:
        user.full_name = req.full_name.strip()
    if req.email is not None:
        user.email = req.email.lower()
    if req.is_active is not None:
        user.is_active = req.is_active

    if req.intern_id is not None:
        # Check uniqueness if changed
        if req.intern_id != profile.intern_id:
            dup = db.query(StudentProfile).filter(StudentProfile.intern_id == req.intern_id).first()
            if dup:
                raise HTTPException(status_code=400, detail="Intern ID is already assigned to another intern")
            profile.intern_id = req.intern_id.strip()

    if req.internship_domain is not None:
        profile.internship_domain = req.internship_domain.strip()
    if req.start_date is not None:
        profile.start_date = req.start_date
    if req.end_date is not None:
        profile.end_date = req.end_date
    if req.duration_weeks is not None:
        profile.duration_weeks = req.duration_weeks
    if req.company_name is not None:
        profile.company_name = req.company_name.strip()
    if req.mentor_name is not None:
        profile.mentor_name = req.mentor_name.strip()
    if req.phone_number is not None:
        profile.phone_number = req.phone_number.strip()
    if req.college is not None:
        profile.college = req.college.strip()
    if req.bio is not None:
        profile.bio = req.bio.strip()
    if req.github_url is not None:
        profile.github_url = req.github_url.strip()

    db.commit()
    return {"message": "Intern details updated successfully"}


@router.delete("/interns/{profile_id}")
def deactivate_or_delete_intern(
    profile_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    profile = db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Intern profile not found")

    user = profile.user
    user.is_active = False
    db.commit()
    return {"message": f"Intern {profile.intern_id} has been deactivated"}


# Projects Management
@router.get("/projects")
def list_projects(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    q = db.query(Project).join(StudentProfile, Project.student_profile_id == StudentProfile.id).join(User, StudentProfile.user_id == User.id)

    if status_filter:
        q = q.filter(Project.status == status_filter)

    projects = q.all()
    results = []
    for p in projects:
        prof = p.student_profile
        results.append({
            "id": p.id,
            "student_profile_id": prof.id,
            "intern_name": prof.user.full_name,
            "intern_id": prof.intern_id,
            "title": p.title,
            "description": p.description,
            "domain": p.domain,
            "technologies": p.technologies,
            "github_url": p.github_url,
            "live_demo_url": p.live_demo_url,
            "documentation_url": p.documentation_url,
            "status": p.status.value,
            "submission_date": p.submission_date,
            "mentor_comments": p.mentor_comments,
            "updated_at": p.updated_at,
        })
    return results


@router.put("/projects/{project_id}")
def update_project_review(
    project_id: int,
    req: ProjectAdminUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if req.title is not None:
        project.title = req.title.strip()
    if req.description is not None:
        project.description = req.description.strip()
    if req.domain is not None:
        project.domain = req.domain.strip()
    if req.technologies is not None:
        project.technologies = req.technologies.strip()
    if req.github_url is not None:
        project.github_url = req.github_url.strip()
    if req.live_demo_url is not None:
        project.live_demo_url = req.live_demo_url.strip() if req.live_demo_url else None
    if req.documentation_url is not None:
        project.documentation_url = req.documentation_url.strip() if req.documentation_url else None
    if req.status is not None:
        project.status = req.status
    if req.mentor_comments is not None:
        project.mentor_comments = req.mentor_comments.strip()

    db.commit()
    db.refresh(project)
    return project


# Mentor Evaluations
@router.get("/evaluations/{student_profile_id}", response_model=MentorEvaluationResponse)
def get_evaluation(
    student_profile_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    evaluation = db.query(MentorEvaluation).filter(MentorEvaluation.student_profile_id == student_profile_id).first()
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation record not found")
    return evaluation


@router.put("/evaluations/{student_profile_id}", response_model=MentorEvaluationResponse)
def save_or_submit_evaluation(
    student_profile_id: int,
    req: MentorEvaluationCreateOrUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    profile = db.query(StudentProfile).filter(StudentProfile.id == student_profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    evaluation = db.query(MentorEvaluation).filter(MentorEvaluation.student_profile_id == student_profile_id).first()
    if not evaluation:
        evaluation = MentorEvaluation(student_profile_id=student_profile_id)
        db.add(evaluation)

    evaluation.technical_skills = req.technical_skills
    evaluation.problem_solving = req.problem_solving
    evaluation.code_quality = req.code_quality
    evaluation.communication = req.communication
    evaluation.teamwork = req.teamwork

    if req.overall_rating is not None:
        evaluation.overall_rating = req.overall_rating
    else:
        # Calculate mean
        mean_rating = (req.technical_skills + req.problem_solving + req.code_quality + req.communication + req.teamwork) / 5.0
        evaluation.overall_rating = round(mean_rating, 1)

    evaluation.feedback = req.feedback.strip()
    evaluation.mentor_name = req.mentor_name.strip()
    evaluation.status = req.status
    evaluation.evaluation_date = datetime.now(timezone.utc)

    db.commit()
    db.refresh(evaluation)
    return evaluation


# Certificate Management
@router.get("/certificates")
def list_certificates(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    q = db.query(Certificate).join(StudentProfile, Certificate.student_profile_id == StudentProfile.id).join(User, StudentProfile.user_id == User.id)

    if status_filter:
        q = q.filter(Certificate.status == status_filter)

    certs = q.order_by(desc(Certificate.updated_at)).all()
    results = []
    for c in certs:
        prof = c.student_profile
        user = prof.user
        verification_url = f"{settings.FRONTEND_URL}/verify/{c.verification_token}"
        results.append({
            "id": c.id,
            "certificate_id": c.certificate_id,
            "verification_token": c.verification_token,
            "student_profile_id": prof.id,
            "intern_name": user.full_name,
            "intern_id": prof.intern_id,
            "internship_domain": prof.internship_domain,
            "company_name": prof.company_name,
            "duration_weeks": prof.duration_weeks,
            "status": c.status.value,
            "issue_date": c.issue_date,
            "revocation_reason": c.revocation_reason,
            "revoked_at": c.revoked_at,
            "rejection_reason": c.rejection_reason,
            "verification_url": verification_url,
            "qr_code_image_path": c.qr_code_image_path,
            "pdf_path": c.pdf_path,
            "created_at": c.created_at,
            "updated_at": c.updated_at,
        })
    return results


@router.post("/certificates/{cert_id}/approve")
def approve_certificate(
    cert_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    cert.status = CertificateStatus.APPROVED
    cert.rejection_reason = None

    audit = CertificateAuditLog(
        certificate_id=cert.id,
        action="admin_approved",
        performed_by_user_id=admin.id,
        details=f"Admin {admin.full_name} approved certificate eligibility.",
    )
    db.add(audit)
    db.commit()
    return {"message": "Certificate approved for issuance"}


@router.post("/certificates/{cert_id}/reject")
def reject_certificate(
    cert_id: int,
    req: CertificateRejectRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    cert.status = CertificateStatus.REJECTED
    cert.rejection_reason = req.reason.strip()

    audit = CertificateAuditLog(
        certificate_id=cert.id,
        action="admin_rejected",
        performed_by_user_id=admin.id,
        details=f"Admin {admin.full_name} rejected certificate with reason: {req.reason.strip()}",
    )
    db.add(audit)
    db.commit()
    return {"message": "Certificate request rejected"}


@router.post("/certificates/{cert_id}/issue")
def issue_certificate(
    cert_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    if cert.status not in [CertificateStatus.APPROVED, CertificateStatus.ISSUED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Certificate cannot be issued because its status is {cert.status.value.upper()}. Only APPROVED certificates are eligible for issuance and QR code activation.",
        )

    profile = cert.student_profile
    user = profile.user
    company_settings = db.query(CompanySettings).first()

    today = datetime.now().date()
    cert.status = CertificateStatus.ISSUED
    cert.issue_date = today
    cert.issued_by_admin_id = admin.id
    cert.revocation_reason = None
    cert.revoked_at = None

    # Generate QR Code image
    qr_path = generate_qr_code(cert.verification_token)
    cert.qr_code_image_path = qr_path

    # Generate PDF certificate
    signatory_name = company_settings.authorized_signatory_name if company_settings else "Dr. Elena Vance"
    signatory_title = company_settings.authorized_signatory_title if company_settings else "Director of Internship & Talent"
    company_name = company_settings.company_name if company_settings else profile.company_name

    pdf_path = generate_certificate_pdf(
        certificate_id=cert.certificate_id,
        verification_token=cert.verification_token,
        intern_name=user.full_name,
        intern_id=profile.intern_id,
        internship_domain=profile.internship_domain,
        company_name=company_name,
        duration_weeks=profile.duration_weeks,
        start_date_str=profile.start_date.strftime("%B %d, %Y") if profile.start_date else "",
        end_date_str=profile.end_date.strftime("%B %d, %Y") if profile.end_date else "",
        issue_date_str=today.strftime("%B %d, %Y"),
        signatory_name=signatory_name,
        signatory_title=signatory_title,
    )
    cert.pdf_path = pdf_path

    audit = CertificateAuditLog(
        certificate_id=cert.id,
        action="admin_issued",
        performed_by_user_id=admin.id,
        details=f"Admin {admin.full_name} issued official certificate with ID {cert.certificate_id}.",
    )
    db.add(audit)
    db.commit()

    return {
        "message": "Certificate successfully generated and issued",
        "certificate_id": cert.certificate_id,
        "verification_token": cert.verification_token,
        "verification_url": f"{settings.FRONTEND_URL}/verify/{cert.verification_token}",
    }


@router.post("/certificates/{cert_id}/revoke")
def revoke_certificate(
    cert_id: int,
    req: CertificateRevokeRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    cert.status = CertificateStatus.REVOKED
    cert.revocation_reason = req.reason.strip()
    cert.revoked_at = datetime.now(timezone.utc)
    cert.revoked_by_admin_id = admin.id

    audit = CertificateAuditLog(
        certificate_id=cert.id,
        action="admin_revoked",
        performed_by_user_id=admin.id,
        details=f"Admin {admin.full_name} revoked certificate. Reason: {req.reason.strip()}",
    )
    db.add(audit)
    db.commit()

    return {"message": "Certificate has been officially revoked and verification updated"}


@router.post("/certificates/{cert_id}/reissue")
def reissue_certificate(
    cert_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    profile = cert.student_profile
    user = profile.user
    company_settings = db.query(CompanySettings).first()

    today = datetime.now().date()
    cert.status = CertificateStatus.ISSUED
    cert.issue_date = today
    cert.issued_by_admin_id = admin.id
    cert.revocation_reason = None
    cert.revoked_at = None

    signatory_name = company_settings.authorized_signatory_name if company_settings else "Dr. Elena Vance"
    signatory_title = company_settings.authorized_signatory_title if company_settings else "Director of Internship & Talent"
    company_name = company_settings.company_name if company_settings else profile.company_name

    pdf_path = generate_certificate_pdf(
        certificate_id=cert.certificate_id,
        verification_token=cert.verification_token,
        intern_name=user.full_name,
        intern_id=profile.intern_id,
        internship_domain=profile.internship_domain,
        company_name=company_name,
        duration_weeks=profile.duration_weeks,
        start_date_str=profile.start_date.strftime("%B %d, %Y") if profile.start_date else "",
        end_date_str=profile.end_date.strftime("%B %d, %Y") if profile.end_date else "",
        issue_date_str=today.strftime("%B %d, %Y"),
        signatory_name=signatory_name,
        signatory_title=signatory_title,
    )
    cert.pdf_path = pdf_path

    audit = CertificateAuditLog(
        certificate_id=cert.id,
        action="admin_reissued",
        performed_by_user_id=admin.id,
        details=f"Admin {admin.full_name} reissued certificate {cert.certificate_id}.",
    )
    db.add(audit)
    db.commit()

    return {"message": "Certificate reissued successfully"}


@router.get("/certificates/{cert_id}/download")
def admin_download_certificate(
    cert_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    profile = cert.student_profile
    user = profile.user

    # Generate PDF if missing
    if not cert.pdf_path or not os.path.exists(cert.pdf_path):
        company_settings = db.query(CompanySettings).first()
        signatory_name = company_settings.authorized_signatory_name if company_settings else "Dr. Elena Vance"
        signatory_title = company_settings.authorized_signatory_title if company_settings else "Director of Internship & Talent"

        issue_date_str = cert.issue_date.strftime("%B %d, %Y") if cert.issue_date else datetime.now().date().strftime("%B %d, %Y")
        pdf_path = generate_certificate_pdf(
            certificate_id=cert.certificate_id,
            verification_token=cert.verification_token,
            intern_name=user.full_name,
            intern_id=profile.intern_id,
            internship_domain=profile.internship_domain,
            company_name=profile.company_name,
            duration_weeks=profile.duration_weeks,
            start_date_str=profile.start_date.strftime("%B %d, %Y") if profile.start_date else "",
            end_date_str=profile.end_date.strftime("%B %d, %Y") if profile.end_date else "",
            issue_date_str=issue_date_str,
            signatory_name=signatory_name,
            signatory_title=signatory_title,
        )
        cert.pdf_path = pdf_path
        db.commit()

    return FileResponse(
        cert.pdf_path,
        media_type="application/pdf",
        filename=f"PSM_Certificate_{cert.certificate_id}.pdf"
    )


@router.get("/certificates/{cert_id}/qr")
def download_qr_image(
    cert_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    qr_path = generate_qr_code(cert.verification_token)
    return FileResponse(
        qr_path,
        media_type="image/png",
        filename=f"QR_{cert.certificate_id}.png"
    )


@router.get("/audit-logs")
def get_audit_logs(
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    logs = db.query(CertificateAuditLog).order_by(desc(CertificateAuditLog.timestamp)).limit(limit).all()
    results = []
    for l in logs:
        perf_name = l.performed_by.full_name if l.performed_by else "System / Public"
        results.append({
            "id": l.id,
            "certificate_id": l.certificate_id,
            "certificate_unique_id": l.certificate.certificate_id if l.certificate else None,
            "action": l.action,
            "performed_by": perf_name,
            "details": l.details,
            "timestamp": l.timestamp,
        })
    return results


# Company Settings
@router.get("/settings", response_model=CompanySettingsResponse)
def get_company_settings(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    settings_obj = db.query(CompanySettings).first()
    if not settings_obj:
        settings_obj = CompanySettings()
        db.add(settings_obj)
        db.commit()
        db.refresh(settings_obj)
    return settings_obj


@router.put("/settings", response_model=CompanySettingsResponse)
def update_company_settings(
    req: CompanySettingsUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    settings_obj = db.query(CompanySettings).first()
    if not settings_obj:
        settings_obj = CompanySettings()
        db.add(settings_obj)

    if req.company_name is not None:
        settings_obj.company_name = req.company_name.strip()
    if req.logo_url is not None:
        settings_obj.logo_url = req.logo_url.strip()
    if req.contact_email is not None:
        settings_obj.contact_email = req.contact_email.lower()
    if req.contact_phone is not None:
        settings_obj.contact_phone = req.contact_phone.strip()
    if req.website_url is not None:
        settings_obj.website_url = req.website_url.strip()
    if req.authorized_signatory_name is not None:
        settings_obj.authorized_signatory_name = req.authorized_signatory_name.strip()
    if req.authorized_signatory_title is not None:
        settings_obj.authorized_signatory_title = req.authorized_signatory_title.strip()
    if req.certificate_template_title is not None:
        settings_obj.certificate_template_title = req.certificate_template_title.strip()

    db.commit()
    db.refresh(settings_obj)
    return settings_obj
