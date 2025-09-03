'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { useDataSource, DataSource } from '@/contexts/data-source-context';

export type TimeRange = '7d' | '30d' | '90d' | '1y';
export type ModelFamily = 'all' | 'openai' | 'anthropic' | 'google' | 'meta' | 'other';

interface FilterControlsProps {
  timeRange: TimeRange;
  modelFamily: ModelFamily;
  onTimeRangeChange: (range: TimeRange) => void;
  onModelFamilyChange: (family: ModelFamily) => void;
  onApplyFilters: () => void;
  isLoading?: boolean;
}

export function FilterControls({
  timeRange,
  modelFamily,
  onTimeRangeChange,
  onModelFamilyChange,
  onApplyFilters,
  isLoading = false,
}: FilterControlsProps) {
  const { dataSource, setDataSource } = useDataSource();

  return (
    <div className="flex flex-row gap-3 items-center mb-6">
      <Select value={timeRange} onValueChange={onTimeRangeChange}>
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="90d">Last 90 days</SelectItem>
          <SelectItem value="1y">Last year</SelectItem>
        </SelectContent>
      </Select>

      <Select value={modelFamily} onValueChange={onModelFamilyChange}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Models</SelectItem>
          <SelectItem value="openai">OpenAI</SelectItem>
          <SelectItem value="anthropic">Anthropic</SelectItem>
          <SelectItem value="google">Google</SelectItem>
          <SelectItem value="meta">Meta</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>

      {/* NEW: Data Source selector */}
      <Select value={dataSource} onValueChange={(value: DataSource) => {
        setDataSource(value);
        onApplyFilters(); // Trigger data refresh
      }}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="real">Real Data</SelectItem>
          <SelectItem value="mock">Mock Data</SelectItem>
        </SelectContent>
      </Select>

      <Button
        onClick={onApplyFilters}
        disabled={isLoading}
        className="flex items-center gap-2"
        size="sm"
      >
        <Calendar className="h-4 w-4" />
        {isLoading ? 'Loading...' : 'Apply'}
      </Button>
    </div>
  );
}