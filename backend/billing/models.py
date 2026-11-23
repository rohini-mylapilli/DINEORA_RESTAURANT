from django.db import models
from orders.models import Order


class Invoice(models.Model):

    order = models.OneToOneField(
        Order,
        on_delete=models.PROTECT,
        related_name='invoice'
    )

    invoice_number = models.CharField(
        max_length=30,
        unique=True
    )

    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    tax_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    discount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.invoice_number