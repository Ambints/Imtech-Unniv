import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { CheckCircle, XCircle, Clock, Eye, AlertTriangle, RefreshCw } from 'lucide-react';

interface PaiementInscription {
  id: string;
  inscription_id: string;
  etudiant_id: string;
  etudiant_nom: string;
  etudiant_prenom: string;
  etudiant_matricule: string;
  montant: number;
  methode_paiement: string;
  reference_paiement: string;
  date_paiement: string;
  preuve_url: string | null;
  statut: string;
  annee_niveau: number;
  parcours_nom: string;
  annee_academique: string;
  valide_par: string | null;
  date_validation: string | null;
  note_validation: string | null;
  motif_rejet: string | null;
  validateur_nom: string | null;
  validateur_prenom: string | null;
}

export const ValidationPaiementsPage: React.FC = () => {
  const { tenant, accessToken, user } = useAuthStore();
  const tenantId = tenant?.id || 'default';
  const [paiements, setPaiements] = useState<PaiementInscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedPaiement, setSelectedPaiement] = useState<PaiementInscription | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<'valider' | 'rejeter'>('valider');
  const [noteValidation, setNoteValidation] = useState('');
  const [motifRejet, setMotifRejet] = useState('');
  const [filterStatut, setFilterStatut] = useState<'en_attente' | 'tous'>('en_attente');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadPaiements();
    loadStats();
  }, [filterStatut]);

  const loadPaiements = async () => {
    setLoading(true);
    try {
      const url = filterStatut === 'en_attente'
        ? `/api/v1/finance/paiements-inscription/en-attente`
        : `/api/v1/finance/paiements-inscription`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPaiements(data);
      } else {
        setError('Erreur lors du chargement des paiements');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`/api/v1/finance/paiements-inscription/statistiques`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Erreur chargement stats:', err);
    }
  };

  const handleAction = (paiement: PaiementInscription, type: 'valider' | 'rejeter') => {
    setSelectedPaiement(paiement);
    setActionType(type);
    setShowModal(true);
    setNoteValidation('');
    setMotifRejet('');
  };

  const handleSubmitAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaiement) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const endpoint = actionType === 'valider' ? 'valider' : 'rejeter';
      const body = actionType === 'valider'
        ? { caissierId: user?.id, noteValidation }
        : { caissierId: user?.id, motifRejet };

      const response = await fetch(
        `/api/v1/finance/paiements-inscription/${selectedPaiement.id}/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSuccess(data.message || `Paiement ${actionType === 'valider' ? 'validé' : 'rejeté'} avec succès`);
        setShowModal(false);
        loadPaiements();
        loadStats();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erreur lors de l\'action');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
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

  return (
    <div className="container-fluid p-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Validation des paiements d'inscription</h2>
        <p className="text-gray-600">Gérez les paiements soumis par les étudiants</p>
      </div>

      {/* Alertes */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
          <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
            <XCircle className="w-4 h-4" />
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
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">En attente</p>
                <p className="text-2xl font-bold text-yellow-800">{stats.en_attente || 0}</p>
                <p className="text-xs text-yellow-600 mt-1">
                  {(stats.total_en_attente || 0).toLocaleString()} Ar
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Validés</p>
                <p className="text-2xl font-bold text-green-800">{stats.valides || 0}</p>
                <p className="text-xs text-green-600 mt-1">
                  {(stats.total_valide || 0).toLocaleString()} Ar
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Rejetés</p>
                <p className="text-2xl font-bold text-red-800">{stats.rejetes || 0}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <button
              onClick={() => { loadPaiements(); loadStats(); }}
              className="w-full h-full flex flex-col items-center justify-center text-blue-600 hover:text-blue-800"
            >
              <RefreshCw className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">Actualiser</span>
            </button>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatut('en_attente')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatut === 'en_attente'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            En attente ({stats?.en_attente || 0})
          </button>
          <button
            onClick={() => setFilterStatut('tous')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatut === 'tous'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous les paiements
          </button>
        </div>
      </div>

      {/* Liste des paiements */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : paiements.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun paiement à afficher</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Étudiant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parcours</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Méthode</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Référence</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paiements.map((paiement) => (
                  <tr key={paiement.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {paiement.etudiant_prenom} {paiement.etudiant_nom}
                        </div>
                        <div className="text-xs text-gray-500">{paiement.etudiant_matricule}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{paiement.parcours_nom}</div>
                      <div className="text-xs text-gray-500">{paiement.annee_academique}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{paiement.montant.toLocaleString()} Ar</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-700">{getMethodePaiementLabel(paiement.methode_paiement)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-mono text-gray-700">{paiement.reference_paiement}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-700">
                        {new Date(paiement.date_paiement).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(paiement.statut)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {paiement.statut === 'en_attente' && (
                          <>
                            <button
                              onClick={() => handleAction(paiement, 'valider')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Valider"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleAction(paiement, 'rejeter')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Rejeter"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {paiement.preuve_url && (
                          <a
                            href={paiement.preuve_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Voir la preuve"
                          >
                            <Eye className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de confirmation */}
      {showModal && selectedPaiement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">
                {actionType === 'valider' ? 'Valider le paiement' : 'Rejeter le paiement'}
              </h3>
            </div>
            <form onSubmit={handleSubmitAction}>
              <div className="p-4">
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Étudiant:</p>
                  <p className="font-medium">
                    {selectedPaiement.etudiant_prenom} {selectedPaiement.etudiant_nom}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">Montant:</p>
                  <p className="font-medium">{selectedPaiement.montant.toLocaleString()} Ar</p>
                  <p className="text-sm text-gray-600 mt-2">Référence:</p>
                  <p className="font-mono text-sm">{selectedPaiement.reference_paiement}</p>
                </div>

                {actionType === 'valider' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Note de validation (optionnel)
                    </label>
                    <textarea
                      value={noteValidation}
                      onChange={(e) => setNoteValidation(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      rows={3}
                      placeholder="Ajouter une note..."
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Motif du rejet *
                    </label>
                    <textarea
                      value={motifRejet}
                      onChange={(e) => setMotifRejet(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows={3}
                      placeholder="Indiquez le motif du rejet..."
                      required
                    />
                  </div>
                )}
              </div>
              <div className="p-4 border-t flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                    actionType === 'valider'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={loading}
                >
                  {loading ? 'Traitement...' : actionType === 'valider' ? 'Valider' : 'Rejeter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Made with Bob
