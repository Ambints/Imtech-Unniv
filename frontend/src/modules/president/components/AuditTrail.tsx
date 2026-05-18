/**
 * Composant AuditTrail - Historique des actions du président
 */

import React from 'react';
import { Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { AuditAction } from '../types/president.types';

interface AuditTrailProps {
  actions: AuditAction[];
  className?: string;
}

const actionColors: Record<string, string> = {
  validation: 'bg-green-100 text-green-800',
  rejet: 'bg-red-100 text-red-800',
  signature: 'bg-blue-100 text-blue-800',
  arbitrage: 'bg-purple-100 text-purple-800',
  delegation: 'bg-amber-100 text-amber-800',
  modification: 'bg-gray-100 text-gray-800',
};

export const AuditTrail: React.FC<AuditTrailProps> = ({
  actions,
  className = '',
}) => {
  if (actions.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <FileText size={48} className="mx-auto mb-2 opacity-50" />
        <p>Aucune action récente</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {actions.map((action) => {
        const actionType = action.action.toLowerCase();
        const colorClass = Object.keys(actionColors).find(key => 
          actionType.includes(key)
        ) || 'modification';

        return (
          <div
            key={action.id}
            className="flex gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            {/* Timeline dot */}
            <div className="flex-shrink-0 mt-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <span className={`
                    inline-block px-2 py-1 rounded text-xs font-medium mb-2
                    ${actionColors[colorClass]}
                  `}>
                    {action.action}
                  </span>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{action.entite}</span>
                    {action.entiteId && (
                      <span className="text-gray-500"> #{action.entiteId}</span>
                    )}
                  </p>
                </div>
                
                <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                  <Clock size={14} />
                  {format(new Date(action.createdAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                </div>
              </div>

              {/* Details */}
              {action.details && Object.keys(action.details).length > 0 && (
                <div className="text-xs text-gray-600 space-y-1">
                  {Object.entries(action.details).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium">{key}:</span>{' '}
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* User */}
              <p className="text-xs text-gray-500 mt-2">
                Par: {action.utilisateurNom}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Made with Bob