from reportlab.lib.pagesizes import A4

LEGAL_TEXT = [
    "No part of this document may be reproduced or transmitted in any form or by any means",
    "electronic or mechanical including photocopying and recording or by any information",
    "storage or retrieval system except as may be expressly permitted.",
    "",
    "Recipient of this document implicitly consents to this and also in consent with the applicable local",
    "privacy law."
]

def draw_legal(c, data, page_no=2, total_pages=8):
    W, H = A4
    margin = 40

    c.rect(margin, margin, W-2*margin, H-2*margin)

    c.setFont("Helvetica-Bold", 10)
    c.drawString(margin+10, H-50, data["enterprise"])
    c.drawRightString(W-margin-10, H-50, "Penetration Testing Report")

    y = H - 200
    c.setFont("Helvetica-Bold", 10)
    for line in LEGAL_TEXT:
        c.drawCentredString(W/2, y, line)
        y -= 16

    # Footer
    c.setFont("Helvetica", 10)
    c.drawString(margin+10, margin+15, "Confidential")
    c.drawCentredString(W/2, margin+15, f"V {data['version']}")
    c.drawRightString(
    W - margin - 10,
    margin + 15,
    f"Page {page_no} of {total_pages}"
)

