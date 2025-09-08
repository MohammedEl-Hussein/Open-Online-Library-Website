from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import UserProfile

class Command(BaseCommand):
    help = 'Creates user profiles for users who do not have one'

    def handle(self, *args, **kwargs):
        users = User.objects.all()
        created_count = 0

        for user in users:
            try:
                UserProfile.objects.get(user=user)
            except UserProfile.DoesNotExist:
                # Create profile with default MEMBER role
                UserProfile.objects.create(
                    user=user,
                    membership_number=f"{user.id:08d}"  # Creates a membership number like 00000001
                )
                created_count += 1
                self.stdout.write(f"Created profile for user: {user.username}")

        self.stdout.write(self.style.SUCCESS(f'Successfully created {created_count} user profiles'))