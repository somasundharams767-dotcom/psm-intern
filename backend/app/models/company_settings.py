from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from app.db.session import Base


class CompanySettings(Base):
    __tablename__ = "company_settings"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), default="PSM Technologies Inc.", nullable=False)
    logo_url = Column(String(512), default="/psm-logo.svg", nullable=True)
    contact_email = Column(String(255), default="contact@psmintern.com", nullable=False)
    contact_phone = Column(String(64), default="+1 (800) 555-0199", nullable=True)
    website_url = Column(String(255), default="https://psmintern.com", nullable=False)
    authorized_signatory_name = Column(String(255), default="Dr. Elena Vance", nullable=False)
    authorized_signatory_title = Column(String(255), default="Director of Internship & Talent", nullable=False)
    certificate_template_title = Column(String(255), default="Certificate of Internship Completion", nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
