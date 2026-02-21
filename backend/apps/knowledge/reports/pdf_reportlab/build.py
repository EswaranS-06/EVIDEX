from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from io import BytesIO

from .cover import draw_cover
from .legal import draw_legal
from .toc import draw_toc
from .scan_manifest import draw_scan_manifest
from .executive_summary import draw_executive_summary
from .methodology import draw_methodology
from .results import draw_results
from .detailed_findings import draw_detailed_findings
from .conclusion import draw_conclusion


def build_report(path, data, report_id):

    # =========================
    # FIRST PASS (calculate pages)
    # =========================

    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)

    page_no = 1
    section_pages = {}

    section_pages["cover"] = page_no
    draw_cover(c, data, page_no, 0)
    c.showPage()
    page_no += 1

    section_pages["legal"] = page_no
    draw_legal(c, data, page_no, 0)
    c.showPage()
    page_no += 1

    section_pages["toc"] = page_no
    c.showPage()
    page_no += 1

    section_pages["scope"] = page_no
    draw_scan_manifest(c, data, page_no, 0)
    c.showPage()
    page_no += 1

    section_pages["executive_summary"] = page_no
    draw_executive_summary(c, data, page_no, 0)
    c.showPage()
    page_no += 1

    section_pages["methodology"] = page_no
    draw_methodology(c, data, page_no, 0)
    c.showPage()
    page_no += 1

    section_pages["results"] = page_no
    draw_results(c, data, report_id, page_no, 0)
    c.showPage()
    page_no += 1

    section_pages["detailed_findings"] = page_no
    page_no = draw_detailed_findings(
        c, data, report_id, start_page_no=page_no, total_pages=0
    )

    section_pages["conclusion"] = page_no
    draw_conclusion(c, data, page_no, 0)
    c.showPage()
    page_no += 1

    total_pages = page_no - 1

    c.save()

    # =========================
    # SECOND PASS (final render)
    # =========================

    c = canvas.Canvas(path, pagesize=A4)
    page_no = 1

    draw_cover(c, data, page_no, total_pages)
    c.showPage()
    page_no += 1

    draw_legal(c, data, page_no, total_pages)
    c.showPage()
    page_no += 1

    draw_toc(c, data, page_no, total_pages, section_pages)
    c.showPage()
    page_no += 1

    draw_scan_manifest(c, data, page_no, total_pages)
    c.showPage()
    page_no += 1

    draw_executive_summary(c, data, page_no, total_pages)
    c.showPage()
    page_no += 1

    draw_methodology(c, data, page_no, total_pages)
    c.showPage()
    page_no += 1

    draw_results(c, data, report_id, page_no, total_pages)
    c.showPage()
    page_no += 1

    page_no = draw_detailed_findings(
        c, data, report_id, start_page_no=page_no, total_pages=total_pages
    )

    draw_conclusion(c, data, page_no, total_pages)
    c.showPage()

    c.save()