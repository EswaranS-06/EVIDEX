from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, black, white
from apps.knowledge.models import ReportFinding
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle


def draw_results(c, data, report_id, page_no, total_pages):
    W, H = A4
    margin = 40

    # =========================
    # Fetch findings
    # =========================
    findings = ReportFinding.objects.filter(report_id=report_id)

    counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0, "INFO": 0}
    for f in findings:
        sev = (f.final_severity or "").upper()
        if sev in counts:
            counts[sev] += 1

    # =========================
    # Colors (locked)
    # =========================
    BLUE = HexColor("#0070C0")
    CRITICAL = HexColor("#C00000")
    HIGH = HexColor("#FF0000")
    MEDIUM = HexColor("#FFC000")
    LOW = HexColor("#0070C0")
    INFO = HexColor("#8EA9DB")
    DARK_BG = HexColor("#2E2E2E")

    # =========================
    # Frame & Header
    # =========================
    c.rect(margin, margin, W - 2 * margin, H - 2 * margin)

    c.setFont("Helvetica-Bold", 10)
    c.drawString(margin + 10, H - 50, data["application_name"])
    c.drawRightString(W - margin - 10, H - 50, "Penetration Testing Report")

    y = H - 105
    c.setFont("Helvetica-Bold", 14)
    c.drawString(margin + 10, y, "3. Project Scope")

    y = H - 125
    scope_text = (
        f"Formal communication from the {data['application_name']} outlined the application "
        "to be tested and the type of testing to be carried out. Based on the received "
        "communication a RED team resource was deployed to perform this activity. The assigned "
        "team carried out the Web application Penetration Testing."
    )

    style = ParagraphStyle("scope", fontName="Helvetica", fontSize=10, leading=14)

    p = Paragraph(scope_text, style)
    text_width = W - (2 * margin) - 20
    w, h = p.wrap(text_width, 120)
    p.drawOn(c, margin + 10, y - 40)

    # IMPORTANT: move cursor down so Results header does not overlap
    results_y = (y - 40) - h - 20
    # Use results_y that we computed from the paragraph height
    c.setFont("Helvetica-Bold", 14)
    
    c.drawString(margin + 10, results_y, "4. Penetration Testing Results")
   
    # =========================
    # Summary Table
    # =========================
    table_top = results_y - 40
    table_left = margin + 10
    row_h = 28

    cols = [160, 60, 60, 60, 60, 80]  # URL, C, H, M, L, I

    # Header row
    # Column colors
    col_colors = [
        HexColor("#0070C0"),  # URL (blue)
        HexColor("#C00000"),  # Critical
        HexColor("#FF0000"),  # High
        HexColor("#FFC000"),  # Medium
        HexColor("#0070C0"),  # Low
        HexColor("#8EA9DB"),  # Information
    ]

    headers = ["URL", "Critical", "High", "Medium", "Low", "Information"]

    x = table_left
    for i, h in enumerate(headers):
        c.setFillColor(col_colors[i])
        c.rect(x, table_top, cols[i], row_h, fill=1)
        c.setFillColor(white)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(x + cols[i]/2, table_top + 9, h)
        x += cols[i]

    # Values row
    y_row = table_top - row_h
    x = table_left
    for w in cols:
        c.setFillColor(white)
        c.rect(x, y_row, w, row_h, fill=1)
        c.setStrokeColor(black)
        c.rect(x, y_row, w, row_h, fill=0)
        x += w


    x = table_left
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(black)
    c.drawCentredString(x + cols[0]/2, y_row + 9, f"https://{data['application_name']}")
    x += cols[0]
    c.drawCentredString(x + cols[1]/2, y_row + 9, str(counts["CRITICAL"])); x += cols[1]
    c.drawCentredString(x + cols[2]/2, y_row + 9, str(counts["HIGH"]));     x += cols[2]
    c.drawCentredString(x + cols[3]/2, y_row + 9, str(counts["MEDIUM"]));   x += cols[3]
    c.drawCentredString(x + cols[4]/2, y_row + 9, str(counts["LOW"]));      x += cols[4]
    c.drawCentredString(x + cols[5]/2, y_row + 9, str(counts["INFO"]))

    # =========================
    # Dark Bar Chart
    # =========================
    chart_left = margin + 80
    chart_bottom = y_row - 230
    chart_w = 360
    chart_h = 160

    c.setFillColor(DARK_BG)
    c.rect(chart_left - 20, chart_bottom - 20, chart_w + 40, chart_h + 40, fill=1)

    # Axes
    c.setStrokeColor(white)
    c.setLineWidth(1)
    c.line(chart_left, chart_bottom, chart_left, chart_bottom + chart_h)   # Y axis
    c.line(chart_left, chart_bottom, chart_left + chart_w, chart_bottom)   # X axis

    bars = [
        ("Critical", counts["CRITICAL"], CRITICAL),
        ("High", counts["HIGH"], HIGH),
        ("Medium", counts["MEDIUM"], MEDIUM),
        ("Low", counts["LOW"], LOW),
        ("Information", counts["INFO"], INFO),
    ]

    # MUST be defined before using it
    max_val = max(1, max(v for _, v, _ in bars))

    # Y‑axis grid + labels
    GRID = HexColor("#BFBFBF")
    steps = 5
    for i in range(steps + 1):
        y = chart_bottom + (i / steps) * chart_h
        c.setStrokeColor(GRID)
        c.setLineWidth(0.5)
        c.line(chart_left, y, chart_left + chart_w, y)

        # scale numbers
        val = round((i / steps) * max_val, 1)
        c.setFont("Helvetica", 7)
        c.setFillColor(white)
        c.drawRightString(chart_left - 6, y - 3, str(val))

    bar_w = 35
    gap = 35
    x = chart_left + 20   # small left padding inside axis

    for label, val, color in bars:
        h = (val / max_val) * chart_h

        c.setFillColor(color)
        c.rect(x, chart_bottom, bar_w, h, fill=1)

        # Value on top
        c.setFillColor(white)
        c.setFont("Helvetica", 8)
        c.drawCentredString(x + bar_w/2, chart_bottom + h + 4, str(val))

        # X‑axis label
        c.drawCentredString(x + bar_w/2, chart_bottom - 12, label)

        x += bar_w + gap

    # =========================
    # Footer
    # =========================
    c.setFont("Helvetica", 9)
    c.setFillColor(black)
    c.drawString(margin + 10, margin + 15, "Confidential")
    c.drawCentredString(W/2, margin + 15, f"V {data['version']}")
    c.drawRightString(W - margin - 10, margin + 15, f"Page {page_no} of {total_pages}")
