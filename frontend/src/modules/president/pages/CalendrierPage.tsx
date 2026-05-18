/**
 * Page Calendrier - Validation du calendrier académique
 */

import React, { useState } from 'react';
import { Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useCalendrierEnAttente, useValiderCalendrier } from '../hooks';
import toast from 'react-hot-toast';

export const CalendrierPage: React.FC = () => {
  const [selectedEvenement, setSelectedEvenement] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [commentaire, setCommentaire] = useState('');

  const { data: evenements, isLoading } = useCalendrierEnAttente();
  const validerMutation = useValiderCalendrier();

  const handleValider = async () => {
    if (!selectedEvenement) {
      toast.error('Aucun événement sélectionné');
      return;
    }

    try {
      await validerMutation.mutateAsync({
        id: selectedEvenement,
        data: { commentaire }
      });
      toast.success('Événement validé avec succès');
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error('Erreur lors de la validation');
    }
  };

  const resetForm = () => {
    setSelectedEvenement(null);
    setCommentaire('');
  };

  const openModal = (id: number) => {
    setSelectedEvenement(id);
    setShowModal(true);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      rentree: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e' },
      examens: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' },
      vacances: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' },
      soutenances: { bg: 'rgba(139, 92, 246, 0.1)', text: '#8b5cf6' },
      pastoral: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' },
    };
    return colors[type] || { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280' };
  };

  const getStatutColor = (statut: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      en_attente_validation: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' },
      valide: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e' },
      modifie: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' },
    };
    return colors[statut] || { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280' };
  };

  const formatDateRange = (debut: string, fin: string) => {
    const dateDebut = new Date(debut);
    const dateFin = new Date(fin);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return `${dateDebut.toLocaleDateString('fr-FR', options)} - ${dateFin.toLocaleDateString('fr-FR', options)}`;
  };

  const getDuree = (debut: string, fin: string) => {
    const dateDebut = new Date(debut);
    const dateFin = new Date(fin);
    const diffTime = Math.abs(dateFin.getTime() - dateDebut.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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

  const evenementsEnAttente = evenements?.filter(e => e.statut === 'en_attente_validation') || [];
  const evenementsValides = evenements?.filter(e => e.statut === 'valide') || [];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-2" style={{ color: '#1e293b' }}>
          Calendrier Académique
        </h1>
        <p className="text-muted mb-0">
          Validation des événements : rentrée, examens, vacances, soutenances
        </p>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
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
                  <AlertCircle size={24} />
                </div>
                <div>
                  <div className="text-muted small">En Attente</div>
                  <div className="h4 fw-bold mb-0" style={{ color: '#1e293b' }}>
                    {evenementsEnAttente.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded"
                  style={{
                    width: 48,
                    height: 48,
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    color: '#22c55e',
                  }}
                >
                  <CheckCircle size={24} />
                </div>
                <div>
                  <div className="text-muted small">Validés</div>
                  <div className="h4 fw-bold mb-0" style={{ color: '#1e293b' }}>
                    {evenementsValides.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Événements en attente */}
      {evenementsEnAttente.length > 0 && (
        <>
          <h5 className="fw-bold mb-3" style={{ color: '#1e293b' }}>
            Événements en Attente de Validation
          </h5>
          <div className="row g-3 mb-4">
            {evenementsEnAttente.map((evenement) => {
              const typeColors = getTypeColor(evenement.type);
              const duree = getDuree(evenement.date_debut, evenement.date_fin);
              return (
                <div key={evenement.id} className="col-12 col-lg-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
                              {evenement.intitule}
                            </h5>
                            <span
                              className="badge"
                              style={{
                                backgroundColor: typeColors.bg,
                                color: typeColors.text,
                                fontSize: '0.7rem',
                              }}
                            >
                              {evenement.type.toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="mb-3">
                            <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                              <Calendar size={14} />
                              {formatDateRange(evenement.date_debut, evenement.date_fin)}
                            </div>
                            <div className="d-flex align-items-center gap-2 text-muted small">
                              <Clock size={14} />
                              {duree} jour{duree > 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-success btn-sm d-flex align-items-center gap-2"
                          onClick={() => openModal(evenement.id)}
                          disabled={validerMutation.isPending}
                        >
                          <CheckCircle size={16} />
                          Valider
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Événements validés */}
      {evenementsValides.length > 0 && (
        <>
          <h5 className="fw-bold mb-3" style={{ color: '#1e293b' }}>
            Événements Validés
          </h5>
          <div className="row g-3">
            {evenementsValides.map((evenement) => {
              const typeColors = getTypeColor(evenement.type);
              const duree = getDuree(evenement.date_debut, evenement.date_fin);
              return (
                <div key={evenement.id} className="col-12 col-lg-6">
                  <div className="card border-0 shadow-sm h-100" style={{ opacity: 0.8 }}>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <h6 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
                              {evenement.intitule}
                            </h6>
                            <span
                              className="badge"
                              style={{
                                backgroundColor: typeColors.bg,
                                color: typeColors.text,
                                fontSize: '0.65rem',
                              }}
                            >
                              {evenement.type.toUpperCase()}
                            </span>
                            <CheckCircle size={16} className="text-success" />
                          </div>
                          
                          <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                            <Calendar size={14} />
                            {formatDateRange(evenement.date_debut, evenement.date_fin)}
                          </div>
                          <div className="d-flex align-items-center gap-2 text-muted small">
                            <Clock size={14} />
                            {duree} jour{duree > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Empty state */}
      {evenements && evenements.length === 0 && (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <Calendar size={48} className="text-muted mb-3" />
            <h5 className="text-muted">Aucun événement disponible</h5>
            <p className="text-muted small mb-0">
              Le calendrier académique n'a pas encore été créé
            </p>
          </div>
        </div>
      )}

      {/* Modal de validation */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Valider l'Événement</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => { setShowModal(false); resetForm(); }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-medium">Commentaire (optionnel)</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    placeholder="Ajoutez un commentaire si nécessaire..."
                  />
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
                  className="btn btn-success"
                  onClick={handleValider}
                  disabled={validerMutation.isPending}
                >
                  {validerMutation.isPending ? 'Validation...' : 'Valider'}
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
