from django.db import models
from django.contrib.auth.models import User


class StaffProfile(models.Model):

    DESIGNATION_CHOICES = [
        ('MANAGER', 'Manager'),
        ('CHEF', 'Chef'),
        ('CASHIER', 'Cashier'),
        ('WAITER', 'Waiter'),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='staff_profile'
    )

    phone_number = models.CharField(max_length=15)

    designation = models.CharField(
        max_length=20,
        choices=DESIGNATION_CHOICES
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username