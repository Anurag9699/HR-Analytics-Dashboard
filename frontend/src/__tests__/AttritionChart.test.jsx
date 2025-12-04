import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock Recharts to avoid heavy rendering
vi.mock('recharts', () => ({
  ComposedChart: ({ children }) => <div data-testid="composed-chart">{children}</div>,
  Bar: () => null,
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
  getAttritionAnalytics: vi.fn(),
}));

import AttritionChart from '../components/AttritionChart';
import { getAttritionAnalytics } from '../services/api';

describe('AttritionChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    getAttritionAnalytics.mockImplementation(() => new Promise(() => {}));
    
    render(<AttritionChart />);
    
    const loadingElement = document.querySelector('.animate-pulse');
    expect(loadingElement).toBeInTheDocument();
  });

  it('renders data after successful fetch', async () => {
    const mockData = {
      attrition_rate: 8.5,
      employees_left: 17,
      total_employees: 200,
      monthly_trend: [
        { month: 'Jan', left_count: 3, attrition_rate: 1.5 },
      ],
    };
    
    getAttritionAnalytics.mockResolvedValue(mockData);
    
    render(<AttritionChart />);
    
    await waitFor(() => {
      expect(screen.getByText('Attrition Rate')).toBeInTheDocument();
      expect(screen.getByText('8.5%')).toBeInTheDocument();
      expect(screen.getByText('Employees Left')).toBeInTheDocument();
      expect(screen.getByText('17')).toBeInTheDocument();
      expect(screen.getByText('Total Employees')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
    });
  });

  it('shows error state when API fails', async () => {
    getAttritionAnalytics.mockRejectedValue(new Error('Network error'));
    
    render(<AttritionChart />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load attrition data. Please try again later.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  it('retries fetch when retry button is clicked', async () => {
    const user = userEvent.setup();
    
    getAttritionAnalytics
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        attrition_rate: 5.0,
        employees_left: 10,
        total_employees: 200,
        monthly_trend: [],
      });
    
    render(<AttritionChart />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load attrition data. Please try again later.')).toBeInTheDocument();
    });
    
    await user.click(screen.getByRole('button', { name: /retry/i }));
    
    await waitFor(() => {
      expect(screen.getByText('5.0%')).toBeInTheDocument();
    });
  });

  it('shows empty state when no data is available', async () => {
    getAttritionAnalytics.mockResolvedValue(null);
    
    render(<AttritionChart />);
    
    await waitFor(() => {
      expect(screen.getByText('No attrition data available.')).toBeInTheDocument();
    });
  });
});
