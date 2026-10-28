from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.enums import ProjectStatus


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    student_profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), unique=True, nullable=False)

    title = Column(String(255), default="Internship Capstone Project", nullable=False)
    description = Column(Text, default="Comprehensive full-stack capstone project implemented during internship.", nullable=False)
    domain = Column(String(128), default="Full Stack Web Development", nullable=False)
    technologies = Column(String(512), default="React, TypeScript, FastAPI, PostgreSQL, Tailwind CSS", nullable=False)
    github_url = Column(String(512), default="https://github.com/example/internship-project", nullable=False)
    live_demo_url = Column(String(512), nullable=True)
    documentation_url = Column(String(512), nullable=True)

    status = Column(Enum(ProjectStatus), default=ProjectStatus.IN_PROGRESS, nullable=False)
    submission_date = Column(DateTime, nullable=True)
    mentor_comments = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    student_profile = relationship("StudentProfile", back_populates="project")
