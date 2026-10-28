from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel, Field
from app.models.enums import CertificateStatus


class CertificateResponse(BaseModel):
    id: int
    certificate_id: str
    verification_token: str
    student_profile_id: int
    intern_name: str
    intern_id: str
    internship_domain: str
    company_name: str
    duration_weeks: int
    status: CertificateStatus
    issue_date: Optional[date] = None
    revocation_reason: Optional[str] = None
    revoked_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    verification_url: str
    qr_code_image_path: Optional[str] = None
    pdf_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CertificateRevokeRequest(BaseModel):
    reason: str = Field(..., min_length=5, description="Mandatory reason for certificate revocation")


class CertificateRejectRequest(BaseModel):
    reason: str = Field(..., min_length=5, description="Reason for rejection")


class PublicVerificationResponse(BaseModel):
    is_valid: bool
    status: CertificateStatus
    certificate_id: str
    verification_token: str
    intern_name: str
    intern_id: str
    internship_domain: str
    company_name: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    duration_weeks: int
    issue_date: Optional[date] = None
    authorized_signatory_name: str
    authorized_signatory_title: str
    company_contact_email: str
    company_website: str
    revoked_at: Optional[datetime] = None
    revocation_reason: Optional[str] = None


class CertificateAuditLogResponse(BaseModel):
    id: int
    certificate_id: int
    action: str
    performed_by_name: Optional[str] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True
