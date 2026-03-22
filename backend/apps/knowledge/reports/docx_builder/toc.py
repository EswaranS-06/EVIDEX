from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT, WD_TAB_LEADER
from docx.shared import Pt, RGBColor, Inches

def draw_toc(doc, section_pages):

    doc.add_paragraph("")
    doc.add_paragraph("")

    # TITLE
    p = doc.add_paragraph()
    run = p.add_run("Table of Contents")
    run.bold = True
    run.font.size = Pt(14)
    run.font.color.rgb = RGBColor(31, 79, 216)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.add_paragraph("")

    entries = [
        ("1. Executive Summary", section_pages.get("exec_summary")),
        ("1.1 Overview", section_pages.get("exec_summary")),
        ("1.2 Risk Model", section_pages.get("exec_summary")),
        ("2. Web Application Penetration Testing Methodology", section_pages.get("methodology")),
        ("3. Project Scope", section_pages.get("scope")),
        ("4. Penetration Testing Results", section_pages.get("results")),
        ("5. Conclusion", section_pages.get("conclusion")),
    ]

    for title, page in entries:

        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Inches(0.5)

        tab_stops = p.paragraph_format.tab_stops
        tab_stops.add_tab_stop(
            Pt(480),
            WD_TAB_ALIGNMENT.RIGHT,
            WD_TAB_LEADER.DOTS
        )

        run = p.add_run(title)
        run.bold = True
        run.font.size = Pt(10)

        p.add_run("\t")

        run = p.add_run(str(page or ""))
        run.bold = True
        run.font.size = Pt(10)

    doc.add_page_break()