# uv run python manage.py seed_roles
from django.core.management.base import BaseCommand
from apps.accounts.models import Role

class Command(BaseCommand):
    help = "Seed default roles (Tester, Reviewer, Approver, User)"

    def handle(self, *args, **options):
        roles = [
            ("Tester", "Security tester"),
            ("Reviewer", "Report reviewer"),
            ("Approver", "Report approver"),
            ("User", "System user"),
        ]

        for name, description in roles:
            role, created = Role.objects.get_or_create(
                name=name,
                defaults={"description": description}
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f"Created role: {name}"))
            else:
                self.stdout.write(self.style.WARNING(f"Role already exists: {name}"))

        self.stdout.write(self.style.SUCCESS("✅ Role seeding completed"))
