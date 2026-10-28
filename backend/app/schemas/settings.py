from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr


class CompanySettingsUpdate(BaseModel):
    company_name: Optional[str] = None
    logo_url: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    website_url: Optional[str] = None
    authorized_signatory_name: Optional[str] = None
    authorized_signatory_title: Optional[str] = None
    certificate_template_title: Optional[str] = None


class CompanySettingsResponse(BaseModel):
    id: int
    company_name: str
    logo_url: Optional[str] = None
    contact_email: str
    contact_phone: Optional[str] = None
    website_url: str
    authorized_signatory_name: str
    authorized_signatory_title: str
    certificate_template_title: str
    updated_at: datetime

    class Config:
        from_attributes = True
