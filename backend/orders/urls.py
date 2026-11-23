
from django.urls import path

from .views import (
    CreateOrderAPIView,
    CustomerOrdersAPIView,
    AdminOrdersAPIView,
    AdminOrderStatusUpdateAPIView,
    AdminReportsAPIView,
)

urlpatterns = [
    path(
        'create/',
        CreateOrderAPIView.as_view(),
        name='create-order'
    ),

    path(
        'my-orders/',
        CustomerOrdersAPIView.as_view(),
        name='customer-my-orders'
    ),

    path(
        'admin/',
        AdminOrdersAPIView.as_view(),
        name='admin-orders'
    ),

    path(
        'admin/<int:order_id>/status/',
        AdminOrderStatusUpdateAPIView.as_view(),
        name='admin-order-status-update'
    ),

    path(
        'admin/reports/',
        AdminReportsAPIView.as_view(),
        name='admin-reports'
    ),
]
