from docx import Document

from .cover import draw_cover


def build_docx(path, data, report_id):

    doc = Document()

    # Cover
    draw_cover(doc, data)

    # TODO next sections
    # draw_legal(doc, data)
    # draw_scan_manifest(doc, data)
    # draw_results(doc, data)

    doc.save(path)