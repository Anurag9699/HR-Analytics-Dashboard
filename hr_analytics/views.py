from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count, Q, Sum
from django.db.models.functions import TruncMonth, TruncDate
from collections import defaultdict
from datetime import datetime, timedelta

from .models import Employee, Attendance, Leave
from .serializers import (
    EmployeeSerializer,
    AttendanceAnalyticsSerializer,
    LeaveAnalyticsSerializer,
    AttritionAnalyticsSerializer,
)


class EmployeeViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for listing and retrieving employees."""
    
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer


class AttendanceAnalyticsView(APIView):
    """API view for attendance analytics with absenteeism calculation."""
    
    def get(self, request):
        # Get all attendance records
        attendance_records = Attendance.objects.all()
        
        # Calculate total working days and absent days
        total_working_days = attendance_records.count()
        total_absent_days = attendance_records.filter(status='absent').count()
        
        # Calculate absenteeism rate
        absenteeism_rate = 0.0
        if total_working_days > 0:
            absenteeism_rate = (total_absent_days / total_working_days) * 100
        
        # Get trend data (daily attendance counts)
        trend_data = []
        daily_stats = attendance_records.values('date').annotate(
            present_count=Count('id', filter=Q(status='present')),
            absent_count=Count('id', filter=Q(status='absent'))
        ).order_by('date')

        
        for stat in daily_stats:
            trend_data.append({
                'date': stat['date'].isoformat(),
                'present_count': stat['present_count'],
                'absent_count': stat['absent_count']
            })
        
        # Get department breakdown
        department_breakdown = []
        departments = Employee.objects.values_list('department', flat=True).distinct()
        
        for dept in departments:
            dept_employees = Employee.objects.filter(department=dept)
            dept_attendance = Attendance.objects.filter(employee__in=dept_employees)
            dept_total = dept_attendance.count()
            dept_absent = dept_attendance.filter(status='absent').count()
            
            dept_rate = 0.0
            if dept_total > 0:
                dept_rate = (dept_absent / dept_total) * 100
            
            department_breakdown.append({
                'department': dept,
                'absenteeism_rate': round(dept_rate, 2)
            })
        
        data = {
            'absenteeism_rate': round(absenteeism_rate, 2),
            'total_working_days': total_working_days,
            'total_absent_days': total_absent_days,
            'trend_data': trend_data,
            'department_breakdown': department_breakdown
        }
        
        serializer = AttendanceAnalyticsSerializer(data)
        return Response(serializer.data)


class LeaveAnalyticsView(APIView):
    """API view for leave analytics with type breakdown."""
    
    def get(self, request):
        # Get leave counts by type
        leave_records = Leave.objects.all()
        
        sick_days = leave_records.filter(leave_type='sick').aggregate(
            total=Sum('days'))['total'] or 0
        vacation_days = leave_records.filter(leave_type='vacation').aggregate(
            total=Sum('days'))['total'] or 0
        personal_days = leave_records.filter(leave_type='personal').aggregate(
            total=Sum('days'))['total'] or 0
        
        total_leave_days = sick_days + vacation_days + personal_days

        
        # Get monthly trend
        monthly_trend = []
        monthly_stats = leave_records.annotate(
            month=TruncMonth('start_date')
        ).values('month').annotate(
            days=Sum('days')
        ).order_by('month')
        
        for stat in monthly_stats:
            if stat['month']:
                monthly_trend.append({
                    'month': stat['month'].strftime('%Y-%m'),
                    'days': stat['days']
                })
        
        data = {
            'leave_by_type': {
                'sick': sick_days,
                'vacation': vacation_days,
                'personal': personal_days
            },
            'total_leave_days': total_leave_days,
            'monthly_trend': monthly_trend
        }
        
        serializer = LeaveAnalyticsSerializer(data)
        return Response(serializer.data)


class AttritionAnalyticsView(APIView):
    """API view for attrition metrics."""
    
    def get(self, request):
        # Get employee counts
        total_employees = Employee.objects.count()
        employees_left = Employee.objects.filter(is_active=False).count()
        
        # Calculate attrition rate
        attrition_rate = 0.0
        if total_employees > 0:
            attrition_rate = (employees_left / total_employees) * 100
        
        # Get monthly trend (based on updated_at for inactive employees)
        monthly_trend = []
        inactive_employees = Employee.objects.filter(is_active=False)
        
        monthly_stats = inactive_employees.annotate(
            month=TruncMonth('updated_at')
        ).values('month').annotate(
            left_count=Count('id')
        ).order_by('month')
        
        for stat in monthly_stats:
            if stat['month']:
                # Calculate monthly attrition rate
                month_rate = 0.0
                if total_employees > 0:
                    month_rate = (stat['left_count'] / total_employees) * 100
                
                monthly_trend.append({
                    'month': stat['month'].strftime('%Y-%m'),
                    'left_count': stat['left_count'],
                    'attrition_rate': round(month_rate, 2)
                })
        
        data = {
            'attrition_rate': round(attrition_rate, 2),
            'employees_left': employees_left,
            'total_employees': total_employees,
            'monthly_trend': monthly_trend
        }
        
        serializer = AttritionAnalyticsSerializer(data)
        return Response(serializer.data)
