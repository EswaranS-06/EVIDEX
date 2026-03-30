from apps.knowledge.models import AuditLog

def log_audit(user, report_id, action, old_value=None, new_value=None, metadata=None):
    AuditLog.objects.create(
        user=user,
        report_id=report_id,
        action=action,
        old_value=old_value,
        new_value=new_value,
        metadata=metadata or {}
    )
