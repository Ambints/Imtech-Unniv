import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { 
  CreditCard, DollarSign, User, Search, Plus, X, CheckCircle, 
  AlertCircle, Receipt, Printer, Download, Calendar, Clock,
  Smartphone, Building2, CreditCard as CardIcon, Wallet
} from 'lucide-react';

interface Etudiant {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  parcours: string;
  annee_academique: string;
  inscription_id: string;
  statut_inscription: string;
}

interface PaiementForm {
  etudiantId: string;
  inscriptionId: string;
  montant: string;
  modePaiement: string;
  typePaiement: string;
  referenceExterne: string;
  observations: string;
}

interface Recu {
  numero: string;
  date: string;
  etudiant: string;
  parcours: string;
  montant: number;
  mode: string;
  type: string;
  caissier: string;
}

// Memoized StatCard component
const StatCard = React.memo(({ icon, label, value, color }: any) => (
  <div style={{
    background: '#fff',
    borderRadius: 12,
    padding: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex',
    alignItems: 'center',
    gap: 12
  }}>
    <div style={{
      width: 48,
      height: 48,
      borderRadius: 12,
      background: `${color}15`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>{value}</div>
    </div>
  </div>
));

export const EncaissementPage: React.FC = () => {
  const { user, tenant, accessToken } = useAuthStore();
  const tenantId = tenant?.id || '';
  
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [filteredEtudiants, setFilteredEtudiants] = useState<Etudiant[]>([]);
  const [selectedEtudiant, setSelectedEtudiant] = useState<Etudiant | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRecu, setShowRecu] = useState(false);
  const [recu, setRecu] = useState<Recu | null>(null);
  const [multiEncaissement, setMultiEncaissement] = useState(false);
  const [selectedEtudiants, setSelectedEtudiants] = useState<string[]>([]);
  
  // Cache pour les données avec expiration de 5 minutes
  const [dataCache, setDataCache] = useState<{[key: string]: {data: any, timestamp: number}}>({});
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const [form, setForm] = useState<PaiementForm>({
    etudiantId: '',
    inscriptionId: '',
    montant: '',
    modePaiement: 'especes',
    typePaiement: 'scolarite',
    referenceExterne: '',
    observations: ''
  });

  // Fonction pour récupérer les données du cache
  const getCachedData = useCallback((key: string) => {
    const cached = dataCache[key];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, [dataCache]);

  // Fonction pour mettre en cache les données
  const setCachedData = useCallback((key: string, data: any) => {
    setDataCache(prev => ({
      ...prev,
      [key]: { data, timestamp: Date.now() }
    }));
  }, []);

  useEffect(() => {
    loadEtudiants();
  }, [tenantId]);

  // Debouncing pour la recherche (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        const filtered = etudiants.filter(etudiant => 
          etudiant.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
          etudiant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          etudiant.prenom.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredEtudiants(filtered);
      } else {
        setFilteredEtudiants(etudiants);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, etudiants]);

  const loadEtudiants = useCallback(async () => {
    // Vérifier le cache d'abord
    const cachedData = getCachedData('etudiants');
    if (cachedData) {
      setEtudiants(cachedData);
      setFilteredEtudiants(cachedData);
      return;
    }

    try {
      const response = await fetch(`/api/v1/caissier/etudiants-valides`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEtudiants(data);
        setFilteredEtudiants(data);
        setCachedData('etudiants', data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des étudiants:', error);
      toast.error('Erreur de chargement des étudiants');
    }
  }, [accessToken, getCachedData, setCachedData]);

  const handleEtudiantSelect = useCallback((etudiant: Etudiant) => {
    setSelectedEtudiant(etudiant);
    setForm(prev => ({
      ...prev,
      etudiantId: etudiant.id,
      inscriptionId: etudiant.inscription_id
    }));
    setSearchTerm('');
    setFilteredEtudiants([]);
  }, []);

  const handlePaiement = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEtudiant || !form.montant) {
      toast.error('Veuillez sélectionner un étudiant et entrer un montant');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/v1/caissier/encaissement-direct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          inscriptionId: form.inscriptionId,
          modePaiement: form.modePaiement,
          montant: parseFloat(form.montant),
          typePaiement: form.typePaiement,
          detailsPaiement: {
            referenceExterne: form.referenceExterne,
            observations: form.observations
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setRecu({
          numero: data.numeroRecu,
          date: new Date().toLocaleDateString('fr-FR'),
          etudiant: `${selectedEtudiant.nom} ${selectedEtudiant.prenom}`,
          parcours: selectedEtudiant.parcours,
          montant: parseFloat(form.montant),
          mode: form.modePaiement,
          type: form.typePaiement,
          caissier: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Caissier'
        });
        setShowRecu(true);
        toast.success('Paiement enregistré avec succès!');
        
        // Reset form
        setForm({
          etudiantId: '',
          inscriptionId: '',
          montant: '',
          modePaiement: 'especes',
          typePaiement: 'scolarite',
          referenceExterne: '',
          observations: ''
        });
        setSelectedEtudiant(null);
        
        // Invalider le cache pour forcer le rechargement
        setDataCache(prev => {
          const newCache = { ...prev };
          delete newCache['etudiants'];
          return newCache;
        });
        loadEtudiants();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erreur lors du paiement');
      }
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }, [selectedEtudiant, form, accessToken, user, loadEtudiants]);

  const handleMultiEncaissement = useCallback(async () => {
    if (selectedEtudiants.length === 0) {
      toast.error('Veuillez sélectionner au moins un étudiant');
      return;
    }

    setLoading(true);
    try {
      const paiements = selectedEtudiants.map(etudiantId => {
        const etudiant = etudiants.find(e => e.id === etudiantId);
        return {
          inscriptionId: etudiant?.inscription_id,
          modePaiement: 'especes',
          montant: 150000, // Montant par défaut
          typePaiement: 'scolarite'
        };
      });

      const response = await fetch(`/api/v1/caissier/encaissement-multiple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ paiements })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`${data.succes} paiements enregistrés sur ${data.total}`);
        setSelectedEtudiants([]);
        setMultiEncaissement(false);
        
        // Invalider le cache
        setDataCache(prev => {
          const newCache = { ...prev };
          delete newCache['etudiants'];
          return newCache;
        });
        loadEtudiants();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erreur lors de l\'encaissement multiple');
      }
    } catch (error) {
      console.error('Erreur lors de l\'encaissement multiple:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }, [selectedEtudiants, etudiants, accessToken, loadEtudiants]);

  // Memoize fmt function
  const fmt = useCallback((n: number) => Number(n || 0).toLocaleString('fr-FR') + ' Ar', []);

  // Memoize options
  const modePaiementOptions = useMemo(() => [
    { value: 'especes', label: 'Espèces', icon: <Wallet size={20} /> },
    { value: 'cheque', label: 'Chèque', icon: <CreditCard size={20} /> },
    { value: 'virement', label: 'Virement', icon: <Building2 size={20} /> },
    { value: 'carte_bancaire', label: 'Carte Bancaire', icon: <CardIcon size={20} /> },
    { value: 'mobile_money', label: 'Mobile Money', icon: <Smartphone size={20} /> }
  ], []);

  const typePaiementOptions = useMemo(() => [
    { value: 'inscription', label: 'Frais d\'inscription', color: '#3b82f6' },
    { value: 'scolarite', label: 'Frais de scolarité', color: '#8b5cf6' },
    { value: 'retard', label: 'Pénalités de retard', color: '#ef4444' },
    { value: 'autre', label: 'Autre', color: '#64748b' }
  ], []);

  return (
    <div style={{ padding: 32, background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
              <CreditCard size={32} color="#1a5276" />
              Encaissement
            </h1>
            <p style={{ color: '#64748b', fontSize: 16, margin: '4px 0 0' }}>
              Enregistrer les paiements des étudiants
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setMultiEncaissement(!multiEncaissement)}
              style={{
                padding: '10px 20px',
                background: multiEncaissement ? '#1a5276' : '#fff',
                color: multiEncaissement ? '#fff' : '#1a5276',
                border: '2px solid #1a5276',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Plus size={18} />
              Encaissement Multiple
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: multiEncaissement ? '1fr 2fr' : '1fr 1fr', gap: 24 }}>
        {/* Recherche Étudiant */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Search size={20} color="#1a5276" />
            {multiEncaissement ? 'Sélection Multiple' : 'Recherche Étudiant'}
          </h3>

          {!multiEncaissement ? (
            <>
              <div style={{ position: 'relative', marginBottom: 20 }}>
                <input
                  type="text"
                  placeholder="Rechercher par matricule, nom ou prénom..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 44px',
                    border: '2px solid #e2e8f0',
                    borderRadius: 12,
                    fontSize: 14,
                    outline: 'none'
                  }}
                />
                <Search size={20} color="#64748b" style={{ position: 'absolute', left: 16, top: 14 }} />
              </div>

              {selectedEtudiant && (
                <div style={{
                  padding: 16,
                  background: '#f1f7ff',
                  border: '2px solid #3b82f6',
                  borderRadius: 12,
                  marginBottom: 20
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>
                        {selectedEtudiant.nom} {selectedEtudiant.prenom}
                      </h4>
                      <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 2px' }}>
                        Matricule: {selectedEtudiant.matricule}
                      </p>
                      <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 2px' }}>
                        Parcours: {selectedEtudiant.parcours}
                      </p>
                      <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                        {selectedEtudiant.annee_academique}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedEtudiant(null);
                        setForm(prev => ({ ...prev, etudiantId: '', inscriptionId: '' }));
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <X size={20} color="#ef4444" />
                    </button>
                  </div>
                </div>
              )}

              {filteredEtudiants.length > 0 && !selectedEtudiant && (
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {filteredEtudiants.map((etudiant) => (
                    <div
                      key={etudiant.id}
                      onClick={() => handleEtudiantSelect(etudiant)}
                      style={{
                        padding: 12,
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        marginBottom: 8,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.borderColor = '#1a5276'}
                      onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                            {etudiant.nom} {etudiant.prenom}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>
                            {etudiant.matricule}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 12, color: '#64748b' }}>
                            {etudiant.parcours}
                          </div>
                          <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>
                            {etudiant.statut_inscription}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {etudiants.map((etudiant) => (
                <div key={etudiant.id} style={{ display: 'flex', alignItems: 'center', padding: 8, borderBottom: '1px solid #f1f5f9' }}>
                  <input
                    type="checkbox"
                    checked={selectedEtudiants.includes(etudiant.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEtudiants([...selectedEtudiants, etudiant.id]);
                      } else {
                        setSelectedEtudiants(selectedEtudiants.filter(id => id !== etudiant.id));
                      }
                    }}
                    style={{ marginRight: 12 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                      {etudiant.nom} {etudiant.prenom}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {etudiant.matricule} • {etudiant.parcours}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {multiEncaissement && selectedEtudiants.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <button
                onClick={handleMultiEncaissement}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                {loading ? (
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Encaisser {selectedEtudiants.length} étudiant(s)
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Formulaire de Paiement */}
        {!multiEncaissement && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <DollarSign size={20} color="#1a5276" />
              Détails du Paiement
            </h3>

            <form onSubmit={handlePaiement}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Montant (Ar)
                </label>
                <input
                  type="number"
                  placeholder="150000"
                  value={form.montant}
                  onChange={(e) => setForm(prev => ({ ...prev, montant: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: 10,
                    fontSize: 14,
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Type de Paiement
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {typePaiementOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, typePaiement: option.value }))}
                      style={{
                        padding: '12px',
                        border: form.typePaiement === option.value ? `2px solid ${option.color}` : '2px solid #e2e8f0',
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 600,
                        background: form.typePaiement === option.value ? `${option.color}10` : '#fff',
                        color: form.typePaiement === option.value ? option.color : '#64748b',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Mode de Paiement
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {modePaiementOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, modePaiement: option.value }))}
                      style={{
                        padding: '12px',
                        border: form.modePaiement === option.value ? '2px solid #1a5276' : '2px solid #e2e8f0',
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 600,
                        background: form.modePaiement === option.value ? '#f1f7ff' : '#fff',
                        color: form.modePaiement === option.value ? '#1a5276' : '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        transition: 'all 0.2s'
                      }}
                    >
                      {option.icon}
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Référence Externe (Optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Numéro de chèque, référence virement..."
                  value={form.referenceExterne}
                  onChange={(e) => setForm(prev => ({ ...prev, referenceExterne: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: 10,
                    fontSize: 14,
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Observations (Optionnel)
                </label>
                <textarea
                  placeholder="Notes supplémentaires..."
                  value={form.observations}
                  onChange={(e) => setForm(prev => ({ ...prev, observations: e.target.value }))}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: 10,
                    fontSize: 14,
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !selectedEtudiant}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: loading || !selectedEtudiant ? '#94a3b8' : '#1a5276',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: loading || !selectedEtudiant ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                {loading ? (
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Enregistrer le Paiement
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Modal Reçu */}
      {showRecu && recu && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: 32,
            maxWidth: 500,
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#10b98115',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <CheckCircle size={32} color="#10b981" />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', margin: '0 0 8px' }}>
                Paiement Enregistré
              </h2>
              <p style={{ color: '#64748b', fontSize: 14 }}>
                Reçu N° {recu.numero}
              </p>
            </div>

            <div style={{
              background: '#f8fafc',
              borderRadius: 12,
              padding: 20,
              marginBottom: 24
            }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Étudiant</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>{recu.etudiant}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{recu.parcours}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Montant</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>{fmt(recu.montant)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Mode</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{recu.mode}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Type</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{recu.type}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Date</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{recu.date}</div>
                </div>
              </div>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Caissier</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{recu.caissier}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => window.print()}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#fff',
                  color: '#1a5276',
                  border: '2px solid #1a5276',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <Printer size={18} />
                Imprimer
              </button>
              <button
                onClick={() => setShowRecu(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#1a5276',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Made with Bob
