
from django.db.models.deletion import ProtectedError

from rest_framework import generics, permissions, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, FoodItem
from .serializers import CategorySerializer, FoodItemSerializer


class IsRestaurantAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_active
            and (request.user.is_staff or request.user.is_superuser)
        )


class CategoryListAPIView(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class FoodItemListAPIView(generics.ListAPIView):
    serializer_class = FoodItemSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = FoodItem.objects.filter(
            is_available=True,
            category__is_active=True
        ).select_related('category')

        category_id = self.request.query_params.get('category')

        if category_id:
            queryset = queryset.filter(category_id=category_id)

        return queryset


class AdminCategoryListCreateAPIView(generics.ListCreateAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsRestaurantAdmin]
    serializer_class = CategorySerializer
    queryset = Category.objects.all().order_by('name')


class AdminCategoryDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsRestaurantAdmin]
    serializer_class = CategorySerializer
    queryset = Category.objects.all()


class AdminFoodListCreateAPIView(generics.ListCreateAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsRestaurantAdmin]
    serializer_class = FoodItemSerializer
    queryset = FoodItem.objects.select_related(
        'category'
    ).all().order_by('-created_at')


class AdminFoodDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsRestaurantAdmin]
    serializer_class = FoodItemSerializer
    queryset = FoodItem.objects.select_related('category').all()

    def destroy(self, request, *args, **kwargs):
        food = self.get_object()

        try:
            self.perform_destroy(food)

            return Response(
                {
                    'success': True,
                    'message': 'Food item deleted successfully.'
                },
                status=status.HTTP_200_OK
            )

        except ProtectedError:
            food.is_available = False
            food.save(update_fields=['is_available'])

            return Response(
                {
                    'success': True,
                    'message': (
                        'This food item has previous orders. '
                        'It has been disabled instead of permanently deleted.'
                    ),
                    'deleted': False,
                    'disabled': True
                },
                status=status.HTTP_200_OK
            )


class AdminFoodAvailabilityAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsRestaurantAdmin]

    def patch(self, request, food_id):
        try:
            food = FoodItem.objects.get(id=food_id)

        except FoodItem.DoesNotExist:
            return Response(
                {
                    'success': False,
                    'message': 'Food item not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        is_available = request.data.get('is_available')

        if not isinstance(is_available, bool):
            return Response(
                {
                    'success': False,
                    'message': 'is_available must be true or false.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        food.is_available = is_available
        food.save(update_fields=['is_available'])

        return Response(
            {
                'success': True,
                'message': 'Food availability updated successfully.',
                'food': FoodItemSerializer(food).data
            },
            status=status.HTTP_200_OK
        )
