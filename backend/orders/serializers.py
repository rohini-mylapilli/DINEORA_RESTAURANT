
from django.db import transaction
from rest_framework import serializers

from .models import Order, OrderItem
from menu.models import FoodItem


class OrderItemInputSerializer(serializers.Serializer):
    food_item_id = serializers.IntegerField(min_value=1)
    quantity = serializers.IntegerField(min_value=1)


class OrderCreateSerializer(serializers.Serializer):
    customer_name = serializers.CharField(max_length=100)
    phone_number = serializers.CharField(max_length=15)
    delivery_address = serializers.CharField()
    city = serializers.CharField(max_length=100)
    pincode = serializers.CharField(max_length=6)
    payment_method = serializers.ChoiceField(
        choices=Order.PAYMENT_METHODS
    )
    items = OrderItemInputSerializer(many=True)

    def validate_phone_number(self, value):
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError(
                "Enter a valid 10-digit mobile number."
            )
        return value

    def validate_pincode(self, value):
        if not value.isdigit() or len(value) != 6:
            raise serializers.ValidationError(
                "Enter a valid 6-digit PIN code."
            )
        return value

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError(
                "Your cart is empty."
            )

        food_ids = [item["food_item_id"] for item in value]

        if len(food_ids) != len(set(food_ids)):
            raise serializers.ValidationError(
                "Duplicate food items are not allowed."
            )

        foods = FoodItem.objects.filter(
            id__in=food_ids,
            is_available=True
        )

        if foods.count() != len(food_ids):
            raise serializers.ValidationError(
                "One or more food items are unavailable."
            )

        return value

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop("items")

        city = validated_data.pop("city")
        pincode = validated_data.pop("pincode")

        validated_data["delivery_address"] = (
            f'{validated_data["delivery_address"]}, '
            f'{city}, PIN: {pincode}'
        )

        food_ids = [
            item["food_item_id"] for item in items_data
        ]

        foods = FoodItem.objects.in_bulk(food_ids)

        total_amount = sum(
            foods[item["food_item_id"]].price * item["quantity"]
            for item in items_data
        )

        order = Order.objects.create(
            customer=self.context["request"].user,
            total_amount=total_amount,
            **validated_data
        )

        order_items = []

        for item in items_data:
            food = foods[item["food_item_id"]]

            order_items.append(
                OrderItem(
                    order=order,
                    food_item=food,
                    quantity=item["quantity"],
                    price=food.price
                )
            )

        OrderItem.objects.bulk_create(order_items)

        return order
