import os
import secrets
from datetime import datetime, date, timedelta, timezone
from sqlalchemy.orm import Session
from app.db.session import engine, Base, SessionLocal
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.enums import UserRole, CertificateStatus, ProjectStatus, EvaluationStatus, InternshipStatus
from app.models.user import User
from app.models.student_profile import StudentProfile
from app.models.internship import Internship
from app.models.project import Project
from app.models.mentor_evaluation import MentorEvaluation
from app.models.certificate import Certificate, CertificateAuditLog
from app.models.company_settings import CompanySettings
from app.services.qr_service import generate_qr_code
from app.services.pdf_service import generate_certificate_pdf


def init_db(db: Session) -> None:
    # Create all tables
    Base.metadata.create_all(bind=engine)

    # 1. Company Settings
    company = db.query(CompanySettings).first()
    if not company:
        company = CompanySettings(
            company_name="PSM Technologies Inc.",
            logo_url="/psm-logo.svg",
            contact_email="contact@psmintern.com",
            contact_phone="+1 (800) 555-0199",
            website_url="https://psmintern.com",
            authorized_signatory_name="Dr. Elena Vance",
            authorized_signatory_title="Director of Internship & Talent",
            certificate_template_title="Certificate of Internship Completion",
        )
        db.add(company)
        db.commit()
        db.refresh(company)

    # 2. Initial Administrator
    admin = db.query(User).filter(User.email == settings.INITIAL_ADMIN_EMAIL.lower()).first()
    if not admin:
        admin = User(
            email=settings.INITIAL_ADMIN_EMAIL.lower(),
            hashed_password=get_password_hash(settings.INITIAL_ADMIN_PASSWORD),
            full_name=settings.INITIAL_ADMIN_NAME,
            role=UserRole.ADMIN,
            is_active=True,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print(f"[BOOTSTRAP] Administrator created: {admin.email}")
    else:
        print(f"[BOOTSTRAP] Administrator already exists: {admin.email}")

    # 3. Seed demonstration students if database is empty of students
    student_count = db.query(User).filter(User.role == UserRole.STUDENT).count()
    if student_count == 0:
        print("[BOOTSTRAP] Seeding demonstration interns across different verification states...")
        today = datetime.now().date()

        seed_interns = [
            {
                "full_name": "Aarav Sharma",
                "email": "student@psmintern.com",
                "password": "Student@2026!",
                "intern_id": "PSM-2026-INT-0101",
                "domain": "Full Stack Web Development",
                "start_date": today - timedelta(days=90),
                "end_date": today - timedelta(days=6),
                "duration_weeks": 12,
                "college": "National Institute of Technology",
                "phone": "+1 555-0144",
                "bio": "Passionate full-stack developer with keen interest in cloud-native applications and verification algorithms.",
                "proj_title": "Enterprise Microservices Verification Platform",
                "proj_desc": "Built an asynchronous cryptographic certificate issuance and verification engine using FastAPI, React, and Redis.",
                "tech": "FastAPI, React 19, TypeScript, Tailwind CSS, PostgreSQL, Docker",
                "github": "https://github.com/aaravsharma/intern-verification-core",
                "demo": "https://aarav-verification.demo.psmintern.com",
                "proj_status": ProjectStatus.COMPLETED,
                "mentor_comments": "Exceptional delivery. All functional and security requirements met ahead of schedule.",
                "skills": 5, "ps": 5, "cq": 5, "comm": 5, "tw": 5, "rating": 5.0,
                "feedback": "Outstanding candidate. Excellent mastery over backend architecture and security practices.",
                "cert_status": CertificateStatus.ISSUED,
                "cert_id": "CERT-PSM-2026-987654",
                "token": "psm-verify-aarav-2026-valid-token-alpha",
                "issue_offset": -5,
            },
            {
                "full_name": "Priya Patel",
                "email": "priya.patel@example.com",
                "password": "Intern@2026!",
                "intern_id": "PSM-2026-INT-0102",
                "domain": "AI & Machine Learning",
                "start_date": today - timedelta(days=75),
                "end_date": today + timedelta(days=9),
                "duration_weeks": 12,
                "college": "University College of Technology",
                "phone": "+1 555-0182",
                "bio": "ML engineer focusing on document authenticity detection and computer vision.",
                "proj_title": "Automated Document Authenticity Classifier",
                "proj_desc": "Trained lightweight convolutional neural network for digital watermark validation and tamper detection.",
                "tech": "PyTorch, OpenCV, FastAPI, Python",
                "github": "https://github.com/priyapatel/doc-authenticity-ml",
                "demo": "https://priya-ml.demo.psmintern.com",
                "proj_status": ProjectStatus.SUBMITTED,
                "mentor_comments": "Model benchmarks are solid. Please add cross-validation documentation.",
                "skills": 5, "ps": 4, "cq": 4, "comm": 4, "tw": 5, "rating": 4.4,
                "feedback": "Strong algorithmic thinking and proactive engagement with the data science team.",
                "cert_status": CertificateStatus.APPROVED,
                "cert_id": "CERT-PSM-2026-987655",
                "token": "psm-verify-priya-2026-approved-token-beta",
                "issue_offset": None,
            },
            {
                "full_name": "Marcus Vance",
                "email": "marcus.vance@example.com",
                "password": "Intern@2026!",
                "intern_id": "PSM-2026-INT-0103",
                "domain": "Cybersecurity & Cloud Systems",
                "start_date": today - timedelta(days=120),
                "end_date": today - timedelta(days=36),
                "duration_weeks": 12,
                "college": "Metropolitan State University",
                "phone": "+1 555-0199",
                "bio": "Security researcher with focus on authorization flaws and tamper-proof logging.",
                "proj_title": "Zero-Trust API Gateway with Token Revocation",
                "proj_desc": "Implemented high-throughput distributed token revocation and rate limiting proxy.",
                "tech": "Go, Python, OAuth2, JWT, PostgreSQL",
                "github": "https://github.com/marcusv/zero-trust-gateway",
                "demo": None,
                "proj_status": ProjectStatus.NEEDS_REVISION,
                "mentor_comments": "Breached code integrity policies during final evaluation. Revocation invoked.",
                "skills": 3, "ps": 3, "cq": 2, "comm": 2, "tw": 2, "rating": 2.4,
                "feedback": "Failed to adhere to academic integrity guidelines in final milestone delivery.",
                "cert_status": CertificateStatus.REVOKED,
                "cert_id": "CERT-PSM-2026-987656",
                "token": "psm-verify-marcus-2026-revoked-token-gamma",
                "issue_offset": -30,
                "revoked_offset": -15,
                "revocation_reason": "Academic integrity violation identified during post-audit code review. Project repository contained uncredited proprietary modules.",
            },
        ]

        for s in seed_interns:
            user = User(
                email=s["email"],
                hashed_password=get_password_hash(s["password"]),
                full_name=s["full_name"],
                role=UserRole.STUDENT,
                is_active=True,
            )
            db.add(user)
            db.flush()

            profile = StudentProfile(
                user_id=user.id,
                intern_id=s["intern_id"],
                internship_domain=s["domain"],
                start_date=s["start_date"],
                end_date=s["end_date"],
                duration_weeks=s["duration_weeks"],
                company_name=company.company_name,
                mentor_name="Dr. Elena Vance" if s["domain"] != "AI & Machine Learning" else "Prof. Rajesh Sen",
                college=s["college"],
                phone_number=s["phone"],
                bio=s["bio"],
                github_url=s.get("student_github", f"https://github.com/{s['full_name'].lower().replace(' ', '')}"),
                completion_percentage=85,
            )
            db.add(profile)
            db.flush()

            internship = Internship(
                student_profile_id=profile.id,
                domain=s["domain"],
                start_date=s["start_date"],
                end_date=s["end_date"],
                status=InternshipStatus.COMPLETED if s["cert_status"] in [CertificateStatus.ISSUED, CertificateStatus.REVOKED] else InternshipStatus.ACTIVE,
                mentor_name=profile.mentor_name,
                mentor_email="mentor@psmintern.com",
            )
            db.add(internship)

            project = Project(
                student_profile_id=profile.id,
                title=s["proj_title"],
                description=s["proj_desc"],
                domain=s["domain"],
                technologies=s["tech"],
                github_url=s["github"],
                live_demo_url=s["demo"],
                status=s["proj_status"],
                submission_date=datetime.now(timezone.utc) - timedelta(days=10),
                mentor_comments=s["mentor_comments"],
            )
            db.add(project)

            evaluation = MentorEvaluation(
                student_profile_id=profile.id,
                technical_skills=s["skills"],
                problem_solving=s["ps"],
                code_quality=s["cq"],
                communication=s["comm"],
                teamwork=s["tw"],
                overall_rating=s["rating"],
                feedback=s["feedback"],
                mentor_name=profile.mentor_name,
                status=EvaluationStatus.SUBMITTED,
                evaluation_date=datetime.now(timezone.utc) - timedelta(days=8),
            )
            db.add(evaluation)

            issue_d = (today + timedelta(days=s["issue_offset"])) if s.get("issue_offset") is not None else None
            cert = Certificate(
                student_profile_id=profile.id,
                internship_id=internship.id,
                certificate_id=s["cert_id"],
                verification_token=s["token"],
                status=s["cert_status"],
                issue_date=issue_d,
                revocation_reason=s.get("revocation_reason"),
                revoked_at=(datetime.now(timezone.utc) + timedelta(days=s["revoked_offset"])) if s.get("revoked_offset") is not None else None,
                revoked_by_admin_id=admin.id if s.get("revocation_reason") else None,
                issued_by_admin_id=admin.id if s["cert_status"] in [CertificateStatus.ISSUED, CertificateStatus.REVOKED] else None,
            )
            db.add(cert)
            db.flush()

            # Pre-generate QR Code and PDF for issued and revoked certificate
            if s["cert_status"] in [CertificateStatus.ISSUED, CertificateStatus.REVOKED]:
                qr_path = generate_qr_code(cert.verification_token)
                pdf_path = generate_certificate_pdf(
                    certificate_id=cert.certificate_id,
                    verification_token=cert.verification_token,
                    intern_name=user.full_name,
                    intern_id=profile.intern_id,
                    internship_domain=profile.internship_domain,
                    company_name=company.company_name,
                    duration_weeks=profile.duration_weeks,
                    start_date_str=profile.start_date.strftime("%B %d, %Y"),
                    end_date_str=profile.end_date.strftime("%B %d, %Y"),
                    issue_date_str=issue_d.strftime("%B %d, %Y") if issue_d else "",
                    signatory_name=company.authorized_signatory_name,
                    signatory_title=company.authorized_signatory_title,
                )
                cert.qr_code_image_path = qr_path
                cert.pdf_path = pdf_path

            audit = CertificateAuditLog(
                certificate_id=cert.id,
                action="system_seed",
                performed_by_user_id=admin.id,
                details=f"Demonstration intern {profile.intern_id} seeded with status {s['cert_status'].value}.",
            )
            db.add(audit)

        db.commit()
        print("[BOOTSTRAP] Successfully seeded demonstration accounts.")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()
