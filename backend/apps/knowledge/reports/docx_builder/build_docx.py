from docx import Document

from .cover import draw_cover
from .legal import draw_legal
from .scan_manifest import draw_scan_manifest
from .toc import draw_toc
from .executive_summary import draw_executive_summary
from .methodology import draw_methodology
from .results import draw_results
from .detailed_findings import draw_detailed_findings
from .conclusion import draw_conclusion

def build_docx(path, data, report_id):
    page = 1

    doc = Document()

    # Cover
    draw_cover(doc, data)
    page += 1

    # Legal
    draw_legal(doc, data)
    page += 1

    # TOC - Generate early, bookmarks will be created later
    section_pages = {
        "executive_summary": 5,
        "methodology": 6,
        "scope": 7,
        "results": 8,
        "conclusion": 10,
    }

    draw_toc(doc, section_pages)
    page += 1

    # Scan Manifest
    draw_scan_manifest(doc, data)
    page += 1

    # Executive Summary (with bookmark)
    draw_executive_summary(doc, data, page_no=1, total_pages=1)
    page += 1

    # Methodology (with bookmark)
    draw_methodology(doc, data, page_no=1, total_pages=1)
    page += 1

    # Results (with bookmarks for scope and results)
    draw_results(doc, data, report_id)
    page += 1

    # Detailed Findings
    draw_detailed_findings(doc, data, report_id)
    page += 1

    # Conclusion (with bookmark)
    draw_conclusion(doc, data)
    page += 1

    doc.save(path)