'use client';

import { useDataSource } from '@/contexts/data-source-context';
import { apiClient } from './api-client';
import { mockQualityDataService } from './mock-quality-data';

export function useApiClient() {
  const { dataSource } = useDataSource();

  return {
    getModelCounts: (timeRange?: string, modelFamily?: string) =>
      apiClient.getModelCounts(timeRange, modelFamily, dataSource),

    getIssueCounts: (timeRange?: string, modelFamily?: string) =>
      apiClient.getIssueCounts(timeRange, modelFamily, dataSource),

    getModelIssuesTimeseries: (timeRange?: string, modelFamily?: string) =>
      apiClient.getModelIssuesTimeseries(timeRange, modelFamily, dataSource),

    getModelTimeseries: (modelName: string) =>
      apiClient.getModelTimeseries(modelName, dataSource),

    getModelIssueBreakdown: (modelName: string) =>
      apiClient.getModelIssueBreakdown(modelName, dataSource),

    getIssueAffectedModels: (issueCategory: string) =>
      apiClient.getIssueAffectedModels(issueCategory, dataSource),

    getRecentClusters: () =>
      apiClient.getRecentClusters(dataSource),

    // Quality data - always from mock service (no real API available)
    getQualityTimeseriesForChart: () =>
      mockQualityDataService.getQualityTimeseriesForChart(),

    getModelQualityScore: (modelName: string) =>
      mockQualityDataService.getModelQualityScore(modelName),

    getModelQualityTrends: (modelName: string, days?: number) =>
      mockQualityDataService.getModelQualityTrends(modelName, days)
  };
}