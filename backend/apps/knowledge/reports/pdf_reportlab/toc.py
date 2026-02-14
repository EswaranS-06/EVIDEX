from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor

BLUE = HexColor("#1f4fd8")  # same blue as sample

def draw_toc(c, data, page_no=3, total_pages=8):
    W, H = A4
    margin = 40

    # Page frame
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

    # TOC entries
    entries = [
        ("1. Executive Summary", 5),
        ("1.1 Overview", 5),
        ("1.2 Risk Model", 5),
        ("2. Web Application Penetration Testing Methodology", 6),
        ("3. Project Scope", 7),
        ("4. Penetration Testing Results", 7),
        ("5. Conclusion", 8),
    ]

    y = H - 200
    line_width = 400

    c.setFont("Helvetica-Bold", 10)

    for title, page in entries:
        # Left text
        c.drawString(margin + 60, y, title)

        # dotted leader
        text_width = c.stringWidth(title, "Helvetica-Bold", 10)
        dots_x = margin + 60 + text_width + 5
        dots_end = margin + 60 + line_width

        c.setDash(1, 2)
        c.line(dots_x, y - 2, dots_end, y - 2)
        c.setDash()

        # Page number
        c.drawRightString(margin + 60 + line_width + 30, y, str(page))

        y -= 22

    # Footer
    c.setFont("Helvetica", 9)
    c.drawString(margin + 10, margin + 15, "Confidential")
    c.drawCentredString(W / 2, margin + 15, f"V {data['version']}")
    c.drawRightString(W - margin - 10, margin + 15, "Page 3 of {}".format(data["total_pages"]))
