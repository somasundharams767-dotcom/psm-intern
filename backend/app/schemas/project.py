from typing import Optional
from datetime import datetime
from pydantic import BaseModel, HttpUrl
from app.models.enums import ProjectStatus


class ProjectSubmit(BaseModel):
    title: str
    description: str
    domain: str
    technologies: str
    github_url: str
    live_demo_url: Optional[str] = None
    documentation_url: Optional[str] = None


class ProjectAdminUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    domain: Optional[str] = None
    technologies: Optional[str] = None
    github_url: Optional[str] = None
    live_demo_url: Optional[str] = None
    documentation_url: Optional[str] = None
    status: Optional[ProjectStatus] = None
    mentor_comments: Optional[str] = None


class ProjectResponse(BaseModel):
    id: int
    student_profile_id: int
    title: str
    description: str
    domain: str
    technologies: str
    github_url: str
    live_demo_url: Optional[str] = None
    documentation_url: Optional[str] = None
    status: ProjectStatus
    submission_date: Optional[datetime] = None
    mentor_comments: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
