from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from django.conf import settings
import os


def draw_cover(c, d, page_no, total_pages=8):

    W, H = A4
    margin = 40

    def s(x):
        return "" if x is None else str(x)

    # =========================
    # LOGO PATHS (SAFE)
    # =========================
    left_logo_path = os.path.join(
        settings.BASE_DIR,
        "apps", "knowledge", "reports", "assets", "evidex.png"
    )

    right_logo_path = os.path.join(
        settings.BASE_DIR,
        "apps", "knowledge", "reports", "assets", "evidex_client.png"
    )

    # =========================
    # DRAW LOGOS (INSIDE FUNCTION ✅)
    # =========================
    try:
        left_logo = ImageReader(left_logo_path)
        right_logo = ImageReader(right_logo_path)

        logo_width = 180
        logo_height = 130
        hs=60

        # LEFT
        c.drawImage(
            left_logo,
            margin + 10,
            H - margin - hs - 75,
            width=logo_width,
            height=logo_height,
            preserveAspectRatio=True,
            mask='auto'
        )

        # RIGHT
        c.drawImage(
            right_logo,
            W - margin - logo_width - 10,
            H - margin - hs - 75,
            width=logo_width,
            height=logo_height,
            preserveAspectRatio=True,
            mask='auto'
        )

    except Exception as e:
        print("LOGO ERROR:", e)

    # =========================
    # OUTER BORDER
    # =========================
    c.rect(margin, margin, W - 2*margin, H - 2*margin)

    # =========================
    # HEADER
    # =========================
    c.setFont("Helvetica-Bold", 10)
    c.drawString(margin + 10, H - 50, s(d["enterprise"]))
    c.drawRightString(W - margin - 10, H - 50, "Penetration Testing Report")

    # =========================
    # TITLE (SHIFTED DOWN)
    # =========================
    y = H - 220

    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(W / 2, y, "PENETRATION TESTING REPORT")

    y -= 25
    c.drawCentredString(W / 2, y, "FOR")

    y -= 25
    c.drawCentredString(W / 2, y, s(d["enterprise"]))

    y -= 25
    c.setFont("Helvetica", 11)
    c.drawCentredString(W / 2, y, f"PT Conducted on {s(d['pt_date'])}")

    y -= 20
    c.drawCentredString(W / 2, y, f"Conducted by {s(d['conducted_by'])}")

    # =========================
    # TABLE
    # =========================
    table_top = y - 70
    row_h = 24

    table_width = 480
    table_left = (W - table_width) / 2

    col1, col2, col3, col4 = 120, 160, 100, 100

    rows = [
        ("Document Type", "Penetration Testing Report", "Version", s(d["version"])),
        ("Assessee", s(d["assessee"]), "Signature", ""),
        ("Assessor", s(d["assessor"]), "Signature", ""),
        ("Reviewer", s(d["reviewed_by"]), "Signature", ""),
        ("Approved by", s(d["approved_by"]), "Signature", ""),
    ]

    for i, r in enumerate(rows):
        y0 = table_top - (i + 1) * row_h

        c.rect(table_left, y0, col1, row_h)
        c.rect(table_left + col1, y0, col2, row_h)
        c.rect(table_left + col1 + col2, y0, col3, row_h)
        c.rect(table_left + col1 + col2 + col3, y0, col4, row_h)

        c.setFont("Helvetica", 9)
        c.drawString(table_left + 5, y0 + 7, r[0])
        c.drawString(table_left + col1 + 5, y0 + 7, r[1])
        c.drawString(table_left + col1 + col2 + 5, y0 + 7, r[2])
        c.drawString(table_left + col1 + col2 + col3 + 5, y0 + 7, r[3])

    # =========================
    # FOOTER
    # =========================
    c.setFont("Helvetica", 9)
    c.drawString(margin + 10, margin + 15, "Confidential")
    c.drawCentredString(W / 2, margin + 15, f"V {s(d['version'])}")
    c.drawRightString(
        W - margin - 10,
        margin + 15,
        f"Page {page_no} of {total_pages}"
    )