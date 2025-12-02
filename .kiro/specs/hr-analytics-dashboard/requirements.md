# Requirements Document

## Introduction

The HR Analytics Dashboard is a full-stack web application designed to help HR teams visualize and analyze employee data efficiently. The system replaces manual spreadsheet-based workflows with an interactive dashboard that displays attendance analytics, leave management insights, and attrition analysis. The backend is built with Django REST Framework connected to MySQL, while the frontend uses React with Tailwind CSS for visualization.

## Glossary

- **HR_Dashboard**: The main web application system that provides analytics visualization
- **Employee**: A person whose data is tracked in the system (name, department, hire date, status)
- **Attendance_Record**: A daily log entry tracking an employee's presence or absence
- **Leave_Request**: A record of time-off taken by an employee with type classification
- **Absenteeism_Rate**: Percentage of workdays an employee or department was absent
- **Attrition_Rate**: Percentage of employees who voluntarily left the organization over a period
- **KPI_Card**: A visual component displaying a key performance indicator value
- **API_Endpoint**: A Django REST Framework URL that returns JSON data

## Requirements

### Requirement 1: Employee Data Management

**User Story:** As an HR manager, I want to store and manage employee records in a structured database, so that I can maintain accurate employee information for analytics.

#### Acceptance Criteria

1. WHEN an employee record is created THEN the HR_Dashboard SHALL store the employee's name, department, hire date, and employment status in MySQL
2. WHEN an employee record is retrieved THEN the HR_Dashboard SHALL return all associated attendance and leave records via foreign key relationships
3. WHEN employee data is requested via API THEN the HR_Dashboard SHALL return a JSON response containing the employee details within 500 milliseconds

### Requirement 2: Attendance Analytics

**User Story:** As an HR manager, I want to view attendance analytics with trend charts, so that I can identify absenteeism patterns across the organization.

#### Acceptance Criteria

1. WHEN the attendance analytics view loads THEN the HR_Dashboard SHALL display the average absenteeism rate as a KPI card
2. WHEN attendance data is aggregated THEN the HR_Dashboard SHALL calculate absenteeism rate as (absent days / total working days) × 100
3. WHEN the attendance trend chart renders THEN the HR_Dashboard SHALL display a line chart showing daily or weekly attendance patterns
4. WHEN the API endpoint for attendance is called THEN the HR_Dashboard SHALL return aggregated attendance data grouped by department

### Requirement 3: Leave Management Analytics

**User Story:** As an HR manager, I want to visualize leave usage by type, so that I can understand how employees are using their time off.

#### Acceptance Criteria

1. WHEN the leave management view loads THEN the HR_Dashboard SHALL display a bar chart comparing leave types (Sick, Vacation, Personal)
2. WHEN leave data is aggregated THEN the HR_Dashboard SHALL calculate total leave days per type across all employees
3. WHEN leave data is requested via API THEN the HR_Dashboard SHALL return leave counts grouped by leave type in JSON format
4. WHEN the leave chart renders THEN the HR_Dashboard SHALL style the visualization using Tailwind CSS classes

### Requirement 4: Attrition Analysis

**User Story:** As an HR manager, I want to see employee turnover metrics, so that I can identify retention issues early.

#### Acceptance Criteria

1. WHEN the attrition analysis view loads THEN the HR_Dashboard SHALL display the voluntary attrition rate as a KPI card
2. WHEN attrition is calculated THEN the HR_Dashboard SHALL compute the rate as (employees who left / total employees) × 100
3. WHEN attrition data is requested via API THEN the HR_Dashboard SHALL return the attrition percentage and employee count data
4. WHEN attrition trends are displayed THEN the HR_Dashboard SHALL show monthly attrition data in a chart format

### Requirement 5: Django REST API Backend

**User Story:** As a developer, I want a well-structured REST API, so that the frontend can fetch analytics data reliably.

#### Acceptance Criteria

1. WHEN the Django API starts THEN the HR_Dashboard SHALL connect to the MySQL database using mysqlclient
2. WHEN an API endpoint is called THEN the HR_Dashboard SHALL return properly formatted JSON with appropriate HTTP status codes
3. WHEN the frontend makes cross-origin requests THEN the HR_Dashboard SHALL handle CORS headers to allow React app communication
4. WHEN data is serialized THEN the HR_Dashboard SHALL use Django REST Framework serializers to convert model data to JSON
5. WHEN the API serializes data to JSON THEN the HR_Dashboard SHALL provide a corresponding parser to deserialize JSON back to model data

### Requirement 6: React Frontend Dashboard

**User Story:** As an HR manager, I want an interactive dashboard interface, so that I can view all analytics in one place.

#### Acceptance Criteria

1. WHEN the dashboard loads THEN the HR_Dashboard SHALL fetch data from Django API using Axios
2. WHEN API data is received THEN the HR_Dashboard SHALL render charts using Recharts or Chart.js library
3. WHEN the dashboard renders THEN the HR_Dashboard SHALL display all content styled with Tailwind CSS
4. WHEN the dashboard fully loads THEN the HR_Dashboard SHALL complete rendering within 2 seconds

### Requirement 7: Date Filtering (Stretch Goal)

**User Story:** As an HR manager, I want to filter analytics by date range, so that I can focus on specific time periods.

#### Acceptance Criteria

1. WHERE date filtering is enabled, WHEN a user selects a date range THEN the HR_Dashboard SHALL trigger an API re-fetch with the selected dates
2. WHERE date filtering is enabled, WHEN filtered data is returned THEN the HR_Dashboard SHALL update all charts to reflect the filtered period

### Requirement 8: Data Export (Stretch Goal)

**User Story:** As an HR manager, I want to export dashboard data, so that I can share reports with stakeholders.

#### Acceptance Criteria

1. WHERE data export is enabled, WHEN a user clicks the export button THEN the HR_Dashboard SHALL generate a CSV file containing the current view data
2. WHERE data export is enabled, WHEN the CSV is generated THEN the HR_Dashboard SHALL trigger a browser download of the file
