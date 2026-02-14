from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import black
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph, Image

def draw_methodology(c, data, page_no, total_pages):
    W, H = A4
    margin = 40

    # ================= PAGE FRAME =================
    c.setStrokeColor(black)
    c.rect(margin, margin, W - 2*margin, H - 2*margin)

    # ================= HEADER =================
    c.setFont("Helvetica-Bold", 10)
    c.drawString(margin + 10, H - 50, data["application_name"])
    c.drawRightString(W - margin - 10, H - 50, "Penetration Testing Report")

    # ================= TITLE =================
    y = H - 95
    c.setFont("Helvetica-Bold", 14)
    c.drawString(margin + 10, y, "2. Web Application Penetration Testing Methodology")

    # ================= BULLETS =================
    c.setFont("Helvetica-Bold", 10)
    bullets = [
        "Information Gathering",
        "Enumeration",
        "Scanning",
        "Exploitation",
        "Reporting",
    ]

    by = y - 25
    for b in bullets:
        c.drawString(margin + 30, by, f"•  {b}")
        by -= 16

    # ================= INTRO =================
    body = ParagraphStyle("body", fontName="Helvetica-Bold", fontSize=10, leading=14)

    intro_text = (
        
        "The following also gives a high-level description and process of Security Analysts "
        "methodology used for performing the Web application testing:"
    )

    intro = Paragraph(intro_text, body)
    iw, ih = intro.wrap(W - 2*margin - 20, 100)
    intro_y = by - 20
    intro.drawOn(c, margin + 10, intro_y)

    # ================= METHODOLOGY IMAGE =================
    img_path = "apps/knowledge/reports/assets/stepss.png"  

    # Make it BIG like the sample
    img_width = W - 2*margin - 80    
    img_height = 120              

    # Reduce top gap (pull image closer to intro text)
    img_y = intro_y - ih - 18

    methodology_img = Image(img_path, img_width, img_height)
    methodology_img.drawOn(c, margin + 40, img_y - img_height)

    # ================= DETAILS =================
    details_top = (img_y - img_height) - 6

    left_col = margin + 10
    right_col = W - margin - 10
    text_width = right_col - left_col

    detail_style = ParagraphStyle(
        "detail",
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        leftIndent=18,   
        spaceBefore=6,
    )

    text = """
    <b>1. Planning and Reconnaissance</b><br/>
    In this initial phase, the pentester gathers information about the target system, defining the scope and objectives of the test. This may involve system documentation and publicly available information.<br/><br/>

    <b>2. Scanning</b><br/>
    The pentester uses automated tools to scan the target system for vulnerabilities such as open ports, weak passwords, and misconfigured software. This helps identify potential entry points for attackers.<br/><br/>

    <b>3. Gaining Access</b><br/>
    The pentester attempts to exploit the vulnerabilities identified during scanning. This may involve using techniques such as SQL injection or social engineering.<br/><br/>

    <b>4. Maintaining Access (Optional)</b><br/>
    In some tests, the pentester may try to maintain access to the system after gaining initial access to assess lateral movement and privilege escalation.<br/><br/>

    <b>5. Reporting</b><br/>
    After completing the test, the pentester creates a report detailing the vulnerabilities found and recommendations for remediation.
    """

    p = Paragraph(text, detail_style)
    pw, ph = p.wrap(text_width, H - margin - details_top)
    p.drawOn(c, left_col, details_top - ph)

     # ================= FOOTER =================
    c.setFont("Helvetica", 9)
    c.drawString(margin + 10, margin + 15, "Confidential")
    c.drawCentredString(W/2, margin + 15, f"V {data['version']}")
    c.drawRightString(W - margin - 10, margin + 15, f"Page {page_no} of {total_pages}")
