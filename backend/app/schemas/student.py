from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel, EmailStr
from app.schemas.project import ProjectResponse
from app.schemas.evaluation import MentorEvaluationResponse


class StudentProfileUpdate(BaseModel):
    phone_number: Optional[str] = None
    college: Optional[str] = None
    bio: Optional[str] = None
    profile_photo_url: Optional[str] = None
    github_url: Optional[str] = None


class AdminStudentProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    intern_id: Optional[str] = None
    internship_domain: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    duration_weeks: Optional[int] = None
    company_name: Optional[str] = None
    mentor_name: Optional[str] = None
    phone_number: Optional[str] = None
    college: Optional[str] = None
    bio: Optional[str] = None
    github_url: Optional[str] = None
    is_active: Optional[bool] = None


class AdminCreateInternRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str = "Intern@2026!"
    intern_id: Optional[str] = None
    internship_domain: str = "Full Stack Web Development"
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    duration_weeks: int = 12
    company_name: str = "PSM Technologies Inc."
    mentor_name: str = "Dr. A. Sharma"
    college: Optional[str] = None
    phone_number: Optional[str] = None
    github_url: Optional[str] = None


class StudentProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    email: str
    intern_id: str
    internship_domain: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    duration_weeks: int
    company_name: str
    mentor_name: str
    profile_photo_url: Optional[str] = None
    phone_number: Optional[str] = None
    college: Optional[str] = None
    bio: Optional[str] = None
    github_url: Optional[str] = None
    completion_percentage: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FullStudentInfoResponse(BaseModel):
    profile: StudentProfileResponse
    project: Optional[ProjectResponse] = None
    evaluation: Optional[MentorEvaluationResponse] = None
    certificate_status: Optional[str] = None
    certificate_id: Optional[str] = None
    verification_token: Optional[str] = None


class PublicStudentProfileResponse(BaseModel):
    full_name: str
    intern_id: str
    internship_domain: str
    company_name: str
    duration_weeks: int
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    profile_photo_url: Optional[str] = None
    college: Optional[str] = None
    bio: Optional[str] = None
    student_github_url: Optional[str] = None
    is_active: bool
    # Public Project Summary
    project_title: Optional[str] = None
    project_description: Optional[str] = None
    project_technologies: Optional[str] = None
    project_status: Optional[str] = None
    github_url: Optional[str] = None
    live_demo_url: Optional[str] = None
    documentation_url: Optional[str] = None
    # Certificate Info
    certificate_status: Optional[str] = None
    certificate_id: Optional[str] = None
    certificate_verification_url: Optional[str] = None
    # Verification Anchors
    profile_verification_url: str
    profile_qr_url: str
    company_contact_email: str
    company_website: str

    class Config:
        from_attributes = True

