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
        // Try to use the pipe first, fall back to SQL query if pipe doesn't exist
        try {
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
        } catch (pipeError) {
          console.warn('recent_clusters pipe error:', pipeError);
          console.warn('Falling back to direct SQL query');
          
          // Fallback: Query report_clusters data directly using SQL
          // First try to see what data exists
          const testQuery = `SHOW TABLES`;
          const testUrl = `${TINYBIRD_BASE_URL}/v0/sql?q=${encodeURIComponent(testQuery)}`;
          const testResponse = await fetch(testUrl, {
            headers: { 'Authorization': `Bearer ${TINYBIRD_TOKEN}` },
          });
          
          if (testResponse.ok) {
            const tablesText = await testResponse.text();
            console.log('Available tables:', tablesText);
          }
          
          const clustersQuery = `
            SELECT 
              cluster_id,
              cluster_summary,
              report_count,
              representative_texts,
              processed_at
            FROM report_clusters
            ORDER BY processed_at DESC
            LIMIT 10
          `;
          
          const clustersUrl = `${TINYBIRD_BASE_URL}/v0/sql?q=${encodeURIComponent(clustersQuery)}`;
          const clustersResponse = await fetch(clustersUrl, {
            headers: {
              'Authorization': `Bearer ${TINYBIRD_TOKEN}`,
            },
          });
          
          if (!clustersResponse.ok) {
            throw new Error(`Tinybird SQL API error: ${clustersResponse.status}`);
          }
          
          // Parse TSV response
          const clustersText = await clustersResponse.text();
          console.log('Clusters SQL response:', clustersText.substring(0, 200) + '...');
          const clustersLines = clustersText.trim().split('\n');
          const clustersData = [];
          
          for (const line of clustersLines) {
            if (!line.trim()) continue;
            
            const columns = line.split('\t');
            if (columns.length >= 5) {
              const [cluster_id, cluster_summary, report_count, representative_texts, processed_at] = columns;
              
              // Parse representative_texts array
              let parsedTexts: string[] = [];
              try {
                if (representative_texts && representative_texts.startsWith('[') && representative_texts.endsWith(']')) {
                  parsedTexts = JSON.parse(representative_texts);
                }
              } catch (e) {
                console.warn(`Failed to parse representative_texts for cluster ${cluster_id}:`, e);
                parsedTexts = [];
              }
              
              clustersData.push({
                cluster_id,
                cluster_summary,
                report_count: parseInt(report_count) || 0,
                representative_texts: parsedTexts,
                processed_at,
              });
            }
          }
          
          return NextResponse.json({
            data: clustersData
          });
        }

      case 'model_issues_timeseries':
        const modelTimeseriesParams: Record<string, string> = {};
        if (timeRange) modelTimeseriesParams.time_range = timeRange;
        if (modelFamily) modelTimeseriesParams.model_family = modelFamily;
        const modelTimeseriesData = await callTinybirdPipe('model_issues_timeseries', modelTimeseriesParams);
        
        // Transform the flat data into the format expected by the frontend
        const transformedData: Record<string, Record<string, string | number>> = {};
        const models: Set<string> = new Set();
        
        modelTimeseriesData.data?.forEach((item: { date: string; model_name: string; report_count: number }) => {
          // Skip empty model names
          if (!item.model_name || item.model_name.trim() === '') {
            return;
          }
          
          if (!transformedData[item.date]) {
            transformedData[item.date] = { date: item.date };
          }
          transformedData[item.date][item.model_name] = item.report_count;
          models.add(item.model_name);
        });
        
        const finalData = Object.values(transformedData).sort((a, b) => String(a.date).localeCompare(String(b.date)));
        const modelsList = Array.from(models).sort();
        
        return NextResponse.json({
          data: finalData,
          models: modelsList
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