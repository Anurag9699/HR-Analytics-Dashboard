import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * DateRangeFilter - Date picker component with preset options
 * 
 * Provides:
 * - Start and end date inputs
 * - Preset options (Last 7 Days, Last 30 Days, This Month)
 * - Triggers callback when date range changes
 * 
 * Requirements: 7.1, 7.2
 */
function DateRangeFilter({ onDateRangeChange }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activePreset, setActivePreset] = useState(null);

  // Calculate preset date ranges
  const getPresetDates = (preset) => {
    const today = new Date();
    const end = today.toISOString().split('T')[0];
    let start;

    switch (preset) {
      case 'last7days':
        start = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
        break;
      case 'last30days':
        start = new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0];
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        break;
      default:
        return { start: '', end: '' };
    }

    return { start, end: new Date().toISOString().split('T')[0] };
  };

  // Handle preset button click
  const handlePresetClick = (preset) => {
    const { start, end } = getPresetDates(preset);
    setStartDate(start);
    setEndDate(end);
    setActivePreset(preset);
  };

  // Handle clear filter
  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    setActivePreset(null);
  };

  // Trigger callback when dates change
  useEffect(() => {
    const dateRange = {
      startDate: startDate || null,
      endDate: endDate || null,
    };
    onDateRangeChange(dateRange);
  }, [startDate, endDate, onDateRangeChange]);

  // Clear active preset when manually changing dates
  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    setActivePreset(null);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    setActivePreset(null);
  };

  const presetButtons = [
    { id: 'last7days', label: 'Last 7 Days' },
    { id: 'last30days', label: 'Last 30 Days' },
    { id: 'thisMonth', label: 'This Month' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Filter Icon and Label */}
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="font-medium text-gray-700">Date Filter</span>
        </div>

        {/* Preset Buttons */}
        <div className="flex gap-2">
          {presetButtons.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetClick(preset.id)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                activePreset === preset.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Date Inputs */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">From:</label>
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">To:</label>
          <input
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Clear Button */}
        {(startDate || endDate) && (
          <button
            onClick={handleClear}
            className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

DateRangeFilter.propTypes = {
  onDateRangeChange: PropTypes.func.isRequired,
};

export default DateRangeFilter;
