from docx.shared import Pt , Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH


def draw_conclusion(doc, data):

    doc.add_page_break()

    # Title
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Inches(0.3)

 
    run = p.add_run("5. Conclusion")
    run.bold = True
    run.font.size = Pt(14)

    # Paragraph
    conclusion_text = (
        f"Nevertheless, we suggest that the application allocated to "
        f"{data['application_name']} implement the recommendations in this "
        "document with respect to the affected application. We also propose "
        "to follow-on retest to verify that the recommended changes were made "
        "and made correctly. Please note that as technologies and risks change "
        "over time, the vulnerabilities associated with the operation of the "
        "applications described in this report, as well as the actions necessary "
        "to reduce the exposure to such vulnerabilities, will also change."
    )

    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Inches(0.3)
    p.paragraph_format.right_indent = Inches(0.3)
    p.paragraph_format.line_spacing = 1.4
    p.paragraph_format.space_after = Pt(20)
    run = p.add_run(conclusion_text)
    run.font.size = Pt(10)

    run = p.add_run(conclusion_text)
    run.font.size = Pt(10)

    # End line
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(20)

    run = p.add_run("----END OF THE DOCUMENT----")
    run.bold = True
    run.font.size = Pt(10)