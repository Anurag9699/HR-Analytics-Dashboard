import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock Recharts to avoid heavy rendering
vi.mock('recharts', () => ({
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
}));

// Mock the API module
vi.mock('../services/api', () => ({
  getAttendanceAnalytics: vi.fn(),
}));

import AttendanceChart from '../components/AttendanceChart';
import { getAttendanceAnalytics } from '../services/api';

describe('AttendanceChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    getAttendanceAnalytics.mockImplementation(() => new Promise(() => {}));
    
    render(<AttendanceChart />);
    
    const loadingElement = document.querySelector('.animate-pulse');
    expect(loadingElement).toBeInTheDocument();
  });

  it('renders data after successful fetch', async () => {
    const mockData = {
      absenteeism_rate: 5.5,
      trend_data: [
        { date: '2024-01-01', present_count: 45, absent_count: 5 },
      ],
    };
    
    getAttendanceAnalytics.mockResolvedValue(mockData);
    
    render(<AttendanceChart />);
    
    await waitFor(() => {
      expect(screen.getByText('Absenteeism Rate')).toBeInTheDocument();
      expect(screen.getByText('5.5%')).toBeInTheDocument();
    });
  });

  it('shows error state when API fails', async () => {
    getAttendanceAnalytics.mockRejectedValue(new Error('Network error'));
    
    render(<AttendanceChart />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load attendance data. Please try again later.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  it('retries fetch when retry button is clicked', async () => {
    const user = userEvent.setup();
    
    getAttendanceAnalytics
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        absenteeism_rate: 3.2,
        trend_data: [],
      });
    
    render(<AttendanceChart />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load attendance data. Please try again later.')).toBeInTheDocument();
    });
    
    await user.click(screen.getByRole('button', { name: /retry/i }));
    
    await waitFor(() => {
      expect(screen.getByText('3.2%')).toBeInTheDocument();
    });
  });

  it('shows empty state when no data is available', async () => {
    getAttendanceAnalytics.mockResolvedValue(null);
    
    render(<AttendanceChart />);
    
    await waitFor(() => {
      expect(screen.getByText('No attendance data available.')).toBeInTheDocument();
    });
  });
});
