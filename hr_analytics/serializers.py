from rest_framework import serializers
from django.db.models import Count, Q
from .models import Employee, Attendance, Leave


class EmployeeSerializer(serializers.ModelSerializer):
    """Serializer for Employee model with nested attendance/leave counts."""
    
    attendance_count = serializers.SerializerMethodField()
    leave_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Employee
        fields = [
            'id', 'name', 'department', 'hire_date', 'is_active',
            'created_at', 'updated_at', 'attendance_count', 'leave_count'
        ]
    
    def get_attendance_count(self, obj):
        return obj.attendance_records.count()
    
    def get_leave_count(self, obj):
        return obj.leave_records.count()


class AttendanceSerializer(serializers.ModelSerializer):
    """Serializer for individual Attendance records."""
    
    class Meta:
        model = Attendance
        fields = ['id', 'employee', 'date', 'status', 'created_at']


class LeaveSerializer(serializers.ModelSerializer):
    """Serializer for individual Leave records."""
    
    class Meta:
        model = Leave
        fields = ['id', 'employee', 'leave_type', 'start_date', 'end_date', 'days', 'created_at']


class AttendanceAnalyticsSerializer(serializers.Serializer):
    """Serializer for aggregated attendance analytics data."""
    
    absenteeism_rate = serializers.FloatField()
    total_working_days = serializers.IntegerField()
    total_absent_days = serializers.IntegerField()
    trend_data = serializers.ListField(child=serializers.DictField())
    department_breakdown = serializers.ListField(child=serializers.DictField())



class LeaveAnalyticsSerializer(serializers.Serializer):
    """Serializer for leave breakdown by type."""
    
    leave_by_type = serializers.DictField()
    total_leave_days = serializers.IntegerField()
    monthly_trend = serializers.ListField(child=serializers.DictField())


class AttritionAnalyticsSerializer(serializers.Serializer):
    """Serializer for attrition metrics."""
    
    attrition_rate = serializers.FloatField()
    employees_left = serializers.IntegerField()
    total_employees = serializers.IntegerField()
    monthly_trend = serializers.ListField(child=serializers.DictField())
