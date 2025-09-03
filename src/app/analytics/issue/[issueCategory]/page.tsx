'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DashboardGrid } from '@/components/dashboard-grid';
import { AnalyticsChart } from '@/components/analytics-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle, Users } from 'lucide-react';
import { useApiClient } from '@/lib/api-client-hooks';
import { useDataSource } from '@/contexts/data-source-context';

export default function IssueDetailPage() {
  const params = useParams();
  const issueCategory = decodeURIComponent(params.issueCategory as string);
  const apiClient = useApiClient();
  const { dataSource } = useDataSource();

  const [affectedModelsData, setAffectedModelsData] = useState<Array<{ name: string; value: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await apiClient.getIssueAffectedModels(issueCategory);
        setAffectedModelsData(result.data);
      } catch (err) {
        console.error('Error fetching issue data:', err);
        setError('Failed to load issue data');
      } finally {
        setIsLoading(false);
      }
    };

    if (issueCategory) {
      fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issueCategory, dataSource]); // Re-run when data source changes

  const handleBackClick = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  const handleModelClick = (data: { name: string; value: number }) => {
    // Navigate to the model's detail page
    if (typeof window !== 'undefined') {
      window.location.href = `/analytics/model/${encodeURIComponent(data.name)}`;
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
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <h1 className="text-3xl font-bold">{issueCategory}</h1>
            </div>
            <p className="text-muted-foreground">
              Models most affected by {issueCategory} issues
            </p>
          </div>

          {/* Charts */}
          <DashboardGrid>
            <div className="md:col-span-2">
              <AnalyticsChart
                title={`Models Affected by ${issueCategory}`}
                data={affectedModelsData}
                type="bar"
                height={400}
                isLoading={isLoading}
                onBarClick={handleModelClick}
              />
            </div>

            <AnalyticsChart
              title="Issue Distribution by Model"
              data={affectedModelsData}
              type="pie"
              height={400}
              isLoading={isLoading}
              onPieClick={handleModelClick}
            />

            <div className="md:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Issue Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-destructive">
                        {affectedModelsData.reduce((sum, item) => sum + item.value, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Reports</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-destructive">
                        {affectedModelsData.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Affected Models</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-destructive">
                        {affectedModelsData.length > 0 ? Math.max(...affectedModelsData.map(d => d.value)) : 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Most Affected</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-destructive">
                        {affectedModelsData.length > 0 ? (affectedModelsData.reduce((sum, item) => sum + item.value, 0) / affectedModelsData.length).toFixed(1) : '0'}
                      </div>
                      <div className="text-sm text-muted-foreground">Avg per Model</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </DashboardGrid>

          {/* Model List */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Most Affected Models</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {affectedModelsData.map((model, index) => (
                  <div
                    key={model.name}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleModelClick(model)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {model.value} reports
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-destructive">
                        {model.value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {((model.value / affectedModelsData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}