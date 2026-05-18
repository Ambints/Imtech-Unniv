import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface FinancesData {
  situation: {
    inscription_id: string;
    montant_inscription: number;
    montant_scolarite: number;
    montant_total: number;
    nb_tranches: number;
    montant_paye: number;
    reste_a_payer: number;
    bourse: boolean;
    type_bourse: string;
    montant_bourse: number;
    parcours: string;
    annee_academique: string;
  };
  echeancier: Array<{
    id: string;
    num_tranche: number;
    montant_du: number;
    date_echeance: string;
    statut: string;
    montant_paye_tranche: number;
  }>;
  paiements: Array<{
    id: string;
    montant: number;
    mode_paiement: string;
    date_paiement: string;
    reference: string;
    numero_recu: string;
    recu_url: string;
    statut: string;
    notes: string;
    num_tranche: number;
    caissier_nom: string;
    caissier_prenom: string;
  }>;
  paiementsEnAttente: Array<{
    id: string;
    montant: number;
    methode_paiement: string;
    reference_paiement: string;
    date_paiement: string;
    preuve_url: string;
    statut: string;
    commentaire: string;
    created_at: string;
  }>;
}

export const ParentFinances: React.FC = () => {
  const { etudiantId } = useParams<{ etudiantId: string }>();
  const navigate = useNavigate();
  const [finances, setFinances] = useState<FinancesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    montant: '',
    methodePaiement: 'virement',
    referencePaiement: '',
    datePaiement: new Date().toISOString().split('T')[0],
    preuveUrl: '',
    commentaire: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFinances();
  }, [etudiantId]);

  const loadFinances = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/v1/portail/parent/enfants/${etudiantId}/finances`);
      setFinances(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des finances');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!finances) return;

    try {
      setSubmitting(true);
      await axios.post(`/api/v1/portail/parent/enfants/${etudiantId}/paiement`, {
        etudiantId,
        inscriptionId: finances.situation.inscription_id,
        montant: parseFloat(paymentForm.montant),
        methodePaiement: paymentForm.methodePaiement,
        referencePaiement: paymentForm.referencePaiement,
        datePaiement: paymentForm.datePaiement,
        preuveUrl: paymentForm.preuveUrl,
        commentaire: paymentForm.commentaire
      });

      alert('Preuve de paiement soumise avec succès ! Elle sera validée par le caissier.');
      setShowPaymentModal(false);
      setPaymentForm({
        montant: '',
        methodePaiement: 'virement',
        referencePaiement: '',
        datePaiement: new Date().toISOString().split('T')[0],
        preuveUrl: '',
        commentaire: ''
      });
      loadFinances();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la soumission du paiement');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MG', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatutBadge = (statut: string) => {
    const badges: Record<string, string> = {
      'en_attente': 'bg-warning',
      'paye': 'bg-success',
      'en_retard': 'bg-danger',
      'annule': 'bg-secondary',
      'valide': 'bg-success',
      'rejete': 'bg-danger'
    };
    return badges[statut] || 'bg-secondary';
  };

  const getStatutLabel = (statut: string) => {
    const labels: Record<string, string> = {
      'en_attente': 'En attente',
      'paye': 'Payé',
      'en_retard': 'En retard',
      'annule': 'Annulé',
      'valide': 'Validé',
      'rejete': 'Rejeté'
    };
    return labels[statut] || statut;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error || !finances) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error || 'Données financières non disponibles'}
        </div>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-2"></i>
          Retour
        </button>
      </div>
    );
  }

  const pourcentagePaye = (finances.situation.montant_paye / finances.situation.montant_total) * 100;

  return (
    <div className="container-fluid py-4">
      {/* En-tête */}
      <div className="row mb-4">
        <div className="col-12">
          <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left me-2"></i>
            Retour au tableau de bord
          </button>
          <h3>
            <i className="bi bi-cash-coin me-2"></i>
            Suivi Financier
          </h3>
          <p className="text-muted">
            {finances.situation.parcours} - {finances.situation.annee_academique}
          </p>
        </div>
      </div>

      {/* Situation globale */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-wallet2 me-2"></i>
                Situation Financière
              </h5>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-4">
                  <small className="text-muted">Montant Total</small>
                  <h4 className="mb-0">{formatCurrency(finances.situation.montant_total)}</h4>
                </div>
                <div className="col-md-4">
                  <small className="text-muted">Montant Payé</small>
                  <h4 className="mb-0 text-success">{formatCurrency(finances.situation.montant_paye)}</h4>
                </div>
                <div className="col-md-4">
                  <small className="text-muted">Reste à Payer</small>
                  <h4 className="mb-0 text-danger">{formatCurrency(finances.situation.reste_a_payer)}</h4>
                </div>
              </div>

              <div className="progress mb-3" style={{ height: '25px' }}>
                <div
                  className="progress-bar bg-success"
                  role="progressbar"
                  style={{ width: `${pourcentagePaye}%` }}
                >
                  {pourcentagePaye.toFixed(1)}%
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <small className="text-muted">Frais d'inscription</small>
                  <p className="mb-1">{formatCurrency(finances.situation.montant_inscription)}</p>
                </div>
                <div className="col-md-6">
                  <small className="text-muted">Frais de scolarité</small>
                  <p className="mb-1">{formatCurrency(finances.situation.montant_scolarite)}</p>
                </div>
              </div>

              {finances.situation.bourse && (
                <div className="alert alert-info mt-3 mb-0">
                  <i className="bi bi-award me-2"></i>
                  <strong>Bourse:</strong> {finances.situation.type_bourse} - 
                  {formatCurrency(finances.situation.montant_bourse)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <i className="bi bi-credit-card text-primary" style={{ fontSize: '3rem' }}></i>
              <h5 className="mt-3">Effectuer un paiement</h5>
              <p className="text-muted">Soumettez une preuve de paiement pour validation</p>
              <button
                className="btn btn-primary w-100"
                onClick={() => setShowPaymentModal(true)}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Nouveau paiement
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Échéancier */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="bi bi-calendar-check me-2"></i>
                Échéancier de Paiement
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Tranche</th>
                      <th>Montant Dû</th>
                      <th>Date Limite</th>
                      <th>Montant Payé</th>
                      <th>Reste</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finances.echeancier.map((tranche) => {
                      const reste = tranche.montant_du - tranche.montant_paye_tranche;
                      const isEnRetard = new Date(tranche.date_echeance) < new Date() && reste > 0;
                      
                      return (
                        <tr key={tranche.id} className={isEnRetard ? 'table-danger' : ''}>
                          <td>
                            <strong>Tranche {tranche.num_tranche}</strong>
                          </td>
                          <td>{formatCurrency(tranche.montant_du)}</td>
                          <td>
                            {formatDate(tranche.date_echeance)}
                            {isEnRetard && (
                              <span className="badge bg-danger ms-2">
                                <i className="bi bi-exclamation-triangle me-1"></i>
                                En retard
                              </span>
                            )}
                          </td>
                          <td className="text-success">{formatCurrency(tranche.montant_paye_tranche)}</td>
                          <td className={reste > 0 ? 'text-danger' : 'text-success'}>
                            {formatCurrency(reste)}
                          </td>
                          <td>
                            <span className={`badge ${getStatutBadge(tranche.statut)}`}>
                              {getStatutLabel(tranche.statut)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Paiements en attente de validation */}
      {finances.paiementsEnAttente.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm border-warning">
              <div className="card-header bg-warning text-dark">
                <h5 className="mb-0">
                  <i className="bi bi-hourglass-split me-2"></i>
                  Paiements en Attente de Validation
                </h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Montant</th>
                        <th>Méthode</th>
                        <th>Référence</th>
                        <th>Preuve</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {finances.paiementsEnAttente.map((paiement) => (
                        <tr key={paiement.id}>
                          <td>{formatDate(paiement.date_paiement)}</td>
                          <td><strong>{formatCurrency(paiement.montant)}</strong></td>
                          <td>
                            <span className="badge bg-secondary">{paiement.methode_paiement}</span>
                          </td>
                          <td><small>{paiement.reference_paiement}</small></td>
                          <td>
                            {paiement.preuve_url && (
                              <a href={paiement.preuve_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                                <i className="bi bi-file-earmark-pdf me-1"></i>
                                Voir
                              </a>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${getStatutBadge(paiement.statut)}`}>
                              {getStatutLabel(paiement.statut)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historique des paiements */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Historique des Paiements
              </h5>
            </div>
            <div className="card-body">
              {finances.paiements.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Montant</th>
                        <th>Mode</th>
                        <th>Référence</th>
                        <th>Tranche</th>
                        <th>Reçu</th>
                        <th>Caissier</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {finances.paiements.map((paiement) => (
                        <tr key={paiement.id}>
                          <td>{formatDate(paiement.date_paiement)}</td>
                          <td><strong>{formatCurrency(paiement.montant)}</strong></td>
                          <td>
                            <span className="badge bg-info">{paiement.mode_paiement}</span>
                          </td>
                          <td><small>{paiement.reference}</small></td>
                          <td>
                            {paiement.num_tranche && (
                              <span className="badge bg-secondary">Tranche {paiement.num_tranche}</span>
                            )}
                          </td>
                          <td>
                            {paiement.recu_url ? (
                              <a href={paiement.recu_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-success">
                                <i className="bi bi-download me-1"></i>
                                N° {paiement.numero_recu}
                              </a>
                            ) : (
                              <small className="text-muted">N° {paiement.numero_recu}</small>
                            )}
                          </td>
                          <td>
                            <small>{paiement.caissier_prenom} {paiement.caissier_nom}</small>
                          </td>
                          <td>
                            <span className={`badge ${getStatutBadge(paiement.statut)}`}>
                              {getStatutLabel(paiement.statut)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-3">Aucun paiement enregistré</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de paiement */}
      {showPaymentModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-credit-card me-2"></i>
                  Soumettre une Preuve de Paiement
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowPaymentModal(false)}></button>
              </div>
              <form onSubmit={handleSubmitPayment}>
                <div className="modal-body">
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    Votre preuve de paiement sera vérifiée par le caissier avant validation.
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Montant *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={paymentForm.montant}
                        onChange={(e) => setPaymentForm({ ...paymentForm, montant: e.target.value })}
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Méthode de Paiement *</label>
                      <select
                        className="form-select"
                        value={paymentForm.methodePaiement}
                        onChange={(e) => setPaymentForm({ ...paymentForm, methodePaiement: e.target.value })}
                        required
                      >
                        <option value="virement">Virement bancaire</option>
                        <option value="mobile_money">Mobile Money</option>
                        <option value="especes">Espèces</option>
                        <option value="cheque">Chèque</option>
                        <option value="carte_bancaire">Carte bancaire</option>
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Référence du Paiement *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={paymentForm.referencePaiement}
                        onChange={(e) => setPaymentForm({ ...paymentForm, referencePaiement: e.target.value })}
                        required
                        placeholder="Ex: TRX123456789"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Date du Paiement *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={paymentForm.datePaiement}
                        onChange={(e) => setPaymentForm({ ...paymentForm, datePaiement: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">URL de la Preuve (Reçu/Capture) *</label>
                    <input
                      type="url"
                      className="form-control"
                      value={paymentForm.preuveUrl}
                      onChange={(e) => setPaymentForm({ ...paymentForm, preuveUrl: e.target.value })}
                      required
                      placeholder="https://..."
                    />
                    <small className="text-muted">
                      Uploadez d'abord votre reçu sur un service cloud et collez le lien ici
                    </small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Commentaire (optionnel)</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={paymentForm.commentaire}
                      onChange={(e) => setPaymentForm({ ...paymentForm, commentaire: e.target.value })}
                      placeholder="Informations complémentaires..."
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2"></i>
                        Soumettre
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentFinances;

// Made with Bob
