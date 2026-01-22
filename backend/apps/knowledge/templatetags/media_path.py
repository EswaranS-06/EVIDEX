import os
from django import template
from django.conf import settings

register = template.Library()

@register.filter
def media_file(url):
    """
    Convert /media/xxx into file:///absolute/path for WeasyPrint
    """
    if not url:
        return ""

    if url.startswith(settings.MEDIA_URL):
        relative_path = url.replace(settings.MEDIA_URL, "")
        absolute_path = os.path.join(settings.MEDIA_ROOT, relative_path)
        return f"file:///{absolute_path.replace(os.sep, '/')}"
    return url

from django import template
from pathlib import Path

register = template.Library()

@register.filter
def file_uri(path):
    try:
        return Path(path).as_uri()
    except Exception:
        return path
