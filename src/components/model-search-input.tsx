'use client';

import * as React from "react";
import { useState, useEffect } from "react";
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

import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
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
  onSubmitSuccess?: () => void;
  onSubmitError?: (error: string) => void;
  onModelSelect?: (modelName: string) => void;
}

export function ModelSearchInput({ onSubmitSuccess, onSubmitError, onModelSelect }: ModelSearchInputProps) {
  const [open, setOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    // Restore selected model from sessionStorage on mount
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('last_search_model') || '';
    }
    return '';
  });

  // Sync with sessionStorage changes (e.g., when switching tabs)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleStorageChange = () => {
        const storedModel = sessionStorage.getItem('last_search_model') || '';
        if (storedModel !== selectedModel) {
          setSelectedModel(storedModel);
        }
      };

      // Listen for storage events
      window.addEventListener('storage', handleStorageChange);

      // Also check on mount and when component becomes visible
      const storedModel = sessionStorage.getItem('last_search_model') || '';
      if (storedModel !== selectedModel) {
        setSelectedModel(storedModel);
      }

      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [selectedModel]);

  // Get the display label for selected model
  const selectedModelLabel = React.useMemo(() => {
    for (const group of modelOptions) {
      const model = group.models.find(m => m.value === selectedModel);
      if (model) return model.label;
    }
    return selectedModel || "Which model are you checking on?";
  }, [selectedModel]);

  const submitSearchEvent = async (modelName: string, reportText?: string) => {
    try {
      const submission: SearchSubmission = {
        model_name: modelName,
        quick_report_text: reportText?.trim() || undefined,
        entry_path: 'search_tab'
      };

      const result = await apiClient.submitSearchEvent(submission);

      if (result.success && result.event_id) {
        onSubmitSuccess?.();
        // Keep the selected model and report text for potential follow-up
      } else {
        onSubmitError?.(result.error || 'Failed to submit search event');
      }
    } catch {
      onSubmitError?.('Network error occurred');
    }
  };

  const handleModelSelect = async (modelValue: string) => {
    const newSelectedModel = modelValue === selectedModel ? "" : modelValue;
    setSelectedModel(newSelectedModel);
    setOpen(false);

    // Call the model select callback with the new value (including empty string)
    onModelSelect?.(newSelectedModel);

    // Send event immediately when model is selected
    if (newSelectedModel) {
      await submitSearchEvent(newSelectedModel);
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
                       onSelect={handleModelSelect}
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

     </div>
    );
  }