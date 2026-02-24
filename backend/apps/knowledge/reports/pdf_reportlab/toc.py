from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor

BLUE = HexColor("#1f4fd8")

def draw_toc(c, data, page_no, total_pages, section_pages):

    W, H = A4
    margin = 40

    c.rect(margin, margin, W - 2 * margin, H - 2 * margin)

    # Header
    c.setFont("Helvetica-Bold", 10)
    c.drawString(margin + 10, H - 50, data["enterprise"])
    c.drawRightString(W - margin - 10, H - 50, "Penetration Testing Report")

    # Title
    c.setFont("Helvetica-Bold", 14)
    c.setFillColor(BLUE)
    c.drawCentredString(W / 2, H - 140, "Table of Contents")
    c.setFillColorRGB(0, 0, 0)

    entries = [
        ("1. Executive Summary", section_pages["executive_summary"]),
        ("1.1 Overview", section_pages["executive_summary"]),
        ("1.2 Risk Model", section_pages["executive_summary"]),
        ("2. Web Application Penetration Testing Methodology", section_pages["methodology"]),
        ("3. Project Scope", section_pages["scope"]),
        ("4. Penetration Testing Results", section_pages["results"]),
        ("5. Conclusion", section_pages["conclusion"]),
    ]

    y = H - 200
    line_width = 400

    c.setFont("Helvetica-Bold", 10)

    for title, page in entries:
        c.drawString(margin + 60, y, title)

        text_width = c.stringWidth(title, "Helvetica-Bold", 10)
        dots_x = margin + 60 + text_width + 5
        dots_end = margin + 60 + line_width

        c.setDash(1, 2)
        c.line(dots_x, y - 2, dots_end, y - 2)
        c.setDash()

        c.drawRightString(margin + 60 + line_width + 30, y, str(page))

        y -= 22

    # Footer (dynamic)
    c.setFont("Helvetica", 9)
    c.drawString(margin + 10, margin + 15, "Confidential")
    c.drawCentredString(W / 2, margin + 15, f"V {data['version']}")
    c.drawRightString(
        W - margin - 10,
        margin + 15,
        f"Page {page_no} of {total_pages}"
    )
