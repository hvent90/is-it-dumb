'use client';

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface ReportFormProps {
  modelName: string;
  // Form state props
  issueCategory: string;
  setIssueCategory: (value: string) => void;
  productContext: string;
  setProductContext: (value: string) => void;
  isOtherContext: boolean;
  setIsOtherContext: (value: boolean) => void;
  otherContextText: string;
  setOtherContextText: (value: string) => void;
  isOtherIssue: boolean;
  setIsOtherIssue: (value: boolean) => void;
  otherIssueText: string;
  setOtherIssueText: (value: string) => void;
  examplePrompts: string;
  setExamplePrompts: (value: string) => void;
  // Submit props
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ReportForm({
  modelName,
  issueCategory,
  setIssueCategory,
  productContext,
  setProductContext,
  isOtherContext,
  setIsOtherContext,
  otherContextText,
  setOtherContextText,
  isOtherIssue,
  setIsOtherIssue,
  otherIssueText,
  setOtherIssueText,
  examplePrompts,
  setExamplePrompts,
  onSubmit,
  isSubmitting
}: ReportFormProps) {
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

  const handleIssueCategoryChange = (value: string) => {
    setIssueCategory(value);
    setIsOtherIssue(value === "other");
    if (value !== "other") {
      setOtherIssueText("");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-background/95 backdrop-blur-sm border-border/50 shadow-lg">
        <CardContent className="space-y-6">
      {/* Brief Issue Description */}
      <div className="space-y-2">
        <Label htmlFor="issue-description">Briefly describe the issue *</Label>
        <Textarea
          id="issue-description"
          placeholder="Describe the problem you're experiencing with this model..."
          value={examplePrompts}
          onChange={(e) => setExamplePrompts(e.target.value)}
          className="min-h-[100px] resize-none bg-background/50 border-border"
        />
      </div>

      {/* Issue Category */}
      <div className="space-y-3">
        <Label>Issue Category *</Label>
        <RadioGroup value={issueCategory} onValueChange={handleIssueCategoryChange} className="flex flex-wrap gap-2">
          <div className="flex items-center">
            <RadioGroupItem value="hallucination" id="hallucination" className="sr-only" />
            <Label
              htmlFor="hallucination"
              className={`px-4 py-2 rounded-md border cursor-pointer transition-colors ${
                issueCategory === "hallucination"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background/50 text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              Hallucination
            </Label>
          </div>
          <div className="flex items-center">
            <RadioGroupItem value="memory" id="memory" className="sr-only" />
            <Label
              htmlFor="memory"
              className={`px-4 py-2 rounded-md border cursor-pointer transition-colors ${
                issueCategory === "memory"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background/50 text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              Memory
            </Label>
          </div>
          <div className="flex items-center">
            <RadioGroupItem value="reliability" id="reliability" className="sr-only" />
            <Label
              htmlFor="reliability"
              className={`px-4 py-2 rounded-md border cursor-pointer transition-colors ${
                issueCategory === "reliability"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background/50 text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              Reliability
            </Label>
          </div>
          <div className="flex items-center">
            <RadioGroupItem value="ui" id="ui" className="sr-only" />
            <Label
              htmlFor="ui"
              className={`px-4 py-2 rounded-md border cursor-pointer transition-colors ${
                issueCategory === "ui"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background/50 text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              UI/Interface
            </Label>
          </div>
          <div className="flex items-center">
            <RadioGroupItem value="other" id="other-category" className="sr-only" />
            <Label
              htmlFor="other-category"
              className={`px-4 py-2 rounded-md border cursor-pointer transition-colors ${
                issueCategory === "other"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background/50 text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              Other
            </Label>
          </div>
        </RadioGroup>
        {isOtherIssue && (
          <Input
            placeholder="Please specify the issue category..."
            value={otherIssueText}
            onChange={(e) => setOtherIssueText(e.target.value)}
            className="mt-2 bg-background/50 border-border"
          />
        )}
      </div>

      {/* Product Context */}
      <div className="space-y-3">
        <Label>How are you using this model? *</Label>
        <RadioGroup value={productContext} onValueChange={handleProductContextChange} className="flex flex-wrap gap-2">
          {productContextOptions.map((option) => (
            <div key={option.value} className="flex items-center">
              <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
              <Label
                htmlFor={option.value}
                className={`px-4 py-2 rounded-md border cursor-pointer transition-colors ${
                  productContext === option.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background/50 text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {isOtherContext && (
          <Input
            placeholder="Please specify..."
            value={otherContextText}
            onChange={(e) => setOtherContextText(e.target.value)}
            className="mt-2 bg-background/50 border-border"
          />
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || !issueCategory || !productContext || !examplePrompts.trim()}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Submitting Report...' : 'Submit Report'}
        </Button>
      </div>
      </CardContent>
    </Card>
    </div>
  );
}