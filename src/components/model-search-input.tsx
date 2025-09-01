'use client';

import * as React from "react";
import { useState } from "react";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
  CommandGroup,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient, SearchSubmission } from "@/lib/api-client";

// Popular LLM models grouped by provider
const modelOptions = [
  {
    label: "OpenAI",
    models: [
      { value: "gpt-4", label: "GPT-4" },
      { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
      { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
      { value: "chatgpt", label: "ChatGPT" },
    ],
  },
  {
    label: "Anthropic", 
    models: [
      { value: "claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
      { value: "claude-3-opus", label: "Claude 3 Opus" },
      { value: "claude-3-haiku", label: "Claude 3 Haiku" },
      { value: "claude-3-sonnet", label: "Claude 3 Sonnet" },
    ],
  },
  {
    label: "Google",
    models: [
      { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
      { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
      { value: "gemini-pro", label: "Gemini Pro" },
      { value: "palm-2", label: "PaLM 2" },
    ],
  },
  {
    label: "Meta",
    models: [
      { value: "llama-3.1", label: "Llama 3.1" },
      { value: "llama-2", label: "Llama 2" },
      { value: "llama-3", label: "Llama 3" },
    ],
  },
  {
    label: "Others",
    models: [
      { value: "mistral-large", label: "Mistral Large" },
      { value: "mistral-medium", label: "Mistral Medium" },
      { value: "cohere-command", label: "Cohere Command" },
    ],
  },
];

interface ModelSearchInputProps {
  onSubmitSuccess?: (eventId: string) => void;
  onSubmitError?: (error: string) => void;
}

export function ModelSearchInput({ onSubmitSuccess, onSubmitError }: ModelSearchInputProps) {
  const [open, setOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [quickReportText, setQuickReportText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the display label for selected model
  const selectedModelLabel = React.useMemo(() => {
    for (const group of modelOptions) {
      const model = group.models.find(m => m.value === selectedModel);
      if (model) return model.label;
    }
    return selectedModel || "Which model are you checking on?";
  }, [selectedModel]);

  const handleSubmit = async () => {
    if (!selectedModel) {
      onSubmitError?.("Please select a model first");
      return;
    }

    setIsSubmitting(true);

    try {
      const submission: SearchSubmission = {
        model_name: selectedModel,
        quick_report_text: quickReportText.trim() || undefined,
        entry_path: 'search_tab'
      };

      const result = await apiClient.submitSearchEvent(submission);

      if (result.success && result.event_id) {
        onSubmitSuccess?.(result.event_id);
        // Keep the selected model and report text for potential follow-up
      } else {
        onSubmitError?.(result.error || 'Failed to submit search event');
      }
    } catch (error) {
      onSubmitError?.('Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Model Selection with Combobox */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedModelLabel}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Search models..." />
            <CommandList>
              <CommandEmpty>No model found.</CommandEmpty>
              {modelOptions.map((group) => (
                <CommandGroup key={group.label} heading={group.label}>
                  {group.models.map((model) => (
                    <CommandItem
                      key={model.value}
                      value={model.value}
                      onSelect={(currentValue) => {
                        setSelectedModel(currentValue === selectedModel ? "" : currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedModel === model.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {model.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Quick Report Text Area */}
      <div className="space-y-2">
        <Textarea
          placeholder="Optional: Briefly describe the issue..."
          value={quickReportText}
          onChange={(e) => setQuickReportText(e.target.value)}
          className="min-h-[100px] resize-none"
        />
      </div>

      {/* Submit Button */}
      <Button 
        onClick={handleSubmit}
        disabled={!selectedModel || isSubmitting}
        size="lg" 
        className="w-full"
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSubmitting ? 'Checking Model...' : 'Check Model'}
      </Button>
    </div>
  );
}