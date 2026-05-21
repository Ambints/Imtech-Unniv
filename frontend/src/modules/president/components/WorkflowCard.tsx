/**
 * Composant WorkflowCard - Carte pour les items en attente de décision
 */

import React from 'react';
import { Check, X, Eye, AlertCircle } from 'lucide-react';
import type { UrgenceLevel } from '../types/president.types';

interface WorkflowCardProps {
  title: string;
  subtitle?: string;
  meta?: Array<{ label: string; value: string }>;
  urgence?: UrgenceLevel;
  onApprove?: () => void;
  onReject?: () => void;
  onViewDetail?: () => void;
  customActions?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

const urgenceColors = {
  faible: 'border-green-300 bg-green-50',
  moyenne: 'border-amber-300 bg-amber-50',
  haute: 'border-red-300 bg-red-50',
};

const urgenceBadgeColors = {
  faible: 'bg-green-100 text-green-800',
  moyenne: 'bg-amber-100 text-amber-800',
  haute: 'bg-red-100 text-red-800',
};

export const WorkflowCard: React.FC<WorkflowCardProps> = ({
  title,
  subtitle,
  meta,
  urgence,
  onApprove,
  onReject,
  onViewDetail,
  customActions,
  isLoading = false,
  className = '',
}) => {
  return (
    <div
      className={`
        rounded-lg border-2 p-6 transition-all duration-200 hover:shadow-md
        ${urgence ? urgenceColors[urgence] : 'border-gray-200 bg-white'}
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
        
        {urgence && (
          <span className={`
            px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1
            ${urgenceBadgeColors[urgence]}
          `}>
            <AlertCircle size={14} />
            {urgence === 'faible' && 'Faible'}
            {urgence === 'moyenne' && 'Moyenne'}
            {urgence === 'haute' && 'Haute'}
          </span>
        )}
      </div>

      {/* Meta information */}
      {meta && meta.length > 0 && (
        <div className="space-y-2 mb-4">
          {meta.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.label}:</span>
              <span className="font-medium text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        {customActions ? (
          customActions
        ) : (
          <>
            {onViewDetail && (
              <button
                onClick={onViewDetail}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye size={18} />
                Détails
              </button>
            )}
            
            {onApprove && (
              <button
                onClick={onApprove}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Check size={18} />
                    Valider
                  </>
                )}
              </button>
            )}
            
            {onReject && (
              <button
                onClick={onReject}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <X size={18} />
                    Rejeter
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Made with Bob