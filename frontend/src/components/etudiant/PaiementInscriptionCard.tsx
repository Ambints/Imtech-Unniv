import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { CheckCircle, XCircle, Clock, CreditCard, AlertTriangle, Send, X as XIcon } from 'lucide-react';

interface PaiementInscriptionCardProps {
  inscription: any;
  onPaiementSubmitted?: () => void;
}

export const PaiementInscriptionCard: React.FC<PaiementInscriptionCardProps> = ({
  inscription,
  onPaiementSubmitted
}) => {
  const { tenant, accessToken } = useAuthStore();
  const tenantId = tenant?.id || 'default';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [montantInfo, setMontantInfo] = useState<any>(null);
  const [paiementStatus, setPaiementStatus] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    methodePaiement: 'virement_bancaire',
    referencePaiement: '',
    montant: 0,
    preuveUrl: ''
  });

  useEffect(() => {
    loadMontantInfo();
    loadPaiementStatus();
  }, [inscription.id]);

  const loadMontantInfo = async () => {
    try {
      const response = await fetch(
        `/api/v1/portail/${tenantId}/etudiant/inscription/${inscription.id}/montant`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMontantInfo(data);
        setFormData(prev => ({ ...prev, montant: data.montant_inscription || 0 }));
      }
    } catch (err) {
      console.error('Erreur chargement montant:', err);
    }
  };

  const loadPaiementStatus = async () => {
    try {
      const response = await fetch(
        `/api/v1/portail/${tenantId}/etudiant/paiement-inscription/${inscription.id}/status`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPaiementStatus(data);
      }
    } catch (err) {
      console.error('Erreur chargement statut paiement:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(
        `/api/v1/portail/${tenantId}/etudiant/paiement-inscription`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inscriptionId: inscription.id,
            ...formData
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSuccess(data.message || 'Paiement soumis avec succès !');
        setShowForm(false);
        setFormData({
          methodePaiement: 'virement_bancaire',
          referencePaiement: '',
          montant: montantInfo?.montant_inscription || 0,
          preuveUrl: ''
        });
        loadPaiementStatus();
        if (onPaiementSubmitted) {
          onPaiementSubmitted();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erreur lors de la soumission du paiement');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'en_attente':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </span>
        );
      case 'valide':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Validé
          </span>
        );
      case 'rejete':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeté
          </span>
        );
      default:
        return <span className="text-gray-600">{statut}</span>;
    }
  };

  const getMethodePaiementLabel = (methode: string) => {
    switch (methode) {
      case 'virement_bancaire':
        return 'Virement bancaire';
      case 'mobile_money':
        return 'Mobile Money';
      default:
        return methode;
    }
  };

  const paiementValide = paiementStatus.find(p => p.statut === 'valide');
  const paiementEnAttente = paiementStatus.find(p => p.statut === 'en_attente');

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
      <div className="bg-blue-600 text-white px-4 py-3">
        <h3 className="text-lg font-semibold flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Paiement d'inscription
        </h3>
      </div>
      
      <div className="p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-800 text-sm">{success}</p>
            </div>
            <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800">
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Informations sur le montant */}
        {montantInfo && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-3 text-gray-700">Montant à payer</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Frais d'inscription:</span>
                <span className="font-medium">{montantInfo.frais_inscription?.toLocaleString() || 0} Ar</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Frais de scolarité:</span>
                <span className="font-medium">{montantInfo.frais_scolarite?.toLocaleString() || 0} Ar</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-semibold text-gray-700">Total:</span>
                <span className="font-bold text-blue-600 text-lg">
                  {montantInfo.montant_inscription?.toLocaleString() || 0} Ar
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Historique des paiements */}
        {paiementStatus.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold mb-3 text-gray-700">Historique des paiements</h4>
            <div className="space-y-2">
              {paiementStatus.map((paiement, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-sm">{getMethodePaiementLabel(paiement.methode_paiement)}</div>
                      <div className="text-xs text-gray-500">Réf: {paiement.reference_paiement}</div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(paiement.statut)}
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(paiement.date_paiement).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {paiement.statut === 'rejete' && paiement.motif_rejet && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                      <strong className="text-red-800">Motif du rejet:</strong>
                      <p className="text-red-700 mt-1">{paiement.motif_rejet}</p>
                    </div>
                  )}
                  {paiement.statut === 'valide' && paiement.note_validation && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                      <strong className="text-green-800">Note:</strong>
                      <p className="text-green-700 mt-1">{paiement.note_validation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bouton pour afficher le formulaire */}
        {!paiementValide && !paiementEnAttente && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Effectuer un paiement en ligne
          </button>
        )}

        {paiementValide && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-800 text-sm">
              Votre paiement a été validé. Votre inscription est confirmée.
            </span>
          </div>
        )}

        {paiementEnAttente && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
            <Clock className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 text-sm">
              Un paiement est en attente de validation par le caissier.
            </span>
          </div>
        )}

        {/* Formulaire de paiement */}
        {showForm && !paiementValide && !paiementEnAttente && (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Méthode de paiement *
              </label>
              <select
                value={formData.methodePaiement}
                onChange={(e) => setFormData({ ...formData, methodePaiement: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="virement_bancaire">Virement bancaire</option>
                <option value="mobile_money">Mobile Money (Orange Money, MVola, etc.)</option>
              </select>
            </div>

            {formData.methodePaiement === 'virement_bancaire' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <strong className="text-blue-900">Informations bancaires:</strong>
                <div className="mt-1 text-blue-800">
                  <div>Banque: BNI Madagascar</div>
                  <div>Compte: 00001-12345-67890</div>
                  <div>Titulaire: IMTECH UNIVERSITY</div>
                  <div className="text-xs mt-1">Veuillez effectuer le virement et indiquer la référence ci-dessous</div>
                </div>
              </div>
            )}

            {formData.methodePaiement === 'mobile_money' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <strong className="text-blue-900">Numéros Mobile Money:</strong>
                <div className="mt-1 text-blue-800">
                  <div>Orange Money: 032 XX XXX XX</div>
                  <div>MVola: 034 XX XXX XX</div>
                  <div className="text-xs mt-1">Effectuez le paiement et indiquez la référence de transaction</div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Référence de paiement *
              </label>
              <input
                type="text"
                placeholder="Ex: TRX123456789 ou numéro de virement"
                value={formData.referencePaiement}
                onChange={(e) => setFormData({ ...formData, referencePaiement: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Indiquez le numéro de transaction ou de virement</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant (Ar) *
              </label>
              <input
                type="number"
                value={formData.montant}
                onChange={(e) => setFormData({ ...formData, montant: parseFloat(e.target.value) })}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preuve de paiement (URL)
              </label>
              <input
                type="url"
                placeholder="https://exemple.com/preuve.jpg (optionnel)"
                value={formData.preuveUrl}
                onChange={(e) => setFormData({ ...formData, preuveUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Lien vers une capture d'écran ou photo de la preuve de paiement</p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Soumettre le paiement
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// Made with Bob
