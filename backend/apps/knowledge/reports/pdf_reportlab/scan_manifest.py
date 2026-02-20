from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import Paragraph


def draw_scan_manifest(c, data, page_no, total_pages):
    W, H = A4
    margin = 40

    # Outer border
    c.rect(margin, margin, W - 2 * margin, H - 2 * margin)

    # Header
    c.setFont("Helvetica-Bold", 10)
    c.drawString(margin + 10, H - 50, data["enterprise"])
    c.drawRightString(W - margin - 10, H - 50, "Penetration Testing Report")

    # -------------------------
    # Table geometry
    # -------------------------
    table_width = 460
    table_left = (W - table_width) / 2
    table_top = H - 140

    col_a = 40
    col_b = 220
    col_c = 200
    row_h = 50

    blue = HexColor("#0070C0")

    # -------------------------
    # Blue header bar
    # -------------------------
    bar_height = 36
    bar_y = table_top

    c.setFillColor(blue)
    c.rect(table_left, bar_y, table_width, bar_height, fill=1)

    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(table_left + table_width / 2, bar_y + 12, "Scan Manifest")

    # Space between header and table
    y = bar_y - 1

    # -------------------------
    # Table data
    # -------------------------
    rows = [
        ("a.", "Description", "Web Application Penetration Testing"),
        ("b.", "Test started on", data.get("start_date", "")),
        ("c.", "Test Completed on", data.get("end_date", "")),
        ("d.", "No. of URL’s tested", "1 URL"),
        ("e.", "Standard / Test Procedure reference", "OWASP TOP 10, SANS 25"),
        ("f.", "Test performed at", "Off-site"),
        ("g.", "Tool used for testing", "Burp Suite, Open-Source Tools"),
    ]

    styles = getSampleStyleSheet()

    label_style = ParagraphStyle(
        "label",
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=14,
        textColor=black,
    )

    value_style = ParagraphStyle(
        "value",
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=14,
        textColor=black,
    )

    # -------------------------
    # Draw rows
    # -------------------------
    for a, b, c_val in rows:
        y -= row_h

        # Grid
        c.setFillColor(white)
        c.rect(table_left, y, col_a, row_h)
        c.rect(table_left + col_a, y, col_b, row_h)
        c.rect(table_left + col_a + col_b, y, col_c, row_h)

        c.setFillColor(black)

        # Column A
        c.setFont("Helvetica-Bold", 10)
        c.drawCentredString(
    table_left + col_a / 2,
    y + row_h / 2 - 4,
    a
)

        # Column B
        p = Paragraph(b, label_style)
        p.wrap(col_b - 10, row_h)
        p.drawOn(c, table_left + col_a + 5, y + 16)

        # Column C
        p = Paragraph(str(c_val), value_style)
        p.wrap(col_c - 10, row_h)
        p.drawOn(c, table_left + col_a + col_b + 5, y + 16)

    # -------------------------
    # Footer
    # -------------------------
    c.setFont("Helvetica", 9)
    c.drawString(margin + 10, margin + 15, "Confidential")
    c.drawCentredString(W / 2, margin + 15, f"V {data['version']}")
    c.drawRightString(
    W - margin - 10,
    margin + 15,
    f"Page {page_no} of {total_pages}"
)

