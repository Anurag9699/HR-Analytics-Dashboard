import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import KPICard from './KPICard';
import { getAttendanceAnalytics } from '../services/api';

/**
 * AttendanceChart - Displays attendance analytics with a line chart and KPI card
 * 
 * Shows:
 * - Absenteeism rate as a KPI card
 * - Line chart showing daily/weekly attendance trends (present vs absent counts)
 * 
 * Requirements: 2.1, 2.3
 */
function AttendanceChart({ dateRange }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const analyticsData = await getAttendanceAnalytics(dateRange);
        setData(analyticsData);
      } catch (err) {
        setError('Failed to load attendance data. Please try again later.');
        console.error('Error fetching attendance analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    getAttendanceAnalytics(dateRange)
      .then(setData)
      .catch((err) => {
        setError('Failed to load attendance data. Please try again later.');
        console.error('Error fetching attendance analytics:', err);
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
        <p className="text-gray-500 text-center">No attendance data available.</p>
      </div>
    );
  }

  const { absenteeism_rate, trend_data } = data;

  return (
    <div className="space-y-6">
      {/* KPI Card for Absenteeism Rate */}
      <KPICard
        title="Absenteeism Rate"
        value={`${absenteeism_rate?.toFixed(1) ?? 0}%`}
        color="green"
      />

      {/* Line Chart for Attendance Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Attendance Trends
        </h3>
        
        {trend_data && trend_data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={trend_data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="present_count"
                name="Present"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="absent_count"
                name="Absent"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No trend data available.
          </p>
        )}
      </div>
    </div>
  );
}

AttendanceChart.propTypes = {
  dateRange: PropTypes.shape({
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  }),
};

AttendanceChart.defaultProps = {
  dateRange: null,
};

export default AttendanceChart;
