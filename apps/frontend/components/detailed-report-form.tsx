'use client';

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { apiClient, DetailedReportSubmission } from "@/lib/api-client";

interface DetailedReportFormProps {
  modelName: string;
  initialQuickReport?: string;
  onSubmitSuccess?: (reportId: string) => void;
  onSubmitError?: (error: string) => void;
}

export function DetailedReportForm({ 
  modelName, 
  initialQuickReport = "",
  onSubmitSuccess, 
  onSubmitError 
}: DetailedReportFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form fields
  const [issueCategory, setIssueCategory] = useState<string>("");
  const [severity, setSeverity] = useState<string>("medium");
  const [productContext, setProductContext] = useState<string>("");
  const [isOtherContext, setIsOtherContext] = useState(false);
  const [otherContextText, setOtherContextText] = useState("");
  const [examplePrompts, setExamplePrompts] = useState("");

  // Determine if model is Anthropic family for conditional options
  const isAnthropicModel = modelName.toLowerCase().includes('claude');

  const productContextOptions = [
    { value: "direct-api", label: "Direct API" },
    { value: "official-web-ui", label: "Official Web UI" },
    { value: "cursor", label: "Cursor" },
    { value: "windsurf", label: "Windsurf" },
    { value: "opencode", label: "OpenCode" },
    ...(isAnthropicModel ? [{ value: "claude-code", label: "Claude Code" }] : []),
    { value: "other", label: "Other" },
  ];

  const handleProductContextChange = (value: string) => {
    setProductContext(value);
    setIsOtherContext(value === "other");
    if (value !== "other") {
      setOtherContextText("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!issueCategory) {
      onSubmitError?.("Please select an issue category");
      return;
    }

    if (!productContext) {
      onSubmitError?.("Please select a product context");
      return;
    }

    if (isOtherContext && !otherContextText.trim()) {
      onSubmitError?.("Please specify the product context");
      return;
    }

    setIsSubmitting(true);

    try {
      const submission: DetailedReportSubmission = {
        model_name: modelName,
        issue_category: issueCategory as 'hallucination' | 'memory' | 'reliability' | 'ui' | 'other',
        severity: severity as 'low' | 'medium' | 'high',
        product_context: isOtherContext ? otherContextText.trim() : productContext,
        example_prompts: examplePrompts.trim() || undefined,
      };

      const result = await apiClient.submitDetailedReport(submission);

      if (result.success && result.report_id) {
        onSubmitSuccess?.(result.report_id);
        // Reset form after successful submission
        setIssueCategory("");
        setSeverity("medium");
        setProductContext("");
        setIsOtherContext(false);
        setOtherContextText("");
        setExamplePrompts("");
        setIsExpanded(false);
      } else {
        onSubmitError?.(result.error || 'Failed to submit detailed report');
      }
    } catch (error) {
      onSubmitError?.('Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isExpanded) {
    return (
      <div className="max-w-2xl mx-auto mt-4">
        <Button
          variant="outline"
          onClick={() => setIsExpanded(true)}
          className="w-full"
        >
          Provide More Details
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Detailed Issue Report</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Issue Category */}
            <div className="space-y-2">
              <Label htmlFor="issue-category">Issue Category *</Label>
              <Select value={issueCategory} onValueChange={setIssueCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an issue category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hallucination">Hallucination</SelectItem>
                  <SelectItem value="memory">Memory</SelectItem>
                  <SelectItem value="reliability">Reliability</SelectItem>
                  <SelectItem value="ui">UI/Interface</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Severity */}
            <div className="space-y-3">
              <Label>Severity</Label>
              <RadioGroup value={severity} onValueChange={setSeverity}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low">Low</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high">High</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Product Context */}
            <div className="space-y-2">
              <Label htmlFor="product-context">How are you using this model? *</Label>
              <Select value={productContext} onValueChange={handleProductContextChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product context" />
                </SelectTrigger>
                <SelectContent>
                  {productContextOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isOtherContext && (
                <Input
                  placeholder="Please specify..."
                  value={otherContextText}
                  onChange={(e) => setOtherContextText(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>

            {/* Example Prompts */}
            <div className="space-y-2">
              <Label htmlFor="example-prompts">Example Prompts or Context (Optional)</Label>
              <Textarea
                id="example-prompts"
                placeholder="Share example prompts or conversation excerpts that demonstrate the issue..."
                value={examplePrompts}
                onChange={(e) => setExamplePrompts(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit"
              disabled={isSubmitting || !issueCategory || !productContext}
              className="w-full"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Submitting Report...' : 'Submit Detailed Report'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}