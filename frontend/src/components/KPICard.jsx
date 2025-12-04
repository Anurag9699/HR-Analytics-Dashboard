import PropTypes from 'prop-types';

/**
 * KPICard - A reusable component for displaying key performance indicators
 * 
 * @param {string} title - The title/label for the KPI
 * @param {string|number} value - The KPI value to display
 * @param {object} trend - Optional trend indicator with direction and value
 * @param {string} trend.direction - 'up' or 'down'
 * @param {string|number} trend.value - The trend percentage or value
 * @param {string} color - Optional color theme ('blue', 'green', 'red', 'orange')
 * 
 * Requirements: 2.1, 4.1
 */
function KPICard({ title, value, trend, color = 'blue' }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600'
  };

  const getTrendColor = (direction) => {
    if (direction === 'up') return 'text-green-400';
    if (direction === 'down') return 'text-red-400';
    return 'text-gray-400';
  };

  const getTrendIcon = (direction) => {
    if (direction === 'up') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      );
    }
    if (direction === 'down') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color] || colorClasses.blue} rounded-xl shadow-lg p-6 text-white`}>
      <h3 className="text-sm font-medium text-white/80 uppercase tracking-wide">
        {title}
      </h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-3xl font-bold">
          {value}
        </p>
        {trend && (
          <span className={`ml-2 flex items-center text-sm font-medium ${getTrendColor(trend.direction)}`}>
            {getTrendIcon(trend.direction)}
            <span className="ml-1">{trend.value}</span>
          </span>
        )}
      </div>
    </div>
  );
}

KPICard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  trend: PropTypes.shape({
    direction: PropTypes.oneOf(['up', 'down']),
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }),
  color: PropTypes.oneOf(['blue', 'green', 'red', 'orange', 'purple'])
};

KPICard.defaultProps = {
  trend: null,
  color: 'blue'
};

export default KPICard;
