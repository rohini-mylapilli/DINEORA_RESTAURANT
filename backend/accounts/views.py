
import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication

from .models import PhoneOTP, UserProfile
from .serializers import RegisterSerializer, AdminCustomerSerializer

User = get_user_model()


class RegisterAPIView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class SendOTPAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        first_name = request.data.get('first_name', '').strip()
        phone_number = request.data.get('phone_number', '').strip()

        if not first_name or not phone_number:
            return Response(
                {'error': 'Name and phone number are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if (
            not phone_number.isdigit()
            or len(phone_number) != 10
            or phone_number[0] not in '6789'
        ):
            return Response(
                {'error': 'Enter a valid 10-digit Indian mobile number.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        otp = str(secrets.randbelow(900000) + 100000)

        PhoneOTP.objects.filter(
            phone_number=phone_number,
            is_used=False
        ).update(is_used=True)

        PhoneOTP.objects.create(
            phone_number=phone_number,
            first_name=first_name,
            otp_hash=make_password(otp),
            expires_at=timezone.now() + timedelta(minutes=5)
        )

        response_data = {
            'message': 'OTP generated successfully. Please verify your number.'
        }

        if settings.OTP_DISPLAY_IN_RESPONSE:
           response_data['dev_otp'] = otp

        return Response(response_data, status=status.HTTP_200_OK)


class VerifyOTPAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone_number = request.data.get('phone_number', '').strip()
        otp = request.data.get('otp', '').strip()

        if not phone_number or not otp:
            return Response(
                {'error': 'Phone number and OTP are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        otp_record = PhoneOTP.objects.filter(
            phone_number=phone_number,
            is_used=False
        ).order_by('-created_at').first()

        if not otp_record:
            return Response(
                {'error': 'Please request a new OTP.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if otp_record.expires_at <= timezone.now():
            otp_record.is_used = True
            otp_record.save(update_fields=['is_used'])
            return Response(
                {'error': 'OTP expired. Please request a new OTP.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if otp_record.attempts >= 5:
            otp_record.is_used = True
            otp_record.save(update_fields=['is_used'])
            return Response(
                {'error': 'Too many attempts. Please request a new OTP.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        otp_record.attempts += 1
        otp_record.save(update_fields=['attempts'])

        if not check_password(otp, otp_record.otp_hash):
            return Response(
                {'error': 'Invalid OTP. Please try again.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user, created = User.objects.get_or_create(
            username=phone_number,
            defaults={'first_name': otp_record.first_name}
        )

        if not created and not user.first_name:
            user.first_name = otp_record.first_name
            user.save(update_fields=['first_name'])

        profile, profile_created = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                'phone_number': phone_number,
                'role': 'CUSTOMER'
            }
        )

        if not profile.phone_number:
            profile.phone_number = phone_number
            profile.save(update_fields=['phone_number'])

        otp_record.is_used = True
        otp_record.save(update_fields=['is_used'])

        token, token_created = Token.objects.get_or_create(user=user)

        return Response({
            'message': 'OTP verified successfully. Login successful.',
            'customer': {
                'id': user.id,
                'name': user.first_name,
                'phone_number': profile.phone_number
            },
            'token': token.key
        }, status=status.HTTP_200_OK)


# ==========================================
# ADMIN LOGIN API
# ==========================================

class AdminLoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')

        if not username or not password:
            return Response(
                {'success': False, 'message': 'Username and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(
            request,
            username=username,
            password=password
        )

        if user is None:
            return Response(
                {'success': False, 'message': 'Invalid username or password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {'success': False, 'message': 'This account is inactive.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if not (user.is_staff or user.is_superuser):
            return Response(
                {'success': False, 'message': 'You are not authorized to access the admin panel.'},
                status=status.HTTP_403_FORBIDDEN
            )

        token, created = Token.objects.get_or_create(user=user)

        return Response({
            'success': True,
            'message': 'Admin login successful.',
            'token': token.key,
            'admin': {
                'id': user.id,
                'username': user.username,
                'name': user.get_full_name() or user.username,
                'is_superuser': user.is_superuser
            }
        }, status=status.HTTP_200_OK)


# ==========================================
# ADMIN DASHBOARD AUTH CHECK API
# ==========================================

class AdminDashboardAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        if not (user.is_staff or user.is_superuser):
            return Response(
                {'success': False, 'message': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN
            )

        return Response({
            'success': True,
            'admin': {
                'id': user.id,
                'username': user.username,
                'name': user.get_full_name() or user.username
            }
        }, status=status.HTTP_200_OK)


# ==========================================
# ADMIN LOGOUT API
# ==========================================

class AdminLogoutAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {'success': False, 'message': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN
            )

        Token.objects.filter(user=request.user).delete()

        return Response({
            'success': True,
            'message': 'Admin logged out successfully.'
        }, status=status.HTTP_200_OK)


# ==========================================
# ADMIN CUSTOMERS LIST API
# ==========================================

class AdminCustomersAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {
                    'success': False,
                    'message': 'Admin access required.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        customers = User.objects.filter(
            profile__role='CUSTOMER',
            is_active=True
        ).select_related('profile').order_by('-date_joined')

        search = request.query_params.get('search', '').strip()

        if search:
            from django.db.models import Q

            customers = customers.filter(
                Q(first_name__icontains=search) |
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(profile__phone_number__icontains=search)
            )

        serializer = AdminCustomerSerializer(
            customers,
            many=True
        )

        return Response(
            {
                'success': True,
                'total_customers': customers.count(),
                'customers': serializer.data
            },
            status=status.HTTP_200_OK
        )
