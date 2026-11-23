
from django.contrib.auth.models import User
from rest_framework import serializers

from .models import UserProfile


class RegisterSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(
        write_only=True,
        max_length=15
    )

    class Meta:
        model = User
        fields = ['id', 'first_name', 'phone_number']

    def validate_phone_number(self, value):
        if UserProfile.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError(
                "This phone number is already registered."
            )
        return value

    def create(self, validated_data):
        phone_number = validated_data.pop('phone_number')

        user = User(
            username=phone_number,
            first_name=validated_data['first_name']
        )
        user.set_unusable_password()
        user.save()

        UserProfile.objects.create(
            user=user,
            phone_number=phone_number,
            role='CUSTOMER'
        )

        return user


class AdminCustomerSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(
        source='profile.phone_number',
        read_only=True
    )

    address = serializers.CharField(
        source='profile.address',
        read_only=True
    )

    role = serializers.CharField(
        source='profile.role',
        read_only=True
    )

    registered_at = serializers.DateTimeField(
        source='profile.created_at',
        read_only=True
    )

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'email',
            'phone_number',
            'address',
            'role',
            'registered_at',
        ]
