from datetime import datetime

def get_watermark_data(request):
    """
    Extracts user information and IP address for report watermarking.
    Expects 'X-Forwarded-For' from frontend for accurate IP reporting.
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        # Get the first IP in the list (client IP)
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR', 'Unknown')
    
    # Last defense: if IP was sent as string 'Unknown' from frontend
    if ip == 'Unknown':
        ip = request.META.get('REMOTE_ADDR', 'Unknown')
    
    return {
        "username": request.user.username if request.user.is_authenticated else "Anonymous",
        "user_id": request.user.id if request.user.is_authenticated else 0,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "ip": ip
    }
