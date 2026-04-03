from reportlab.lib.colors import Color
from reportlab.lib.pagesizes import A4
from apps.knowledge.utils.watermark import get_watermark_data

def draw_watermark(c, data):
    W, H = A4

    wm = data.get("watermark_data", {})

    username = wm.get("username", "")
    ip = wm.get("ip", "")
    timestamp = wm.get("timestamp", "")

    watermark_text = f"{username} | {ip} | {timestamp}"

    # SAVE STATE (important)
    c.saveState()

    # Light grey transparent feel
    c.setFillColor(Color(0.6, 0.6, 0.6, alpha=0.2))

    # Rotate for diagonal watermark
    c.translate(W / 2, H / 2)
    c.rotate(45)

    # Font
    c.setFont("Helvetica-Bold", 30)

    # Draw center
    c.drawCentredString(0, 0, watermark_text)

    # RESTORE STATE
    c.restoreState()