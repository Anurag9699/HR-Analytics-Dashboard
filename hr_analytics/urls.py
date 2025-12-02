from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EmployeeViewSet,
    AttendanceAnalyticsView,
    LeaveAnalyticsView,
    AttritionAnalyticsView,
)

# Create router and register viewsets
router = DefaultRouter()
router.register(r'employees', EmployeeViewSet, basename='employee')

urlpatterns = [
    # Router URLs (employees list/detail)
    path('', include(router.urls)),
    
    # Analytics endpoints
    path('attendance/analytics/', AttendanceAnalyticsView.as_view(), name='attendance-analytics'),
    path('leave/analytics/', LeaveAnalyticsView.as_view(), name='leave-analytics'),
    path('attrition/analytics/', AttritionAnalyticsView.as_view(), name='attrition-analytics'),
]
