'use client';

import { useState, useEffect } from 'react';
import { DashboardGrid } from './dashboard-grid';
import { FilterControls, TimeRange, ModelFamily } from './filter-controls';
import { AnalyticsChart } from './analytics-chart';

// Mock data for development - replace with actual API calls
const mockModelData = [
  { name: 'GPT-4', value: 1250 },
  { name: 'Claude-3', value: 980 },
  { name: 'GPT-3.5', value: 750 },
  { name: 'Gemini Pro', value: 620 },
  { name: 'Llama 2', value: 450 },
];

const mockIssueData = [
  { name: 'Hallucination', value: 35 },
  { name: 'Memory Issues', value: 28 },
  { name: 'Reliability', value: 22 },
  { name: 'UI Problems', value: 15 },
];

export function TrendingOverview() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [modelFamily, setModelFamily] = useState<ModelFamily>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [modelData, setModelData] = useState(mockModelData);
  const [issueData, setIssueData] = useState(mockIssueData);

  const handleApplyFilters = async () => {
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real implementation, this would fetch data from Tinybird
    // For now, we'll just update with the same mock data
    setModelData(mockModelData);
    setIssueData(mockIssueData);

    setIsLoading(false);
  };

  const handleModelClick = (data: any) => {
    // Navigate to model detail page
    console.log('Navigate to model:', data.name);
  };

  const handleIssueClick = (data: any) => {
    // Navigate to issue detail page
    console.log('Navigate to issue:', data.name);
  };

  // Load initial data
  useEffect(() => {
    handleApplyFilters();
  }, []);

  return (
    <div className="space-y-6">
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
            data={mockIssueData.slice(0, 3)}
            type="bar"
            height={300}
            onBarClick={handleIssueClick}
            isLoading={isLoading}
          />
        </div>
      </DashboardGrid>
    </div>
  );
}