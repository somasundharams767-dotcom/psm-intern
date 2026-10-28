import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app

from app.db.session import Base, get_db
from app.core.config import settings

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_psm.db"
test_engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    from app.db.init_db import init_db
    db = TestingSessionLocal()
    init_db(db)
    db.close()
    yield
    Base.metadata.drop_all(bind=test_engine)


def test_public_root_and_health():
    res = client.get("/")
    assert res.status_code == 200
    assert "PSM.Intern" in res.json()["app"]

    health = client.get("/health")
    assert health.status_code == 200
    assert health.json()["status"] == "healthy"


def test_admin_login():
    res = client.post("/api/v1/auth/admin/login", json={
        "email": settings.INITIAL_ADMIN_EMAIL,
        "password": settings.INITIAL_ADMIN_PASSWORD,
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "admin"


def test_student_registration_and_login():
    res = client.post("/api/v1/auth/register", json={
        "email": "teststudent@example.com",
        "full_name": "Test Student",
        "password": "Password123!",
        "password_confirm": "Password123!",
    })
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "student"

    # Login with newly created student
    login_res = client.post("/api/v1/auth/login", json={
        "email": "teststudent@example.com",
        "password": "Password123!",
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    # Access student profile
    headers = {"Authorization": f"Bearer {token}"}
    prof_res = client.get("/api/v1/student/profile", headers=headers)
    assert prof_res.status_code == 200
    prof = prof_res.json()
    assert prof["email"] == "teststudent@example.com"
    assert prof["intern_id"].startswith("PSM-")

    # Update student profile with github_url
    update_res = client.put("/api/v1/student/profile", headers=headers, json={
        "github_url": "https://github.com/teststudent-official",
        "college": "Stanford University",
        "bio": "Building distributed systems",
    })
    assert update_res.status_code == 200
    assert update_res.json()["github_url"] == "https://github.com/teststudent-official"


def test_student_cannot_access_admin_endpoints():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "teststudent@example.com",
        "password": "Password123!",
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Attempt to list all interns via admin route
    admin_res = client.get("/api/v1/admin/interns", headers=headers)
    assert admin_res.status_code == 403


def test_student_project_submission():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "teststudent@example.com",
        "password": "Password123!",
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    submit_res = client.put("/api/v1/student/project", headers=headers, json={
        "title": "Automated Quality Assurance Pipeline",
        "description": "Implemented robust CI/CD and verification testing for cloud services.",
        "domain": "Full Stack Web Development",
        "technologies": "FastAPI, Pytest, Docker, GitHub Actions",
        "github_url": "https://github.com/teststudent/qa-pipeline",
        "live_demo_url": "https://qa-pipeline.test.app",
        "documentation_url": "https://docs.qa-pipeline.test.app",
    })
    assert submit_res.status_code == 200
    assert submit_res.json()["status"] == "submitted"


def test_public_verification_valid_certificate():
    # Aarav Sharma has valid issued certificate with token 'psm-verify-aarav-2026-valid-token-alpha'
    res = client.get("/api/v1/public/verify/psm-verify-aarav-2026-valid-token-alpha")
    assert res.status_code == 200
    data = res.json()
    assert data["is_valid"] is True
    assert data["status"] == "issued"
    assert data["intern_name"] == "Aarav Sharma"
    assert data["certificate_id"] == "CERT-PSM-2026-987654"


def test_public_verification_revoked_certificate():
    # Marcus Vance has revoked certificate with token 'psm-verify-marcus-2026-revoked-token-gamma'
    res = client.get("/api/v1/public/verify/psm-verify-marcus-2026-revoked-token-gamma")
    assert res.status_code == 200
    data = res.json()
    assert data["is_valid"] is False
    assert data["status"] == "revoked"
    assert "Academic integrity violation" in data["revocation_reason"]


def test_admin_issue_certificate_flow():
    # Login as admin
    admin_res = client.post("/api/v1/auth/admin/login", json={
        "email": settings.INITIAL_ADMIN_EMAIL,
        "password": settings.INITIAL_ADMIN_PASSWORD,
    })
    admin_token = admin_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Find Priya's certificate (which is approved)
    certs_res = client.get("/api/v1/admin/certificates?status_filter=approved", headers=admin_headers)
    assert certs_res.status_code == 200
    certs = certs_res.json()
    assert len(certs) > 0
    priya_cert = certs[0]

    # Issue certificate
    issue_res = client.post(f"/api/v1/admin/certificates/{priya_cert['id']}/issue", headers=admin_headers)
    assert issue_res.status_code == 200
    assert "successfully generated and issued" in issue_res.json()["message"]

    # Verify public verification now reflects issued
    verify_res = client.get(f"/api/v1/public/verify/{priya_cert['verification_token']}")
    assert verify_res.status_code == 200
    assert verify_res.json()["is_valid"] is True
    assert verify_res.json()["status"] == "issued"


def test_student_profile_photo_upload_and_delete():
    import io
    from PIL import Image

    # 1. Login as student
    login_res = client.post("/api/v1/auth/login", json={
        "email": "teststudent@example.com",
        "password": "Password123!",
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create test image
    img = Image.new("RGB", (100, 100), color=(109, 40, 217))
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format="PNG")
    img_bytes = img_byte_arr.getvalue()

    # 3. Upload image
    files = {"file": ("test_avatar.png", img_bytes, "image/png")}
    upload_res = client.post("/api/v1/student/profile/photo", headers=headers, files=files)
    assert upload_res.status_code == 200
    data = upload_res.json()
    assert "profile_photo_url" in data
    assert data["profile_photo_url"].startswith("/storage/avatars/avatar_")

    # 4. Check that dashboard returns profile_photo_url
    dash_res = client.get("/api/v1/student/dashboard", headers=headers)
    assert dash_res.status_code == 200
    assert dash_res.json()["profile_photo_url"] == data["profile_photo_url"]

    # 5. Test invalid file extension is rejected
    fake_exe = io.BytesIO(b"MALICIOUS_BYTES")
    bad_upload = client.post(
        "/api/v1/student/profile/photo",
        headers=headers,
        files={"file": ("malware.exe", fake_exe, "application/octet-stream")},
    )
    assert bad_upload.status_code == 400

    # 6. Delete profile photo
    del_res = client.delete("/api/v1/student/profile/photo", headers=headers)
    assert del_res.status_code == 200
    assert del_res.json()["profile_photo_url"] is None

    # Check dashboard reflects removal
    dash_after = client.get("/api/v1/student/dashboard", headers=headers)
    assert dash_after.json()["profile_photo_url"] is None


def test_public_student_profile_and_privacy():
    # 1. Fetch Aarav's public profile (PSM-2026-INT-0101)
    res = client.get("/api/v1/public/profile/PSM-2026-INT-0101")
    assert res.status_code == 200
    data = res.json()
    assert data["full_name"] == "Aarav Sharma"
    assert data["intern_id"] == "PSM-2026-INT-0101"
    assert data["internship_domain"] == "Full Stack Web Development"
    assert data["company_name"] == "PSM Technologies Inc."

    # 2. Strict Privacy Checks: no private contact or credentials exposed
    assert "email" not in data
    assert "phone_number" not in data
    assert "password" not in data
    assert "hashed_password" not in data

    # 3. Test non-existent intern ID returns 404
    not_found = client.get("/api/v1/public/profile/NON-EXISTENT-ID")
    assert not_found.status_code == 404


def test_public_qr_code_endpoints():
    # 1. Certificate QR Code endpoint
    cert_qr_res = client.get("/api/v1/public/certificates/psm-verify-aarav-2026-valid-token-alpha/qr")
    assert cert_qr_res.status_code == 200
    assert cert_qr_res.headers["content-type"] == "image/png"
    assert len(cert_qr_res.content) > 100

    # 2. Profile QR Code endpoint
    prof_qr_res = client.get("/api/v1/public/profile/PSM-2026-INT-0101/qr")
    assert prof_qr_res.status_code == 200
    assert prof_qr_res.headers["content-type"] == "image/png"
    assert len(prof_qr_res.content) > 100

    # 3. Verify non-existent certificate token QR returns 404
    bad_cert_qr = client.get("/api/v1/public/certificates/invalid-token-123/qr")
    assert bad_cert_qr.status_code == 404

    # 4. Verify non-existent profile intern ID QR returns 404
    bad_prof_qr = client.get("/api/v1/public/profile/INVALID-ID-999/qr")
    assert bad_prof_qr.status_code == 404
