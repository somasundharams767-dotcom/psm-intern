from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.enums import EvaluationStatus


class MentorEvaluationCreateOrUpdate(BaseModel):
    technical_skills: int = Field(..., ge=1, le=5)
    problem_solving: int = Field(..., ge=1, le=5)
    code_quality: int = Field(..., ge=1, le=5)
    communication: int = Field(..., ge=1, le=5)
    teamwork: int = Field(..., ge=1, le=5)
    overall_rating: Optional[float] = Field(None, ge=1.0, le=5.0)
    feedback: str = Field(..., min_length=10)
    mentor_name: str = Field(..., min_length=2)
    status: EvaluationStatus = EvaluationStatus.SUBMITTED


class MentorEvaluationResponse(BaseModel):
    id: int
    student_profile_id: int
    technical_skills: int
    problem_solving: int
    code_quality: int
    communication: int
    teamwork: int
    overall_rating: float
    feedback: str
    mentor_name: str
    status: EvaluationStatus
    evaluation_date: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
