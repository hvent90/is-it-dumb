'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DashboardGrid } from './dashboard-grid';
import { FilterControls, TimeRange, ModelFamily } from './filter-controls';
import { AnalyticsChart } from './analytics-chart';
import { RecentClusters } from './recent-clusters';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CardHeader, CardTitle } from '@/components/ui/card';
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
  const [qualityData, setQualityData] = useState<Array<{ date: string; [modelName: string]: string | number }>>([]);
  const [qualityModels, setQualityModels] = useState<string[]>([]);
   const [timeseriesData, setTimeseriesData] = useState<Array<{ date: string; name: string; value: number; [modelName: string]: string | number }>>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  const handleApplyFilters = useCallback(async () => {
    setIsLoading(true);

    try {
      // Fetch data from APIs with current filter values
      const [modelCountsResult, issueCountsResult, qualityResult, timeseriesResult] = await Promise.all([
        apiClient.getModelCounts(timeRange, modelFamily),
        apiClient.getIssueCounts(timeRange, modelFamily),
        mockQualityDataService.getQualityTimeseriesForChart(),
        apiClient.getModelIssuesTimeseries(timeRange, modelFamily)
      ]);

      // Mock data for Issue Distribution
      const mockIssueData = [
        { name: 'Hallucination', value: 35 },
        { name: 'Memory Issues', value: 28 },
        { name: 'Reliability', value: 22 },
        { name: 'UI Problems', value: 15 },
        { name: 'Performance', value: 12 },
        { name: 'Safety Concerns', value: 8 }
      ];

      // Update state with fetched data and mock issue data
      setModelData(enhanceDataWithHighlighting(modelCountsResult.data, highlightedModel || null));
      setIssueData(mockIssueData); // Use mock data instead of real API data
      setQualityData(qualityResult.data);
      setQualityModels(qualityResult.models);
      setTimeseriesData(timeseriesResult.data);
      setAvailableModels(timeseriesResult.models);
      
      // Debug logging
      console.log('Timeseries API Response:', timeseriesResult);
      console.log('Timeseries Data:', timeseriesResult.data);
      console.log('Available Models:', timeseriesResult.models);
      console.log('First few data points:', timeseriesResult.data?.slice(0, 3));
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Fallback to empty arrays if API fails
      setModelData([]);
      setIssueData([]);
      setQualityData([]);
      setQualityModels([]);
      setTimeseriesData([]);
      setAvailableModels([]);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, modelFamily, highlightedModel]);

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

  const handleAreaClick = (data: { name: string; value: number }) => {
    // Navigate to model detail page for the clicked area/model
    if (typeof window !== 'undefined') {
      window.location.href = `/analytics/model/${encodeURIComponent(data.name)}`;
    }
  };

  // Load initial data and refresh when filters change
  useEffect(() => {
    handleApplyFilters();
  }, [handleApplyFilters]);

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

      {/* Full-width area chart showing models and their issue counts over time */}
      <div className="w-full">
        <AnalyticsChart
          title="Models Issue Reports Over Time"
          data={timeseriesData}
          type="area"
          nameKey="date"
          height={400}
          areaDataKeys={availableModels}
          onAreaClick={handleAreaClick}
          isLoading={isLoading}
          colors={['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb']}
        />
      </div>

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

        <div className="col-span-2">
          <RecentClusters isLoading={isLoading} />
        </div>
      </DashboardGrid>

      {/* Full-width model evals line chart with faux tab switcher */}
      <div className="w-full">
        <AnalyticsChart
          title="Model Evals"
          data={qualityData}
          type="line"
          nameKey="date"
          height={350}
          lineDataKeys={qualityModels}
          isLoading={isLoading}
          colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']}
          customHeader={
            <CardHeader>
              <CardTitle className="mb-4">Model Evals (mock data)</CardTitle>
              {/* Faux tab switcher */}
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                <button className="px-3 py-1 text-sm font-medium bg-white text-gray-900 rounded shadow-sm">
                  Overall Score
                </button>
                <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 rounded">
                  SWE-Bench
                </button>
                <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 rounded">
                  MMLU
                </button>
                <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 rounded">
                  HumanEval
                </button>
                <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 rounded">
                  HellaSwag
                </button>
              </div>
            </CardHeader>
          }
        />
      </div>
    </div>
  );
}