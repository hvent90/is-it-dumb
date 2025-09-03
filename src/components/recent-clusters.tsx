'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { useApiClient } from '@/lib/api-client-hooks';
import { useDataSource } from '@/contexts/data-source-context';

interface ClusterData {
  cluster_id: string;
  cluster_summary: string;
  report_count: number;
  representative_texts: string[];
  processed_at: string;
}

interface RecentClustersProps {
  isLoading?: boolean;
}

const mockClusters: ClusterData[] = [
  {
    cluster_id: 'cluster_001',
    cluster_summary: 'GPT-4 hallucination issues with factual accuracy (12 reports)',
    report_count: 12,
    representative_texts: [
      'GPT-4 keeps making up facts about historical events that never happened',
      'Model is providing incorrect scientific information with confidence',
      'Getting completely wrong answers for basic math problems'
    ],
    processed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  },
  {
    cluster_id: 'cluster_002',
    cluster_summary: 'Claude memory and context retention problems (8 reports)',
    report_count: 8,
    representative_texts: [
      'Claude forgets what we discussed earlier in the same conversation',
      'Model loses track of context after long conversations',
      'Cannot remember instructions given at the start of the chat'
    ],
    processed_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
  },
  {
    cluster_id: 'cluster_003',
    cluster_summary: 'ChatGPT refusing valid requests and safety issues (15 reports)',
    report_count: 15,
    representative_texts: [
      'ChatGPT refuses to help with legitimate coding questions',
      'Model being overly cautious with harmless creative writing prompts',
      'Getting safety warnings for normal educational content'
    ],
    processed_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
  },
  {
    cluster_id: 'cluster_004',
    cluster_summary: 'Gemini Pro inconsistent response quality (7 reports)',
    report_count: 7,
    representative_texts: [
      'Gemini gives different answers to the same question',
      'Quality varies dramatically between conversations',
      'Sometimes very helpful, other times completely unhelpful'
    ],
    processed_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() // 8 hours ago
  },
  {
    cluster_id: 'cluster_005',
    cluster_summary: 'LLaMA 2 performance and speed concerns (5 reports)',
    report_count: 5,
    representative_texts: [
      'LLaMA 2 is extremely slow to respond',
      'Model seems to struggle with complex reasoning tasks',
      'Takes forever to generate even simple responses'
    ],
    processed_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString() // 10 hours ago
  }
];

export function RecentClusters({ isLoading = false }: RecentClustersProps) {
  const apiClient = useApiClient();
  const { dataSource } = useDataSource();
  const [clusters, setClusters] = useState<ClusterData[]>(mockClusters);
  const [loading] = useState(false); // Start with mock data, no loading

  useEffect(() => {
    const fetchClusters = async () => {
      try {
        const result = await apiClient.getRecentClusters();
        // Update with data from context-aware API client
        setClusters(result.data);
      } catch (error) {
        console.error('Error fetching clusters:', error);
        // Keep mock data on error
      }
    };

    fetchClusters();
  }, [dataSource]); // Re-run when data source changes

  if (loading || isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Trending Issues
          </CardTitle>
          <CardDescription>
            Semantic clusters of user reports from the last 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (clusters.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Trending Issues
          </CardTitle>
          <CardDescription>
            Semantic clusters of user reports from the last 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-2">No trending issues found</p>
            <p className="text-sm text-gray-400">
              Clusters will appear here once enough user reports are collected and processed.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Recent Trending Issues
        </CardTitle>
        <CardDescription>
          Semantic clusters of user reports from the last 24 hours
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {clusters.slice(0, 5).map((cluster) => (
            <div key={cluster.cluster_id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm leading-tight">
                  {cluster.cluster_summary}
                </h4>
                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full flex-shrink-0">
                  {cluster.report_count} reports
                </span>
              </div>

              {cluster.representative_texts.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-600 font-medium">Sample reports:</p>
                  {cluster.representative_texts.slice(0, 2).map((text, index) => (
                     <p key={index} className="text-xs text-gray-500 italic">
                       &ldquo;{text.length > 80 ? `${text.substring(0, 80)}...` : text}&rdquo;
                     </p>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-400 mt-2">
                Processed {new Date(cluster.processed_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {clusters.length > 5 && (
          <p className="text-xs text-gray-500 mt-4 text-center">
            Showing top 5 clusters. {clusters.length - 5} more available.
          </p>
        )}
      </CardContent>
    </Card>
  );
}