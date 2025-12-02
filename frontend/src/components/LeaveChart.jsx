import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import KPICard from './KPICard';
import { getLeaveAnalytics } from '../services/api';

/**
 * LeaveChart - Displays leave analytics with a bar chart and KPI card
 * 
 * Shows:
 * - Total leave days as a KPI card
 * - Bar chart showing leave breakdown by type (Sick, Vacation, Personal)
 * 
 * Requirements: 3.1
 */
function LeaveChart() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const analyticsData = await getLeaveAnalytics();
        setData(analyticsData);
      } catch (err) {
        setError('Failed to load leave data. Please try again later.');
        console.error('Error fetching leave analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    getLeaveAnalytics()
      .then(setData)
      .catch((err) => {
        setError('Failed to load leave data. Please try again later.');
        console.error('Error fetching leave analytics:', err);
      })
      .finally(() => setLoading(false));
  };


  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center">No leave data available.</p>
      </div>
    );
  }

  const { leave_by_type, total_leave_days } = data;

  // Transform leave_by_type object into array format for Recharts
  const chartData = leave_by_type ? [
    { type: 'Sick', days: leave_by_type.sick || 0, fill: '#ef4444' },
    { type: 'Vacation', days: leave_by_type.vacation || 0, fill: '#3b82f6' },
    { type: 'Personal', days: leave_by_type.personal || 0, fill: '#8b5cf6' }
  ] : [];

  return (
    <div className="space-y-6">
      {/* KPI Card for Total Leave Days */}
      <KPICard
        title="Total Leave Days"
        value={total_leave_days ?? 0}
      />

      {/* Bar Chart for Leave Type Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Leave by Type
        </h3>
        
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="type"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
                label={{ 
                  value: 'Days', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: '#6b7280', fontSize: 12 }
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [`${value} days`, 'Leave Days']}
              />
              <Legend />
              <Bar
                dataKey="days"
                name="Leave Days"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No leave data available.
          </p>
        )}
      </div>
    </div>
  );
}

LeaveChart.propTypes = {};

export default LeaveChart;
