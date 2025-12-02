import { useState, useEffect } from 'react';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart
} from 'recharts';
import KPICard from './KPICard';
import { getAttritionAnalytics } from '../services/api';

/**
 * AttritionChart - Displays attrition analytics with a chart and KPI card
 * 
 * Shows:
 * - Attrition rate as a KPI card
 * - Chart showing monthly attrition data
 * 
 * Requirements: 4.1, 4.4
 */
function AttritionChart() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const analyticsData = await getAttritionAnalytics();
        setData(analyticsData);
      } catch (err) {
        setError('Failed to load attrition data. Please try again later.');
        console.error('Error fetching attrition analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    getAttritionAnalytics()
      .then(setData)
      .catch((err) => {
        setError('Failed to load attrition data. Please try again later.');
        console.error('Error fetching attrition analytics:', err);
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
        <p className="text-gray-500 text-center">No attrition data available.</p>
      </div>
    );
  }

  const { attrition_rate, employees_left, total_employees, monthly_trend } = data;

  return (
    <div className="space-y-6">
      {/* KPI Cards for Attrition Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Attrition Rate"
          value={`${attrition_rate?.toFixed(1) ?? 0}%`}
        />
        <KPICard
          title="Employees Left"
          value={employees_left ?? 0}
        />
        <KPICard
          title="Total Employees"
          value={total_employees ?? 0}
        />
      </div>

      {/* Chart for Monthly Attrition Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Monthly Attrition Trends
        </h3>
        
        {monthly_trend && monthly_trend.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={monthly_trend}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
                label={{ 
                  value: 'Employees Left', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: '#6b7280', fontSize: 12 }
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
                label={{ 
                  value: 'Attrition Rate (%)', 
                  angle: 90, 
                  position: 'insideRight',
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
                formatter={(value, name) => {
                  if (name === 'Attrition Rate') return [`${value}%`, name];
                  return [value, name];
                }}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="left_count"
                name="Employees Left"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="attrition_rate"
                name="Attrition Rate"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ fill: '#f97316', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No monthly trend data available.
          </p>
        )}
      </div>
    </div>
  );
}

export default AttritionChart;
