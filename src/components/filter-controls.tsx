'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, Filter } from 'lucide-react';

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
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Time Range</label>
            <Select value={timeRange} onValueChange={onTimeRangeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Model Family</label>
            <Select value={modelFamily} onValueChange={onModelFamilyChange}>
              <SelectTrigger>
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
          </div>

          <Button
            onClick={onApplyFilters}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            {isLoading ? 'Loading...' : 'Apply Filters'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}