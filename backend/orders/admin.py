
from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('food_item', 'quantity', 'price')
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'customer_name',
        'phone_number',
        'total_amount',
        'payment_method',
        'order_status',
        'created_at',
    )

    search_fields = (
        'customer_name',
        'phone_number',
    )

    list_filter = (
        'order_status',
        'payment_method',
        'created_at',
    )

    inlines = [OrderItemInline]

    fields = (
        'customer',
        'customer_name',
        'phone_number',
        'delivery_address',
        'total_amount',
        'payment_method',
        'order_status',
        'created_at',
    )

    readonly_fields = (
        'customer',
        'customer_name',
        'phone_number',
        'delivery_address',
        'total_amount',
        'payment_method',
        'created_at',
    )


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'order',
        'food_item',
        'quantity',
        'price',
    )

    readonly_fields = (
        'order',
        'food_item',
        'quantity',
        'price',
    )
