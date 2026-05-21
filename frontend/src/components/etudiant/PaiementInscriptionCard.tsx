import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { CreditCard, Upload, CheckCircle, AlertCircle, Smartphone, Building2, DollarSign } from 'lucide-react';

interface ConfigurationPaiement {
  id: string;
  tenantId: string;
  typePaiement: string;
  nomAffichage: string;
  nomBanque?: string;
  numeroCompte?: string;
  nomTitulaire?: string;
  nomService?: string;
  numeroTelephone?: string;
  instructionsSupplementaires?: string;
  // Support ancien format pour rétrocompatibilité
  libelle?: string;
  operateur?: string;
  nomBeneficiaire?: string;
  titulaireCompte?: string;
  instructions?: string;
}

interface PaiementInscriptionCardProps {
  inscriptionId: string;
  montant?: number;
  onPaiementSubmitted?: () => void;
}

export const PaiementInscriptionCard: React.FC<PaiementInscriptionCardProps> = ({
  inscriptionId,
  montant = 0,
  onPaiementSubmitted
}) => {
  const { tenant, accessToken } = useAuthStore();
  const [moyensPaiement, setMoyensPaiement] = useState<ConfigurationPaiement[]>([]);
  const [selectedMethode, setSelectedMethode] = useState<string>('');
  const [referencePaiement, setReferencePaiement] = useState('');
  const [montantPaiement, setMontantPaiement] = useState(montant);
  const [preuveFile, setPreuveFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadMoyensPaiement();
  }, []);

  const loadMoyensPaiement = async () => {
    try {
      setLoadingConfig(true);
      const response = await fetch(`/api/v1/configuration/${tenant?.id}/paiement/actifs`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMoyensPaiement(data);
        if (data.length > 0) {
          setSelectedMethode(data[0].typePaiement);
        }
      }
    } catch (err) {
      console.error('Erreur lors du chargement des moyens de paiement:', err);
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPreuveFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!referencePaiement.trim()) {
      setError('Veuillez saisir la référence de paiement');
      return;
    }

    if (!preuveFile) {
      setError('Veuillez joindre une preuve de paiement');
      return;
    }

    try {
      setLoading(true);

      // Upload de la preuve de paiement
      const formData = new FormData();
      formData.append('file', preuveFile);
      formData.append('type', 'preuve_paiement');

      const uploadResponse = await fetch(`/api/v1/upload/${tenant?.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData
      });

      let preuveUrl = '';
      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        preuveUrl = uploadData.url || uploadData.path;
      }

      // Soumettre le paiement
      const paiementData = {
        inscriptionId,
        montant: montantPaiement,
        methodePaiement: selectedMethode,
        referencePaiement,
        preuveUrl,
        datePaiement: new Date().toISOString()
      };

      const response = await fetch(`/api/v1/finance/${tenant?.id}/paiements-inscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(paiementData)
      });

      if (response.ok) {
        setSuccess('Paiement soumis avec succès ! En attente de validation par le service financier.');
        setReferencePaiement('');
        setPreuveFile(null);
        if (onPaiementSubmitted) {
          onPaiementSubmitted();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erreur lors de la soumission du paiement');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const getMethodeIcon = (type: string) => {
    switch (type) {
      case 'mobile_money':
        return <Smartphone size={20} className="text-primary" />;
      case 'virement':
        return <Building2 size={20} className="text-primary" />;
      case 'especes':
      case 'cheque':
      case 'carte_bancaire':
        return <CreditCard size={20} className="text-primary" />;
      default:
        return <DollarSign size={20} className="text-primary" />;
    }
  };

  const selectedConfig = moyensPaiement.find(m => m.typePaiement === selectedMethode);

  if (loadingConfig) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3 text-muted">Chargement des moyens de paiement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        <h5 className="card-title mb-0">
          <CreditCard size={20} className="me-2" />
          Soumettre le Paiement d'Inscription
        </h5>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger d-flex align-items-center mb-3">
            <AlertCircle size={20} className="me-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success d-flex align-items-center mb-3">
            <CheckCircle size={20} className="me-2" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label fw-bold">Méthode de paiement *</label>
            <select
              className="form-select"
              value={selectedMethode}
              onChange={(e) => setSelectedMethode(e.target.value)}
              required
            >
              {moyensPaiement.map((moyen) => (
                <option key={moyen.id} value={moyen.typePaiement}>
                  {moyen.nomAffichage || moyen.libelle}
                </option>
              ))}
            </select>
          </div>

          {selectedConfig && (
            <div className="alert alert-info mb-4">
              <div className="d-flex align-items-start">
                {getMethodeIcon(selectedConfig.typePaiement)}
                <div className="ms-3 flex-grow-1">
                  <h6 className="mb-2">{selectedConfig.nomAffichage || selectedConfig.libelle}</h6>
                  
                  {selectedConfig.typePaiement === 'mobile_money' && (
                    <div>
                      <p className="mb-1"><strong>Service:</strong> {selectedConfig.nomService || selectedConfig.operateur}</p>
                      <p className="mb-1"><strong>Numéro:</strong> {selectedConfig.numeroTelephone}</p>
                      <p className="mb-1"><strong>Titulaire:</strong> {selectedConfig.nomTitulaire || selectedConfig.nomBeneficiaire}</p>
                    </div>
                  )}

                  {(selectedConfig.typePaiement === 'bank' || selectedConfig.typePaiement === 'virement') && (
                    <div>
                      <p className="mb-1"><strong>Banque:</strong> {selectedConfig.nomBanque}</p>
                      <p className="mb-1"><strong>Numéro de compte:</strong> {selectedConfig.numeroCompte}</p>
                      {selectedConfig.iban && <p className="mb-1"><strong>IBAN:</strong> {selectedConfig.iban}</p>}
                      {selectedConfig.swiftBic && <p className="mb-1"><strong>SWIFT/BIC:</strong> {selectedConfig.swiftBic}</p>}
                      <p className="mb-1"><strong>Titulaire:</strong> {selectedConfig.titulaireCompte}</p>
                    </div>
                  )}

                  {selectedConfig.instructions && (
                    <p className="mt-2 mb-0 fst-italic text-muted">
                      <small>{selectedConfig.instructions}</small>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mb-3">
            <label className="form-label fw-bold">Référence de paiement *</label>
            <input
              type="text"
              className="form-control"
              value={referencePaiement}
              onChange={(e) => setReferencePaiement(e.target.value)}
              placeholder="Ex: TRX123456789 ou numéro de transaction"
              required
            />
            <small className="text-muted">
              Indiquez le numéro de transaction ou de virement
            </small>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Montant (Ar) *</label>
            <input
              type="number"
              className="form-control"
              value={montantPaiement}
              onChange={(e) => setMontantPaiement(parseFloat(e.target.value))}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold">Preuve de paiement (URL) *</label>
            <input
              type="url"
              className="form-control"
              placeholder="https://example.com/preuve.jpg"
              required
            />
            <small className="text-muted">
              Lien vers une capture d'écran ou photo de la preuve de paiement
            </small>
          </div>

          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading || !selectedMethode}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Soumission en cours...
                </>
              ) : (
                <>
                  <CheckCircle size={20} className="me-2" />
                  Soumettre le paiement
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-light rounded">
          <h6 className="mb-2">
            <AlertCircle size={18} className="me-2 text-warning" />
            Important
          </h6>
          <ul className="mb-0 small">
            <li>Effectuez le paiement avant de soumettre ce formulaire</li>
            <li>Conservez votre preuve de paiement</li>
            <li>Votre paiement sera vérifié par le service financier</li>
            <li>Vous recevrez une notification une fois validé</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Made with Bob
