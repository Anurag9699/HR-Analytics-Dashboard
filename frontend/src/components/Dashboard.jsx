import { useState, useEffect } from 'react';
import AttendanceChart from './AttendanceChart';
import LeaveChart from './LeaveChart';
import AttritionChart from './AttritionChart';

/**
 * Dashboard - Main dashboard component that composes all analytics charts
 * 
 * Displays:
 * - Attendance analytics with trends
 * - Leave analytics with type breakdown
 * - Attrition analytics with monthly trends
 * 
 * Requirements: 6.2, 6.3
 */
function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Simulate initial dashboard load check
    // Individual components handle their own data fetching
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    // Force re-render of child components by toggling loading state
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load dashboard</h3>
          <p className="text-gray-600 mb-4">There was an error loading the analytics data.</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Attendance Section */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Attendance Analytics</h2>
        <AttendanceChart />
      </section>

      {/* Leave and Attrition Section - Side by side on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Leave Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Leave Management</h2>
          <LeaveChart />
        </section>

        {/* Attrition Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Attrition Analysis</h2>
          <AttritionChart />
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
