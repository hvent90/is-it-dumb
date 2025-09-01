'use client';

import { useState, useEffect } from 'react';
import { DashboardGrid } from './dashboard-grid';
import { FilterControls, TimeRange, ModelFamily } from './filter-controls';
import { AnalyticsChart } from './analytics-chart';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { mockQualityDataService } from '@/lib/mock-quality-data';

// Function to enhance data with highlighting
const enhanceDataWithHighlighting = (data: Array<{ name: string; value: number }>, highlightedModel: string | null) => {
  return data.map(item => ({
    ...item,
    isHighlighted: highlightedModel ? item.name === highlightedModel : false,
  }));
};

interface TrendingOverviewProps {
  highlightedModel?: string | null;
}

export function TrendingOverview({ highlightedModel }: TrendingOverviewProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [modelFamily, setModelFamily] = useState<ModelFamily>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [modelData, setModelData] = useState<Array<{ name: string; value: number; isHighlighted?: boolean }>>([]);
  const [issueData, setIssueData] = useState<Array<{ name: string; value: number }>>([]);
  const [qualityData, setQualityData] = useState<Array<{ name: string; value: number; type: 'quality' }>>([]);

  const handleApplyFilters = async () => {
    setIsLoading(true);

    try {
      // Fetch data from APIs with current filter values
      const [modelCountsResult, issueCountsResult, qualityResult] = await Promise.all([
        apiClient.getModelCounts(timeRange, modelFamily),
        apiClient.getIssueCounts(timeRange, modelFamily),
        mockQualityDataService.getQualityScoresForChart()
      ]);

      // Update state with fetched data
      setModelData(enhanceDataWithHighlighting(modelCountsResult.data, highlightedModel || null));
      setIssueData(issueCountsResult.data);
      setQualityData(qualityResult.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Fallback to empty arrays if API fails
      setModelData([]);
      setIssueData([]);
      setQualityData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelClick = (data: { name: string; value: number; isHighlighted?: boolean }) => {
    // Navigate to model detail page
    if (typeof window !== 'undefined') {
      window.location.href = `/analytics/model/${encodeURIComponent(data.name)}`;
    }

    // Special handling for highlighted model
    if (highlightedModel && data.name === highlightedModel) {
      console.log('This is the model you just reported an issue for!');
    }
  };

  const handleIssueClick = (data: { name: string; value: number }) => {
    // Navigate to issue detail page
    if (typeof window !== 'undefined') {
      window.location.href = `/analytics/issue/${encodeURIComponent(data.name)}`;
    }
  };

  // Load initial data and refresh when filters change
  useEffect(() => {
    handleApplyFilters();
  }, [highlightedModel, timeRange, modelFamily]);

  return (
    <div className="space-y-6">
      {highlightedModel && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You just reported an issue for <strong>{highlightedModel}</strong>.
            Here&apos;s how it compares to other models in our analytics.
          </AlertDescription>
        </Alert>
      )}

      <FilterControls
        timeRange={timeRange}
        modelFamily={modelFamily}
        onTimeRangeChange={setTimeRange}
        onModelFamilyChange={setModelFamily}
        onApplyFilters={handleApplyFilters}
        isLoading={isLoading}
      />

      <DashboardGrid>
        <AnalyticsChart
          title="Top Reported Models"
          data={modelData}
          type="bar"
          height={350}
          onBarClick={handleModelClick}
          isLoading={isLoading}
        />

        <AnalyticsChart
          title="Issue Distribution"
          data={issueData}
          type="pie"
          height={350}
          onPieClick={handleIssueClick}
          isLoading={isLoading}
        />

        <div className="md:col-span-2 lg:col-span-3">
          <AnalyticsChart
            title="Recent Trending Issues"
            data={issueData.slice(0, 3)}
            type="bar"
            height={300}
            onBarClick={handleIssueClick}
            isLoading={isLoading}
          />
        </div>

        <div className="md:col-span-2">
          <AnalyticsChart
            title="Model Quality Scores (Automated Evaluation)"
            data={qualityData}
            type="bar"
            height={350}
            isLoading={isLoading}
            colors={['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe']}
          />
        </div>
      </DashboardGrid>
    </div>
  );
}