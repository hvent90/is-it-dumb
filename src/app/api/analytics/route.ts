import { NextRequest, NextResponse } from 'next/server';

// Tinybird API configuration
const TINYBIRD_BASE_URL = process.env.TINYBIRD_BASE_URL || 'https://api.tinybird.co';
const TINYBIRD_TOKEN = process.env.TINYBIRD_TOKEN;

// Helper function to call Tinybird pipes
async function callTinybirdPipe(pipeName: string, params: Record<string, string> = {}) {
  if (!TINYBIRD_TOKEN) {
    throw new Error('Tinybird API token not configured. Please set TINYBIRD_TOKEN environment variable.');
  }

  const url = new URL(`${TINYBIRD_BASE_URL}/v0/pipes/${pipeName}.json`);

  // Add parameters
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${TINYBIRD_TOKEN}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Tinybird API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

// GET /api/analytics - Main analytics endpoint
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const modelName = searchParams.get('model_name');
  const issueCategory = searchParams.get('issue_category');
  const timeRange = searchParams.get('time_range');
  const modelFamily = searchParams.get('model_family');

  try {
    switch (type) {
      case 'model_counts':
        const modelCountsParams: Record<string, string> = {};
        if (timeRange) modelCountsParams.time_range = timeRange;
        if (modelFamily) modelCountsParams.model_family = modelFamily;
        const modelCountsData = await callTinybirdPipe('model_report_counts', modelCountsParams);
        return NextResponse.json({
          data: modelCountsData.data?.map((item: { model_name: string; report_count: number }) => ({
            name: item.model_name,
            value: item.report_count,
          })) || []
        });

      case 'issue_counts':
        const issueCountsParams: Record<string, string> = {};
        if (timeRange) issueCountsParams.time_range = timeRange;
        if (modelFamily) issueCountsParams.model_family = modelFamily;
        const issueCountsData = await callTinybirdPipe('issue_category_counts', issueCountsParams);
        return NextResponse.json({
          data: issueCountsData.data?.map((item: { issue_category: string; report_count: number }) => ({
            name: item.issue_category,
            value: item.report_count,
          })) || []
        });

      case 'model_timeseries':
        if (!modelName) {
          return NextResponse.json({ error: 'model_name parameter required' }, { status: 400 });
        }
        const timeseriesData = await callTinybirdPipe('model_timeseries', { model_name: modelName });
        return NextResponse.json({
          data: timeseriesData.data?.map((item: { date: string; report_count: number }) => ({
            date: item.date,
            value: item.report_count,
          })) || []
        });

      case 'model_issue_breakdown':
        if (!modelName) {
          return NextResponse.json({ error: 'model_name parameter required' }, { status: 400 });
        }
        const breakdownData = await callTinybirdPipe('model_issue_breakdown', { model_name: modelName });
        return NextResponse.json({
          data: breakdownData.data?.map((item: { issue_category: string; report_count: number }) => ({
            name: item.issue_category,
            value: item.report_count,
          })) || []
        });

      case 'issue_models':
        if (!issueCategory) {
          return NextResponse.json({ error: 'issue_category parameter required' }, { status: 400 });
        }
        const affectedModelsData = await callTinybirdPipe('issue_models', { issue_category: issueCategory });
        return NextResponse.json({
          data: affectedModelsData.data?.map((item: { model_name: string; report_count: number }) => ({
            name: item.model_name,
            value: item.report_count,
          })) || []
        });

      case 'recent_clusters':
        const clustersData = await callTinybirdPipe('recent_clusters');
        return NextResponse.json({
          data: clustersData.data?.map((item: { cluster_id: string; cluster_summary: string; report_count: number; representative_texts: string[]; processed_at: string }) => ({
            cluster_id: item.cluster_id,
            cluster_summary: item.cluster_summary,
            report_count: item.report_count,
            representative_texts: item.representative_texts,
            processed_at: item.processed_at,
          })) || []
        });

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}