from django.utils import timezone

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0]
    return request.META.get('REMOTE_ADDR')


def get_watermark_data(request):

    tester_name = request.user.username

    input_ip = request.data.get("ip") if hasattr(request, "data") else None
    real_ip = get_client_ip(request)

    if input_ip and input_ip != real_ip:
        ip = f"{input_ip} (client: {real_ip})"
    else:
        ip = real_ip

    timestamp = timezone.localtime().strftime("%Y-%m-%d %H:%M:%S")

    return {
        "tester_name": tester_name,
        "ip": ip,
        "timestamp": timestamp
    }