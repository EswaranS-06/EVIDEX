from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.lib.colors import black


def draw_conclusion(c, data, page_no, total_pages):
    W, H = A4
    margin = 55

    # =========================
    # Outer Border
    # =========================
    c.rect(margin, margin, W - 2 * margin, H - 2 * margin)

    # =========================
    # Header (inside layout)
    # =========================
    c.setFont("Helvetica-Bold", 10)
    c.drawString(margin + 10, H - margin - 25, data["application_name"])
    c.drawRightString(
        W - margin - 10,
        H - margin - 25,
        "Penetration Testing Report"
    )

    # =========================
    # Section Title
    # =========================
    y = H - margin - 70

    c.setFont("Helvetica-Bold", 14)
    c.drawString(margin + 10, y, "5. Conclusion")

    y -= 25

    # =========================
    # Conclusion Paragraph
    # =========================
    conclusion_text = (
        f"Nevertheless, we suggest that the application allocated to "
        f"{data['application_name']} implement the recommendations in this "
        "document with respect to the affected application. We also propose "
        "to follow-on retest to verify that the recommended changes were made "
        "and made correctly. Please note that as technologies and risks change "
        "over time, the vulnerabilities associated with the operation of the "
        "applications described in this report, as well as the actions necessary "
        "to reduce the exposure to such vulnerabilities, will also change."
    )

    style = ParagraphStyle(
        "conclusion",
        fontName="Helvetica",
        fontSize=10,
        leading=14,
    )

    p = Paragraph(conclusion_text, style)

    usable_width = W - 2 * margin - 20
    text_width, text_height = p.wrap(usable_width, 500)

    p.drawOn(c, margin + 10, y - text_height)

    # =========================
    # End of Document Line
    # =========================
    end_text = "----END OF THE DOCUMENT----"

    c.setFont("Helvetica-Bold", 10)
    c.drawCentredString(
        W / 2,
        y - text_height - 40,
        end_text
    )

    # =========================
    # Footer
    # =========================
    c.setFont("Helvetica", 9)
    c.drawString(margin + 10, margin + 15, "Confidential")
    c.drawCentredString(W / 2, margin + 15, f"V {data['version']}")
    c.drawRightString(
        W - margin - 10,
        margin + 15,
        f"Page {page_no} of {total_pages}"
    )
