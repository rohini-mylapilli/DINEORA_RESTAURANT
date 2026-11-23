from django.contrib import admin
from .models import StaffProfile


@admin.register(StaffProfile)
class StaffProfileAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'phone_number',
        'designation',
        'is_active',
        'created_at',
    )
    search_fields = ('user__username', 'phone_number')
    list_filter = ('designation', 'is_active')