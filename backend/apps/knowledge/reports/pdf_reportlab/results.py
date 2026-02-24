from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, black, white
from apps.knowledge.models import ReportFinding
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle


def draw_results(c, data, report_id, page_no, total_pages):
    W, H = A4
    margin = 40

    # =========================
    # Sorting Setup
    # =========================
    SEVERITY_ORDER = {
        "CRITICAL": 0,
        "HIGH": 1,
        "MEDIUM": 2,
        "LOW": 3,
        "INFO": 4,
    }

    STATUS_ORDER = {
        "Pending": 0,
        "Patched": 1,
    }

    SEVERITY_COLORS = {
        "CRITICAL": HexColor("#C00000"),
        "HIGH": HexColor("#FF0000"),
        "MEDIUM": HexColor("#FFC000"),
        "LOW": HexColor("#0070C0"),
        "INFO": HexColor("#8EA9DB"),
    }
    
    STATUS_COLORS = {
    "Patched": HexColor("#008000"),   # Green
    "Pending": HexColor("#C00000"),   # Red
}
    findings = [
        f for f in ReportFinding.objects.filter(report_id=report_id)
        if (f.final_title and f.final_severity)
    ]

    findings.sort(
        key=lambda f: (
            STATUS_ORDER.get(f.status or "Pending", 1),
            SEVERITY_ORDER.get((f.final_severity or "").upper(), 5)
        )
    )

    # =========================
    # Count Summary
    # =========================
    counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0, "INFO": 0}
    for f in findings:
        sev = (f.final_severity or "").upper()
        if sev in counts:
            counts[sev] += 1

    # =========================
    # Frame & Header
    # =========================
    c.setLineWidth(0.8)
    c.rect(margin, margin, W - 2 * margin, H - 2 * margin)

    c.setFont("Helvetica-Bold", 10)
    c.drawString(margin + 10, H - 50, data["application_name"])
    c.drawRightString(W - margin - 10, H - 50, "Penetration Testing Report")

    # =========================
    # 3. Project Scope
    # =========================
    scope_y = H - 100

    c.setFont("Helvetica-Bold", 14)
    c.drawString(margin + 10, scope_y, "3. Project Scope")

    scope_text = (
        f"Formal communication from the {data['application_name']} outlined the application "
        "to be tested and the type of testing to be carried out. "
        "A RED team resource was deployed to perform this activity."
    )

    style = ParagraphStyle("scope", fontName="Helvetica", fontSize=10, leading=14)
    p = Paragraph(scope_text, style)

    text_width = W - (2 * margin) - 20
    _, text_height = p.wrap(text_width, 200)
    p.drawOn(c, margin + 10, scope_y - 40)

    # =========================
    # 4. Penetration Testing Results
    # =========================
    results_title_y = scope_y - 40 - text_height - 30

    c.setFont("Helvetica-Bold", 14)
    c.drawString(margin + 10, results_title_y, "4. Penetration Testing Results")

    # =========================
    # Summary Table
    # =========================
    table_top = results_title_y - 40
    table_left = margin + 10
    row_h = 28
    cols = [160, 60, 60, 60, 60, 80]

    headers = ["URL", "Critical", "High", "Medium", "Low", "Information"]
    col_colors = [
        HexColor("#0070C0"),
        HexColor("#C00000"),
        HexColor("#FF0000"),
        HexColor("#FFC000"),
        HexColor("#0070C0"),
        HexColor("#8EA9DB"),
    ]

    x = table_left
    for i, header in enumerate(headers):
        c.setFillColor(col_colors[i])
        c.rect(x, table_top, cols[i], row_h, fill=1)
        c.setFillColor(white)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(x + cols[i] / 2, table_top + 9, header)
        x += cols[i]

    y_row = table_top - row_h
    x = table_left
    c.setFillColor(black)
    c.setFont("Helvetica-Bold", 9)

    for w in cols:
        c.rect(x, y_row, w, row_h, fill=0)
        x += w

    x = table_left
    c.drawCentredString(x + cols[0]/2, y_row + 9, f"https://{data['application_name']}")
    x += cols[0]
    c.drawCentredString(x + cols[1]/2, y_row + 9, str(counts["CRITICAL"])); x += cols[1]
    c.drawCentredString(x + cols[2]/2, y_row + 9, str(counts["HIGH"])); x += cols[2]
    c.drawCentredString(x + cols[3]/2, y_row + 9, str(counts["MEDIUM"])); x += cols[3]
    c.drawCentredString(x + cols[4]/2, y_row + 9, str(counts["LOW"])); x += cols[4]
    c.drawCentredString(x + cols[5]/2, y_row + 9, str(counts["INFO"]))

    # =========================
    # Bar Chart
    # =========================
    chart_left = margin + 80
    chart_bottom = y_row - 220
    chart_w = 360
    chart_h = 160

    DARK_BG = HexColor("#2E2E2E")
    GRID = HexColor("#BFBFBF")

    c.setFillColor(DARK_BG)
    c.rect(chart_left - 20, chart_bottom - 20, chart_w + 40, chart_h + 40, fill=1)

    c.setStrokeColor(white)
    c.line(chart_left, chart_bottom, chart_left, chart_bottom + chart_h)
    c.line(chart_left, chart_bottom, chart_left + chart_w, chart_bottom)

    bars = [
        ("Critical", counts["CRITICAL"], SEVERITY_COLORS["CRITICAL"]),
        ("High", counts["HIGH"], SEVERITY_COLORS["HIGH"]),
        ("Medium", counts["MEDIUM"], SEVERITY_COLORS["MEDIUM"]),
        ("Low", counts["LOW"], SEVERITY_COLORS["LOW"]),
        ("Information", counts["INFO"], SEVERITY_COLORS["INFO"]),
    ]

    max_val = max(1, max(v for _, v, _ in bars))

    for i in range(max_val + 1):
        y_axis = chart_bottom + (i / max_val) * chart_h
        c.setStrokeColor(GRID)
        c.line(chart_left, y_axis, chart_left + chart_w, y_axis)
        c.setFillColor(white)
        c.setFont("Helvetica", 7)
        c.drawRightString(chart_left - 6, y_axis - 3, str(i))

    bar_w = 35
    gap = 35
    x = chart_left + 20

    for label, val, color in bars:
        bar_height = (val / max_val) * chart_h
        c.setFillColor(color)
        c.rect(x, chart_bottom, bar_w, bar_height, fill=1)

        c.setFillColor(white)
        c.setFont("Helvetica", 8)
        c.drawCentredString(x + bar_w/2, chart_bottom + bar_height + 4, str(val))
        c.drawCentredString(x + bar_w/2, chart_bottom - 12, label)

        x += bar_w + gap
        
    # =========================
    # Paginated Findings Table
    # =========================
    
    table_y = chart_bottom - 60

    if findings:

        table_left = margin + 20
        col1, col2, col3, col4 = 50, 220, 100, 100
        base_row_h = 22
        total_width = col1 + col2 + col3 + col4

        table_style = ParagraphStyle(
            "table_style",
            fontName="Helvetica",
            fontSize=9,
            leading=11,
        )

        def draw_table_header(y_top):
            c.setLineWidth(0.5)
            c.setFillColor(HexColor("#1F4E8C"))
            c.rect(table_left, y_top - base_row_h, total_width, base_row_h, fill=1)

            c.setFillColor(white)
            c.setFont("Helvetica-Bold", 9)

            text_y = y_top - 15
            c.drawString(table_left + 5, text_y, "S.No")
            c.drawString(table_left + col1 + 5, text_y, "Vulnerability Name")
            c.drawString(table_left + col1 + col2 + 5, text_y, "Severity")
            c.drawString(table_left + col1 + col2 + col3 + 5, text_y, "Status")

            return y_top - base_row_h

        table_y = draw_table_header(table_y)

        c.setFont("Helvetica", 9)
        c.setLineWidth(0.5)

        for idx, f in enumerate(findings, start=1):

            severity = (f.final_severity or "").upper()
            status = f.status or "Pending"

            title_para = Paragraph(f.final_title, table_style)
            available_width = col2 - 10
            _, text_height = title_para.wrap(available_width, 100)

            row_h = max(base_row_h, text_height + 8)

            # Pagination
            if table_y - row_h < margin + 40:
                c.showPage()
                page_no += 1

                c.setLineWidth(0.8)
                c.rect(margin, margin, W - 2 * margin, H - 2 * margin)

                c.setFont("Helvetica-Bold", 10)
                c.drawString(margin + 10, H - 50, data["application_name"])
                c.drawRightString(W - margin - 10, H - 50, "Penetration Testing Report")

                table_y = H - 100
                table_y = draw_table_header(table_y)

                c.setFont("Helvetica", 9)
                c.setLineWidth(0.5)

            # Row border
            c.setStrokeColor(black)
            c.rect(table_left, table_y - row_h, total_width, row_h, fill=0)

            # Column separators
            c.line(table_left + col1, table_y - row_h, table_left + col1, table_y)
            c.line(table_left + col1 + col2, table_y - row_h, table_left + col1 + col2, table_y)
            c.line(table_left + col1 + col2 + col3, table_y - row_h, table_left + col1 + col2 + col3, table_y)

            # S.No
            c.setFillColor(black)
            c.drawString(table_left + 5, table_y - 14, str(idx))

            # Wrapped Title
            title_para.drawOn(
                c,
                table_left + col1 + 5,
                table_y - text_height - 4
            )

            # Severity (color coded)
            c.setFillColor(SEVERITY_COLORS.get(severity, black))
            c.drawString(
                table_left + col1 + col2 + 5,
                table_y - 14,
                severity
            )

            # Status (Color coded)
            c.setFillColor(STATUS_COLORS.get(status, black))
            c.drawString(
                table_left + col1 + col2 + col3 + 5,
                table_y - 14,
                status
            )

            table_y -= row_h

    # =========================
    # Footer
    # =========================
    c.setFont("Helvetica", 9)
    c.setFillColor(black)
    c.drawString(margin + 10, margin + 15, "Confidential")
    c.drawCentredString(W / 2, margin + 15, f"V {data['version']}")
    c.drawRightString(W - margin - 10, margin + 15, f"Page {page_no} of {total_pages}")