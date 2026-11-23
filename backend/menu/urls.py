
from django.urls import path

from .views import (
    CategoryListAPIView,
    FoodItemListAPIView,
    AdminCategoryListCreateAPIView,
    AdminCategoryDetailAPIView,
    AdminFoodListCreateAPIView,
    AdminFoodDetailAPIView,
    AdminFoodAvailabilityAPIView,
)

urlpatterns = [
    # Customer Menu APIs
    path(
        'categories/',
        CategoryListAPIView.as_view(),
        name='category-list'
    ),
    path(
        'foods/',
        FoodItemListAPIView.as_view(),
        name='food-list'
    ),

    # Admin Category Management APIs
    path(
        'admin/categories/',
        AdminCategoryListCreateAPIView.as_view(),
        name='admin-category-list-create'
    ),
    path(
        'admin/categories/<int:pk>/',
        AdminCategoryDetailAPIView.as_view(),
        name='admin-category-detail'
    ),

    # Admin Food Management APIs
    path(
        'admin/foods/',
        AdminFoodListCreateAPIView.as_view(),
        name='admin-food-list-create'
    ),
    path(
        'admin/foods/<int:pk>/',
        AdminFoodDetailAPIView.as_view(),
        name='admin-food-detail'
    ),
    path(
        'admin/foods/<int:food_id>/availability/',
        AdminFoodAvailabilityAPIView.as_view(),
        name='admin-food-availability'
    ),
]
