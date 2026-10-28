import os
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.certificate import Certificate, CertificateAuditLog
from app.models.student_profile import StudentProfile
from app.models.project import Project
from app.models.company_settings import CompanySettings
from app.models.enums import CertificateStatus
from app.schemas.certificate import PublicVerificationResponse
from app.schemas.student import PublicStudentProfileResponse
from app.services.qr_service import generate_qr_code, generate_profile_qr_code
from app.core.config import settings

router = APIRouter()


@router.get("/verify/{verification_token}", response_model=PublicVerificationResponse)
def verify_certificate_public(
    verification_token: str,
    request: Request,
    db: Session = Depends(get_db),
):
    cert = db.query(Certificate).filter(Certificate.verification_token == verification_token).first()
    if not cert:
        # Also allow verifying by exact certificate_id
        cert = db.query(Certificate).filter(Certificate.certificate_id == verification_token).first()

    if not cert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate verification failed: No matching certificate record found in the official registry.",
        )

    profile = cert.student_profile
    user = profile.user
    settings_obj = db.query(CompanySettings).first()

    company_name = settings_obj.company_name if settings_obj else profile.company_name
    contact_email = settings_obj.contact_email if settings_obj else "contact@psmintern.com"
    website_url = settings_obj.website_url if settings_obj else "https://psmintern.com"
    signatory_name = settings_obj.authorized_signatory_name if settings_obj else "Dr. Elena Vance"
    signatory_title = settings_obj.authorized_signatory_title if settings_obj else "Director of Internship & Talent"

    is_valid = (cert.status == CertificateStatus.ISSUED)

    # Record public verification lookup in audit logs
    client_ip = request.client.host if request.client else None
    audit = CertificateAuditLog(
        certificate_id=cert.id,
        action="public_verification_view",
        performed_by_user_id=None,
        details=f"Public certificate lookup via token {verification_token[:8]}... Status: {cert.status.value.upper()}.",
        ip_address=client_ip,
    )
    db.add(audit)
    db.commit()

    return PublicVerificationResponse(
        is_valid=is_valid,
        status=cert.status,
        certificate_id=cert.certificate_id,
        verification_token=cert.verification_token,
        intern_name=user.full_name,
        intern_id=profile.intern_id,
        internship_domain=profile.internship_domain,
        company_name=company_name,
        start_date=profile.start_date,
        end_date=profile.end_date,
        duration_weeks=profile.duration_weeks,
        issue_date=cert.issue_date,
        authorized_signatory_name=signatory_name,
        authorized_signatory_title=signatory_title,
        company_contact_email=contact_email,
        company_website=website_url,
        revoked_at=cert.revoked_at,
        revocation_reason=cert.revocation_reason,
    )


@router.get("/certificates/{verification_token}/qr")
def get_public_certificate_qr(verification_token: str, db: Session = Depends(get_db)):
    """
    Publicly accessible endpoint that generates or returns the verified QR code image
    pointing to the certificate verification page. No authentication required.
    """
    cert = db.query(Certificate).filter(
        (Certificate.verification_token == verification_token) | (Certificate.certificate_id == verification_token)
    ).first()
    if not cert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Certificate matching '{verification_token}' was not found in the official registry.",
        )

    qr_path = generate_qr_code(cert.verification_token)
    if not os.path.exists(qr_path):
        raise HTTPException(status_code=404, detail="QR code could not be generated.")

    return FileResponse(qr_path, media_type="image/png", filename=f"QR_{cert.certificate_id}.png")


@router.get("/profile/{intern_id}", response_model=PublicStudentProfileResponse)
def get_public_student_profile(intern_id: str, db: Session = Depends(get_db)):
    """
    Public student verification endpoint. Displays only approved public information.
    Does NOT expose private emails, phone numbers, or passwords.
    """
    profile = db.query(StudentProfile).filter(StudentProfile.intern_id == intern_id).first()
    if not profile or not profile.user or not profile.user.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student profile with ID '{intern_id}' was not found or is currently inactive.",
        )

    project = db.query(Project).filter(Project.student_profile_id == profile.id).first()
    cert = db.query(Certificate).filter(Certificate.student_profile_id == profile.id).first()
    settings_obj = db.query(CompanySettings).first()

    company_name = settings_obj.company_name if settings_obj else profile.company_name
    contact_email = settings_obj.contact_email if settings_obj else "contact@psmintern.com"
    website_url = settings_obj.website_url if settings_obj else "https://psmintern.com"

    cert_status = cert.status.value if cert else None
    cert_id = cert.certificate_id if (cert and cert.status == CertificateStatus.ISSUED) else None
    cert_verify_url = f"{settings.FRONTEND_URL}/verify/{cert.verification_token}" if cert else None

    profile_verification_url = f"{settings.FRONTEND_URL}/profile/{profile.intern_id}"
    profile_qr_url = f"{settings.FRONTEND_URL}/api/v1/public/profile/{profile.intern_id}/qr"

    return PublicStudentProfileResponse(
        full_name=profile.user.full_name,
        intern_id=profile.intern_id,
        internship_domain=profile.internship_domain,
        company_name=company_name,
        duration_weeks=profile.duration_weeks,
        start_date=profile.start_date,
        end_date=profile.end_date,
        profile_photo_url=profile.profile_photo_url,
        college=profile.college,
        bio=profile.bio,
        student_github_url=profile.github_url,
        is_active=profile.user.is_active,
        project_title=project.title if project else None,
        project_description=project.description if project else None,
        project_technologies=project.technologies if project else None,
        project_status=project.status.value if project else None,
        github_url=project.github_url if project else None,
        live_demo_url=project.live_demo_url if project else None,
        documentation_url=project.documentation_url if project else None,
        certificate_status=cert_status,
        certificate_id=cert_id,
        certificate_verification_url=cert_verify_url,
        profile_verification_url=profile_verification_url,
        profile_qr_url=profile_qr_url,
        company_contact_email=contact_email,
        company_website=website_url,
    )


@router.get("/profile/{intern_id}/qr")
def get_public_profile_qr(intern_id: str, db: Session = Depends(get_db)):
    """
    Publicly accessible endpoint that generates or returns the unique QR code image
    pointing to the student's public profile page.
    """
    profile = db.query(StudentProfile).filter(StudentProfile.intern_id == intern_id).first()
    if not profile or not profile.user or not profile.user.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student profile with ID '{intern_id}' was not found.",
        )

    qr_path = generate_profile_qr_code(profile.intern_id)
    if not os.path.exists(qr_path):
        raise HTTPException(status_code=404, detail="Profile QR code could not be generated.")

    return FileResponse(qr_path, media_type="image/png", filename=f"Profile_QR_{profile.intern_id}.png")


@router.get("/company-contact")
def get_public_company_contact(db: Session = Depends(get_db)):
    settings_obj = db.query(CompanySettings).first()
    if not settings_obj:
        return {
            "company_name": "PSM Technologies Inc.",
            "contact_email": "contact@psmintern.com",
            "contact_phone": "+1 (800) 555-0199",
            "website_url": "https://psmintern.com",
            "logo_url": "/psm-logo.svg",
        }
    return {
        "company_name": settings_obj.company_name,
        "contact_email": settings_obj.contact_email,
        "contact_phone": settings_obj.contact_phone,
        "website_url": settings_obj.website_url,
        "logo_url": settings_obj.logo_url,
    }
