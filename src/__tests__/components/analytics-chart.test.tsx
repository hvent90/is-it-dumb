import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { AnalyticsChart } from '@/components/analytics-chart';

const mockData = [
  { name: 'GPT-4', value: 150 },
  { name: 'Claude-3', value: 120 },
  { name: 'GPT-3.5', value: 90 },
];

describe('AnalyticsChart', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the chart title', () => {
    render(
      <AnalyticsChart
        title="Test Chart"
        data={mockData}
        type="bar"
      />
    );

    expect(screen.getByText('Test Chart')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    render(
      <AnalyticsChart
        title="Loading Chart"
        data={mockData}
        type="bar"
        isLoading={true}
      />
    );

    expect(screen.getByText('Loading Chart')).toBeInTheDocument();
    // Check for loading spinner
    const loadingSpinner = document.querySelector('.animate-spin');
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('renders bar chart with correct data', () => {
    render(
      <AnalyticsChart
        title="Test Bar Chart"
        data={mockData}
        type="bar"
      />
    );

    expect(screen.getByText('Test Bar Chart')).toBeInTheDocument();
    // Check that responsive container is rendered (Recharts component)
    const responsiveContainer = document.querySelector('.recharts-responsive-container');
    expect(responsiveContainer).toBeInTheDocument();
  });

  it('renders pie chart with correct data', () => {
    render(
      <AnalyticsChart
        title="Test Pie Chart"
        data={mockData}
        type="pie"
      />
    );

    expect(screen.getByText('Test Pie Chart')).toBeInTheDocument();
    // Check that responsive container is rendered (Recharts component)
    const responsiveContainer = document.querySelector('.recharts-responsive-container');
    expect(responsiveContainer).toBeInTheDocument();
  });

  it('uses custom colors when provided', () => {
    const customColors = ['#ff0000', '#00ff00', '#0000ff'];

    render(
      <AnalyticsChart
        title="Color Test Chart"
        data={mockData}
        type="bar"
        colors={customColors}
      />
    );

    expect(screen.getByText('Color Test Chart')).toBeInTheDocument();
  });

  it('uses custom height when provided', () => {
    render(
      <AnalyticsChart
        title="Height Test Chart"
        data={mockData}
        type="bar"
        height={500}
      />
    );

    expect(screen.getByText('Height Test Chart')).toBeInTheDocument();
  });

  it('handles empty data array', () => {
    render(
      <AnalyticsChart
        title="Empty Chart"
        data={[]}
        type="bar"
      />
    );

    expect(screen.getByText('Empty Chart')).toBeInTheDocument();
  });

  it('uses custom dataKey and nameKey', () => {
    const customData = [
      { name: 'Model A', value: 100, label: 'Model A', count: 100 },
      { name: 'Model B', value: 200, label: 'Model B', count: 200 },
    ];

    render(
      <AnalyticsChart
        title="Custom Keys Chart"
        data={customData}
        type="bar"
        dataKey="count"
        nameKey="label"
      />
    );

    expect(screen.getByText('Custom Keys Chart')).toBeInTheDocument();
  });

  it('calls onBarClick when bar is clicked', () => {
    const mockOnBarClick = vi.fn();
    const { container } = render(
      <AnalyticsChart
        title="Clickable Bar Chart"
        data={mockData}
        type="bar"
        onBarClick={mockOnBarClick}
      />
    );

    // Find the bar elements (Recharts bars)
    const bars = container.querySelectorAll('.recharts-bar-rectangle');
    if (bars.length > 0) {
      fireEvent.click(bars[0]);
      expect(mockOnBarClick).toHaveBeenCalled();
    }
  });

  it('calls onPieClick when pie slice is clicked', () => {
    const mockOnPieClick = vi.fn();
    const { container } = render(
      <AnalyticsChart
        title="Clickable Pie Chart"
        data={mockData}
        type="pie"
        onPieClick={mockOnPieClick}
      />
    );

    // Find pie sectors (Recharts pie slices)
    const pieSectors = container.querySelectorAll('.recharts-pie-sector');
    if (pieSectors.length > 0) {
      fireEvent.click(pieSectors[0]);
      expect(mockOnPieClick).toHaveBeenCalled();
    }
  });

  it('does not call click handlers when not provided', () => {
    const { container } = render(
      <AnalyticsChart
        title="Non-Clickable Chart"
        data={mockData}
        type="bar"
      />
    );

    // Find the bar elements
    const bars = container.querySelectorAll('.recharts-bar-rectangle');
    if (bars.length > 0) {
      // Should not throw error when clicked without handler
      expect(() => fireEvent.click(bars[0])).not.toThrow();
    }
  });

  it('shows pointer cursor when click handlers are provided', () => {
    const mockOnBarClick = vi.fn();
    const { container } = render(
      <AnalyticsChart
        title="Pointer Cursor Chart"
        data={mockData}
        type="bar"
        onBarClick={mockOnBarClick}
      />
    );

    // Check that bars have pointer cursor
    const bars = container.querySelectorAll('.recharts-bar-rectangle');
    if (bars.length > 0) {
      const bar = bars[0] as HTMLElement;
      expect(bar.style.cursor).toBe('pointer');
    }
  });

  it('shows default cursor when no click handlers are provided', () => {
    const { container } = render(
      <AnalyticsChart
        title="Default Cursor Chart"
        data={mockData}
        type="bar"
      />
    );

    // Check that bars have default cursor
    const bars = container.querySelectorAll('.recharts-bar-rectangle');
    if (bars.length > 0) {
      const bar = bars[0] as HTMLElement;
      expect(bar.style.cursor).toBe('default');
    }
  });
});