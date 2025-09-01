'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export type ChartType = 'bar' | 'pie';

interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number | boolean | undefined;
}

interface AnalyticsChartProps {
  title: string;
  data: ChartData[];
  type: ChartType;
  dataKey?: string;
  nameKey?: string;
  height?: number;
  colors?: string[];
  onBarClick?: (data: ChartData) => void;
  onPieClick?: (data: ChartData) => void;
  isLoading?: boolean;
}

const DEFAULT_COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7c7c',
  '#8dd1e1',
  '#d084d0',
  '#ffb347',
  '#87ceeb',
];

export function AnalyticsChart({
  title,
  data,
  type,
  dataKey = 'value',
  nameKey = 'name',
  height = 300,
  colors = DEFAULT_COLORS,
  onBarClick,
  onPieClick,
  isLoading = false,
}: AnalyticsChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey={nameKey}
          angle={-45}
          textAnchor="end"
          height={80}
          interval={0}
        />
        <YAxis />
        <Tooltip />
         <Bar
           dataKey={dataKey}
           fill={colors[0]}
           onClick={onBarClick ? (data) => onBarClick(data.payload as ChartData) : undefined}
           cursor={onBarClick ? 'pointer' : 'default'}
         />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey={dataKey}
          onClick={onPieClick}
          cursor={onPieClick ? 'pointer' : 'default'}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {type === 'bar' ? renderBarChart() : renderPieChart()}
      </CardContent>
    </Card>
  );
}