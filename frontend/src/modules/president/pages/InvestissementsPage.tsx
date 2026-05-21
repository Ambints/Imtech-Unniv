/**
 * Page Investissements - Validation des gros investissements
 * Design aligné avec le Dashboard Président
 */

import React, { useState } from 'react';
import { DollarSign, Search, TrendingUp, AlertCircle, Package, Check, X } from 'lucide-react';
import { useInvestissementsEnAttente, useValiderInvestissement } from '../hooks';
import { WorkflowCard } from '../components';
import type { InvestissementEnAttente } from '../types/president.types';

export const InvestissementsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState<string>('all');
  
  const { data: investissements, isLoading } = useInvestissementsEnAttente();
  const validerMutation = useValiderInvestissement();

  const [showModal, setShowModal] = useState(false);
  const [selectedInvestissement, setSelectedInvestissement] = useState<InvestissementEnAttente | null>(null);
  const [action, setAction] = useState<'approuve' | 'rejete'>('approuve');
  const [motif, setMotif] = useState('');
  const [montantAjuste, setMontantAjuste] = useState('');

  const filteredInvestissements = investissements?.filter(inv => {
    const matchSearch = inv.intitule.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       inv.fournisseur.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategorie = selectedCategorie === 'all' || inv.categorie === selectedCategorie;
    return matchSearch && matchCategorie;
  });

  const handleAction = (investissement: InvestissementEnAttente, actionType: 'approuve' | 'rejete') => {
    setSelectedInvestissement(investissement);
    setAction(actionType);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!selectedInvestissement || !motif.trim()) return;

    const payload = {
      decision: action,
      motif,
      montantAjuste: montantAjuste ? Number(montantAjuste) : undefined,
    };

    try {
      await validerMutation.mutateAsync({ id: selectedInvestissement.id, data: payload });
      setShowModal(false);
      setMotif('');
      setMontantAjuste('');
      setSelectedInvestissement(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const montantTotal = investissements?.reduce((sum, inv) => sum + inv.montant, 0) || 0;
  const investissementsParCategorie = {
    equipement: investissements?.filter(i => i.categorie === 'Équipement').length || 0,
    infrastructure: investissements?.filter(i => i.categorie === 'Infrastructure').length || 0,
    informatique: investissements?.filter(i => i.categorie === 'Informatique').length || 0,
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
          Validation des Investissements
        </h1>
        <p className="text-muted mb-0">
          Approbation des gros investissements soumis par l'Économat
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
                    {investissements?.length || 0}
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
                  <DollarSign size={24} />
                </div>
                <div>
                  <div className="text-muted small">Montant Total</div>
                  <div className="h4 fw-bold mb-0" style={{ color: '#1e293b' }}>
                    {(montantTotal / 1_000_000).toFixed(2)}M Ar
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
                  <Package size={24} />
                </div>
                <div>
                  <div className="text-muted small">Équipements</div>
                  <div className="h4 fw-bold mb-0" style={{ color: '#1e293b' }}>
                    {investissementsParCategorie.equipement}
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
                  placeholder="Rechercher par intitulé ou fournisseur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>
            <div className="col-12 col-md-6">
              <select
                value={selectedCategorie}
                onChange={(e) => setSelectedCategorie(e.target.value)}
                className="form-select"
              >
                <option value="all">Toutes les catégories</option>
                <option value="Équipement">Équipement</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Informatique">Informatique</option>
                <option value="Mobilier">Mobilier</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des investissements */}
      {filteredInvestissements && filteredInvestissements.length > 0 ? (
        <div className="row g-3">
          {filteredInvestissements.map((investissement) => (
            <div key={investissement.id} className="col-12 col-lg-6">
              <WorkflowCard
                title={investissement.intitule}
                subtitle={investissement.justification}
                meta={[
                  { label: 'Montant', value: `${investissement.montant.toLocaleString('fr-FR')} Ar` },
                  { label: 'Fournisseur', value: investissement.fournisseur },
                  { label: 'Catégorie', value: investissement.categorie },
                  { label: 'Soumis le', value: new Date(investissement.soumis_le).toLocaleDateString('fr-FR') },
                  { label: 'Par', value: investissement.par_economat },
                ]}
                urgence={investissement.montant > 5_000_000 ? 'haute' : investissement.montant > 2_000_000 ? 'moyenne' : 'faible'}
                onApprove={() => handleAction(investissement, 'approuve')}
                onReject={() => handleAction(investissement, 'rejete')}
                isLoading={validerMutation.isPending}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <DollarSign size={48} className="text-muted mb-3" />
            <h5 className="text-muted mb-2">Aucun investissement en attente</h5>
            <p className="text-muted small mb-0">
              Tous les investissements ont été traités
            </p>
          </div>
        </div>
      )}

      {/* Modal de validation/rejet */}
      {showModal && selectedInvestissement && (
        <div
          className="modal d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => {
            setShowModal(false);
            setMotif('');
            setMontantAjuste('');
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {action === 'approuve' ? 'Approuver' : 'Rejeter'} l'investissement
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    setMotif('');
                    setMontantAjuste('');
                  }}
                />
              </div>
              <div className="modal-body">
                <p className="text-muted mb-4">
                  {selectedInvestissement.intitule} - {selectedInvestissement.montant.toLocaleString('fr-FR')} Ar
                </p>
                
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Motif de la décision <span className="text-danger">*</span>
                  </label>
                  <textarea
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    rows={4}
                    className="form-control"
                    placeholder={action === 'approuve' ? 'Motivez votre approbation...' : 'Motivez votre rejet...'}
                    required
                  />
                </div>

                {action === 'approuve' && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Montant ajusté (optionnel)
                    </label>
                    <input
                      type="number"
                      value={montantAjuste}
                      onChange={(e) => setMontantAjuste(e.target.value)}
                      className="form-control"
                      placeholder="Laisser vide pour garder le montant initial"
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
                    setMotif('');
                    setMontantAjuste('');
                  }}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!motif.trim() || validerMutation.isPending}
                  className={`btn ${action === 'approuve' ? 'btn-success' : 'btn-danger'}`}
                >
                  {validerMutation.isPending ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      {action === 'approuve' ? <Check size={18} className="me-2" /> : <X size={18} className="me-2" />}
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
