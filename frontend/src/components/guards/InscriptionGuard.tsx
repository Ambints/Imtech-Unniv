import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { AlertCircle, CreditCard, CheckCircle, ArrowRight } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

export const InscriptionGuard: React.FC<Props> = ({ children }) => {
  const navigate = useNavigate();
  const { user, tenant } = useAuthStore();
  const [inscriptions, setInscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasValidInscription, setHasValidInscription] = useState(false);
  const [hasPaidFees, setHasPaidFees] = useState(false);

  useEffect(() => {
    if (user?.role === 'etudiant') {
      checkInscriptionStatus();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkInscriptionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const tenantId = tenant?.id || 'default';

      // Récupérer les inscriptions de l'étudiant
      const response = await fetch(`/api/portail/${tenantId}/etudiant/inscriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setInscriptions(data);
        
        // Vérifier s'il y a une inscription validée
        const validInscription = data.find((ins: any) => ins.statut === 'validee');
        setHasValidInscription(!!validInscription);

        // Vérifier si les frais sont payés (simulation - à implémenter avec l'API paiement)
        if (validInscription) {
          // Pour l'instant, on considère que les frais ne sont pas payés
          // Dans un vrai système, il faudrait vérifier via l'API de paiement
          setHasPaidFees(false); // À modifier quand l'API paiement sera prête
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'inscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const canAccess = hasValidInscription && hasPaidFees;

  if (user?.role !== 'etudiant') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="container-fluid p-4">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10">
            <div className="card shadow-sm border-0">
              <div className="card-body p-5 text-center">
                <div className="mb-4">
                  <AlertCircle size={64} className="text-warning" />
                </div>
                
                <h2 className="h3 mb-3">Accès Restreint</h2>
                
                {!hasValidInscription && (
                  <>
                    <p className="text-muted mb-4">
                      Vous devez avoir une inscription validée pour accéder à cette fonctionnalité.
                    </p>
                    <div className="alert alert-info d-flex align-items-center justify-content-center mb-4">
                      <AlertCircle size={20} className="me-2" />
                      <span>
                        Veuillez vous inscrire à un parcours académique et attendre la validation de votre inscription.
                      </span>
                    </div>
                    <div className="d-flex gap-3 justify-content-center">
                      <button
                        className="btn btn-primary"
                        onClick={() => navigate('/portail/etudiant/inscription')}
                      >
                        <CheckCircle size={18} className="me-2" />
                        Faire mon inscription
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => navigate('/portail/etudiant')}
                      >
                        Retour au tableau de bord
                      </button>
                    </div>
                  </>
                )}

                {hasValidInscription && !hasPaidFees && (
                  <>
                    <p className="text-muted mb-4">
                      Votre inscription est validée, mais vous devez payer les frais d'inscription pour accéder à cette fonctionnalité.
                    </p>
                    <div className="alert alert-warning d-flex align-items-center justify-content-center mb-4">
                      <CreditCard size={20} className="me-2" />
                      <span>
                        Veuillez régler les frais d'inscription pour débloquer l'accès complet au portail.
                      </span>
                    </div>
                    <div className="d-flex gap-3 justify-content-center">
                      <button
                        className="btn btn-success"
                        onClick={() => navigate('/portail/etudiant/paiements')}
                      >
                        <CreditCard size={18} className="me-2" />
                        Payer les frais d'inscription
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => navigate('/portail/etudiant')}
                      >
                        Retour au tableau de bord
                      </button>
                    </div>
                  </>
                )}

                {/* Résumé de l'inscription */}
                {inscriptions.length > 0 && (
                  <div className="mt-5">
                    <h5 className="mb-3">État de votre inscription</h5>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Parcours</th>
                            <th>Année Académique</th>
                            <th>Statut</th>
                            <th>Paiement</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inscriptions.map((inscription) => (
                            <tr key={inscription.id}>
                              <td>{inscription.parcours_nom}</td>
                              <td>{inscription.annee_academique}</td>
                              <td>
                                <span className={`badge ${
                                  inscription.statut === 'validee' 
                                    ? 'bg-success' 
                                    : inscription.statut === 'en_attente' 
                                    ? 'bg-warning' 
                                    : 'bg-danger'
                                }`}>
                                  {inscription.statut === 'validee' ? 'Validée' : 
                                   inscription.statut === 'en_attente' ? 'En attente' : 
                                   inscription.statut}
                                </span>
                              </td>
                              <td>
                                <span className="badge bg-secondary">
                                  En attente
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Instructions supplémentaires */}
                <div className="mt-5 text-start">
                  <h6 className="mb-3">Étapes à suivre :</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="d-flex align-items-start mb-3">
                        <div className="me-3">
                          <div className={`rounded-circle d-flex align-items-center justify-content-center ${
                            hasValidInscription ? 'bg-success text-white' : 'bg-secondary text-white'
                          }`} style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                            {hasValidInscription ? '✓' : '1'}
                          </div>
                        </div>
                        <div>
                          <strong>Inscription académique</strong>
                          <p className="text-muted small mb-0">
                            {hasValidInscription 
                              ? 'Votre inscription est validée' 
                              : 'Choisissez un parcours et soumettez votre inscription'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-start mb-3">
                        <div className="me-3">
                          <div className={`rounded-circle d-flex align-items-center justify-content-center ${
                            hasPaidFees ? 'bg-success text-white' : 'bg-secondary text-white'
                          }`} style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                            {hasPaidFees ? '✓' : '2'}
                          </div>
                        </div>
                        <div>
                          <strong>Paiement des frais</strong>
                          <p className="text-muted small mb-0">
                            {hasPaidFees 
                              ? 'Frais d\'inscription payés' 
                              : 'Réglez les frais d\'inscription pour débloquer l\'accès'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
