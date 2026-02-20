#!/bin/bash
pip install -r requirements.txt
echo "Done PIP"
# python manage.py makemigrations
# echo "Done Make"
# python manage.py migrate
# echo "Done Migrate"
# python manage.py seed_roles
# echo "Done Roles"
# python manage.py seed_owasp_category
# echo "Done Cat"
# python manage.py seed_owasp_sub
# echo "Done Sub"
# python manage.py seed_owasp_variants
# echo "Done Variant"
# python manage.py seed_testcases
# echo "Done Testcases"
python manage.py collectstatic --noinput
echo "Done static"
# DJANGO_SUPERUSER_USERNAME=___ DJANGO_SUPERUSER_EMAIL=___@example.com DJANGO_SUPERUSER_PASSWORD=***** python manage.py createsuperuser --noinput
python ./bootstrap_admin.py
echo "Done SU"