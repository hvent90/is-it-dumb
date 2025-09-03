'use client';

import { useState } from "react";


import { ModelSearchInput } from "@/components/model-search-input";
import { ReportForm } from "@/components/report-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";
import SmoothTab from "@/components/kokonutui/smooth-tab";
import { DetailedReportSubmission } from "@/lib/api-client";
import { FloatingPaths } from "@/components/kokonutui/background-paths";
import { TrendingOverview } from "@/components/trending-overview";

export default function Home() {
  const [searchError, setSearchError] = useState<string | null>(null);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [activeTab, setActiveTab] = useState("search");
  const [highlightedModel, setHighlightedModel] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('');

  // Form state moved from DetailedReportForm
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issueCategory, setIssueCategory] = useState<string>("");
  const [productContext, setProductContext] = useState<string>("");
  const [isOtherContext, setIsOtherContext] = useState(false);
  const [otherContextText, setOtherContextText] = useState("");
  const [isOtherIssue, setIsOtherIssue] = useState(false);
  const [otherIssueText, setOtherIssueText] = useState("");
  const [quickReportText, setQuickReportText] = useState("");


  const handleModelSelect = (modelName: string) => {
    // Update selected model state
    setSelectedModel(modelName);
    // Store the selected model immediately for the report form (for backward compatibility)
    if (typeof window !== 'undefined') {
      if (modelName) {
        sessionStorage.setItem('last_search_model', modelName);
      } else {
        sessionStorage.removeItem('last_search_model');
      }
    }
    // Show report form when model is selected, hide when deselected
    setShowReportForm(!!modelName);
    // Don't set highlighted model here - only after successful submission
  };

  const handleSearchSuccess = () => {
    setSearchError(null);
    // Report form is already shown from handleModelSelect
    // No success message shown to user
  };

  const handleSearchError = (error: string) => {
    setSearchError(error);
    setShowReportForm(false);
  };



  const handleFormSubmit = async () => {
    const modelName = selectedModel;

    if (!quickReportText.trim()) {
      setReportError("Please describe the issue");
      return;
    }

    if (!issueCategory) {
      setReportError("Please select an issue category");
      return;
    }

    if (isOtherIssue && !otherIssueText.trim()) {
      setReportError("Please specify the issue category");
      return;
    }

    if (!productContext) {
      setReportError("Please select a product context");
      return;
    }

    if (isOtherContext && !otherContextText.trim()) {
      setReportError("Please specify the product context");
      return;
    }

    setIsSubmitting(true);
    setReportError(null);

    try {
      const { apiClient } = await import("@/lib/api-client");

      const submission: DetailedReportSubmission = {
        model_name: modelName,
        issue_category: isOtherIssue ? otherIssueText.trim() : issueCategory as 'hallucination' | 'memory' | 'reliability' | 'ui' | 'other',
        product_context: isOtherContext ? otherContextText.trim() : productContext,
        quickReportText: quickReportText.trim() || undefined,
      };

      const result = await apiClient.submitDetailedReport(submission);

       if (result.success && result.report_id) {
         setReportSuccess(`Detailed report submitted successfully! Report ID: ${result.report_id}`);
         setReportError(null);

         // Switch to trending tab and highlight the reported model
         setActiveTab("trending");
         setHighlightedModel(modelName);

         // Reset form after successful submission
         setIssueCategory("");
         setProductContext("");
         setIsOtherContext(false);
         setOtherContextText("");
         setIsOtherIssue(false);
         setOtherIssueText("");
         setQuickReportText("");

         // Clear success message and highlighted model after 10 seconds
         setTimeout(() => {
           setReportSuccess(null);
           setHighlightedModel(null);
         }, 10000);
       }
    } catch {
      setReportError('Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabItems = [
    {
      id: "search",
      title: "Search",
      color: "bg-blue-500 hover:bg-blue-600",
      cardContent: <div></div>,
    },
    {
      id: "trending",
      title: "Trending",
      color: "bg-purple-500 hover:bg-purple-600",
      cardContent: <div></div>,
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
       {/* Background Paths */}
       <div className="absolute inset-0 pointer-events-none opacity-30">
         <FloatingPaths
           position={1}
           highlightedModel={highlightedModel}
         />
       </div>

      {/* Header */}
      <header className="border-b relative z-10">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-foreground">Is It Dumb</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="smooth-tab-wrapper">
            <SmoothTab
              items={tabItems}
              defaultTabId="search"
              value={activeTab}
              onChange={(tabId) => {
                setActiveTab(tabId);
                // Clear success/error messages when navigating away from search tab manually
                if (tabId !== 'search') {
                  setReportSuccess(null);
                  setReportError(null);
                  // Also clear the report form and selected model when leaving search
                  setShowReportForm(false);
                  setSelectedModel('');
                  // Clear sessionStorage so ModelSearchInput also clears
                  if (typeof window !== 'undefined') {
                    sessionStorage.removeItem('last_search_model');
                  }
                }
                // Clear highlighted model when navigating away from trending tab
                if (tabId !== 'trending') {
                  setHighlightedModel(null);
                }
              }}
            />
          </div>

          {/* Content below the tabs */}
          <div className="mt-8">
            {activeTab === "search" && (
              <>
                {/* Error Messages */}
                {searchError && (
                  <div className="max-w-2xl mx-auto mb-6">
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{searchError}</AlertDescription>
                    </Alert>
                  </div>
                )}

                {reportSuccess && (
                  <div className="max-w-2xl mx-auto mb-6">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>{reportSuccess}</AlertDescription>
                    </Alert>
                  </div>
                )}

                {reportError && (
                  <div className="max-w-2xl mx-auto mb-6">
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
                  onModelSelect={handleModelSelect}
                />

                {/* Issue Report Form */}
                {showReportForm && (
                  <div className="mt-8">
                    <ReportForm
                      modelName={selectedModel}
                      issueCategory={issueCategory}
                      setIssueCategory={setIssueCategory}
                      productContext={productContext}
                      setProductContext={setProductContext}
                      isOtherContext={isOtherContext}
                      setIsOtherContext={setIsOtherContext}
                      otherContextText={otherContextText}
                      setOtherContextText={setOtherContextText}
                      isOtherIssue={isOtherIssue}
                      setIsOtherIssue={setIsOtherIssue}
                      otherIssueText={otherIssueText}
                      setOtherIssueText={setOtherIssueText}
                      quickReportText={quickReportText}
                      setQuickReportText={setQuickReportText}
                      onSubmit={handleFormSubmit}
                      isSubmitting={isSubmitting}
                    />
                  </div>
                )}
              </>
            )}

             {activeTab === "trending" && (
               <TrendingOverview highlightedModel={highlightedModel} />
             )}
          </div>

        </div>
      </main>
    </div>
  );
}
