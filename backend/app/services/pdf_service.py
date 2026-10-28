import os
from datetime import datetime
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas
from app.core.config import settings
from app.services.qr_service import generate_qr_code


class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_certificate_decorations()
            super().showPage()
        super().save()

    def draw_certificate_decorations(self):
        self.saveState()
        width, height = self._pagesize

        # Outer border: Deep Purple
        self.setStrokeColor(colors.HexColor("#4C1D95"))
        self.setLineWidth(5)
        self.rect(20, 20, width - 40, height - 40)

        # Inner border: Soft Lavender
        self.setStrokeColor(colors.HexColor("#DDD6FE"))
        self.setLineWidth(2)
        self.rect(28, 28, width - 56, height - 56)

        # Corner accents
        self.setFillColor(colors.HexColor("#6D28D9"))
        corner_size = 18
        # Top-left
        self.rect(20, height - 20 - corner_size, corner_size, corner_size, fill=1, stroke=0)
        # Top-right
        self.rect(width - 20 - corner_size, height - 20 - corner_size, corner_size, corner_size, fill=1, stroke=0)
        # Bottom-left
        self.rect(20, 20, corner_size, corner_size, fill=1, stroke=0)
        # Bottom-right
        self.rect(width - 20 - corner_size, 20, corner_size, corner_size, fill=1, stroke=0)

        self.restoreState()


def generate_certificate_pdf(
    certificate_id: str,
    verification_token: str,
    intern_name: str,
    intern_id: str,
    internship_domain: str,
    company_name: str,
    duration_weeks: int,
    start_date_str: str,
    end_date_str: str,
    issue_date_str: str,
    signatory_name: str,
    signatory_title: str,
) -> str:
    """
    Generates a professional PDF certificate with embedded QR code.
    Ensures QR code exists and is placed neatly in the bottom-right corner.
    Returns the file path of the generated PDF.
    """
    # 1. Ensure QR code exists and is verified before embedding
    qr_filepath = generate_qr_code(verification_token)
    if not os.path.exists(qr_filepath) or os.path.getsize(qr_filepath) == 0:
        raise RuntimeError(f"Failed to generate or locate QR code at {qr_filepath}")

    os.makedirs(settings.CERTIFICATES_DIR, exist_ok=True)
    pdf_filename = f"certificate_{certificate_id}.pdf"
    pdf_filepath = os.path.abspath(os.path.join(settings.CERTIFICATES_DIR, pdf_filename))

    doc = SimpleDocTemplate(
        pdf_filepath,
        pagesize=landscape(letter),
        leftMargin=45,
        rightMargin=45,
        topMargin=40,
        bottomMargin=35,
    )

    styles = getSampleStyleSheet()

    # Custom typography styles
    title_style = ParagraphStyle(
        "CertTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=25,
        leading=30,
        alignment=1,  # Center
        textColor=colors.HexColor("#312E81"),  # Deep Indigo
    )

    subtitle_style = ParagraphStyle(
        "CertSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=15,
        alignment=1,
        textColor=colors.HexColor("#6D28D9"),
    )

    recipient_title_style = ParagraphStyle(
        "RecipientTitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=12,
        leading=16,
        alignment=1,
        textColor=colors.HexColor("#4B5563"),
    )

    name_style = ParagraphStyle(
        "RecipientName",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=27,
        leading=33,
        alignment=1,
        textColor=colors.HexColor("#5B21B6"),  # Deep Purple
    )

    body_style = ParagraphStyle(
        "CertBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=12.5,
        leading=19,
        alignment=1,
        textColor=colors.HexColor("#1F2937"),
    )

    meta_style = ParagraphStyle(
        "CertMeta",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor("#334155"),
    )

    qr_label_style = ParagraphStyle(
        "QRLabel",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        alignment=1,
        textColor=colors.HexColor("#4C1D95"),
    )

    sign_style = ParagraphStyle(
        "SignStyle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=14,
        alignment=1,
        textColor=colors.HexColor("#1E293B"),
    )

    story = []

    # Header spacing
    story.append(Spacer(1, 8))

    # Organization / Platform Branding
    story.append(Paragraph("<b>PSM.INTERN</b> &bull; OFFICIAL CERTIFICATION AUTHORITY", subtitle_style))
    story.append(Spacer(1, 4))

    # Main Certificate Title
    story.append(Paragraph("CERTIFICATE OF INTERNSHIP COMPLETION", title_style))
    story.append(Spacer(1, 12))

    # Recipient presentation line
    story.append(Paragraph("This is proudly presented to", recipient_title_style))
    story.append(Spacer(1, 6))

    # Recipient Name
    story.append(Paragraph(intern_name.upper(), name_style))
    story.append(Spacer(1, 10))

    # Statement of achievement
    dates_text = f"from <b>{start_date_str}</b> to <b>{end_date_str}</b>" if start_date_str and end_date_str else f"for a duration of <b>{duration_weeks} Weeks</b>"
    cert_text = (
        f"for successfully completing an intensive <b>{duration_weeks}-week</b> internship in "
        f"<b>{internship_domain}</b> at <b>{company_name}</b> {dates_text}. "
        f"The candidate demonstrated rigorous problem solving, production-grade technical excellence, "
        f"and exemplary collaborative teamwork in delivering scheduled engineering milestones."
    )
    story.append(Paragraph(cert_text, body_style))
    story.append(Spacer(1, 20))

    # Footer section: Left = IDs/Details, Center = Signature, Right = Visible Scannable QR Code
    qr_img = Image(qr_filepath, width=88, height=88)

    verification_url = f"{settings.FRONTEND_URL}/verify/{verification_token}"
    left_meta = (
        f"<b>Certificate ID:</b> <font color='#4C1D95'>{certificate_id}</font><br/>"
        f"<b>Intern ID:</b> {intern_id}<br/>"
        f"<b>Issue Date:</b> {issue_date_str}<br/>"
        f"<b>Registry Token:</b> <font size=7 color='#64748B'>{verification_token[:18]}...</font><br/>"
        f"<font size=7 color='#64748B'>Verify at: {verification_url}</font>"
    )
    left_cell = [
        Paragraph(left_meta, meta_style),
    ]

    center_signature = (
        f"<br/>"
        f"_______________________________________<br/>"
        f"<b>{signatory_name}</b><br/>"
        f"<font color='#64748B'>{signatory_title}</font><br/>"
        f"<font color='#4C1D95'><b>{company_name}</b></font>"
    )
    center_cell = [
        Paragraph(center_signature, sign_style),
    ]

    # Bottom-Right Corner QR Code Cell
    right_cell = [
        Paragraph("<b>SCAN TO VERIFY</b>", qr_label_style),
        Spacer(1, 3),
        qr_img,
        Spacer(1, 2),
        Paragraph("<font size=6.5 color='#64748B'>Official Tamper-Proof QR</font>", qr_label_style),
    ]

    footer_table_data = [[left_cell, center_cell, right_cell]]
    # Total width: 250 + 270 + 182 = 702 pt (matches printable landscape width)
    footer_table = Table(footer_table_data, colWidths=[250, 270, 182])
    footer_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'BOTTOM'),
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'CENTER'),
        ('ALIGN', (2, 0), (2, 0), 'CENTER'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))

    story.append(footer_table)

    doc.build(story, canvasmaker=NumberedCanvas)
    return pdf_filepath
