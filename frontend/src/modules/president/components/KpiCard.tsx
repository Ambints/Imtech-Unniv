/**
 * Composant KpiCard - Carte d'affichage d'un KPI avec Bootstrap
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { KpiCardData } from '../types/president.types';

interface KpiCardProps extends KpiCardData {
  className?: string;
}

const colorClasses = {
  blue: 'border-primary',
  green: 'border-success',
  amber: 'border-warning',
  red: 'border-danger',
  purple: 'border-info',
};

const iconBgClasses = {
  blue: 'bg-primary bg-opacity-10 text-primary',
  green: 'bg-success bg-opacity-10 text-success',
  amber: 'bg-warning bg-opacity-10 text-warning',
  red: 'bg-danger bg-opacity-10 text-danger',
  purple: 'bg-info bg-opacity-10 text-info',
};

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  unit,
  trend,
  trendValue,
  color = 'blue',
  icon,
  onClick,
  className = '',
}) => {
  const TrendIcon = trend ? trendIcons[trend] : null;
  const isClickable = !!onClick;

  return (
    <div
      className={`card president-kpi-card shadow-sm ${colorClasses[color]} ${className}`}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      style={{ cursor: isClickable ? 'pointer' : 'default' }}
    >
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="text-uppercase text-muted fw-medium small">
            {label}
          </div>
          {icon && (
            <div className={`president-kpi-icon ${iconBgClasses[color]} rounded`}>
              {icon}
            </div>
          )}
        </div>

        <div className="d-flex align-items-baseline mb-2">
          <div className="president-kpi-value me-2">
            {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
          </div>
          {unit && (
            <span className="text-muted fs-5">{unit}</span>
          )}
        </div>

        {trend && TrendIcon && (
          <div className={`d-flex align-items-center president-kpi-trend ${trend}`}>
            <TrendIcon size={16} className="me-1" />
            {trendValue && <span>{trendValue}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

// Made with ❤️ by IBM Bob

// Made with Bob
