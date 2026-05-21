/**
 * Page Délégations - Gestion des délégations de signature
 */

import React, { useState } from 'react';
import { UserCog, Plus, XCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { useDelegations, useCreerDelegation, useRevoquerDelegation } from '../hooks';
import toast from 'react-hot-toast';

export const DelegationsPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [delegataireId, setDelegataireId] = useState<number | undefined>();
  const [typesActes, setTypesActes] = useState<string[]>([]);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [conditions, setConditions] = useState('');

  const { data: delegations, isLoading } = useDelegations();
  const creerMutation = useCreerDelegation();
  const revoquerMutation = useRevoquerDelegation();

  const actesDisponibles = [
    { value: 'attestation_scolarite', label: 'Attestation de Scolarité' },
    { value: 'convocation', label: 'Convocation' },
    { value: 'certificat_inscription', label: 'Certificat d\'Inscription' },
    { value: 'releve_notes', label: 'Relevé de Notes' },
    { value: 'autorisation_sortie', label: 'Autorisation de Sortie' },
    { value: 'courrier_administratif', label: 'Courrier Administratif' },
  ];

  const handleCreer = async () => {
    if (!delegataireId || typesActes.length === 0 || !dateDebut || !dateFin) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    if (new Date(dateFin) <= new Date(dateDebut)) {
      toast.error('La date de fin doit être postérieure à la date de début');
      return;
    }

    try {
      await creerMutation.mutateAsync({
        delegataireId,
        typesActes,
        dateDebut,
        dateFin,
        conditions
      });
      toast.success('Délégation créée avec succès');
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error('Erreur lors de la création');
    }
  };

  const handleRevoquer = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir révoquer cette délégation ?')) {
      return;
    }

    try {
      await revoquerMutation.mutateAsync(id);
      toast.success('Délégation révoquée avec succès');
    } catch (error) {
      toast.error('Erreur lors de la révocation');
    }
  };

  const resetForm = () => {
    setDelegataireId(undefined);
    setTypesActes([]);
    setDateDebut('');
    setDateFin('');
    setConditions('');
  };

  const toggleActe = (acte: string) => {
    setTypesActes(prev =>
      prev.includes(acte)
        ? prev.filter(a => a !== acte)
        : [...prev, acte]
    );
  };

  const getStatutColor = (statut: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      active: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e' },
      revoquee: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' },
      expiree: { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280' },
    };
    return colors[statut] || { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280' };
  };

  const isExpired = (dateFin: string) => {
    return new Date(dateFin) < new Date();
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

  const delegationsActives = delegations?.filter(d => d.statut === 'active') || [];
  const delegationsInactives = delegations?.filter(d => d.statut !== 'active') || [];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold mb-2" style={{ color: '#1e293b' }}>
            Délégations de Signature
          </h1>
          <p className="text-muted mb-0">
            Déléguer la signature de certains actes au secrétariat général
          </p>
        </div>
        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <Plus size={18} />
          Nouvelle Délégation
        </button>
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
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    color: '#22c55e',
                  }}
                >
                  <CheckCircle size={24} />
                </div>
                <div>
                  <div className="text-muted small">Actives</div>
                  <div className="h4 fw-bold mb-0" style={{ color: '#1e293b' }}>
                    {delegationsActives.length}
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
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                  }}
                >
                  <XCircle size={24} />
                </div>
                <div>
                  <div className="text-muted small">Révoquées/Expirées</div>
                  <div className="h4 fw-bold mb-0" style={{ color: '#1e293b' }}>
                    {delegationsInactives.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Délégations actives */}
      {delegationsActives.length > 0 && (
        <>
          <h5 className="fw-bold mb-3" style={{ color: '#1e293b' }}>
            Délégations Actives
          </h5>
          <div className="row g-3 mb-4">
            {delegationsActives.map((delegation) => {
              const colors = getStatutColor(delegation.statut);
              const expired = isExpired(delegation.date_fin);
              return (
                <div key={delegation.id} className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
                              {delegation.delegataire}
                            </h5>
                            <span
                              className="badge"
                              style={{
                                backgroundColor: colors.bg,
                                color: colors.text,
                                fontSize: '0.7rem',
                              }}
                            >
                              {delegation.statut.toUpperCase()}
                            </span>
                            {expired && (
                              <span className="badge bg-warning text-dark" style={{ fontSize: '0.7rem' }}>
                                EXPIRE
                              </span>
                            )}
                          </div>
                          
                          <div className="mb-3">
                            <div className="text-muted small mb-1">Types d'actes délégués</div>
                            <div className="d-flex flex-wrap gap-2">
                              {delegation.types_actes.map((acte, idx) => (
                                <span
                                  key={idx}
                                  className="badge"
                                  style={{
                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                    color: '#3b82f6',
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  {acte}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="row g-2">
                            <div className="col-6 col-md-3">
                              <div className="text-muted small">Date Début</div>
                              <div className="fw-medium">
                                {new Date(delegation.date_debut).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                            <div className="col-6 col-md-3">
                              <div className="text-muted small">Date Fin</div>
                              <div className="fw-medium">
                                {new Date(delegation.date_fin).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-danger btn-sm d-flex align-items-center gap-2"
                          onClick={() => handleRevoquer(delegation.id)}
                          disabled={revoquerMutation.isPending}
                        >
                          <XCircle size={16} />
                          Révoquer
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

      {/* Délégations inactives */}
      {delegationsInactives.length > 0 && (
        <>
          <h5 className="fw-bold mb-3" style={{ color: '#1e293b' }}>
            Historique
          </h5>
          <div className="row g-3">
            {delegationsInactives.map((delegation) => {
              const colors = getStatutColor(delegation.statut);
              return (
                <div key={delegation.id} className="col-12 col-lg-6">
                  <div className="card border-0 shadow-sm" style={{ opacity: 0.7 }}>
                    <div className="card-body">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <h6 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
                          {delegation.delegataire}
                        </h6>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: colors.bg,
                            color: colors.text,
                            fontSize: '0.65rem',
                          }}
                        >
                          {delegation.statut.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-muted small">
                        {new Date(delegation.date_debut).toLocaleDateString('fr-FR')} - {new Date(delegation.date_fin).toLocaleDateString('fr-FR')}
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
      {delegations && delegations.length === 0 && (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <UserCog size={48} className="text-muted mb-3" />
            <h5 className="text-muted">Aucune délégation</h5>
            <p className="text-muted small mb-3">
              Vous n'avez pas encore créé de délégation de signature
            </p>
            <button
              className="btn btn-primary d-flex align-items-center gap-2 mx-auto"
              onClick={() => setShowModal(true)}
            >
              <Plus size={18} />
              Créer une Délégation
            </button>
          </div>
        </div>
      )}

      {/* Modal de création */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nouvelle Délégation</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => { setShowModal(false); resetForm(); }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info d-flex align-items-center gap-2 mb-3">
                  <AlertCircle size={20} />
                  <small>Une seule délégation active peut exister pour les mêmes types d'actes.</small>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium">Délégataire (ID Utilisateur) *</label>
                  <input
                    type="number"
                    className="form-control"
                    value={delegataireId || ''}
                    onChange={(e) => setDelegataireId(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="ID du secrétaire général"
                  />
                  <small className="text-muted">Entrez l'ID de l'utilisateur du secrétariat général</small>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium">Types d'Actes *</label>
                  <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {actesDisponibles.map((acte) => (
                      <div key={acte.value} className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={acte.value}
                          checked={typesActes.includes(acte.value)}
                          onChange={() => toggleActe(acte.value)}
                        />
                        <label className="form-check-label" htmlFor={acte.value}>
                          {acte.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label fw-medium">Date Début *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={dateDebut}
                      onChange={(e) => setDateDebut(e.target.value)}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-medium">Date Fin *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={dateFin}
                      onChange={(e) => setDateFin(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium">Conditions (optionnel)</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={conditions}
                    onChange={(e) => setConditions(e.target.value)}
                    placeholder="Conditions ou restrictions particulières..."
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
                  className="btn btn-primary"
                  onClick={handleCreer}
                  disabled={
                    creerMutation.isPending || 
                    !delegataireId || 
                    typesActes.length === 0 || 
                    !dateDebut || 
                    !dateFin
                  }
                >
                  {creerMutation.isPending ? 'Création...' : 'Créer la Délégation'}
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
