/**
 * Data structure for chart data points.
 */
export interface ChartDataPoint {
  label: string;
  value: number;
}

/**
 * Data structure for time series data points.
 */
export interface TimeSeriesDataPoint {
  date: string; // "YYYY-MM-DD"
  count: number;
}

/**
 * Data structure for trending cluster summaries.
 */
export interface TrendingCluster {
  id: string;
  summary: string;
  reportCount: number;
}

/**
 * Props for BarChart component.
 */
export interface BarChartProps {
  data: ChartDataPoint[];
  title: string;
  onBarClick: (label: string) => void;
}

/**
 * Filter options for analytics dashboard.
 */
export interface FilterOptions {
  timeRange: '24h' | '7d' | '30d' | 'custom';
  modelFamily?: string;
  issueCategory?: string;
}

/**
 * Analytics data response structure.
 */
export interface AnalyticsData {
  topModels: ChartDataPoint[];
  issueDistribution: ChartDataPoint[];
  trendingClusters: TrendingCluster[];
  totalReports: number;
}