import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import KPICard from '../components/KPICard';

describe('KPICard', () => {
  it('renders title and value correctly', () => {
    render(<KPICard title="Test KPI" value="42%" />);
    
    expect(screen.getByText('Test KPI')).toBeInTheDocument();
    expect(screen.getByText('42%')).toBeInTheDocument();
  });

  it('renders numeric value correctly', () => {
    render(<KPICard title="Count" value={100} />);
    
    expect(screen.getByText('Count')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('renders with trend indicator when provided', () => {
    render(
      <KPICard 
        title="Growth" 
        value="25%" 
        trend={{ direction: 'up', value: '+5%' }} 
      />
    );
    
    expect(screen.getByText('Growth')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('+5%')).toBeInTheDocument();
  });

  it('renders without trend indicator when not provided', () => {
    const { container } = render(<KPICard title="Simple" value="10" />);
    
    expect(screen.getByText('Simple')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    // No trend SVG should be present
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(0);
  });

  it('applies correct color class for different colors', () => {
    const { container, rerender } = render(<KPICard title="Blue" value="1" color="blue" />);
    expect(container.firstChild).toHaveClass('from-blue-500');
    
    rerender(<KPICard title="Green" value="2" color="green" />);
    expect(container.firstChild).toHaveClass('from-green-500');
    
    rerender(<KPICard title="Red" value="3" color="red" />);
    expect(container.firstChild).toHaveClass('from-red-500');
    
    rerender(<KPICard title="Orange" value="4" color="orange" />);
    expect(container.firstChild).toHaveClass('from-orange-500');
  });

  it('defaults to blue color when no color is specified', () => {
    const { container } = render(<KPICard title="Default" value="5" />);
    expect(container.firstChild).toHaveClass('from-blue-500');
  });
});
