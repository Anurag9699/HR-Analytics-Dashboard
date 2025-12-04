import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock Recharts to avoid heavy rendering
vi.mock('recharts', () => ({
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
}));

// Mock the API module
vi.mock('../services/api', () => ({
  getLeaveAnalytics: vi.fn(),
}));

import LeaveChart from '../components/LeaveChart';
import { getLeaveAnalytics } from '../services/api';

describe('LeaveChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    getLeaveAnalytics.mockImplementation(() => new Promise(() => {}));
    
    render(<LeaveChart />);
    
    const loadingElement = document.querySelector('.animate-pulse');
    expect(loadingElement).toBeInTheDocument();
  });

  it('renders data after successful fetch', async () => {
    const mockData = {
      leave_by_type: {
        sick: 15,
        vacation: 30,
        personal: 10,
      },
      total_leave_days: 55,
    };
    
    getLeaveAnalytics.mockResolvedValue(mockData);
    
    render(<LeaveChart />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Leave Days')).toBeInTheDocument();
      expect(screen.getByText('55')).toBeInTheDocument();
    });
  });

  it('shows error state when API fails', async () => {
    getLeaveAnalytics.mockRejectedValue(new Error('Network error'));
    
    render(<LeaveChart />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load leave data. Please try again later.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  it('retries fetch when retry button is clicked', async () => {
    const user = userEvent.setup();
    
    getLeaveAnalytics
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        leave_by_type: { sick: 5, vacation: 10, personal: 3 },
        total_leave_days: 18,
      });
    
    render(<LeaveChart />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load leave data. Please try again later.')).toBeInTheDocument();
    });
    
    await user.click(screen.getByRole('button', { name: /retry/i }));
    
    await waitFor(() => {
      expect(screen.getByText('18')).toBeInTheDocument();
    });
  });

  it('shows empty state when no data is available', async () => {
    getLeaveAnalytics.mockResolvedValue(null);
    
    render(<LeaveChart />);
    
    await waitFor(() => {
      expect(screen.getByText('No leave data available.')).toBeInTheDocument();
    });
  });
});
