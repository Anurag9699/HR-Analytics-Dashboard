"""
Django management command to populate the database with sample HR data.
Generates employees, attendance records, and leave records for testing.
"""
import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from hr_analytics.models import Employee, Attendance, Leave


class Command(BaseCommand):
    help = 'Populate database with sample HR data for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--employees',
            type=int,
            default=25,
            help='Number of employees to create (default: 25)'
        )
        parser.add_argument(
            '--days',
            type=int,
            default=90,
            help='Number of days of attendance data (default: 90)'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before seeding'
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            Leave.objects.all().delete()
            Attendance.objects.all().delete()
            Employee.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Existing data cleared.'))

        num_employees = options['employees']
        num_days = options['days']

        self.stdout.write(f'Creating {num_employees} employees...')
        employees = self._create_employees(num_employees)
        self.stdout.write(self.style.SUCCESS(f'Created {len(employees)} employees.'))

        self.stdout.write(f'Creating attendance records for {num_days} days...')
        attendance_count = self._create_attendance(employees, num_days)
        self.stdout.write(self.style.SUCCESS(f'Created {attendance_count} attendance records.'))

        self.stdout.write('Creating leave records...')
        leave_count = self._create_leaves(employees)
        self.stdout.write(self.style.SUCCESS(f'Created {leave_count} leave records.'))

        self.stdout.write(self.style.SUCCESS('Seed data created successfully!'))

    def _create_employees(self, count):
        """Create sample employees across different departments."""
        departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations']
        first_names = [
            'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa',
            'William', 'Jennifer', 'James', 'Maria', 'Daniel', 'Susan', 'Thomas',
            'Karen', 'Christopher', 'Nancy', 'Matthew', 'Betty', 'Andrew', 'Helen',
            'Joshua', 'Sandra', 'Kevin', 'Ashley', 'Brian', 'Dorothy', 'George', 'Kimberly'
        ]
        last_names = [
            'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
            'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
            'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
        ]

        employees = []
        today = date.today()

        for i in range(count):
            # Generate random hire date (1-5 years ago)
            days_ago = random.randint(30, 1825)
            hire_date = today - timedelta(days=days_ago)

            # 15% chance of being inactive (left the company)
            is_active = random.random() > 0.15

            employee = Employee.objects.create(
                name=f"{random.choice(first_names)} {random.choice(last_names)}",
                department=random.choice(departments),
                hire_date=hire_date,
                is_active=is_active
            )
            employees.append(employee)

        return employees

    def _create_attendance(self, employees, num_days):
        """Create attendance records for employees."""
        today = date.today()
        attendance_records = []
        active_employees = [e for e in employees if e.is_active]

        for day_offset in range(num_days):
            record_date = today - timedelta(days=day_offset)

            # Skip weekends
            if record_date.weekday() >= 5:
                continue

            for employee in active_employees:
                # Skip if employee wasn't hired yet
                if record_date < employee.hire_date:
                    continue

                # Determine attendance status
                # 85% present, 10% absent, 5% late
                rand = random.random()
                if rand < 0.85:
                    status = 'present'
                elif rand < 0.95:
                    status = 'absent'
                else:
                    status = 'late'

                attendance_records.append(
                    Attendance(
                        employee=employee,
                        date=record_date,
                        status=status
                    )
                )

        # Bulk create for efficiency
        Attendance.objects.bulk_create(attendance_records, ignore_conflicts=True)
        return len(attendance_records)

    def _create_leaves(self, employees):
        """Create leave records for employees."""
        leave_types = ['sick', 'vacation', 'personal']
        leave_records = []
        today = date.today()
        active_employees = [e for e in employees if e.is_active]

        for employee in active_employees:
            # Each employee gets 1-4 leave records
            num_leaves = random.randint(1, 4)

            for _ in range(num_leaves):
                # Random start date in the past 90 days
                days_ago = random.randint(1, 90)
                start_date = today - timedelta(days=days_ago)

                # Skip if before hire date
                if start_date < employee.hire_date:
                    continue

                # Leave duration 1-5 days
                duration = random.randint(1, 5)
                end_date = start_date + timedelta(days=duration - 1)

                leave_records.append(
                    Leave(
                        employee=employee,
                        leave_type=random.choice(leave_types),
                        start_date=start_date,
                        end_date=end_date,
                        days=duration
                    )
                )

        Leave.objects.bulk_create(leave_records)
        return len(leave_records)
