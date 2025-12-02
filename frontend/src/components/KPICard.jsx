import PropTypes from 'prop-types';

/**
 * KPICard - A reusable component for displaying key performance indicators
 * 
 * @param {string} title - The title/label for the KPI
 * @param {string|number} value - The KPI value to display
 * @param {object} trend - Optional trend indicator with direction and value
 * @param {string} trend.direction - 'up' or 'down'
 * @param {string|number} trend.value - The trend percentage or value
 */
function KPICard({ title, value, trend }) {
  const getTrendColor = (direction) => {
    if (direction === 'up') return 'text-green-600';
    if (direction === 'down') return 'text-red-600';
    return 'text-gray-500';
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
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
        {title}
      </h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-3xl font-semibold text-gray-900">
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
  })
};

KPICard.defaultProps = {
  trend: null
};

export default KPICard;
