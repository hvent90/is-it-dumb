'use client';

import React, { ReactNode } from 'react';

interface DashboardGridProps {
  children: ReactNode;
  className?: string;
}

export function DashboardGrid({ children, className = '' }: DashboardGridProps) {
  return (
    <div className={`grid gap-6 grid-cols-2 ${className}`}>
      {children}
    </div>
  );
}