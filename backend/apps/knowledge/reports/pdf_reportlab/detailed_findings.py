from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, white
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from apps.knowledge.models import ReportFinding

# =============================
# Severity Order & Colors
# =============================

SEV_ORDER = {
    "CRITICAL": 0,
    "HIGH": 1,
    "MEDIUM": 2,
    "LOW": 3,
    "INFO": 4,
}

SEV_COLORS = {
    "CRITICAL": HexColor("#C00000"),
    "HIGH": HexColor("#FF0000"),
    "MEDIUM": HexColor("#FFC000"),
    "LOW": HexColor("#0070C0"),
    "INFO": HexColor("#8EA9DB"),
}

LEFT_BLUE = HexColor("#1F4E8C")


# =============================
# Header & Footer (inside border)
# =============================

def draw_layout_header_footer(c, data, page_no, total_pages, margin):
    W, H = A4

    # Outer Border
    c.rect(margin, margin, W - 2 * margin, H - 2 * margin)

    # Header
    c.setFont("Helvetica-Bold", 10)
    c.drawString(margin + 10, H - margin - 25, data["application_name"])
    c.drawRightString(
        W - margin - 10,
        H - margin - 25,
        "Penetration Testing Report"
    )

    # Footer
    c.setFont("Helvetica", 9)
    c.drawString(margin + 10, margin + 15, "Confidential")
    c.drawCentredString(W / 2, margin + 15, f"V {data['version']}")
    c.drawRightString(
        W - margin - 10,
        margin + 15,
        f"Page {page_no} of {total_pages}"
    )


# =============================
# Main Renderer
# =============================

def draw_detailed_findings(c, data, report_id, start_page_no, total_pages):

    W, H = A4
    margin = 55
    page_no = start_page_no

    findings = list(
        ReportFinding.objects.filter(report_id=report_id)
    )

    # Remove empty / incomplete findings
    filtered_findings = []

    for f in findings:
        severity = (f.final_severity or "").strip()
        title = (f.final_title or "").strip()
        description = (f.final_description or "").strip()

        # Only include if tester actually created meaningful vulnerability
        if severity and title and description:
            filtered_findings.append(f)

    findings = filtered_findings

    findings.sort(
        key=lambda f: SEV_ORDER.get(
            (f.final_severity or "INFO").upper(), 4
        )
    )

    if not findings:
        return page_no

    first_page = True

    style = ParagraphStyle(
        "body",
        fontName="Helvetica",
        fontSize=9,
        leading=12
    )

    for idx, f in enumerate(findings, start=1):

        draw_layout_header_footer(c, data, page_no, total_pages, margin)

        y_start = H - margin - 60

        # Title only once
        if first_page:
            c.setFont("Helvetica-Bold", 14)
            c.drawString(margin + 10, y_start, "3. Detailed Findings")
            y_start -= 35
            first_page = False

        table_left = margin + 10
        table_width = W - 2 * margin - 20
        left_col_width = 150
        right_col_width = table_width - left_col_width

        rows = [
            ("Vulnerability {}".format(idx), f.final_title),
            ("Severity", (f.final_severity or "INFO").upper()),
            ("Description", f.final_description),
            ("Impact", f.final_impact),
            ("Recommendation", f.final_remediation),
        ]

        # =============================
        # Calculate Row Heights
        # =============================

        row_heights = []

        for label, value in rows:

            p = Paragraph(str(value or ""), style)

            text_width, text_height = p.wrap(
                right_col_width - 12,
                H  # allow full natural height
            )

            padding_top = 6
            padding_bottom = 6

            final_height = text_height + padding_top + padding_bottom

            row_heights.append(max(28, final_height))

        total_table_height = sum(row_heights)

        # =============================
        # Draw Outer Table Border
        # =============================

        c.rect(
            table_left,
            y_start - total_table_height,
            table_width,
            total_table_height,
            fill=0
        )

        # Vertical divider
        c.line(
            table_left + left_col_width,
            y_start,
            table_left + left_col_width,
            y_start - total_table_height
        )

        y_cursor = y_start

        # =============================
        # Draw Rows
        # =============================

        for i, (label, value) in enumerate(rows):

            row_h = row_heights[i]
            y_cursor -= row_h

            # Horizontal separator
            c.line(
                table_left,
                y_cursor,
                table_left + table_width,
                y_cursor
            )

            # Left blue cell
            c.setFillColor(LEFT_BLUE)
            c.rect(
                table_left,
                y_cursor,
                left_col_width,
                row_h,
                fill=1
            )

            c.setFillColor(white)
            c.setFont("Helvetica-Bold", 9)
            c.drawString(
                table_left + 8,
                y_cursor + row_h - 14,
                label
            )

            # Severity row special
            if label == "Severity":

                sev_color = SEV_COLORS.get(value, SEV_COLORS["INFO"])

                c.setFillColor(sev_color)
                c.rect(
                    table_left + left_col_width,
                    y_cursor,
                    right_col_width,
                    row_h,
                    fill=1
                )

                c.setFillColor(white)
                c.setFont("Helvetica-Bold", 10)
                c.drawCentredString(
                    table_left + left_col_width + right_col_width / 2,
                    y_cursor + row_h / 2 - 4,
                    value
                )

            else:

                p = Paragraph(str(value or ""), style)

                text_width, text_height = p.wrap(
                    right_col_width - 12,
                    H
                )

                text_x = table_left + left_col_width + 6
                text_y = y_cursor + row_h - text_height - 6

                p.drawOn(c, text_x, text_y)

        # =============================
        # Evidence Section (Safe Pagination)
        # =============================

        evidences = list(f.evidences.all())

        if evidences:

            y_cursor -= 25

            # Check space for "Evidence" heading
            if y_cursor < margin + 80:
                c.showPage()
                page_no += 1
                draw_layout_header_footer(c, data, page_no, total_pages, margin)
                y_cursor = H - margin - 60

            c.setFont("Helvetica-Bold", 11)
            c.setFillColor(LEFT_BLUE)
            c.drawString(table_left, y_cursor, "Evidence")

            y_cursor -= 20

            for idx_ev, ev in enumerate(evidences, start=1):

                image_height = 200
                image_width = table_width
                required_space = image_height + 40  # title + spacing

                # 🔴 Check if image fits
                if y_cursor - required_space < margin + 60:
                    c.showPage()
                    page_no += 1
                    draw_layout_header_footer(c, data, page_no, total_pages, margin)
                    y_cursor = H - margin - 60

                # Step label
                c.setFont("Helvetica-Bold", 9)
                c.setFillColor("black")
                c.drawString(
                    table_left,
                    y_cursor,
                    ev.title or f"step-{idx_ev}"
                )

                y_cursor -= 15

                # Draw image safely
                try:
                    image_path = ev.file.path

                    c.drawImage(
                        image_path,
                        table_left,
                        y_cursor - image_height,
                        width=image_width,
                        height=image_height,
                        preserveAspectRatio=True,
                        mask='auto'
                    )

                    y_cursor -= image_height + 25

                except Exception:
                    # If image missing or broken
                    y_cursor -= 20

        c.showPage()
        page_no += 1

    return page_no
