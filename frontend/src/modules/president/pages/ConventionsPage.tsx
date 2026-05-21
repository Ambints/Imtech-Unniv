/**
 * Page Conventions - Signature des conventions (Église/diocèses/État)
 * Design aligné avec le Dashboard Président
 */

import React, { useState } from 'react';
import { FileText, Search, Building2, AlertCircle, Globe, Church } from 'lucide-react';
import { useConventionsEnAttente, useSignerConvention } from '../hooks';
import { WorkflowCard, SignatureModal } from '../components';
import type { ConventionEnAttente } from '../types/president.types';

export const ConventionsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  
  const { data: conventions, isLoading } = useConventionsEnAttente();
  const signerMutation = useSignerConvention();

  const [showModal, setShowModal] = useState(false);
  const [selectedConvention, setSelectedConvention] = useState<ConventionEnAttente | null>(null);
  const [representantPartenaire, setRepresentantPartenaire] = useState('');
  const [dateEffet, setDateEffet] = useState('');
  const [remarques, setRemarques] = useState('');

  const filteredConventions = conventions?.filter(conv => {
    const matchSearch = conv.intitule.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       conv.partenaire.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = selectedType === 'all' || conv.type_partenaire === selectedType;
    return matchSearch && matchType;
  });

  const handleSign = (convention: ConventionEnAttente) => {
    setSelectedConvention(convention);
    setShowModal(true);
  };

  const handleConfirmSign = async (codeSignature: string) => {
    if (!selectedConvention || !representantPartenaire.trim() || !dateEffet) return;

    try {
      await signerMutation.mutateAsync({
        id: selectedConvention.id,
        data: { codeSignature, representantPartenaire, dateEffet, remarques }
      });
      setShowModal(false);
      setRepresentantPartenaire('');
      setDateEffet('');
      setRemarques('');
      setSelectedConvention(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const conventionsEglise = conventions?.filter(c => c.type_partenaire === 'eglise' || c.type_partenaire === 'diocese').length || 0;
  const conventionsEtat = conventions?.filter(c => c.type_partenaire === 'etat').length || 0;

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
          Signature des Conventions
        </h1>
        <p className="text-muted mb-0">
          Conventions avec l'Église, les diocèses, l'État et autres partenaires
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
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    color: '#f59e0b',
                  }}
                >
                  <AlertCircle size={24} />
                </div>
                <div>
                  <div className="text-muted small">En Attente</div>
                  <div className="h4 fw-bold mb-0" style={{ color: '#1e293b' }}>
                    {conventions?.length || 0}
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
                  <Church size={24} />
                </div>
                <div>
                  <div className="text-muted small">Partenaires Église</div>
                  <div className="h4 fw-bold mb-0" style={{ color: '#1e293b' }}>
                    {conventionsEglise}
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
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                  }}
                >
                  <Globe size={24} />
                </div>
                <div>
                  <div className="text-muted small">Partenaires État</div>
                  <div className="h4 fw-bold mb-0" style={{ color: '#1e293b' }}>
                    {conventionsEtat}
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
                  placeholder="Rechercher par intitulé ou partenaire..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>
            <div className="col-12 col-md-6">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="form-select"
              >
                <option value="all">Tous les types de partenaire</option>
                <option value="eglise">Église</option>
                <option value="diocese">Diocèse</option>
                <option value="etat">État</option>
                <option value="entreprise">Entreprise</option>
                <option value="universite">Université</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des conventions */}
      {filteredConventions && filteredConventions.length > 0 ? (
        <div className="row g-3">
          {filteredConventions.map((convention) => (
            <div key={convention.id} className="col-12 col-lg-6">
              <WorkflowCard
                title={convention.intitule}
                subtitle={convention.objet_convention}
                meta={[
                  { label: 'Partenaire', value: convention.partenaire },
                  { label: 'Type', value: convention.type_partenaire.toUpperCase() },
                  { label: 'Date proposée', value: new Date(convention.date_proposee).toLocaleDateString('fr-FR') },
                ]}
                urgence={convention.type_partenaire === 'etat' ? 'haute' : 'moyenne'}
                customActions={
                  <button
                    onClick={() => handleSign(convention)}
                    disabled={signerMutation.isPending}
                    className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                  >
                    <FileText size={18} />
                    Signer
                  </button>
                }
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <FileText size={48} className="text-muted mb-3" />
            <h5 className="text-muted mb-2">Aucune convention en attente</h5>
            <p className="text-muted small mb-0">
              Toutes les conventions ont été signées
            </p>
          </div>
        </div>
      )}

      {/* Modal de signature avec champs supplémentaires */}
      {showModal && selectedConvention && (
        <div
          className="modal d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => {
            setShowModal(false);
            setRepresentantPartenaire('');
            setDateEffet('');
            setRemarques('');
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Signer la Convention</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    setRepresentantPartenaire('');
                    setDateEffet('');
                    setRemarques('');
                  }}
                />
              </div>
              <div className="modal-body">
                <p className="text-muted mb-4">
                  {selectedConvention.intitule} - {selectedConvention.partenaire}
                </p>

                <div className="alert alert-warning d-flex align-items-center mb-4" role="alert">
                  <AlertCircle size={20} className="me-2" />
                  <small>Cette action est irréversible. La signature engage l'université.</small>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Représentant du Partenaire <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={representantPartenaire}
                    onChange={(e) => setRepresentantPartenaire(e.target.value)}
                    className="form-control"
                    placeholder="Nom et fonction du signataire partenaire"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Date d'Effet <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    value={dateEffet}
                    onChange={(e) => setDateEffet(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Remarques (optionnel)
                  </label>
                  <textarea
                    value={remarques}
                    onChange={(e) => setRemarques(e.target.value)}
                    rows={3}
                    className="form-control"
                    placeholder="Remarques ou conditions particulières..."
                  />
                </div>

                {representantPartenaire.trim() && dateEffet && (
                  <SignatureModal
                    isOpen={true}
                    onClose={() => {
                      setShowModal(false);
                      setRepresentantPartenaire('');
                      setDateEffet('');
                      setRemarques('');
                      setSelectedConvention(null);
                    }}
                    onConfirm={handleConfirmSign}
                    titre="Confirmer la signature"
                    description="Entrez votre code de signature pour confirmer"
                    isLoading={signerMutation.isPending}
                  />
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setRepresentantPartenaire('');
                    setDateEffet('');
                    setRemarques('');
                  }}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={!representantPartenaire.trim() || !dateEffet || signerMutation.isPending}
                  className="btn btn-primary"
                >
                  {signerMutation.isPending ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Signature...
                    </>
                  ) : (
                    'Continuer vers la signature'
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
