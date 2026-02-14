from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph, Table, TableStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT


def draw_executive_summary(c, data, page_no, total_pages):

    W, H = A4
    margin = 40

    # ===== PAGE BORDER =====
    c.setStrokeColor(black)
    c.rect(margin, margin, W - 2 * margin, H - 2 * margin)

    # ===== HEADER =====
    c.setFont("Helvetica-Bold", 10)
    c.drawString(margin + 10, H - 50, data["application_name"])
    c.drawRightString(W - margin - 10, H - 50, "Penetration Testing Report")

    y = H - 95
    c.setFont("Helvetica-Bold", 14)
    c.drawString(margin + 10, y, "1. Executive Summary")

    # ===== BODY TEXT =====
    body_style = ParagraphStyle(
        "body",
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=black,
    )

    overview_text = f"""
    <b>1.1 Overview</b><br/>
    
This report presents the results of the Penetration Testing of web application allocated to <b>{data["application_name"]}</b>.
<br/>
This testing was performed by a security analyst. The purpose of this testing is to identify application-
level security issues that could affect the confidentiality, integrity, or availability of <b>{data["application_name"]}</b>.The
scope of this exercise includes assessing and testing the URL under consideration to understand the
security posture of the application. The Testing exercise concentrated on evaluating the security of
our web applications, covering front-end, back-end components, databases, and user interactions.
<br/>
The objective was to identify vulnerabilities like SQL injection and XSS, ensuring the robustness of
application security.
<br/>
In summary, this document outlines the analysis, findings, and recommendations from <b>{data["created_by"]}</b> for the
vulnerabilities, aimed at enhancing the overall security posture of the network infrastructure.
    """

    p = Paragraph(overview_text, body_style)
    text_width = W - 2 * margin - 20
    _, h = p.wrap(text_width, 400)
    p.drawOn(c, margin + 10, y - 40 - h)

    y_table = y - 40 - h - 30
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin + 10, y_table, "1.2 Risk Model")
    
    risk_text = f"""
    Throughout this document, <b>{data["created_by"]}</b> has categorized the risk ratings for discovered
    vulnerabilities based on global standard risk definitions.
    """

    risk_para = Paragraph(risk_text, body_style)
    rw, rh = risk_para.wrap(W - 2*margin - 20, 100)
    risk_para.drawOn(c, margin + 10, y_table - 18 - rh)


    table_top = y_table - 18 - rh - 15
    table_left = margin + 10
    table_width = W - 2 * (margin + 10)

    # ===== TABLE STYLES =====
    desc_style = ParagraphStyle("desc", fontSize=9, leading=12, alignment=TA_LEFT)
    center = ParagraphStyle("center", fontSize=9, alignment=TA_CENTER)

    # ===== TABLE DATA =====
    table_data = [
        ["Priority\nLevel", "Severity\nScale", "CVSS\nScore", "Description of Vulnerability"],

        ["P1", Paragraph("Critical", center), "9.0 – 10.0",
         Paragraph("The exposure may be exploited resulting in bad outcomes such as unauthorized privilege escalation, data access, downtime, or compromise of data.", desc_style)],

        ["P2", Paragraph("High", center), "7.0 – 8.9",
         Paragraph("These issues identify conditions that could directly result in the compromise or unauthorized access of a network, system, application, or sensitive information.", desc_style)],

        ["P3", Paragraph("Medium", center), "4.0 – 6.9",
         Paragraph("These issues identify conditions that do not immediately or directly result in the compromise or unauthorized access of a network, system, application, or sensitive information, but do provide a capability or information that could in combination with others’ capabilities or information result in the compromise unauthorized access of a network application or information.", desc_style)],

        ["P4", Paragraph("Low", center), "0.1 – 3.9",
         Paragraph("These issues identify conditions that do not immediately or directly result in the compromise of a network, system, application, or information but do provide information that could be used in combination with others’ information that could be used in combination with other's information access to a network system,application,or information.", desc_style)],

        ["P5", Paragraph("Informational", center), "0",
         Paragraph("Issues that leaking very basic information which might lead to information disclosure.", desc_style)],
    ]

    col_widths = [60, 90, 80, table_width - 230]

    tbl = Table(table_data, colWidths=col_widths, repeatRows=1)

    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), HexColor("#00B0F0")),
        ("TEXTCOLOR", (0,0), (-1,0), white),
        ("ALIGN", (0,0), (-1,0), "CENTER"),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,0), 9),

        ("GRID", (0,0), (-1,-1), 1, black),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),

        ("BACKGROUND", (1,1), (1,1), HexColor("#C00000")),
        ("BACKGROUND", (1,2), (1,2), HexColor("#FF0000")),
        ("BACKGROUND", (1,3), (1,3), HexColor("#FFC000")),
        ("BACKGROUND", (1,4), (1,4), HexColor("#0070C0")),
        ("BACKGROUND", (1,5), (1,5), HexColor("#8EA9DB")),

        ("TEXTCOLOR", (1,1), (1,5), white),
        ("FONTNAME", (1,1), (1,5), "Helvetica-Bold"),

        ("ALIGN", (0,1), (2,-1), "CENTER"),
    ]))

    # Draw table
    _, h = tbl.wrap(table_width, 600)
    tbl.drawOn(c, table_left, table_top - h)

    # ===== FOOTER =====
    c.setFont("Helvetica", 9)
    c.drawString(margin + 10, margin + 15, "Confidential")
    c.drawCentredString(W / 2, margin + 15, f"V {data['version']}")
    c.drawRightString(W - margin - 10, margin + 15, f"Page {page_no} of {total_pages}")
