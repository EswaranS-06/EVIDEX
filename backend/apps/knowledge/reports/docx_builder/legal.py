from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Pt



LEGAL_TEXT = [
    "No part of this document may be reproduced or transmitted in any form or by any means",
    "electronic or mechanical including photocopying and recording or by any information",
    "storage or retrieval system except as may be expressly permitted.",
    "",
    "Recipient of this document implicitly consents to this and also in consent with the applicable local",
    "privacy law."
]


def draw_legal(doc, data):

    # space from top similar to PDF layout
    doc.add_paragraph("")
    doc.add_paragraph("")
    doc.add_paragraph("")
    doc.add_paragraph("")
    doc.add_paragraph("")

    for line in LEGAL_TEXT:

        p = doc.add_paragraph()

        run = p.add_run(line)

        run.font.name = "Arial"
        run.font.size = Pt(10)
        run.bold = True

        p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # push text away from footer area
    for _ in range(10):
        doc.add_paragraph("")

    doc.add_page_break()