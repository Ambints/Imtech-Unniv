/**
 * Page Recrutements - Validation des recrutements RH
 * Design aligné avec le Dashboard Président
 */

import React, { useState } from 'react';
import { UserPlus, Search, Filter, AlertCircle, Briefcase, Check, X } from 'lucide-react';
import { useRecrutementsEnAttente, useValiderRecrutement, useRejeterRecrutement } from '../hooks';
import { WorkflowCard } from '../components';
import type { RecrutementEnAttente } from '../types/president.types';

export const RecrutementsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  
  const { data: recrutements, isLoading } = useRecrutementsEnAttente();
  const validerMutation = useValiderRecrutement();
  const rejeterMutation = useRejeterRecrutement();

  const [showModal, setShowModal] = useState(false);
  const [selectedRecrutement, setSelectedRecrutement] = useState<RecrutementEnAttente | null>(null);
  const [action, setAction] = useState<'valider' | 'rejeter'>('valider');
  const [commentaire, setCommentaire] = useState('');
  const [conditionsSpeciales, setConditionsSpeciales] = useState('');

  const filteredRecrutements = recrutements?.filter(r => {
    const matchSearch = r.nom_candidat.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       r.poste.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = selectedType === 'all' || r.type_contrat === selectedType;
    return matchSearch && matchType;
  });

  const handleAction = (recrutement: RecrutementEnAttente, actionType: 'valider' | 'rejeter') => {
    setSelectedRecrutement(recrutement);
    setAction(actionType);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!selectedRecrutement || !commentaire.trim()) return;

    const payload = {
      decision: action === 'valider' ? 'approuve' as const : 'rejete' as const,
      commentaire,
      conditionsSpeciales: conditionsSpeciales || undefined,
    };

    try {
      if (action === 'valider') {
        await validerMutation.mutateAsync({ id: selectedRecrutement.id, data: payload });
      } else {
        await rejeterMutation.mutateAsync({ id: selectedRecrutement.id, data: payload });
      }
      setShowModal(false);
      setCommentaire('');
      setConditionsSpeciales('');
      setSelectedRecrutement(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const recrutementsParType = {
    CDI: recrutements?.filter(r => r.type_contrat === 'CDI').length || 0,
    CDD: recrutements?.filter(r => r.type_contrat === 'CDD').length || 0,
    vacataire: recrutements?.filter(r => r.type_contrat === 'vacataire').length || 0,
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
          Validation des Recrutements
        </h1>
        <p className="text-muted mb-0">
          {filteredRecrutements?.length || 0} recrutement(s) nécessitant votre validation
        </p>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded"
                  style={{
                    width: 48,
                    height: 48,
                    backgroundColor: 'rgba(236, 72, 153, 0.1)',
                    color: '#ec4899',
                  }}
                >
                  <AlertCircle size={24} />
                </div>
                <div>
                  <div className="text-muted small">En Attente</div>
                  <div className="h4 fw-bold mb-0" style={{ color: '#1e293b' }}>
                    {recrutements?.length || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100">
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
                  <Briefcase size={24} />
                </div>
                <div>
                  <div className="text-muted small">CDI</div>
                  <div className="h4 fw-bold mb-0" style={{ color: '#1e293b' }}>
                    {recrutementsParType.CDI}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded"
                  style={{
                    width: 48,
                    height: 48,
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    color: '#8b5cf6',
                  }}
                >
                  <UserPlus size={24} />
                </div>
                <div>
                  <div className="text-muted small">CDD / Vacataires</div>
                  <div className="h4 fw-bold mb-0" style={{ color: '#1e293b' }}>
                    {recrutementsParType.CDD + recrutementsParType.vacataire}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="position-relative">
                <Search
                  className="position-absolute text-muted"
                  size={20}
                  style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou poste..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="position-relative">
                <Filter
                  className="position-absolute text-muted"
                  size={20}
                  style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="form-select ps-5"
                  style={{ paddingLeft: '40px' }}
                >
                  <option value="all">Tous les types de contrat</option>
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="vacataire">Vacataire</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des recrutements */}
      {filteredRecrutements && filteredRecrutements.length > 0 ? (
        <div className="row g-3">
          {filteredRecrutements.map((recrutement) => (
            <div key={recrutement.id} className="col-12 col-lg-6">
              <WorkflowCard
                title={recrutement.nom_candidat}
                subtitle={recrutement.poste}
                meta={[
                  { label: 'Type contrat', value: recrutement.type_contrat },
                  { label: 'Salaire proposé', value: `${recrutement.salaire_propose.toLocaleString()} Ar` },
                  { label: 'Département', value: recrutement.departement },
                  { label: 'Soumis le', value: new Date(recrutement.soumis_le).toLocaleDateString('fr-FR') },
                  { label: 'Par', value: recrutement.par_rh },
                ]}
                urgence={recrutement.type_contrat === 'CDI' ? 'haute' : 'moyenne'}
                onApprove={() => handleAction(recrutement, 'valider')}
                onReject={() => handleAction(recrutement, 'rejeter')}
                isLoading={validerMutation.isPending || rejeterMutation.isPending}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <UserPlus size={48} className="text-muted mb-3" />
            <h5 className="text-muted mb-2">Aucun recrutement en attente</h5>
            <p className="text-muted small mb-0">
              Tous les recrutements ont été traités
            </p>
          </div>
        </div>
      )}

      {/* Modal de validation/rejet */}
      {showModal && selectedRecrutement && (
        <div
          className="modal d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => {
            setShowModal(false);
            setCommentaire('');
            setConditionsSpeciales('');
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {action === 'valider' ? 'Valider' : 'Rejeter'} le recrutement
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    setCommentaire('');
                    setConditionsSpeciales('');
                  }}
                />
              </div>
              <div className="modal-body">
                <p className="text-muted mb-4">
                  {selectedRecrutement.nom_candidat} - {selectedRecrutement.poste}
                </p>
                
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Commentaire <span className="text-danger">*</span>
                  </label>
                  <textarea
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    rows={4}
                    className="form-control"
                    placeholder={action === 'valider' ? 'Motivez votre validation...' : 'Motivez votre rejet...'}
                    required
                  />
                </div>

                {action === 'valider' && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Conditions spéciales (optionnel)
                    </label>
                    <textarea
                      value={conditionsSpeciales}
                      onChange={(e) => setConditionsSpeciales(e.target.value)}
                      rows={3}
                      className="form-control"
                      placeholder="Ex: Période d'essai de 6 mois, formation obligatoire..."
                    />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setCommentaire('');
                    setConditionsSpeciales('');
                  }}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!commentaire.trim() || validerMutation.isPending || rejeterMutation.isPending}
                  className={`btn ${action === 'valider' ? 'btn-success' : 'btn-danger'}`}
                >
                  {validerMutation.isPending || rejeterMutation.isPending ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      {action === 'valider' ? <Check size={18} className="me-2" /> : <X size={18} className="me-2" />}
                      Confirmer
                    </>
                  )}
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