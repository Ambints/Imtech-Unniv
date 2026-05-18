/**
 * Composant KpiGrid - Grille de cartes KPI
 */

import React from 'react';
import { KpiCard } from './KpiCard';
import type { KpiCardData } from '../types/president.types';

interface KpiGridProps {
  kpis: KpiCardData[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export const KpiGrid: React.FC<KpiGridProps> = ({
  kpis,
  columns = 4,
  className = '',
}) => {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6 ${className}`}>
      {kpis.map((kpi, index) => (
        <KpiCard key={index} {...kpi} />
      ))}
    </div>
  );
};

// Made with Bob