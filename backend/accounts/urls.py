
from django.urls import path

from .views import (
    RegisterAPIView,
    SendOTPAPIView,
    VerifyOTPAPIView,
    AdminLoginAPIView,
    AdminDashboardAPIView,
    AdminLogoutAPIView,
    AdminCustomersAPIView,
)

urlpatterns = [
    # Customer APIs
    path(
        'register/',
        RegisterAPIView.as_view(),
        name='customer-register'
    ),
    path(
        'send-otp/',
        SendOTPAPIView.as_view(),
        name='send-otp'
    ),
    path(
        'verify-otp/',
        VerifyOTPAPIView.as_view(),
        name='verify-otp'
    ),

    # Admin APIs
    path(
        'admin/login/',
        AdminLoginAPIView.as_view(),
        name='admin-login'
    ),
    path(
        'admin/dashboard/',
        AdminDashboardAPIView.as_view(),
        name='admin-dashboard'
    ),
    path(
        'admin/logout/',
        AdminLogoutAPIView.as_view(),
        name='admin-logout'
    ),
    path(
        'admin/customers/',
        AdminCustomersAPIView.as_view(),
        name='admin-customers'
    ),
]
