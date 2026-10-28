from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    # Official Intern identifier
    intern_id = Column(String(64), unique=True, index=True, nullable=False)

    # Internship details (controlled / approved by admin)
    internship_domain = Column(String(128), default="Full Stack Web Development", nullable=False)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    duration_weeks = Column(Integer, default=12, nullable=False)
    company_name = Column(String(255), default="PSM Technologies Inc.", nullable=False)
    mentor_name = Column(String(255), default="Dr. A. Sharma", nullable=False)

    # Student personal information
    profile_photo_url = Column(String(512), nullable=True)
    phone_number = Column(String(64), nullable=True)
    college = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    github_url = Column(String(512), nullable=True)
    completion_percentage = Column(Integer, default=30, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="student_profile")
    internships = relationship("Internship", back_populates="student_profile", cascade="all, delete-orphan")
    project = relationship("Project", back_populates="student_profile", uselist=False, cascade="all, delete-orphan")
    mentor_evaluation = relationship("MentorEvaluation", back_populates="student_profile", uselist=False, cascade="all, delete-orphan")
    certificate = relationship("Certificate", back_populates="student_profile", uselist=False, cascade="all, delete-orphan")
