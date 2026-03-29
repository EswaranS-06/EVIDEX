from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def add_bookmark(paragraph, name):
    if not hasattr(add_bookmark, 'bookmark_counter'):
        add_bookmark.bookmark_counter = 1
    else:
        add_bookmark.bookmark_counter += 1

    bookmark_id = str(add_bookmark.bookmark_counter)

    start = OxmlElement('w:bookmarkStart')
    start.set(qn('w:id'), bookmark_id)
    start.set(qn('w:name'), name)

    end = OxmlElement('w:bookmarkEnd')
    end.set(qn('w:id'), bookmark_id)

    paragraph._p.insert(0, start)
    paragraph._p.append(end)