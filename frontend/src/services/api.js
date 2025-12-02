import axios from 'axios';

// Base URL configuration for Django backend
const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

/**
 * Fetch attendance analytics data
 * @returns {Promise<Object>} Attendance analytics including absenteeism rate and trend data
 */
export const getAttendanceAnalytics = async () => {
  try {
    const response = await apiClient.get('/attendance/analytics/');
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to fetch attendance analytics');
    throw error;
  }
};

/**
 * Fetch leave analytics data
 * @returns {Promise<Object>} Leave analytics including breakdown by type
 */
export const getLeaveAnalytics = async () => {
  try {
    const response = await apiClient.get('/leave/analytics/');
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to fetch leave analytics');
    throw error;
  }
};

/**
 * Fetch attrition analytics data
 * @returns {Promise<Object>} Attrition analytics including rate and monthly trends
 */
export const getAttritionAnalytics = async () => {
  try {
    const response = await apiClient.get('/attrition/analytics/');
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to fetch attrition analytics');
    throw error;
  }
};


/**
 * Fetch all employees
 * @returns {Promise<Array>} List of employees
 */
export const getEmployees = async () => {
  try {
    const response = await apiClient.get('/employees/');
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to fetch employees');
    throw error;
  }
};

/**
 * Handle API errors with consistent error messaging
 * @param {Error} error - The error object from axios
 * @param {string} defaultMessage - Default message if no specific error is available
 */
const handleApiError = (error, defaultMessage) => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const message = error.response.data?.error || error.response.data?.message;
    
    if (status === 404) {
      console.error(`${defaultMessage}: Resource not found`);
    } else if (status >= 500) {
      console.error(`${defaultMessage}: Server error`);
    } else {
      console.error(`${defaultMessage}: ${message || 'Unknown error'}`);
    }
  } else if (error.request) {
    // Request was made but no response received
    console.error(`${defaultMessage}: No response from server. Please check if the backend is running.`);
  } else {
    // Error in setting up the request
    console.error(`${defaultMessage}: ${error.message}`);
  }
};

// Export the api client for custom requests if needed
export default apiClient;
