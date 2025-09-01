'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

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

export function RecentClusters({ isLoading = false }: RecentClustersProps) {
  const [clusters, setClusters] = useState<ClusterData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClusters = async () => {
      try {
        const result = await apiClient.getRecentClusters();
        setClusters(result.data);
      } catch (error) {
        console.error('Error fetching clusters:', error);
        // Keep empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchClusters();
  }, []);

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
                      "{text.length > 80 ? `${text.substring(0, 80)}...` : text}"
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