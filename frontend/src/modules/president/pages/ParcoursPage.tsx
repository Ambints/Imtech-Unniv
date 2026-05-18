/**
 * Page Parcours - Ouverture/Fermeture de parcours académiques
 */

import React, { useState } from 'react';
import { BookOpen, CheckCircle, XCircle, Users, AlertCircle } from 'lucide-react';
import { useParcoursList, useOuvrirParcours, useFermerParcours } from '../hooks';
import toast from 'react-hot-toast';

export const ParcoursPage: React.FC = () => {
  const [selectedParcours, setSelectedParcours] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState<'ouvrir' | 'fermer'>('ouvrir');
  const [motif, setMotif] = useState('');
  const [dateEffet, setDateEffet] = useState('');

  const { data: parcours, isLoading } = useParcoursList();
  const ouvrirMutation = useOuvrirParcours();
  const fermerMutation = useFermerParcours();

  const handleSubmit = async () => {
    if (!selectedParcours || !motif.trim()) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    try {
      if (action === 'ouvrir') {
        await ouvrirMutation.mutateAsync({
          id: selectedParcours,
          data: { motif }
        });
        toast.success('Parcours ouvert avec succès');
      } else {
        await fermerMutation.mutateAsync({
          id: selectedParcours,
          data: { motif, dateEffet }
        });
        toast.success('Parcours fermé avec succès');
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error(`Erreur lors de ${action === 'ouvrir' ? "l'ouverture" : 'la fermeture'}`);
    }
  };

  const resetForm = () => {
    setSelectedParcours(null);
    setAction('ouvrir');
    setMotif('');
    setDateEffet('');
  };

  const openModal = (id: number, actionType: 'ouvrir' | 'fermer') => {
    setSelectedParcours(id);
    setAction(actionType);
    setShowModal(true);
  };

  const getStatutColor = (statut: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      ouvert: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e' },
      ferme: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' },
      suspendu: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' },
    };
    return colors[statut] || { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280' };
  };

  const getNiveauColor = (niveau: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      licence: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' },
      master: { bg: 'rgba(139, 92, 246, 0.1)', text: '#8b5cf6' },
      doctorat: { bg: 'rgba(236, 72, 153, 0.1)', text: '#ec4899' },
    };
    return colors[niveau] || { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280' };
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

  const parcoursOuverts = parcours?.filter(p => p.statut === 'ouvert') || [];
  const parcoursFermes = parcours?.filter(p => p.statut === 'ferme') || [];
  const parcoursSuspendus = parcours?.filter(p => p.statut === 'suspendu') || [];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-2" style={{ color: '#1e293b' }}>
          Gestion des Parcours
        </h1>
        <p className="text-muted mb-0">
          Ouverture et fermeture des licences, masters et doctorats
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
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    color: '#22c55e',
                  }}
                >
                  <CheckCircle size={24} />
                </div>
                <div>
                  <div className="text-muted small">Ouverts</div>
                  <div className="h4 fw-bold mb-0" style={{ color: '#1e293b' }}>
                    {parcoursOuverts.length}
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
                  <XCircle size={24} />
                </div>
                <div>
                  <div className="text-muted small">Fermés</div>
                  <div className="h4 fw-bold mb-0" style={{ color: '#1e293b' }}>
                    {parcoursFermes.length}
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
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    color: '#3b82f6',
                  }}
                >
                  <Users size={24} />
                </div>
                <div>
                  <div className="text-muted small">Étudiants Actifs</div>
                  <div className="h4 fw-bold mb-0" style={{ color: '#1e293b' }}>
                    {parcoursOuverts.reduce((sum, p) => sum + p.effectif_actuel, 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des parcours */}
      <div className="row g-3">
        {parcours && parcours.length > 0 ? (
          parcours.map((p) => {
            const statutColors = getStatutColor(p.statut);
            const niveauColors = getNiveauColor(p.niveau);
            return (
              <div key={p.id} className="col-12 col-lg-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                          <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
                            {p.intitule}
                          </h5>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: niveauColors.bg,
                              color: niveauColors.text,
                              fontSize: '0.7rem',
                            }}
                          >
                            {p.niveau.toUpperCase()}
                          </span>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: statutColors.bg,
                              color: statutColors.text,
                              fontSize: '0.7rem',
                            }}
                          >
                            {p.statut.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="row g-2 mb-3">
                          <div className="col-6">
                            <div className="text-muted small">Effectif Actuel</div>
                            <div className="fw-bold text-primary">{p.effectif_actuel} étudiants</div>
                          </div>
                          <div className="col-6">
                            <div className="text-muted small">Responsable</div>
                            <div className="fw-medium small">{p.responsable_pedagogique}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex gap-2 flex-wrap">
                      {p.statut === 'ferme' && (
                        <button
                          className="btn btn-success btn-sm d-flex align-items-center gap-2"
                          onClick={() => openModal(p.id, 'ouvrir')}
                          disabled={ouvrirMutation.isPending}
                        >
                          <CheckCircle size={16} />
                          Ouvrir
                        </button>
                      )}
                      {p.statut === 'ouvert' && (
                        <button
                          className="btn btn-danger btn-sm d-flex align-items-center gap-2"
                          onClick={() => openModal(p.id, 'fermer')}
                          disabled={fermerMutation.isPending}
                        >
                          <XCircle size={16} />
                          Fermer
                        </button>
                      )}
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
                <BookOpen size={48} className="text-muted mb-3" />
                <h5 className="text-muted">Aucun parcours disponible</h5>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal d'action */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {action === 'ouvrir' ? 'Ouvrir' : 'Fermer'} le Parcours
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => { setShowModal(false); resetForm(); }}
                ></button>
              </div>
              <div className="modal-body">
                {action === 'fermer' && (
                  <div className="alert alert-warning d-flex align-items-center gap-2 mb-3">
                    <AlertCircle size={20} />
                    <small>La fermeture est bloquée s'il reste des étudiants actifs.</small>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label fw-medium">Motif *</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    placeholder={`Expliquez la raison de ${action === 'ouvrir' ? "l'ouverture" : 'la fermeture'}...`}
                  />
                </div>

                {action === 'fermer' && (
                  <div className="mb-3">
                    <label className="form-label fw-medium">Date d'effet (optionnel)</label>
                    <input
                      type="date"
                      className="form-control"
                      value={dateEffet}
                      onChange={(e) => setDateEffet(e.target.value)}
                    />
                    <small className="text-muted">Laisser vide pour une fermeture immédiate</small>
                  </div>
                )}
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
                  className={`btn ${action === 'ouvrir' ? 'btn-success' : 'btn-danger'}`}
                  onClick={handleSubmit}
                  disabled={
                    (ouvrirMutation.isPending || fermerMutation.isPending) || 
                    !motif.trim()
                  }
                >
                  {(ouvrirMutation.isPending || fermerMutation.isPending) ? 'Traitement...' : 'Confirmer'}
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
