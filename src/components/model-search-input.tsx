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
      { value: "gpt-5", label: "GPT-5" },
      { value: "gpt-4.1", label: "GPT-4.1" },
      { value: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
      { value: "gpt-4.1-nano", label: "GPT-4.1 Nano" },
      { value: "gpt-4.5", label: "GPT-4.5" },
      { value: "gpt-4o", label: "GPT-4o" },
      { value: "o3", label: "o3" },
      { value: "o4-mini", label: "o4-mini" },
      { value: "o1", label: "o1" },
      { value: "gpt-4", label: "GPT-4" },
      { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
      { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
      { value: "gpt-3", label: "GPT-3" },
      { value: "gpt-oss", label: "gpt-oss" },
      { value: "chatgpt", label: "ChatGPT" },
    ],
  },
  {
    label: "Anthropic",
    models: [
      { value: "claude-4-opus", label: "Claude Opus 4" },
      { value: "claude-4-sonnet", label: "Claude Sonnet 4" },
      { value: "claude-4.1", label: "Claude 4.1" },
      { value: "claude-3.7-sonnet", label: "Claude 3.7 Sonnet" },
      { value: "claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
      { value: "claude-3.5-haiku", label: "Claude 3.5 Haiku" },
      { value: "claude-3-opus", label: "Claude 3 Opus" },
      { value: "claude-3-sonnet", label: "Claude 3 Sonnet" },
      { value: "claude-3-haiku", label: "Claude 3 Haiku" },
    ],
  },
  {
    label: "Google",
    models: [
      { value: "gemini-ultra", label: "Gemini Ultra" },
      { value: "gemini-pro", label: "Gemini Pro" },
      { value: "gemini-flash", label: "Gemini Flash" },
      { value: "gemini-nano", label: "Gemini Nano" },
      { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
      { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
      { value: "gemma-3-27b", label: "Gemma 3 27B" },
      { value: "gemma-3-12b", label: "Gemma 3 12B" },
      { value: "gemma-3-4b", label: "Gemma 3 4B" },
      { value: "gemma-3-1b", label: "Gemma 3 1B" },
      { value: "gemma-2-27b", label: "Gemma 2 27B" },
      { value: "gemma-2-9b", label: "Gemma 2 9B" },
      { value: "bert", label: "BERT" },
      { value: "medlm", label: "MedLM" },
      { value: "palm-2", label: "PaLM 2" },
    ],
  },
  {
    label: "Meta",
    models: [
      { value: "llama-4-scout", label: "Llama 4 Scout" },
      { value: "llama-4-maverick", label: "Llama 4 Maverick" },
      { value: "llama-4-behemoth", label: "Llama 4 Behemoth" },
      { value: "llama-3.3-70b", label: "Llama 3.3 70B" },
      { value: "llama-3.1-405b", label: "Llama 3.1 405B" },
      { value: "llama-3.1-70b", label: "Llama 3.1 70B" },
      { value: "llama-3.1", label: "Llama 3.1" },
      { value: "llama-3", label: "Llama 3" },
      { value: "llama-2", label: "Llama 2" },
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
  const [selectedModel, setSelectedModel] = useState<string>('');

  // Clear any persisted model selection on page load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('last_search_model');
    }
  }, []);

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