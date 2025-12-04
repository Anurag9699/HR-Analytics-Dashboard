import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('API Service', () => {
  let mockGet;
  let api;

  beforeEach(async () => {
    vi.resetModules();
    
    // Mock axios before importing api
    mockGet = vi.fn();
    vi.doMock('axios', () => ({
      default: {
        create: () => ({
          get: mockGet,
        }),
      },
    }));
    
    api = await import('../services/api');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getAttendanceAnalytics', () => {
    it('fetches attendance analytics successfully', async () => {
      const mockData = {
        absenteeism_rate: 5.5,
        trend_data: [{ date: '2024-01-01', present_count: 45, absent_count: 5 }],
      };
      
      mockGet.mockResolvedValue({ data: mockData });
      
      const result = await api.getAttendanceAnalytics();
      expect(result).toEqual(mockData);
    });

    it('throws error when API call fails', async () => {
      mockGet.mockRejectedValue(new Error('Network error'));
      
      await expect(api.getAttendanceAnalytics()).rejects.toThrow();
    });
  });

  describe('getLeaveAnalytics', () => {
    it('fetches leave analytics successfully', async () => {
      const mockData = {
        leave_by_type: { sick: 10, vacation: 20, personal: 5 },
        total_leave_days: 35,
      };
      
      mockGet.mockResolvedValue({ data: mockData });
      
      const result = await api.getLeaveAnalytics();
      expect(result).toEqual(mockData);
    });

    it('throws error when API call fails', async () => {
      mockGet.mockRejectedValue(new Error('Server error'));
      
      await expect(api.getLeaveAnalytics()).rejects.toThrow();
    });
  });

  describe('getAttritionAnalytics', () => {
    it('fetches attrition analytics successfully', async () => {
      const mockData = {
        attrition_rate: 8.5,
        employees_left: 17,
        total_employees: 200,
        monthly_trend: [],
      };
      
      mockGet.mockResolvedValue({ data: mockData });
      
      const result = await api.getAttritionAnalytics();
      expect(result).toEqual(mockData);
    });

    it('throws error when API call fails', async () => {
      mockGet.mockRejectedValue(new Error('Timeout'));
      
      await expect(api.getAttritionAnalytics()).rejects.toThrow();
    });
  });

  describe('getEmployees', () => {
    it('fetches employees successfully', async () => {
      const mockData = [
        { id: 1, name: 'John Doe', department: 'Engineering' },
        { id: 2, name: 'Jane Smith', department: 'HR' },
      ];
      
      mockGet.mockResolvedValue({ data: mockData });
      
      const result = await api.getEmployees();
      expect(result).toEqual(mockData);
    });

    it('throws error when API call fails', async () => {
      mockGet.mockRejectedValue(new Error('Not found'));
      
      await expect(api.getEmployees()).rejects.toThrow();
    });
  });
});
