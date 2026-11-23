
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, serializers
from rest_framework.authentication import TokenAuthentication

from .models import Order, OrderItem
from .serializers import OrderCreateSerializer


# ==========================================
# COMMON ORDER ITEM SERIALIZER
# ==========================================

class OrderItemDisplaySerializer(serializers.ModelSerializer):

    food_name = serializers.CharField(
        source='food_item.name',
        read_only=True
    )

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'food_name',
            'quantity',
            'price'
        ]


# ==========================================
# COMMON ORDER DISPLAY SERIALIZER
# ==========================================

class OrderDisplaySerializer(serializers.ModelSerializer):

    items = OrderItemDisplaySerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Order
        fields = [
            'id',
            'customer_name',
            'phone_number',
            'delivery_address',
            'total_amount',
            'payment_method',
            'order_status',
            'created_at',
            'items'
        ]


# ==========================================
# CUSTOMER CREATE ORDER API
# ==========================================

class CreateOrderAPIView(APIView):

    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):

        serializer = OrderCreateSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            order = serializer.save()

            return Response(
                {
                    'success': True,
                    'message': 'Your order has been placed successfully!',
                    'order': {
                        'id': order.id,
                        'customer_name': order.customer_name,
                        'phone_number': order.phone_number,
                        'total_amount': str(order.total_amount),
                        'payment_method': order.payment_method,
                        'order_status': order.order_status,
                        'created_at': order.created_at,
                    }
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            {
                'success': False,
                'message': 'Please check your order details.',
                'errors': serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


# ==========================================
# CUSTOMER VIEW OWN ORDERS API
# ==========================================

class CustomerOrdersAPIView(APIView):

    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):

        orders = Order.objects.filter(
            customer=request.user
        ).prefetch_related(
            'items__food_item'
        ).order_by('-created_at')

        serializer = OrderDisplaySerializer(
            orders,
            many=True
        )

        return Response(
            {
                'success': True,
                'count': orders.count(),
                'orders': serializer.data
            },
            status=status.HTTP_200_OK
        )


# ==========================================
# ADMIN VIEW ALL ORDERS API
# ==========================================

class AdminOrdersAPIView(APIView):

    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):

        if not (
            request.user.is_staff or request.user.is_superuser
        ):
            return Response(
                {
                    'success': False,
                    'message': 'Admin access required.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        orders = Order.objects.select_related(
            'customer'
        ).prefetch_related(
            'items__food_item'
        ).order_by('-created_at')

        serializer = OrderDisplaySerializer(
            orders,
            many=True
        )

        return Response(
            {
                'success': True,
                'count': orders.count(),
                'orders': serializer.data
            },
            status=status.HTTP_200_OK
        )


# ==========================================
# ADMIN UPDATE ORDER STATUS API
# ==========================================

class AdminOrderStatusUpdateAPIView(APIView):

    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, order_id):

        if not (
            request.user.is_staff or request.user.is_superuser
        ):
            return Response(
                {
                    'success': False,
                    'message': 'Admin access required.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        order = get_object_or_404(
            Order,
            id=order_id
        )

        new_status = request.data.get('order_status')

        valid_statuses = [
            choice[0] for choice in Order.ORDER_STATUS
        ]

        if new_status not in valid_statuses:
            return Response(
                {
                    'success': False,
                    'message': 'Invalid order status.',
                    'valid_statuses': valid_statuses
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        order.order_status = new_status
        order.save(update_fields=['order_status'])

        return Response(
            {
                'success': True,
                'message': 'Order status updated successfully.',
                'order_id': order.id,
                'order_status': order.order_status
            },
            status=status.HTTP_200_OK
        )


# ==========================================
# ADMIN REPORTS & ANALYTICS API
# ==========================================

class AdminReportsAPIView(APIView):

    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):

        if not (
            request.user.is_staff or request.user.is_superuser
        ):
            return Response(
                {
                    'success': False,
                    'message': 'Admin access required.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        orders = Order.objects.all()

        # Total Orders
        total_orders = orders.count()

        # Total Revenue
        total_revenue = orders.aggregate(
            revenue=Sum('total_amount')
        )['revenue'] or 0

        # Order Status Summary
        status_summary = []

        for value, label in Order.ORDER_STATUS:
            count = orders.filter(
                order_status=value
            ).count()

            status_summary.append({
                'status': value,
                'label': label,
                'count': count
            })

        # Monthly Sales
        monthly_sales = orders.annotate(
            month=TruncMonth('created_at')
        ).values(
            'month'
        ).annotate(
            total_orders=Count('id'),
            total_revenue=Sum('total_amount')
        ).order_by('month')

        monthly_data = [
            {
                'month': item['month'].strftime('%Y-%m'),
                'total_orders': item['total_orders'],
                'total_revenue': str(item['total_revenue'] or 0)
            }
            for item in monthly_sales
        ]

        # Most Popular Food Items
        popular_foods = OrderItem.objects.values(
            'food_item__name'
        ).annotate(
            total_quantity=Sum('quantity'),
            total_orders=Count('order_id')
        ).order_by(
            '-total_quantity'
        )[:10]

        popular_food_data = [
            {
                'food_name': item['food_item__name'],
                'total_quantity': item['total_quantity'],
                'total_orders': item['total_orders']
            }
            for item in popular_foods
        ]

        return Response(
            {
                'success': True,
                'summary': {
                    'total_orders': total_orders,
                    'total_revenue': str(total_revenue),
                    'pending_orders': orders.filter(
                        order_status='PENDING'
                    ).count(),
                    'delivered_orders': orders.filter(
                        order_status='DELIVERED'
                    ).count()
                },
                'order_status': status_summary,
                'monthly_sales': monthly_data,
                'popular_foods': popular_food_data
            },
            status=status.HTTP_200_OK
        )
