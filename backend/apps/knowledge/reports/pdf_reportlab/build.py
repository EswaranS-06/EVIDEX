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
from .watermark import draw_watermark   # ✅ ADD THIS

def build_report(path, data, report_id):

    # =========================
    # FIRST PASS (calculate pages)
    # =========================
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)

    page_no = 1
    section_pages = {}

    # COVER
    section_pages["cover"] = page_no
    draw_cover(c, data, page_no, 0)
    c.showPage()
    page_no += 1

    # LEGAL
    section_pages["legal"] = page_no
    draw_legal(c, data, page_no, 0)
    c.showPage()
    page_no += 1

    # TOC (empty first pass)
    section_pages["toc"] = page_no
    c.showPage()
    page_no += 1

    # SCOPE
    section_pages["scope"] = page_no
    draw_scan_manifest(c, data, page_no, 0)
    c.showPage()
    page_no += 1

    # EXEC SUMMARY
    section_pages["executive_summary"] = page_no
    draw_executive_summary(c, data, page_no, 0)
    c.showPage()
    page_no += 1

    # METHODOLOGY
    section_pages["methodology"] = page_no
    draw_methodology(c, data, page_no, 0)
    c.showPage()
    page_no += 1

    # RESULTS
    section_pages["results"] = page_no
    draw_results(c, data, report_id, page_no, 0)
    c.showPage()
    page_no += 1

    # DETAILED FINDINGS (multi-page)
    section_pages["detailed_findings"] = page_no
    page_no = draw_detailed_findings(
        c, data, report_id, start_page_no=page_no, total_pages=0
    )

    # CONCLUSION
    section_pages["conclusion"] = page_no
    draw_conclusion(c, data, report_id, page_no, 0)
    c.showPage()
    page_no += 1

    total_pages = page_no - 1
    c.save()

    # =========================
    # SECOND PASS (FINAL PDF)
    # =========================
    c = canvas.Canvas(path, pagesize=A4)
    page_no = 1

    # -------------------------
    # COVER
    # -------------------------
    draw_watermark(c, data)
    draw_cover(c, data, page_no, total_pages)
    c.showPage()
    page_no += 1

    # -------------------------
    # LEGAL
    # -------------------------
    draw_watermark(c, data)
    draw_legal(c, data, page_no, total_pages)
    c.showPage()
    page_no += 1

    # -------------------------
    # TOC
    # -------------------------
    draw_watermark(c, data)
    draw_toc(c, data, page_no, total_pages, section_pages)
    c.showPage()
    page_no += 1

    # -------------------------
    # SCOPE
    # -------------------------
    draw_watermark(c, data)
    draw_scan_manifest(c, data, page_no, total_pages)
    c.showPage()
    page_no += 1

    # -------------------------
    # EXEC SUMMARY
    # -------------------------
    draw_watermark(c, data)
    draw_executive_summary(c, data, page_no, total_pages)
    c.showPage()
    page_no += 1

    # -------------------------
    # METHODOLOGY
    # -------------------------
    draw_watermark(c, data)
    draw_methodology(c, data, page_no, total_pages)
    c.showPage()
    page_no += 1

    # -------------------------
    # RESULTS
    # -------------------------
    draw_watermark(c, data)
    draw_results(c, data, report_id, page_no, total_pages)
    c.showPage()
    page_no += 1

    # -------------------------
    # DETAILED FINDINGS (⚠️ SPECIAL CASE)
    # -------------------------
    # ❗ IMPORTANT:
    # This function creates multiple pages internally
    # 👉 You MUST ALSO call draw_watermark inside that file
    page_no = draw_detailed_findings(
        c, data, report_id, start_page_no=page_no, total_pages=total_pages
    )

    # -------------------------
    # CONCLUSION
    # -------------------------
    draw_watermark(c, data)
    draw_conclusion(c, data, report_id, page_no, total_pages)
    c.showPage()

    c.save()