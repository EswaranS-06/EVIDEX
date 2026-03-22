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

        
    enterprise = d.get("enterprise")
    application_name = d.get("application_name")
    pt_date = d.get("pt_date")

    # what you display in UI
    pt_date = d.get("pt_date")
    conducted_by = application_name
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

    header_table = header.add_table(rows=1, cols=2, width=Inches(7.27))
    header_table.autofit = False
    remove_table_cell_margins(header_table)

    left = header_table.rows[0].cells[0].paragraphs[0]
    run = left.add_run(enterprise)
    run.bold = True
    run.font.size = Pt(10)

    right = header_table.rows[0].cells[1].paragraphs[0]
    right.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run = right.add_run("Penetration Testing Report")
    run.bold = True
    run.font.size = Pt(10)
    # -------------------------
    # FOOTER (DYNAMIC FIX)
    # -------------------------
    footer = section.footer

    footer_table = footer.add_table(rows=1, cols=3, width=Inches(7.27))
    footer_table.autofit = False
    remove_table_cell_margins(footer_table)

    # LEFT
    footer_table.rows[0].cells[0].text = "Confidential"

    # CENTER
    footer_table.rows[0].cells[1].text = f"V {version}"
    footer_table.rows[0].cells[1].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER

    # RIGHT (🔥 DYNAMIC PAGE NUMBER)
    cell = footer_table.rows[0].cells[2]
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT

    run = p.add_run("Page ")

    # PAGE FIELD
    fldChar1 = OxmlElement('w:fldChar')
    fldChar1.set(qn('w:fldCharType'), 'begin')

    instrText = OxmlElement('w:instrText')
    instrText.text = "PAGE"

    fldChar2 = OxmlElement('w:fldChar')
    fldChar2.set(qn('w:fldCharType'), 'end')

    run._r.append(fldChar1)
    run._r.append(instrText)
    run._r.append(fldChar2)
    
    # -------------------------
    # TITLE
    # -------------------------
    doc.add_paragraph("")
    doc.add_paragraph("")
    doc.add_paragraph("")

    p = doc.add_paragraph("PENETRATION TESTING REPORT")
    p.runs[0].bold = True
    p.runs[0].font.size = Pt(14)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.add_paragraph("FOR").alignment = WD_ALIGN_PARAGRAPH.CENTER
    doc.add_paragraph(enterprise).alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.add_paragraph("")

    doc.add_paragraph(f"PT Conducted on {pt_date}").alignment = WD_ALIGN_PARAGRAPH.CENTER
    doc.add_paragraph(f"Conducted by {conducted_by}").alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.add_paragraph("")
    doc.add_paragraph("")

    # -------------------------
    # TABLE (FINAL FIX)
    # -------------------------
    table = doc.add_table(rows=5, cols=4)
    table.style = "Table Grid"
    table.autofit = False
    table.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # 🔥 TOTAL WIDTH CONTROL (ONLY ONCE)
    tbl = table._element
    tblPr = tbl.tblPr

    tblLayout = OxmlElement('w:tblLayout')
    tblLayout.set(qn('w:type'), 'fixed')
    tblPr.append(tblLayout)

    tblW = OxmlElement('w:tblW')
    tblW.set(qn('w:w'), str(int(6.5 * 1440)))  # wider table
    tblW.set(qn('w:type'), 'dxa')
    tblPr.append(tblW)

    # 🔥 COLUMN WIDTHS (balanced properly)
    col_widths = [1.4, 2.4, 1.2, 0.9]

    for i, width in enumerate(col_widths):
        table.columns[i].width = Inches(width)

    # -------------------------
    # DATA
    # -------------------------
    rows = [
        ("Document Type", "Penetration Testing Report", "Version", version),
        ("Assessee", assessee, "Signature", ""),
        ("Assessor", assessor, "Signature", ""),
        ("Reviewer", reviewed_by, "Signature", ""),
        ("Approved by", approved_by, "Signature", ""),
    ]

    for i, r in enumerate(rows):
        row = table.rows[i]

        for j in range(4):
            cell = row.cells[j]
            cell.width = Inches(col_widths[j])  # 🔥 FORCE WIDTH

            p = cell.paragraphs[0]

            # spacing (clean look)
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)

            run = p.add_run(s(r[j]))
            run.font.size = Pt(9)

    doc.add_page_break()