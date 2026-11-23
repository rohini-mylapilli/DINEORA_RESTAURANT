from django.contrib import admin
from .models import Invoice


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'invoice_number',
        'order',
        'subtotal',
        'tax_amount',
        'discount',
        'total_amount',
        'created_at',
    )
    search_fields = ('invoice_number', 'order__customer_name')
    list_filter = ('created_at',)