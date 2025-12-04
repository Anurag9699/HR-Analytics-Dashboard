import { useState } from 'react';
import { exportCSV } from '../services/api';

/**
 * ExportButton - Button component for exporting dashboard data as CSV
 * 
 * Features:
 * - Download icon
 * - Loading state during export
 * - Triggers browser download of CSV file
 * 
 * Requirements: 8.1, 8.2
 */
function ExportButton({ dateRange }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const blob = await exportCSV(dateRange);
      
      // Generate filename with date range if provided
      let filename = 'hr_analytics_export';
      if (dateRange?.startDate) {
        filename += `_from_${dateRange.startDate}`;
      }
      if (dateRange?.endDate) {
        filename += `_to_${dateRange.endDate}`;
      }
      filename += '.csv';

      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export data. Please try again.');
      console.error('Export error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleExport}
        disabled={isLoading}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium
          transition-all duration-200 shadow-sm
          ${isLoading 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md active:bg-green-800'
          }
        `}
        title="Export dashboard data as CSV"
      >
        {isLoading ? (
          <>
            <svg 
              className="animate-spin h-5 w-5" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <svg 
              className="h-5 w-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
              />
            </svg>
            <span>Export CSV</span>
          </>
        )}
      </button>
      
      {error && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-red-100 text-red-700 text-sm rounded-lg shadow-md whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  );
}

export default ExportButton;
