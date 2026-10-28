from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.enums import EvaluationStatus


class MentorEvaluation(Base):
    __tablename__ = "mentor_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    student_profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), unique=True, nullable=False)

    technical_skills = Column(Integer, default=5, nullable=False)   # 1-5
    problem_solving = Column(Integer, default=5, nullable=False)    # 1-5
    code_quality = Column(Integer, default=5, nullable=False)       # 1-5
    communication = Column(Integer, default=5, nullable=False)      # 1-5
    teamwork = Column(Integer, default=5, nullable=False)           # 1-5

    overall_rating = Column(Float, default=5.0, nullable=False)
    feedback = Column(Text, default="Consistently demonstrated exceptional engineering rigor, problem solving, and collaborative team communication.", nullable=False)
    mentor_name = Column(String(255), default="Dr. A. Sharma", nullable=False)
    status = Column(Enum(EvaluationStatus), default=EvaluationStatus.SUBMITTED, nullable=False)
    evaluation_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    student_profile = relationship("StudentProfile", back_populates="mentor_evaluation")
