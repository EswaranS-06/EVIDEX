from reportlab.lib.pagesizes import A4

def draw_cover(c, d, page_no=1, total_pages=8):
    W, H = A4
    margin = 40

    # Always cast to string (prevents Django object crash)
    def s(x):
        return "" if x is None else str(x)

    # Outer border
    c.rect(margin, margin, W - 2*margin, H - 2*margin)

    # Header
    c.setFont("Helvetica-Bold", 10)
    c.drawString(margin + 10, H - 50, s(d["enterprise"]))
    c.drawRightString(W - margin - 10, H - 50, "Penetration Testing Report")

    # Title
    y = H - 200
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(W / 2, y, "PENETRATION TESTING REPORT")

    y -= 25
    c.drawCentredString(W / 2, y, "FOR")

    y -= 25
    c.drawCentredString(W / 2, y, s(d["enterprise"]))

    y -= 25
    c.setFont("Helvetica", 11)
    c.drawCentredString(W / 2, y, f"PT Conducted on {s(d['pt_date'])}")

    y -= 20
    c.drawCentredString(W / 2, y, f"Conducted by {s(d['conducted_by'])}")

    # -------------------------
    # Table (4 columns)
    # -------------------------
    table_top = y - 50
    row_h = 24

    table_width = 480
    table_left = (W - table_width) / 2

    col1 = 120   # label
    col2 = 160   # value
    col3 = 100   # label
    col4 = 100   # value

    rows = [
        ("Document Type", "Penetration Testing Report", "Version ", s(d["version"])),
        ("Assessee", s(d["assessee"]), "Signature", ""),
        ("Assessor", s(d["assessor"]), "Signature", ""),
        ("Reviewer", s(d["reviewer"]), "Signature", ""),
        ("Approved by", s(d["approved"]), "Signature", ""),
    ]

    for i, r in enumerate(rows):
        y0 = table_top - (i + 1) * row_h

        # Cell borders
        c.rect(table_left, y0, col1, row_h)
        c.rect(table_left + col1, y0, col2, row_h)
        c.rect(table_left + col1 + col2, y0, col3, row_h)
        c.rect(table_left + col1 + col2 + col3, y0, col4, row_h)

        # Text
        c.setFont("Helvetica", 9)
        c.drawString(table_left + 5, y0 + 7, r[0])
        c.drawString(table_left + col1 + 5, y0 + 7, r[1])
        c.drawString(table_left + col1 + col2 + 5, y0 + 7, r[2])
        c.drawString(table_left + col1 + col2 + col3 + 5, y0 + 7, r[3])

    # Footer
    c.setFont("Helvetica", 9)
    c.drawString(margin + 10, margin + 15, "Confidential")
    c.drawCentredString(W / 2, margin + 15, f"V {s(d['version'])}")
    c.drawRightString(W - margin - 10, margin + 15,f"Page {page_no} of {total_pages}")
