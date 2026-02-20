#!/bin/python
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

username = os.getenv("DJANGO_SUPERUSER_USERNAME")
email = os.getenv("DJANGO_SUPERUSER_EMAIL")
password = os.getenv("DJANGO_SUPERUSER_PASSWORD")
print(username,email,password)

user, created = User.objects.get_or_create(username=username, defaults={"email": email})

user.set_password(password)
user.is_staff = True
user.is_superuser = True
user.save()

print("✅ Admin ensured:", username, "| created:", created)