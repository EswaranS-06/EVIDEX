from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from PIL import Image
import tempfile
import os
from apps.knowledge.models import ReportFinding


# =============================
# COLORS
# =============================
SEV_COLORS = {
    "CRITICAL": "C00000",
    "HIGH": "FF0000",
    "MEDIUM": "FFC000",
    "LOW": "0070C0",
    "INFO": "8EA9DB",
}

LEFT_BLUE = "1F4E8C"

# =============================
# HELPERS
# =============================
def set_cell_bg(cell, color):
    tcPr = cell._element.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), color)
    tcPr.append(shd)

def set_row_height(row, height):
    tr = row._tr
    trPr = tr.get_or_add_trPr()
    trHeight = OxmlElement('w:trHeight')
    trHeight.set(qn('w:val'), str(height))
    trHeight.set(qn('w:hRule'), 'atLeast')
    trPr.append(trHeight)

# =============================
# MAIN FUNCTION
# =============================
def draw_detailed_findings(doc, data, report_id):

    findings = list(ReportFinding.objects.filter(report_id=report_id))

    findings = [
        f for f in findings
        if f.final_title and f.final_severity and f.final_description
    ]

    if not findings:
        return

    # TITLE
    p = doc.add_paragraph()
    run = p.add_run("3. Detailed Findings")
    run.bold = True
    run.font.size = Pt(14)
 
    run = p.add_run("4. Penetration Testing Results")


    doc.add_paragraph("")
    for idx, f in enumerate(findings, start=1):

        table = doc.add_table(rows=5, cols=2)
        table.style = "Table Grid"
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False
        table.width = Inches(6.2)

        table.columns[0].width = Inches(1.8)
        table.columns[1].width = Inches(4.2)
        

        rows_data = [
            ("Vulnerability {}".format(idx), f.final_title),
            ("Severity", (f.final_severity or "INFO").upper()),
            ("Description", f.final_description),
            ("Impact", f.final_impact),
            ("Recommendation", f.final_remediation),
        ]

        for i, (label, value) in enumerate(rows_data):

            left = table.rows[i].cells[0]
            right = table.rows[i].cells[1]

            # LEFT CELL
            set_cell_bg(left, LEFT_BLUE)
            left.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER

            p_left = left.paragraphs[0]
            p_left.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p_left.paragraph_format.space_before = Pt(4)
            p_left.paragraph_format.space_after = Pt(4)

            run = p_left.add_run(label)
            run.bold = True
            run.font.size = Pt(9)
            run.font.color.rgb = RGBColor(255, 255, 255)

            # RIGHT CELL
            right.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER

            p_right = right.paragraphs[0]
            p_right.paragraph_format.space_before = Pt(4)
            p_right.paragraph_format.space_after = Pt(4)

            if label == "Severity":
                sev = value.upper()
                color = SEV_COLORS.get(sev, SEV_COLORS["INFO"])

                set_cell_bg(right, color)
                p_right.alignment = WD_ALIGN_PARAGRAPH.CENTER

                run = p_right.add_run(sev)
                run.bold = True
                run.font.size = Pt(10)
                run.font.color.rgb = RGBColor(255, 255, 255)
            else:
                p_right.alignment = WD_ALIGN_PARAGRAPH.LEFT

                run = p_right.add_run(str(value or ""))
                run.font.size = Pt(9)

            set_row_height(table.rows[i], 500)

        doc.add_paragraph("")
        
        tbl = table._element
        tblPr = tbl.tblPr
        tblW = OxmlElement('w:tblW')
        tblW.set(qn('w:w'), str(int(6.8 * 1440)))  # 6.2 inches in twips
        tblW.set(qn('w:type'), 'dxa')
        tblPr.append(tblW)

        # =============================
        # EVIDENCE SECTION
        # =============================
        evidences = list(f.evidences.all())

        if evidences:
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT

            run = p.add_run("Evidence")
            run.bold = True
            run.font.size = Pt(11)
            run.font.color.rgb = RGBColor(31, 78, 140)

            for ev in evidences:

                p_title = doc.add_paragraph()
                p_title.alignment = WD_ALIGN_PARAGRAPH.LEFT

                run = p_title.add_run(ev.title or "step")
                run.font.size = Pt(9)

                if ev.file and os.path.exists(ev.file.path):
                    try:
                        img = Image.open(ev.file.path)
                        img = img.convert("RGB")

                        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
                        img.save(tmp.name)

                        p_img = doc.add_paragraph()
                        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
                        p_img.paragraph_format.space_before = Pt(8)
                        p_img.paragraph_format.space_after = Pt(8)

                        run = p_img.add_run()
                        run.add_picture(tmp.name, width=Inches(5.5))

                    except Exception as e:
                        print("Image error:", e)

                        p_err = doc.add_paragraph("(Invalid image format)")
                        p_err.alignment = WD_ALIGN_PARAGRAPH.CENTER

                else:
                    p_err = doc.add_paragraph("(Image not found)")
                    p_err.alignment = WD_ALIGN_PARAGRAPH.CENTER

                doc.add_paragraph("")

        # =============================
        # ✅ PAGE BREAK (FINAL FIX)
        # =============================
        if idx != len(findings):
            doc.add_page_break()