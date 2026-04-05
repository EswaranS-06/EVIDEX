from django.utils import timezone


def get_client_ip(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")

    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()

    return request.META.get("REMOTE_ADDR", "")


def get_watermark_data(request):
    username = request.user.username

    # 🔥 TRY MULTIPLE SOURCES (THIS IS THE FIX)
    frontend_ip = (
        request.data.get("ip") or
        request.POST.get("ip") or
        request.GET.get("ip")
    )

    backend_ip = get_client_ip(request)

    # =========================
    # FINAL DECISION
    # =========================
    if frontend_ip:
        ip = frontend_ip
    else:
        ip = backend_ip  # fallback

    timestamp = timezone.localtime().strftime("%Y-%m-%d %H:%M:%S")

    return {
        "username": username,
        "ip": ip,
        "timestamp": timestamp,
    }