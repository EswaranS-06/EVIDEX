from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Pt, Inches
from docx.oxml import OxmlElement
from docx.oxml.ns import qn


def remove_table_cell_margins(table):
    tbl = table._element
    tblPr = tbl.tblPr

    tblCellMar = OxmlElement('w:tblCellMar')

    for m in ["top", "left", "bottom", "right"]:
        node = OxmlElement(f"w:{m}")
        node.set(qn("w:w"), "0")
        node.set(qn("w:type"), "dxa")
        tblCellMar.append(node)

    tblPr.append(tblCellMar)


def draw_cover(doc, d):

    def s(x):
        return "" if x is None else str(x)

    enterprise = s(d.get("enterprise"))
    pt_date = s(d.get("pt_date"))
    conducted_by = s(d.get("conducted_by"))
    version = s(d.get("version"))
    assessee = s(d.get("assessee"))
    assessor = s(d.get("assessor"))
    reviewed_by = s(d.get("reviewed_by"))
    approved_by = s(d.get("approved_by"))

    section = doc.sections[0]

    # -------------------------
    # PAGE MARGINS
    # -------------------------

    section.top_margin = Inches(0.5)
    section.bottom_margin = Inches(0.5)
    section.left_margin = Inches(0.5)
    section.right_margin = Inches(0.5)

    section.header_distance = Inches(0.1)
    section.footer_distance = Inches(0.1)

    # -------------------------
    # PAGE BORDER
    # -------------------------

    sectPr = section._sectPr
    pgBorders = OxmlElement('w:pgBorders')

    for side in ['top', 'left', 'bottom', 'right']:
        border = OxmlElement(f'w:{side}')
        border.set(qn('w:val'), 'single')
        border.set(qn('w:sz'), '12')
        border.set(qn('w:space'), '0')
        border.set(qn('w:color'), '000000')
        pgBorders.append(border)

    sectPr.append(pgBorders)

    # -------------------------
    # HEADER
    # -------------------------

    header = section.header

    header_table = header.add_table(
        rows=1,
        cols=2,
        width=Inches(7.27)
    )

    header_table.autofit = False
    remove_table_cell_margins(header_table)

    left = header_table.rows[0].cells[0].paragraphs[0]
    left.paragraph_format.space_before = Pt(0)
    left.paragraph_format.space_after = Pt(0)

    run = left.add_run(enterprise)
    run.bold = True
    run.font.name = "Arial"
    run.font.size = Pt(10)

    right = header_table.rows[0].cells[1].paragraphs[0]
    right.paragraph_format.space_before = Pt(0)
    right.paragraph_format.space_after = Pt(0)
    right.alignment = WD_ALIGN_PARAGRAPH.RIGHT

    run = right.add_run("Penetration Testing Report")
    run.bold = True
    run.font.name = "Arial"
    run.font.size = Pt(10)

    # -------------------------
    # FOOTER
    # -------------------------

    footer = section.footer

    footer_table = footer.add_table(
        rows=1,
        cols=3,
        width=Inches(7.27)
    )

    footer_table.autofit = False
    remove_table_cell_margins(footer_table)

    left = footer_table.rows[0].cells[0].paragraphs[0]
    left.paragraph_format.space_before = Pt(0)
    left.paragraph_format.space_after = Pt(0)

    run = left.add_run("Confidential")
    run.bold = True
    run.font.name = "Arial"
    run.font.size = Pt(10)

    center = footer_table.rows[0].cells[1].paragraphs[0]
    center.paragraph_format.space_before = Pt(0)
    center.paragraph_format.space_after = Pt(0)
    center.alignment = WD_ALIGN_PARAGRAPH.CENTER

    run = center.add_run(f"V {version}")
    run.bold = True
    run.font.name = "Arial"
    run.font.size = Pt(10)

    right = footer_table.rows[0].cells[2].paragraphs[0]
    right.paragraph_format.space_before = Pt(0)
    right.paragraph_format.space_after = Pt(0)
    right.alignment = WD_ALIGN_PARAGRAPH.RIGHT

    run = right.add_run("Page 1")
    run.bold = True
    run.font.name = "Arial"
    run.font.size = Pt(10)

    # -------------------------
    # TITLE SECTION
    # -------------------------

    doc.add_paragraph("")
    doc.add_paragraph("")
    doc.add_paragraph("")

    p = doc.add_paragraph()
    run = p.add_run("PENETRATION TESTING REPORT")
    run.bold = True
    run.font.name = "Arial"
    run.font.size = Pt(14)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    p = doc.add_paragraph("FOR")
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    p = doc.add_paragraph(enterprise)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.add_paragraph("")

    p = doc.add_paragraph(f"PT Conducted on {pt_date}")
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    p = doc.add_paragraph(f"Conducted by {conducted_by}")
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.add_paragraph("")
    doc.add_paragraph("")

    # -------------------------
    # COVER TABLE
    # -------------------------

    table = doc.add_table(rows=5, cols=4)
    table.style = "Table Grid"
    table.autofit = False
    table.alignment = WD_ALIGN_PARAGRAPH.CENTER

    table.columns[0].width = Inches(1.8)
    table.columns[1].width = Inches(2.6)
    table.columns[2].width = Inches(1.4)
    table.columns[3].width = Inches(1.47)

    rows = [
        ("Document Type", "Penetration Testing Report", "Version", version),
        ("Assessee", assessee, "Signature", ""),
        ("Assessor", assessor, "Signature", ""),
        ("Reviewer", reviewed_by, "Signature", ""),
        ("Approved by", approved_by, "Signature", ""),
    ]

    for i, r in enumerate(rows):
        cells = table.rows[i].cells
        for j in range(4):
            p = cells[j].paragraphs[0]
            run = p.add_run(s(r[j]))
            run.font.name = "Arial"
            run.font.size = Pt(9)

    doc.add_page_break()