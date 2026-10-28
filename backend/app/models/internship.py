from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.enums import InternshipStatus


class Internship(Base):
    __tablename__ = "internships"

    id = Column(Integer, primary_key=True, index=True)
    student_profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)

    domain = Column(String(128), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(Enum(InternshipStatus), default=InternshipStatus.ACTIVE, nullable=False)
    mentor_name = Column(String(255), nullable=False)
    mentor_email = Column(String(255), nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    student_profile = relationship("StudentProfile", back_populates="internships")
    certificates = relationship("Certificate", back_populates="internship")
