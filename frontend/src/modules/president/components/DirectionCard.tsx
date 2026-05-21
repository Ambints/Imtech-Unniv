/**
 * Composant DirectionCard - Carte résumé d'une direction
 */

import React from 'react';
import { ChevronRight } from 'lucide-react';

interface DirectionCardProps {
  title: string;
  icon: React.ReactNode;
  stats: Array<{ label: string; value: string | number; alert?: boolean }>;
  color?: 'blue' | 'green' | 'purple' | 'amber' | 'red';
  onClick?: () => void;
  className?: string;
}

const colorClasses = {
  blue: 'bg-blue-50 border-blue-200 hover:border-blue-400',
  green: 'bg-green-50 border-green-200 hover:border-green-400',
  purple: 'bg-purple-50 border-purple-200 hover:border-purple-400',
  amber: 'bg-amber-50 border-amber-200 hover:border-amber-400',
  red: 'bg-red-50 border-red-200 hover:border-red-400',
};

const iconColorClasses = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  purple: 'text-purple-600',
  amber: 'text-amber-600',
  red: 'text-red-600',
};

export const DirectionCard: React.FC<DirectionCardProps> = ({
  title,
  icon,
  stats,
  color = 'blue',
  onClick,
  className = '',
}) => {
  const isClickable = !!onClick;

  return (
    <div
      className={`
        relative rounded-lg border-2 p-6 transition-all duration-200
        ${colorClasses[color]}
        ${isClickable ? 'cursor-pointer hover:shadow-lg' : ''}
        ${className}
      `}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`${iconColorClasses[color]}`}>
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
        </div>
        {isClickable && (
          <ChevronRight className="text-gray-400" size={20} />
        )}
      </div>

      {/* Stats */}
      <div className="space-y-3">
        {stats.map((stat, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {stat.label}
            </span>
            <span className={`
              text-sm font-semibold
              ${stat.alert ? 'text-red-600' : 'text-gray-900'}
            `}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Made with Bob