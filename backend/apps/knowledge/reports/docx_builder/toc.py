from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT, WD_TAB_LEADER
from docx.shared import Pt, RGBColor, Inches

# =========================
# FORMAT SECTION NUMBER
# =========================
def format_section(section):
    return section.rjust(4)   # key for last-digit alignment

# =========================
# TOC
# =========================
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
        ("Executive Summary", "1"),
        ("Overview", "1.1"),
        ("Risk Model", "1.2"),
        ("Web Application Penetration Testing Methodology", "2"),
        ("Project Scope", "3"),
        ("Penetration Testing Results", "4"),
        ("Conclusion", "5"),
    ]

    for title, section in entries:

        p = doc.add_paragraph()

        # SAME LEFT ALIGNMENT
        p.paragraph_format.left_indent = Inches(0.5)

        # ADD TAB STOP (DO NOT CLEAR)
        tab_stops = p.paragraph_format.tab_stops
        tab_stops.add_tab_stop(
            Inches(6.5),
            WD_TAB_ALIGNMENT.RIGHT,
            WD_TAB_LEADER.DOTS
        )

        # LEFT TEXT
        run = p.add_run(title)
        run.bold = True
        run.font.size = Pt(10)

        # TAB
        p.add_run("\t")

        # RIGHT NUMBER (aligned by last digit)
        run = p.add_run(format_section(section))
        run.bold = True
        run.font.size = Pt(10)

    doc.add_page_break()