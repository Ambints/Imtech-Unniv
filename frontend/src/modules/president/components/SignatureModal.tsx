/**
 * Composant SignatureModal - Modal de signature numérique
 */

import React, { useState } from 'react';
import { X, Lock, AlertTriangle } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (codeSignature: string, extra?: Record<string, any>) => void;
  titre: string;
  description?: string;
  extraFields?: React.ReactNode;
  isLoading?: boolean;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  titre,
  description,
  extraFields,
  isLoading = false,
}) => {
  const [codeSignature, setCodeSignature] = useState('');
  const [showCode, setShowCode] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (codeSignature.trim()) {
      onConfirm(codeSignature);
      setCodeSignature('');
      setShowCode(false);
    }
  };

  const handleClose = () => {
    setCodeSignature('');
    setShowCode(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {titre}
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Warning */}
            <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="text-amber-600 flex-shrink-0" size={20} />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Action irréversible</p>
                <p>
                  Cette signature numérique est définitive et ne pourra pas être annulée.
                  Assurez-vous d'avoir vérifié toutes les informations.
                </p>
              </div>
            </div>

            {/* Description */}
            {description && (
              <p className="text-sm text-gray-600">
                {description}
              </p>
            )}

            {/* Extra fields */}
            {extraFields && (
              <div className="space-y-3">
                {extraFields}
              </div>
            )}

            {/* Code de signature */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code de signature *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={18} />
                </div>
                <input
                  type={showCode ? 'text' : 'password'}
                  value={codeSignature}
                  onChange={(e) => setCodeSignature(e.target.value)}
                  placeholder="Entrez votre code de signature"
                  className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-600 hover:text-gray-900"
                  disabled={isLoading}
                >
                  {showCode ? 'Masquer' : 'Afficher'}
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!codeSignature.trim() || isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Signature en cours...
                </>
              ) : (
                <>
                  <Lock size={18} />
                  Confirmer la signature
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Made with Bob