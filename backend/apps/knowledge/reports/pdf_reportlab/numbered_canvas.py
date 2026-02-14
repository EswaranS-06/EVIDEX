# from reportlab.pdfgen import canvas


# class NumberedCanvas(canvas.Canvas):
#     def __init__(self, *args, **kwargs):
#         super().__init__(*args, **kwargs)
#         self._saved_page_states = []

#     def showPage(self):
#         self._saved_page_states.append(dict(self.__dict__))
#         self._startPage()

#     def save(self):
#         total_pages = len(self._saved_page_states)

#         for state in self._saved_page_states:
#             self.__dict__.update(state)
#             self.draw_page_number(total_pages)
#             super().showPage()

#         super().save()

#     def draw_page_number(self, total_pages):
#         page = self._pageNumber
#         self.setFont("Helvetica", 9)
#         self.drawRightString(
#             550,  # adjust based on margin
#             30,
#             f"Page {page} of {total_pages}"
#         )
