from rest_framework.throttling import UserRateThrottle

class ReportExportThrottle(UserRateThrottle):
    rate = "20/hour"
