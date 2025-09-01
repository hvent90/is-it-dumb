'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DashboardGrid } from '@/components/dashboard-grid';
import { AnalyticsChart } from '@/components/analytics-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, AlertTriangle, Beaker } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { mockQualityDataService } from '@/lib/mock-quality-data';

export default function ModelDetailPage() {
  const params = useParams();
  const modelName = decodeURIComponent(params.modelName as string);

  const [timeseriesData, setTimeseriesData] = useState<Array<{ date: string; value: number }>>([]);
  const [issueBreakdownData, setIssueBreakdownData] = useState<Array<{ name: string; value: number }>>([]);
  const [qualityScore, setQualityScore] = useState<{
    model_name: string;
    overall_score: number;
    accuracy_score: number;
    safety_score: number;
    efficiency_score: number;
  } | null>(null);
  const [qualityTrends, setQualityTrends] = useState<Array<{ date: string; overall_score: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [timeseriesResult, breakdownResult, qualityScoreResult, qualityTrendsResult] = await Promise.all([
          apiClient.getModelTimeseries(modelName),
          apiClient.getModelIssueBreakdown(modelName),
          mockQualityDataService.getModelQualityScore(modelName),
          mockQualityDataService.getModelQualityTrends(modelName)
        ]);

        setTimeseriesData(timeseriesResult.data);
        setIssueBreakdownData(breakdownResult.data);
        setQualityScore(qualityScoreResult.data);
        setQualityTrends(qualityTrendsResult.data);
      } catch (err) {
        console.error('Error fetching model data:', err);
        setError('Failed to load model data');
      } finally {
        setIsLoading(false);
      }
    };

    if (modelName) {
      fetchData();
    }
  }, [modelName]);

  const handleBackClick = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <Button onClick={handleBackClick}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={handleBackClick}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Analytics
            </Button>

            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">{modelName}</h1>
            </div>
            <p className="text-muted-foreground">
              Detailed analytics and issue breakdown for {modelName}
            </p>
          </div>

          {/* Charts */}
          <DashboardGrid>
            <div className="md:col-span-2">
              <AnalyticsChart
                title="Report Trends Over Time"
                data={timeseriesData.map(item => ({ name: item.date, value: item.value }))}
                type="bar"
                height={400}
                isLoading={isLoading}
                dataKey="value"
                nameKey="name"
              />
            </div>

            <AnalyticsChart
              title="Issue Breakdown"
              data={issueBreakdownData}
              type="pie"
              height={400}
              isLoading={isLoading}
            />

            {qualityScore && (
              <div className="md:col-span-2">
                <AnalyticsChart
                  title="Quality Score Trends (Automated Evaluation)"
                  data={qualityTrends.map(item => ({ name: item.date, value: item.overall_score }))}
                  type="bar"
                  height={350}
                  isLoading={isLoading}
                  colors={['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe']}
                />
              </div>
            )}

            {qualityScore && (
              <AnalyticsChart
                title="Quality Metrics Breakdown"
                data={[
                  { name: 'Accuracy', value: qualityScore.accuracy_score },
                  { name: 'Safety', value: qualityScore.safety_score },
                  { name: 'Efficiency', value: qualityScore.efficiency_score },
                  { name: 'Overall', value: qualityScore.overall_score }
                ]}
                type="bar"
                height={350}
                isLoading={isLoading}
                colors={['#10b981', '#f59e0b', '#ef4444', '#3b82f6']}
              />
            )}

            <div className="md:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Model Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {timeseriesData.reduce((sum, item) => sum + item.value, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Reports</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {issueBreakdownData.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Issue Types</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {timeseriesData.length > 0 ? Math.max(...timeseriesData.map(d => d.value)) : 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Peak Reports</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {timeseriesData.length > 0 ? (timeseriesData.reduce((sum, item) => sum + item.value, 0) / timeseriesData.length).toFixed(1) : '0'}
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Daily</div>
                    </div>
                  </div>

                  {qualityScore && (
                    <>
                      <div className="border-t mt-6 pt-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Beaker className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium text-muted-foreground">Automated Quality Evaluation</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {qualityScore.overall_score.toFixed(1)}
                            </div>
                            <div className="text-sm text-muted-foreground">Overall Score</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {qualityScore.accuracy_score.toFixed(1)}
                            </div>
                            <div className="text-sm text-muted-foreground">Accuracy</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                              {qualityScore.safety_score.toFixed(1)}
                            </div>
                            <div className="text-sm text-muted-foreground">Safety</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {qualityScore.efficiency_score.toFixed(1)}
                            </div>
                            <div className="text-sm text-muted-foreground">Efficiency</div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </DashboardGrid>
        </div>
      </div>
    </div>
  );
}