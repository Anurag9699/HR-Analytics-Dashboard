from django.db import models


class Employee(models.Model):
    """Model representing an employee in the HR system."""
    
    name = models.CharField(max_length=100)
    department = models.CharField(max_length=50)
    hire_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.department})"


class Attendance(models.Model):
    """Model representing daily attendance records for employees."""
    
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
    ]
    
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='attendance_records'
    )
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
        unique_together = ['employee', 'date']

    def __str__(self):
        return f"{self.employee.name} - {self.date} - {self.status}"


class Leave(models.Model):
    """Model representing leave requests taken by employees."""
    
    LEAVE_TYPE_CHOICES = [
        ('sick', 'Sick'),
        ('vacation', 'Vacation'),
        ('personal', 'Personal'),
    ]
    
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='leave_records'
    )
    leave_type = models.CharField(max_length=10, choices=LEAVE_TYPE_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField()
    days = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.employee.name} - {self.leave_type} ({self.days} days)"
