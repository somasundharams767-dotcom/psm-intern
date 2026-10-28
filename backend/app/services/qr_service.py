import os
import qrcode
from PIL import Image
from app.core.config import settings


def generate_qr_code(verification_token: str) -> str:
    """
    Generates a high-resolution, high-contrast QR code pointing to the canonical
    public certificate verification page.
    Saves to the QR code directory and returns the absolute file path.
    """
    verification_url = f"{settings.FRONTEND_URL}/verify/{verification_token}"
    
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=12,
        border=3,
    )
    qr.add_data(verification_url)
    qr.make(fit=True)

    # Crisp dark navy on pure white background for maximum scanning contrast
    img = qr.make_image(fill_color="#0F172A", back_color="#FFFFFF")

    os.makedirs(settings.QR_CODES_DIR, exist_ok=True)
    filename = f"qr_{verification_token}.png"
    filepath = os.path.abspath(os.path.join(settings.QR_CODES_DIR, filename))
    img.save(filepath)
    
    return filepath


def generate_profile_qr_code(intern_id: str) -> str:
    """
    Generates a high-resolution, unique QR code pointing to the student's
    public profile verification page.
    Saves to the QR code directory and returns the absolute file path.
    """
    profile_url = f"{settings.FRONTEND_URL}/profile/{intern_id}"
    
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=12,
        border=3,
    )
    qr.add_data(profile_url)
    qr.make(fit=True)

    # Crisp deep purple/slate on pure white background
    img = qr.make_image(fill_color="#3B0764", back_color="#FFFFFF")

    os.makedirs(settings.QR_CODES_DIR, exist_ok=True)
    # Sanitize intern_id for filename
    safe_intern_id = intern_id.replace("/", "_").replace("\\", "_")
    filename = f"qr_profile_{safe_intern_id}.png"
    filepath = os.path.abspath(os.path.join(settings.QR_CODES_DIR, filename))
    img.save(filepath)
    
    return filepath
