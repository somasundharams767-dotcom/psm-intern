from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.enums import CertificateStatus


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    student_profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), unique=True, nullable=False)
    internship_id = Column(Integer, ForeignKey("internships.id", ondelete="SET NULL"), nullable=True)

    # Unique public certificate ID (e.g. CERT-PSM-2026-XXXX)
    certificate_id = Column(String(64), unique=True, index=True, nullable=False)

    # Unique unguessable verification token for public URL lookup
    verification_token = Column(String(128), unique=True, index=True, nullable=False)

    status = Column(Enum(CertificateStatus), default=CertificateStatus.PENDING, nullable=False)
    issue_date = Column(Date, nullable=True)
    
    # Revocation & Rejection fields
    revocation_reason = Column(Text, nullable=True)
    revoked_at = Column(DateTime, nullable=True)
    revoked_by_admin_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    rejection_reason = Column(Text, nullable=True)

    # Issued by admin
    issued_by_admin_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Generated asset paths
    qr_code_image_path = Column(String(512), nullable=True)
    pdf_path = Column(String(512), nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    student_profile = relationship("StudentProfile", back_populates="certificate")
    internship = relationship("Internship", back_populates="certificates")
    issued_by_admin = relationship("User", foreign_keys=[issued_by_admin_id], back_populates="issued_certificates")
    revoked_by_admin = relationship("User", foreign_keys=[revoked_by_admin_id], back_populates="revoked_certificates")
    audit_logs = relationship("CertificateAuditLog", back_populates="certificate", cascade="all, delete-orphan", order_by="desc(CertificateAuditLog.timestamp)")


class CertificateAuditLog(Base):
    __tablename__ = "certificate_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    certificate_id = Column(Integer, ForeignKey("certificates.id", ondelete="CASCADE"), nullable=False)
    action = Column(String(64), nullable=False)  # request, approve, issue, revoke, reissue, reject, pdf_download, verify_view
    performed_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(64), nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    certificate = relationship("Certificate", back_populates="audit_logs")
    performed_by = relationship("User", back_populates="audit_logs")
