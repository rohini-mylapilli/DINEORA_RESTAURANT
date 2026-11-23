from django.db import models
from django.contrib.auth.models import User
from menu.models import FoodItem


class Order(models.Model):

    ORDER_STATUS = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('PREPARING', 'Preparing'),
        ('READY', 'Ready'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
    ]

    PAYMENT_METHODS= [
    ('COD', 'Cash on Delivery'),
    ('UPI', 'UPI'),
    ('CARD', 'Credit / Debit Card'),
    ('NETBANKING', 'Net Banking'),
    ]

    customer = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='orders'
    )

    customer_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15)
    delivery_address = models.TextField()

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    payment_method = models.CharField(
        max_length=10,
        choices=PAYMENT_METHODS,
        default='COD'
    )

    order_status = models.CharField(
        max_length=20,
        choices=ORDER_STATUS,
        default='PENDING'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} - {self.customer_name}"


class OrderItem(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items'
    )

    food_item = models.ForeignKey(
        FoodItem,
        on_delete=models.PROTECT
    )

    quantity = models.PositiveIntegerField(default=1)

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    def __str__(self):
        return self.food_item.name