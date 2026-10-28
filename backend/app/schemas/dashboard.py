from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime


class AdminDashboardStats(BaseModel):
    total_interns: int
    active_internships: int
    pending_project_reviews: int
    pending_evaluations: int
    certificates_issued: int
    certificates_revoked: int
    certificates_pending: int
    domain_breakdown: dict
    recent_activities: List[dict]


class StudentDashboardStats(BaseModel):
    intern_name: str
    intern_id: str
    internship_domain: str
    duration_weeks: int
    profile_completion: int
    project_status: str
    evaluation_status: str
    overall_rating: Optional[float]
    certificate_status: str
    certificate_id: Optional[str]
    verification_token: Optional[str]
    can_download_certificate: bool
    profile_photo_url: Optional[str] = None

