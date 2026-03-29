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

from docx.oxml import OxmlElement
from docx.oxml.ns import qn





def build_docx(path, data, report_id):

    doc = Document()

    # -------------------------
    # 1. COVER
    # -------------------------
    draw_cover(doc, data)

    # -------------------------
    # 2. LEGAL
    # -------------------------
    draw_legal(doc, data)

    # -------------------------
    # 3. TOC (STATIC + PAGEREF)
    # -------------------------
    # ⚠️ section_pages NOT needed anymore
    draw_toc(doc, section_pages={})

    # -------------------------
    # 4. SCAN MANIFEST
    # -------------------------
    draw_scan_manifest(doc, data)

    # -------------------------
    # 5. EXECUTIVE SUMMARY
    # -------------------------
    draw_executive_summary(doc, data)

    # -------------------------
    # 6. METHODOLOGY
    # -------------------------
    draw_methodology(doc, data)

    # -------------------------
    # 7. RESULTS (THIS MUST HAVE BOOKMARKS)
    # -------------------------
    draw_results(doc, data, report_id)

    # -------------------------
    # 8. DETAILED FINDINGS (THIS MUST HAVE BOOKMARK)
    # -------------------------
    draw_detailed_findings(doc, data, report_id)

    # -------------------------
    # 9. CONCLUSION (THIS MUST HAVE BOOKMARK)
    # -------------------------
    draw_conclusion(doc, data, report_id)

    # -------------------------
    # AUTO UPDATE FIELDS (CRITICAL)
    # -------------------------
    settings = doc.settings.element
    update_fields = OxmlElement('w:updateFields')
    update_fields.set(qn('w:val'), 'true')
    settings.append(update_fields)

    # -------------------------
    # SAVE
    # -------------------------
    doc.save(path)