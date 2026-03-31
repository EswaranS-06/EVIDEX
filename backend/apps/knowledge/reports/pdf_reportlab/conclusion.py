from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.lib.enums import TA_JUSTIFY
from reportlab.lib.colors import black
from apps.knowledge.models import ReportFinding


def draw_conclusion(c, data, report_id, page_no, total_pages):

    W, H = A4
    margin = 55

    # =========================
    # FETCH + NORMALIZE STATUSES
    # =========================
# =========================
# FORCE DB FETCH (FIX)
# =========================
    findings = list(
        ReportFinding.objects
        .filter(report_id=report_id)
        .values_list("status", flat=True)
    )

    statuses = [
        (status or "").strip().lower()
        for status in findings
    ]

    
    # =========================
    # FINAL LOGIC (YOUR REQUIREMENT)
    # =========================
    
    # 👉 If ANY is patched → use patched block
    any_patched = any(status == "patched" for status in statuses)

    # =========================
    # CONCLUSION TEXT
    # =========================
    if any_patched:
        # ✅ PATCHED (IF BLOCK — YOUR REQUIREMENT)
        conclusion_text = (
            f"As part of the security assessment conducted for {data['application_name']}, multiple vulnerabilities were "
            "identified and subsequently addressed through remediation efforts. The corrective actions undertaken demonstrate "
            "a positive commitment towards improving the security posture of the application. Based on the current assessment, "
            "the remediated controls have reduced the overall risk exposure associated with the identified vulnerabilities.\n\n"
            "While the implemented fixes significantly enhance the security baseline, it is important to recognize that the "
            "threat landscape is continuously evolving. Therefore, reliance on point-in-time remediation alone is insufficient. "
            "We recommend conducting periodic security assessments, including vulnerability scanning and penetration testing, "
            "to ensure sustained protection against emerging threats.\n\n"
            "In addition, integrating security best practices into the development lifecycle, such as secure coding standards, "
            "regular code reviews, and automated security testing, will further strengthen resilience. A follow-up validation "
            "exercise is also recommended to confirm the effectiveness of the applied remediations and to ensure that no "
            "residual risks remain within the application environment."
        )
    else:
        # ✅ ALL PENDING
        conclusion_text = (
            f"As part of the security assessment conducted for {data['application_name']}, multiple vulnerabilities "
            "were identified that may impact the confidentiality, integrity, and availability of the application. "
            "These findings indicate gaps in the current security controls and highlight areas requiring immediate attention. "
            "At the time of this report, the identified vulnerabilities remain unremediated and may expose the application "
            "to potential exploitation if left unaddressed.\n\n"
            "It is strongly recommended that the organization prioritize the remediation of these findings based on their "
            "severity and potential business impact. Implementing appropriate security controls, secure coding practices, "
            "and configuration hardening measures will significantly reduce the attack surface. Additionally, a formal "
            "validation or retesting exercise should be conducted post-remediation to ensure that the identified risks "
            "have been effectively mitigated.\n\n"
            "Furthermore, adopting a continuous security approach, including regular vulnerability assessments, penetration "
            "testing, and secure development lifecycle (SDLC) practices, will help in proactively identifying and addressing "
            "emerging threats, thereby strengthening the overall security posture of the application."
        )

    # =========================
    # OUTER BORDER
    # =========================
    c.rect(margin, margin, W - 2 * margin, H - 2 * margin)

    # =========================
    # HEADER
    # =========================
    c.setFont("Helvetica-Bold", 10)
    c.drawString(margin + 10, H - margin - 25, data["application_name"])
    c.drawRightString(
        W - margin - 10,
        H - margin - 25,
        "Penetration Testing Report"
    )

    # =========================
    # TITLE
    # =========================
    y = H - margin - 70

    c.setFont("Helvetica-Bold", 14)
    c.drawString(margin + 10, y, "5. Conclusion")

    y -= 25

    # =========================
    # PARAGRAPH STYLE
    # =========================
    style = ParagraphStyle(
        name="ConclusionStyle",
        fontName="Helvetica",
        fontSize=10,
        leading=15,
        alignment=TA_JUSTIFY,
        textColor=black,
        spaceAfter=10
    )

    # =========================
    # RENDER PARAGRAPH
    # =========================
    p = Paragraph(conclusion_text, style)

    usable_width = W - 2 * margin - 20
    text_width, text_height = p.wrap(usable_width, H)

    p.drawOn(c, margin + 10, y - text_height)

    # =========================
    # END LINE
    # =========================
    c.setFont("Helvetica-Bold", 10)
    c.drawCentredString(
        W / 2,
        y - text_height - 40,
        "----END OF THE DOCUMENT----"
    )

    # =========================
    # FOOTER
    # =========================
    c.setFont("Helvetica", 9)
    c.drawString(margin + 10, margin + 15, "Confidential")
    c.drawCentredString(W / 2, margin + 15, f"V {data['version']}")
    c.drawRightString(
        W - margin - 10,
        margin + 15,
        f"Page {page_no} of {total_pages}"
    )