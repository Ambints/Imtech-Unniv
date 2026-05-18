/**
 * Page Diplômes - Signature des diplômes
 * Design aligné avec le Dashboard Président
 */

import React, { useState } from 'react';
import { Award, Search, CheckSquare, GraduationCap, FileCheck, AlertCircle, Plus, Filter } from 'lucide-react';
import { useDiplomesASigner, useSignerDiplome, useSignerDiplomesEnMasse } from '../hooks';
import { WorkflowCard, SignatureModal } from '../components';
import type { DiplomeASigner } from '../types/president.types';

export const DiplomesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDiplomes, setSelectedDiplomes] = useState<string[]>([]);
  const [selectedMention, setSelectedMention] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [isBulkSign, setIsBulkSign] = useState(false);
  const [selectedDiplome, setSelectedDiplome] = useState<DiplomeASigner | null>(null);
  
  const { data: diplomes, isLoading } = useDiplomesASigner();
  const signerMutation = useSignerDiplome();
  const signerMasseMutation = useSignerDiplomesEnMasse();

  const filteredDiplomes = diplomes?.filter(d => {
    const matchSearch = d.etudiant_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       d.etudiant_prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       d.parcours.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMention = selectedMention === 'all' || d.mention.toLowerCase().includes(selectedMention.toLowerCase());
    return matchSearch && matchMention;
  });

  const handleSingleSign = (diplome: DiplomeASigner) => {
    setSelectedDiplome(diplome);
    setIsBulkSign(false);
    setShowModal(true);
  };

  const handleBulkSign = () => {
    if (selectedDiplomes.length === 0) return;
    setIsBulkSign(true);
    setShowModal(true);
  };

  const handleConfirmSign = async (codeSignature: string) => {
    try {
      if (isBulkSign) {
        await signerMasseMutation.mutateAsync({
          ids: selectedDiplomes,
          codeSignature,
        });
        setSelectedDiplomes([]);
      } else if (selectedDiplome) {
        await signerMutation.mutateAsync({
          id: selectedDiplome.id,
          data: { codeSignature },
        });
      }
      setShowModal(false);
      setSelectedDiplome(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const toggleDiplomeSelection = (id: string) => {
    setSelectedDiplomes(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (filteredDiplomes) {
      setSelectedDiplomes(filteredDiplomes.map(d => d.id));
    }
  };

  const deselectAll = () => {
    setSelectedDiplomes([]);
  };

  const diplomesParMention = {
    excellent: diplomes?.filter(d => d.mention.toLowerCase().includes('excellent')).length || 0,
    bien: diplomes?.filter(d => d.mention.toLowerCase().includes('bien')).length || 0,
    passable: diplomes?.filter(d => d.mention.toLowerCase().includes('passable')).length || 0,
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
      <div className="mb-4 d-flex justify-content-between align-items-start flex-wrap gap-3">
        <div>
          <h1 className="h3 fw-bold mb-2" style={{ color: '#1e293b' }}>
            Gestion des Diplômes
          </h1>
          <p className="text-muted mb-0">
            {filteredDiplomes?.length || 0} diplôme(s) prêt(s) pour signature
          </p>
        </div>
        <div className="d-flex gap-2">
          {selectedDiplomes.length > 0 && (
            <button
              onClick={handleBulkSign}
              disabled={signerMasseMutation.isPending}
              className="btn btn-success d-flex align-items-center gap-2"
            >
              <Award size={20} />
              Signer {selectedDiplomes.length} diplôme(s)
            </button>
          )}
          <button
            onClick={() => {
              // TODO: Implémenter la création de diplôme
              alert('Fonctionnalité de création de diplôme à venir. Cette action sera gérée par le module Scolarité.');
            }}
            className="btn btn-primary d-flex align-items-center gap-2"
          >
            <Plus size={20} />
            Nouveau Diplôme
          </button>
        </div>
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
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                  }}
                >
                  <FileCheck size={24} />
                </div>
                <div>
                  <div className="text-muted small">À Signer</div>
                  <div className="h4 fw-bold mb-0" style={{ color: '#1e293b' }}>
                    {diplomes?.length || 0}
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
                  <CheckSquare size={24} />
                </div>
                <div>
                  <div className="text-muted small">Sélectionnés</div>
                  <div className="h4 fw-bold mb-0" style={{ color: '#1e293b' }}>
                    {selectedDiplomes.length}
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
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    color: '#f59e0b',
                  }}
                >
                  <GraduationCap size={24} />
                </div>
                <div>
                  <div className="text-muted small">Mentions Excellent</div>
                  <div className="h4 fw-bold mb-0" style={{ color: '#1e293b' }}>
                    {diplomesParMention.excellent}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <div className="position-relative">
                <Search
                  className="position-absolute text-muted"
                  size={20}
                  style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                />
                <input
                  type="text"
                  placeholder="Rechercher par nom, prénom ou parcours..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="position-relative">
                <Filter
                  className="position-absolute text-muted"
                  size={20}
                  style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <select
                  value={selectedMention}
                  onChange={(e) => setSelectedMention(e.target.value)}
                  className="form-select"
                  style={{ paddingLeft: '40px' }}
                >
                  <option value="all">Toutes les mentions</option>
                  <option value="excellent">Excellent</option>
                  <option value="bien">Bien</option>
                  <option value="assez bien">Assez Bien</option>
                  <option value="passable">Passable</option>
                </select>
              </div>
            </div>
            <div className="col-12 col-md-4 d-flex gap-2">
              <button
                onClick={selectAll}
                className="btn btn-outline-secondary flex-fill"
              >
                Tout sélectionner
              </button>
              <button
                onClick={deselectAll}
                className="btn btn-outline-secondary flex-fill"
              >
                Tout désélectionner
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des diplômes */}
      {filteredDiplomes && filteredDiplomes.length > 0 ? (
        <div className="row g-3">
          {filteredDiplomes.map((diplome) => (
            <div key={diplome.id} className="col-12 col-lg-6">
              <div className="position-relative">
                <div className="position-absolute" style={{ top: '16px', left: '16px', zIndex: 10 }}>
                  <input
                    type="checkbox"
                    checked={selectedDiplomes.includes(diplome.id)}
                    onChange={() => toggleDiplomeSelection(diplome.id)}
                    className="form-check-input"
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                </div>
                <div style={{ marginLeft: '32px' }}>
                  <WorkflowCard
                    title={`${diplome.etudiant_prenom} ${diplome.etudiant_nom}`}
                    subtitle={diplome.parcours}
                    meta={[
                      { label: 'Mention', value: diplome.mention },
                      { label: 'Promotion', value: diplome.promotion_annee },
                      { label: 'Date limite', value: new Date(diplome.date_limite_sig).toLocaleDateString('fr-FR') },
                    ]}
                    urgence={new Date(diplome.date_limite_sig) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? 'haute' : 'faible'}
                    customActions={
                      <button
                        onClick={() => handleSingleSign(diplome)}
                        disabled={signerMutation.isPending}
                        className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                      >
                        <Award size={18} />
                        Signer
                      </button>
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <Award size={64} className="text-muted mb-3" />
            <h5 className="text-muted mb-2">Aucun diplôme à signer</h5>
            <p className="text-muted small mb-3">
              {searchTerm || selectedMention !== 'all'
                ? 'Aucun diplôme ne correspond à vos critères de recherche'
                : 'Tous les diplômes ont été signés ou aucun diplôme n\'est prêt pour signature'}
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedMention('all');
              }}
              className="btn btn-outline-primary btn-sm"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      )}

      {/* Modal de signature */}
      <SignatureModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedDiplome(null);
        }}
        onConfirm={handleConfirmSign}
        titre={isBulkSign ? `Signer ${selectedDiplomes.length} diplômes` : 'Signer le diplôme'}
        description={
          isBulkSign
            ? `Vous êtes sur le point de signer ${selectedDiplomes.length} diplômes. Cette action est irréversible.`
            : selectedDiplome
            ? `Diplôme de ${selectedDiplome.etudiant_prenom} ${selectedDiplome.etudiant_nom} - ${selectedDiplome.parcours}`
            : ''
        }
        isLoading={signerMutation.isPending || signerMasseMutation.isPending}
      />
    </div>
  );
};

// Made with ❤️ by IBM Bob