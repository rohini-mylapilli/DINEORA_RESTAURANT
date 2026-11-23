from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'order',
        'payment_method',
        'amount',
        'payment_status',
        'transaction_id',
        'created_at',
    )
    search_fields = ('transaction_id', 'order__customer_name')
    list_filter = ('payment_method', 'payment_status', 'created_at')