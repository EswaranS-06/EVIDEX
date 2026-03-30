from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import UserProfile, Role

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        default_role = Role.objects.filter(name="User").first()
        UserProfile.objects.get_or_create(user=instance, defaults={'role': default_role})
