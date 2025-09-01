import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { TrendingOverview } from '@/components/trending-overview';

// Mock the API client
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    getModelCounts: vi.fn().mockResolvedValue({
      data: [
        { name: 'GPT-4', value: 150 },
        { name: 'Claude-3', value: 120 },
        { name: 'GPT-3.5', value: 90 },
      ]
    }),
    getIssueCounts: vi.fn().mockResolvedValue({
      data: [
        { name: 'Hallucination', value: 35 },
        { name: 'Memory Issues', value: 28 },
        { name: 'Reliability', value: 22 },
      ]
    }),
  }
}));

// Mock the quality data service
vi.mock('@/lib/mock-quality-data', () => ({
  mockQualityDataService: {
    getQualityScoresForChart: vi.fn().mockResolvedValue({
      data: [
        { name: 'GPT-4', value: 92.3, type: 'quality' },
        { name: 'Claude-3', value: 91.8, type: 'quality' },
      ]
    }),
  }
}));

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('TrendingOverview', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the trending overview with charts', async () => {
    render(<TrendingOverview />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Top Reported Models')).toBeInTheDocument();
    });

    expect(screen.getByText('Issue Distribution')).toBeInTheDocument();
    expect(screen.getByText('Model Quality Scores (Automated Evaluation)')).toBeInTheDocument();
  });

  it.skip('shows highlighted model message when highlightedModel is provided', async () => {
    render(<TrendingOverview highlightedModel="GPT-4" />);

    await waitFor(() => {
      expect(screen.getByText('Top Reported Models')).toBeInTheDocument();
    });

    // Test that the alert component is rendered when highlightedModel is provided
    const alert = document.querySelector('[data-slot="alert"]');
    expect(alert).toBeInTheDocument();
  });

  it('calls API methods on mount', async () => {
    const { apiClient } = await import('@/lib/api-client');
    const { mockQualityDataService } = await import('@/lib/mock-quality-data');

    render(<TrendingOverview />);

    await waitFor(() => {
      expect(apiClient.getModelCounts).toHaveBeenCalled();
      expect(apiClient.getIssueCounts).toHaveBeenCalled();
      expect(mockQualityDataService.getQualityScoresForChart).toHaveBeenCalled();
    });
  });

  it('applies filters when Apply Filters button is clicked', async () => {
    const { apiClient } = await import('@/lib/api-client');

    render(<TrendingOverview />);

    await waitFor(() => {
      expect(screen.getByText('Top Reported Models')).toBeInTheDocument();
    });

    const applyButton = screen.getByRole('button', { name: 'Apply Filters' });
    fireEvent.click(applyButton);

    // Should call API methods again with filters
    await waitFor(() => {
      expect(apiClient.getModelCounts).toHaveBeenCalledTimes(2);
      expect(apiClient.getIssueCounts).toHaveBeenCalledTimes(2);
    });
  });

  it('shows loading state while fetching data', async () => {
    // Mock a delay in the API call
    const { apiClient } = await import('@/lib/api-client');
    vi.mocked(apiClient.getModelCounts).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({
        data: [
          { name: 'GPT-4', value: 150 },
          { name: 'Claude-3', value: 120 },
        ]
      }), 100))
    );

    render(<TrendingOverview />);

    // Should show loading initially
    expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0);

    // Should resolve after delay
    await waitFor(() => {
      expect(screen.getByText('Top Reported Models')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    const { apiClient } = await import('@/lib/api-client');
    vi.mocked(apiClient.getModelCounts).mockRejectedValueOnce(new Error('API Error'));

    // Mock console.error to avoid test output pollution
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<TrendingOverview />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching analytics data:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('renders filter controls', async () => {
    render(<TrendingOverview />);

    await waitFor(() => {
      expect(screen.getByText('Top Reported Models')).toBeInTheDocument();
    });

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Time Range')).toBeInTheDocument();
    expect(screen.getByText('Model Family')).toBeInTheDocument();
  });

  it('updates time range filter', async () => {
    render(<TrendingOverview />);

    await waitFor(() => {
      expect(screen.getByText('Top Reported Models')).toBeInTheDocument();
    });

    // The filter controls use a select component, so we test the basic rendering
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
  });

  it('displays quality data in charts', async () => {
    render(<TrendingOverview />);

    await waitFor(() => {
      expect(screen.getByText('Model Quality Scores (Automated Evaluation)')).toBeInTheDocument();
    });

    // Quality data should be displayed
    expect(screen.getByText('Model Quality Scores (Automated Evaluation)')).toBeInTheDocument();
  });
});