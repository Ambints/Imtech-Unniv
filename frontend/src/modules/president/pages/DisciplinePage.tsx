/**
 * Page Discipline - Arbitrage des conseils de discipline
 */

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Eye, Shield } from 'lucide-react';
import { useConseilsDisciplineEnAttente, useArbitrerDiscipline } from '../hooks';
import type { DecisionDiscipline } from '../types/president.types';
import toast from 'react-hot-toast';

export const DisciplinePage: React.FC = () => {
  const [selectedConseil, setSelectedConseil] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [decision, setDecision] = useState<DecisionDiscipline>('avertissement');
  const [motivationDecision, setMotivationDecision] = useState('');
  const [dureeSuspensionJours, setDureeSuspensionJours] = useState<number | undefined>();
  const [notifierParents, setNotifierParents] = useState(true);

  const { data: conseils, isLoading } = useConseilsDisciplineEnAttente();
  const arbitrerMutation = useArbitrerDiscipline();

  const handleArbitrer = async () => {
    if (!selectedConseil || !motivationDecision.trim()) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    if (decision === 'suspension_temporaire' && !dureeSuspensionJours) {
      toast.error('Veuillez indiquer la durée de suspension');
      return;
    }

    try {
      await arbitrerMutation.mutateAsync({
        id: selectedConseil,
        data: { decision, motivationDecision, dureeSuspensionJours, notifierParents }
      });
      toast.success('Décision enregistrée avec succès');
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error('Erreur lors de l\'arbitrage');
    }
  };

  const resetForm = () => {
    setSelectedConseil(null);
    setDecision('avertissement');
    setMotivationDecision('');
    setDureeSuspensionJours(undefined);
    setNotifierParents(true);
  };

  const openModal = (id: number) => {
    setSelectedConseil(id);
    setShowModal(true);
  };

  const getGraviteColor = (gravite: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      mineure: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e' },
      majeure: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' },
      critique: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' },
    };
    return colors[gravite] || { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280' };
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-2" style={{ color: '#1e293b' }}>
          Arbitrage Disciplinaire
        </h1>
        <p className="text-muted mb-0">
          Conseils de discipline majeurs nécessitant une décision présidentielle
        </p>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded"
                  style={{
                    width: 48,
                    height: 48,
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    color: '#f59e0b',
                  }}
                >
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <div className="text-muted small">En Attente</div>
                  <div className="h4 fw-bold mb-0" style={{ color: '#1e293b' }}>
                    {conseils?.length || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded"
                  style={{
                    width: 48,
                    height: 48,
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                  }}
                >
                  <Shield size={24} />
                </div>
                <div>
                  <div className="text-muted small">Cas Critiques</div>
                  <div className="h4 fw-bold mb-0" style={{ color: '#1e293b' }}>
                    {conseils?.filter(c => c.gravite === 'critique').length || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des conseils */}
      <div className="row g-3">
        {conseils && conseils.length > 0 ? (
          conseils.map((conseil) => {
            const colors = getGraviteColor(conseil.gravite);
            return (
              <div key={conseil.id} className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
                            {conseil.etudiant_nom}
                          </h5>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: colors.bg,
                              color: colors.text,
                              fontSize: '0.75rem',
                            }}
                          >
                            {conseil.gravite.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="mb-3">
                          <div className="text-muted small mb-1">Motif</div>
                          <div className="fw-medium">{conseil.motif}</div>
                        </div>

                        <div className="row g-3 mb-3">
                          <div className="col-12 col-md-6">
                            <div className="text-muted small mb-1">Date de l'incident</div>
                            <div className="fw-medium">
                              {new Date(conseil.date_incident).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="text-muted small mb-1">Rapport du surveillant</div>
                          <div className="p-3 rounded" style={{ backgroundColor: '#f8fafc' }}>
                            <small>{conseil.rapport_surveillant}</small>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="text-muted small mb-1">Proposition du secrétariat</div>
                          <div className="p-3 rounded" style={{ backgroundColor: '#f8fafc' }}>
                            <small>{conseil.proposition_secretariat}</small>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex gap-2 flex-wrap">
                      <button
                        className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                        onClick={() => openModal(conseil.id)}
                        disabled={arbitrerMutation.isPending}
                      >
                        <CheckCircle size={16} />
                        Arbitrer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <Shield size={48} className="text-muted mb-3" />
                <h5 className="text-muted">Aucun conseil en attente</h5>
                <p className="text-muted small mb-0">
                  Tous les conseils de discipline ont été traités
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal d'arbitrage */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Arbitrage Disciplinaire</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => { setShowModal(false); resetForm(); }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-warning d-flex align-items-center gap-2 mb-3">
                  <AlertTriangle size={20} />
                  <small>Cette décision est définitive et engage la responsabilité de l'université.</small>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium">Décision *</label>
                  <select
                    className="form-select"
                    value={decision}
                    onChange={(e) => setDecision(e.target.value as DecisionDiscipline)}
                  >
                    <option value="avertissement">Avertissement</option>
                    <option value="suspension_temporaire">Suspension Temporaire</option>
                    <option value="exclusion_definitive">Exclusion Définitive</option>
                    <option value="classement_sans_suite">Classement Sans Suite</option>
                  </select>
                </div>

                {decision === 'suspension_temporaire' && (
                  <div className="mb-3">
                    <label className="form-label fw-medium">Durée de suspension (jours) *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={dureeSuspensionJours || ''}
                      onChange={(e) => setDureeSuspensionJours(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Ex: 7"
                      min="1"
                      max="90"
                    />
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label fw-medium">Motivation de la décision *</label>
                  <textarea
                    className="form-control"
                    rows={5}
                    value={motivationDecision}
                    onChange={(e) => setMotivationDecision(e.target.value)}
                    placeholder="Expliquez en détail les raisons de votre décision..."
                  />
                </div>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="notifierParents"
                    checked={notifierParents}
                    onChange={(e) => setNotifierParents(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="notifierParents">
                    Notifier les parents par email
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setShowModal(false); resetForm(); }}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleArbitrer}
                  disabled={
                    arbitrerMutation.isPending || 
                    !motivationDecision.trim() ||
                    (decision === 'suspension_temporaire' && !dureeSuspensionJours)
                  }
                >
                  {arbitrerMutation.isPending ? 'Enregistrement...' : 'Confirmer la Décision'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Made with ❤️ by IBM Bob

// Made with Bob
