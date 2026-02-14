from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from .cover import draw_cover
from .legal import draw_legal
from .toc import draw_toc
from .scan_manifest import draw_scan_manifest
from .executive_summary import draw_executive_summary
from .methodology import draw_methodology
from .results import draw_results
from .detailed_findings import draw_detailed_findings
from .conclusion import draw_conclusion



def build_report(path, data, report_id):   # <-- FIXED: accepts report_id
    c = canvas.Canvas(path, pagesize=A4)

    total_pages = data.get("total_pages", 8)

    # -------------------------
    # Page 1 – Cover
    # -------------------------
    draw_cover(c, data,page_no=1, total_pages=8)
    c.showPage()

    # -------------------------
    # Page 2 – Legal
    # -------------------------
    draw_legal(c, data, page_no=2, total_pages=total_pages)
    c.showPage()

    # -------------------------
    # Page 3 – Table of Contents
    # -------------------------
    draw_toc(c, data, page_no=3, total_pages=total_pages)
    c.showPage()

    # -------------------------
    # Page 4 – Scan Manifest
    # -------------------------
    draw_scan_manifest(c, data, page_no=4, total_pages=total_pages)
    c.showPage()

    # -------------------------
    # Page 5 – Executive Summary
    # -------------------------
    draw_executive_summary(c, data, page_no=5, total_pages=total_pages)
    c.showPage()

    # -------------------------
    # Page 6 – Methodology
    # -------------------------
    draw_methodology(c, data, page_no=6, total_pages=total_pages)
    c.showPage()

    # -------------------------
    # Page 7 – Results  
    # -------------------------
    draw_results(c, data, report_id, page_no=7, total_pages=total_pages)
    c.showPage()

    # -------------------------
    # Page 8 - Detailed Finding
    # -------------------------
    
    draw_detailed_findings(c, data, report_id, start_page_no=8, total_pages=total_pages)

    # -------------------------
    # Final Page – Conclusion
    # -------------------------
    draw_conclusion(
        c,
        data,
        page_no=total_pages,
        total_pages=total_pages
    )
    c.showPage()

    c.save()
