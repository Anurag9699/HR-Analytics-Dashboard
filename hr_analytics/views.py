from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count, Q, Sum
from django.db.models.functions import TruncMonth, TruncDate
from django.http import HttpResponse
from collections import defaultdict
from datetime import datetime, timedelta
import csv
import io

from .models import Employee, Attendance, Leave
from .serializers import (
    EmployeeSerializer,
    AttendanceAnalyticsSerializer,
    LeaveAnalyticsSerializer,
    AttritionAnalyticsSerializer,
)


def parse_date_params(request):
    """
    Parse start_date and end_date query parameters from request.
    Returns tuple of (start_date, end_date) as date objects or None if not provided.
    """
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    
    parsed_start = None
    parsed_end = None
    
    if start_date:
        try:
            parsed_start = datetime.strptime(start_date, '%Y-%m-%d').date()
        except ValueError:
            pass
    
    if end_date:
        try:
            parsed_end = datetime.strptime(end_date, '%Y-%m-%d').date()
        except ValueError:
            pass
    
    return parsed_start, parsed_end


class EmployeeViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for listing and retrieving employees."""
    
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer


class AttendanceAnalyticsView(APIView):
    """API view for attendance analytics with absenteeism calculation."""
    
    def get(self, request):
        # Parse date filter parameters
        start_date, end_date = parse_date_params(request)
        
        # Get attendance records with optional date filtering
        attendance_records = Attendance.objects.all()
        
        if start_date:
            attendance_records = attendance_records.filter(date__gte=start_date)
        if end_date:
            attendance_records = attendance_records.filter(date__lte=end_date)
        
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
        
        # Get department breakdown (filtered by date range)
        department_breakdown = []
        departments = Employee.objects.values_list('department', flat=True).distinct()
        
        for dept in departments:
            dept_employees = Employee.objects.filter(department=dept)
            dept_attendance = attendance_records.filter(employee__in=dept_employees)
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
        # Parse date filter parameters
        start_date, end_date = parse_date_params(request)
        
        # Get leave records with optional date filtering
        leave_records = Leave.objects.all()
        
        if start_date:
            leave_records = leave_records.filter(start_date__gte=start_date)
        if end_date:
            leave_records = leave_records.filter(end_date__lte=end_date)
        
        # Get leave counts by type
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
        # Parse date filter parameters
        start_date, end_date = parse_date_params(request)
        
        # Get employee counts
        total_employees = Employee.objects.count()
        
        # Get inactive employees with optional date filtering on updated_at
        inactive_employees = Employee.objects.filter(is_active=False)
        
        if start_date:
            inactive_employees = inactive_employees.filter(updated_at__date__gte=start_date)
        if end_date:
            inactive_employees = inactive_employees.filter(updated_at__date__lte=end_date)
        
        employees_left = inactive_employees.count()
        
        # Calculate attrition rate
        attrition_rate = 0.0
        if total_employees > 0:
            attrition_rate = (employees_left / total_employees) * 100
        
        # Get monthly trend (based on updated_at for inactive employees)
        monthly_trend = []
        
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


class CSVExportView(APIView):
    """
    API view for exporting dashboard data as CSV.
    Includes attendance, leave, and attrition data in the export.
    Requirements: 8.1
    """
    
    def get(self, request):
        # Parse date filter parameters
        start_date, end_date = parse_date_params(request)
        
        # Create CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)
        
        # --- Attendance Data Section ---
        writer.writerow(['=== ATTENDANCE DATA ==='])
        writer.writerow([])
        
        # Get attendance records with optional date filtering
        attendance_records = Attendance.objects.select_related('employee').all()
        if start_date:
            attendance_records = attendance_records.filter(date__gte=start_date)
        if end_date:
            attendance_records = attendance_records.filter(date__lte=end_date)
        
        # Calculate attendance summary
        total_working_days = attendance_records.count()
        total_absent_days = attendance_records.filter(status='absent').count()
        absenteeism_rate = 0.0
        if total_working_days > 0:
            absenteeism_rate = (total_absent_days / total_working_days) * 100
        
        writer.writerow(['Attendance Summary'])
        writer.writerow(['Metric', 'Value'])
        writer.writerow(['Total Working Days', total_working_days])
        writer.writerow(['Total Absent Days', total_absent_days])
        writer.writerow(['Absenteeism Rate (%)', round(absenteeism_rate, 2)])
        writer.writerow([])
        
        # Attendance records detail
        writer.writerow(['Attendance Records'])
        writer.writerow(['Employee Name', 'Department', 'Date', 'Status'])
        for record in attendance_records.order_by('date', 'employee__name'):
            writer.writerow([
                record.employee.name,
                record.employee.department,
                record.date.isoformat(),
                record.status
            ])
        writer.writerow([])
        
        # --- Leave Data Section ---
        writer.writerow(['=== LEAVE DATA ==='])
        writer.writerow([])
        
        # Get leave records with optional date filtering
        leave_records = Leave.objects.select_related('employee').all()
        if start_date:
            leave_records = leave_records.filter(start_date__gte=start_date)
        if end_date:
            leave_records = leave_records.filter(end_date__lte=end_date)
        
        # Calculate leave summary
        sick_days = leave_records.filter(leave_type='sick').aggregate(
            total=Sum('days'))['total'] or 0
        vacation_days = leave_records.filter(leave_type='vacation').aggregate(
            total=Sum('days'))['total'] or 0
        personal_days = leave_records.filter(leave_type='personal').aggregate(
            total=Sum('days'))['total'] or 0
        total_leave_days = sick_days + vacation_days + personal_days
        
        writer.writerow(['Leave Summary'])
        writer.writerow(['Leave Type', 'Total Days'])
        writer.writerow(['Sick', sick_days])
        writer.writerow(['Vacation', vacation_days])
        writer.writerow(['Personal', personal_days])
        writer.writerow(['Total', total_leave_days])
        writer.writerow([])
        
        # Leave records detail
        writer.writerow(['Leave Records'])
        writer.writerow(['Employee Name', 'Department', 'Leave Type', 'Start Date', 'End Date', 'Days'])
        for record in leave_records.order_by('start_date', 'employee__name'):
            writer.writerow([
                record.employee.name,
                record.employee.department,
                record.leave_type,
                record.start_date.isoformat(),
                record.end_date.isoformat(),
                record.days
            ])
        writer.writerow([])
        
        # --- Attrition Data Section ---
        writer.writerow(['=== ATTRITION DATA ==='])
        writer.writerow([])
        
        # Get employee counts
        total_employees = Employee.objects.count()
        inactive_employees = Employee.objects.filter(is_active=False)
        
        if start_date:
            inactive_employees = inactive_employees.filter(updated_at__date__gte=start_date)
        if end_date:
            inactive_employees = inactive_employees.filter(updated_at__date__lte=end_date)
        
        employees_left = inactive_employees.count()
        attrition_rate = 0.0
        if total_employees > 0:
            attrition_rate = (employees_left / total_employees) * 100
        
        writer.writerow(['Attrition Summary'])
        writer.writerow(['Metric', 'Value'])
        writer.writerow(['Total Employees', total_employees])
        writer.writerow(['Employees Left', employees_left])
        writer.writerow(['Attrition Rate (%)', round(attrition_rate, 2)])
        writer.writerow([])
        
        # Employee list
        writer.writerow(['Employee List'])
        writer.writerow(['Name', 'Department', 'Hire Date', 'Status'])
        for emp in Employee.objects.all().order_by('name'):
            writer.writerow([
                emp.name,
                emp.department,
                emp.hire_date.isoformat(),
                'Active' if emp.is_active else 'Inactive'
            ])
        
        # Create HTTP response with CSV content
        output.seek(0)
        response = HttpResponse(output.getvalue(), content_type='text/csv')
        
        # Generate filename with date range if provided
        filename = 'hr_analytics_export'
        if start_date:
            filename += f'_from_{start_date.isoformat()}'
        if end_date:
            filename += f'_to_{end_date.isoformat()}'
        filename += '.csv'
        
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
