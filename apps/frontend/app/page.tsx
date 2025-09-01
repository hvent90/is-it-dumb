'use client';

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModelSearchInput } from "@/components/model-search-input";
import { DetailedReportForm } from "@/components/detailed-report-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function Home() {
  const [searchSuccess, setSearchSuccess] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [showDetailedForm, setShowDetailedForm] = useState(false);

  const handleSearchSuccess = (eventId: string) => {
    setSearchSuccess(`Search event logged successfully! Event ID: ${eventId}`);
    setSearchError(null);
    setShowDetailedForm(true);
    // Clear success message after 5 seconds
    setTimeout(() => setSearchSuccess(null), 5000);
  };

  const handleSearchError = (error: string) => {
    setSearchError(error);
    setSearchSuccess(null);
    setShowDetailedForm(false);
  };

  const handleReportSuccess = (reportId: string) => {
    setReportSuccess(`Detailed report submitted successfully! Report ID: ${reportId}`);
    setReportError(null);
    // Clear success message after 5 seconds
    setTimeout(() => setReportSuccess(null), 5000);
  };

  const handleReportError = (error: string) => {
    setReportError(error);
    setReportSuccess(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-foreground">Is It Dumb</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="trending">Trending Overview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="mt-6">
            <div className="space-y-6">
              {/* Success/Error Messages */}
              {searchSuccess && (
                <div className="max-w-2xl mx-auto">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{searchSuccess}</AlertDescription>
                  </Alert>
                </div>
              )}
              
              {searchError && (
                <div className="max-w-2xl mx-auto">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{searchError}</AlertDescription>
                  </Alert>
                </div>
              )}

              {reportSuccess && (
                <div className="max-w-2xl mx-auto">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{reportSuccess}</AlertDescription>
                  </Alert>
                </div>
              )}
              
              {reportError && (
                <div className="max-w-2xl mx-auto">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{reportError}</AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Model Search Input */}
              <ModelSearchInput 
                onSubmitSuccess={handleSearchSuccess}
                onSubmitError={handleSearchError}
              />

              {/* Detailed Report Form */}
              {showDetailedForm && (
                <DetailedReportForm
                  modelName={typeof window !== 'undefined' ? sessionStorage.getItem('last_search_model') || '' : ''}
                  onSubmitSuccess={handleReportSuccess}
                  onSubmitError={handleReportError}
                />
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="trending" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Top Reported Models</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Issue Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Charts coming soon...</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Trending Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Clustering analysis coming soon...</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
