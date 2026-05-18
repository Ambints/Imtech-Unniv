import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';
import { GraduationCap, Award, CheckCircle, Clock, Download, Search, Filter, Eye, X, AlertCircle } from 'lucide-react';

interface Diplome {
  id: string;
  numeroDiplome: string;
  etudiant: {
    id: string;
    nom: string;
    prenom: string;
    matricule: string;
    etudiantNom: string;
  };
  parcours: {
    id: string;
    nom: string;
  };
  typeDiplome: string;
  dateObtention: Date;
  moyenneFinale: number;
  mentionGenerale: string;
  statut: string;
}

interface EtudiantEligible {
  etudiantId: string;
  matricule: string;
  nom: string;
  prenom: string;
  etudiantNom: string;
  parcours: {
    id: string;
    nom: string;
    niveau: string;
    typeDiplome: string;
  };
  anneeAcademique: string;
  moyenneGenerale: number;
  mention: string;
}

interface AnneeAcademique {
  id: string;
  libelle: string;
}

interface Parcours {
  id: string;
  nom: string;
}

const DiplomesPage: React.FC = () => {
  const { tenant } = useAuthStore();
  const [diplomes, setDiplomes] = useState<Diplome[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('all');
  
  // Filtres pour génération
  const [anneesAcademiques, setAnneesAcademiques] = useState<AnneeAcademique[]>([]);
  const [parcoursList, setParcoursList] = useState<Parcours[]>([]);
  const [selectedAnnee, setSelectedAnnee] = useState<string>('');
  const [selectedParcours, setSelectedParcours] = useState<string>('');
  
  // Prévisualisation
  const [showPreview, setShowPreview] = useState(false);
  const [etudiantsEligibles, setEtudiantsEligibles] = useState<EtudiantEligible[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    if (tenant?.id) {
      loadDiplomes();
      loadAnneesAcademiques();
      loadParcours();
    }
  }, [tenant]);

  const loadDiplomes = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/scolarite/${tenant?.id}/diplomes`);
      setDiplomes(response.data || []);
    } catch (error) {
      console.error('Erreur chargement diplômes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnneesAcademiques = async () => {
    try {
      const response = await api.get(`/academic/${tenant?.id}/annees`);
      setAnneesAcademiques(response.data || []);
    } catch (error) {
      console.error('Erreur chargement années:', error);
    }
  };

  const loadParcours = async () => {
    try {
      const response = await api.get(`/academic/${tenant?.id}/parcours`);
      setParcoursList(response.data || []);
    } catch (error) {
      console.error('Erreur chargement parcours:', error);
    }
  };

  const previsualiserEtudiants = async () => {
    try {
      setLoadingPreview(true);
      const params = new URLSearchParams();
      if (selectedAnnee) params.append('anneeAcademiqueId', selectedAnnee);
      if (selectedParcours) params.append('parcoursId', selectedParcours);
      
      const response = await api.get(`/scolarite/${tenant?.id}/diplomes/eligibles?${params.toString()}`);
      setEtudiantsEligibles(response.data.etudiants || []);
      setShowPreview(true);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la prévisualisation');
    } finally {
      setLoadingPreview(false);
    }
  };

  const genererDiplomes = async () => {
    if (!confirm(`Voulez-vous générer ${etudiantsEligibles.length} diplôme(s) ?`)) {
      return;
    }

    try {
      const response = await api.post(`/scolarite/${tenant?.id}/diplomes/generer`, {
        anneeAcademiqueId: selectedAnnee || undefined,
        parcoursId: selectedParcours || undefined
      });
      alert(response.data.message || `${response.data.generated} diplôme(s) généré(s)`);
      setShowPreview(false);
      setSelectedAnnee('');
      setSelectedParcours('');
      loadDiplomes();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la génération des diplômes');
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'en_preparation': return '#f59e0b';
      case 'pret_signature': return '#8b5cf6';
      case 'signe': return '#06b6d4';
      case 'delivre': return '#10b981';
      case 'retire': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getMentionColor = (mention: string) => {
    switch (mention) {
      case 'Très Bien': return '#10b981';
      case 'Bien': return '#3b82f6';
      case 'Assez Bien': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const filteredDiplomes = diplomes.filter(d => {
    const etudiantNom = d.etudiant?.etudiantNom || `${d.etudiant?.nom} ${d.etudiant?.prenom}`;
    const matchesSearch = etudiantNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.etudiant?.matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.numeroDiplome?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatut = filterStatut === 'all' || d.statut === filterStatut;
    return matchesSearch && matchesStatut;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#6b7280' }}>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <GraduationCap size={32} color="#3b82f6" />
          Gestion des Diplômes
        </h1>
        <p style={{ color: '#64748b' }}>Vérification des conditions d'obtention et génération des diplômes</p>
      </div>

      {/* Statistiques */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Total Diplômes</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#1e293b' }}>{diplomes.length}</p>
            </div>
            <Award size={24} color="#3b82f6" />
          </div>
        </div>

        <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Délivrés</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#10b981' }}>
                {diplomes.filter(d => d.statut === 'delivre').length}
              </p>
            </div>
            <CheckCircle size={24} color="#10b981" />
          </div>
        </div>

        <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>En préparation</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>
                {diplomes.filter(d => d.statut === 'en_preparation').length}
              </p>
            </div>
            <Clock size={24} color="#f59e0b" />
          </div>
        </div>

        <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Retirés</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#3b82f6' }}>
                {diplomes.filter(d => d.statut === 'retire').length}
              </p>
            </div>
            <Download size={24} color="#3b82f6" />
          </div>
        </div>
      </div>

      {/* Section Génération avec Filtres */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20, marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={20} />
          Générer de Nouveaux Diplômes
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6 }}>
              Année Académique
            </label>
            <select
              value={selectedAnnee}
              onChange={(e) => setSelectedAnnee(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              <option value="">Toutes les années</option>
              {anneesAcademiques.map(annee => (
                <option key={annee.id} value={annee.id}>{annee.libelle}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6 }}>
              Parcours
            </label>
            <select
              value={selectedParcours}
              onChange={(e) => setSelectedParcours(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              <option value="">Tous les parcours</option>
              {parcoursList.map(parcours => (
                <option key={parcours.id} value={parcours.id}>{parcours.nom}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={previsualiserEtudiants}
          disabled={loadingPreview}
          style={{
            padding: '10px 20px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            cursor: loadingPreview ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            opacity: loadingPreview ? 0.6 : 1
          }}
        >
          <Eye size={16} />
          {loadingPreview ? 'Chargement...' : 'Prévisualiser les Étudiants Éligibles'}
        </button>
      </div>

      {/* Modal Prévisualisation */}
      {showPreview && (
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
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: 'white',
            borderRadius: 12,
            maxWidth: 1000,
            width: '100%',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ padding: 20, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b' }}>
                Étudiants Éligibles ({etudiantsEligibles.length})
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                style={{
                  padding: 8,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
              {etudiantsEligibles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                  <AlertCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                  <p>Aucun étudiant éligible trouvé avec les filtres sélectionnés</p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f8fafc', position: 'sticky', top: 0 }}>
                    <tr>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#475569' }}>Matricule</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#475569' }}>Nom Complet</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#475569' }}>Parcours</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>Moyenne</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>Mention</th>
                    </tr>
                  </thead>
                  <tbody>
                    {etudiantsEligibles.map((etudiant, index) => (
                      <tr key={index} style={{ borderTop: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px 16px', fontSize: 14, color: '#334155', fontWeight: 600 }}>
                          {etudiant.matricule}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 14, color: '#334155' }}>
                          {etudiant.etudiantNom}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 14, color: '#334155' }}>
                          <div>
                            <div style={{ fontWeight: 500 }}>{etudiant.parcours.nom}</div>
                            <div style={{ fontSize: 12, color: '#64748b' }}>{etudiant.parcours.typeDiplome}</div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 14, textAlign: 'center', fontWeight: 600 }}>
                          {etudiant.moyenneGenerale.toFixed(2)}/20
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 500,
                            background: `${getMentionColor(etudiant.mention)}20`,
                            color: getMentionColor(etudiant.mention)
                          }}>
                            {etudiant.mention}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ padding: 20, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                onClick={() => setShowPreview(false)}
                style={{
                  padding: '10px 20px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
              <button
                onClick={genererDiplomes}
                disabled={etudiantsEligibles.length === 0}
                style={{
                  padding: '10px 20px',
                  background: etudiantsEligibles.length === 0 ? '#cbd5e1' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: etudiantsEligibles.length === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <GraduationCap size={16} />
                Générer {etudiantsEligibles.length} Diplôme(s)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des Diplômes */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: 20, borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>Liste des Diplômes</h2>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Rechercher par nom, matricule ou numéro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 14
                }}
              />
            </div>
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              style={{
                padding: '10px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              <option value="all">Tous les statuts</option>
              <option value="en_preparation">En préparation</option>
              <option value="pret_signature">Prêt signature</option>
              <option value="signe">Signé</option>
              <option value="delivre">Délivrés</option>
              <option value="retire">Retirés</option>
            </select>
          </div>
        </div>

        {filteredDiplomes.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
            <GraduationCap size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p>Aucun diplôme trouvé</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#475569' }}>N° Diplôme</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#475569' }}>Étudiant</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#475569' }}>Parcours</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#475569' }}>Type</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>Moyenne</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>Mention</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#475569' }}>Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>Statut</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDiplomes.map((diplome) => (
                  <tr key={diplome.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#334155', fontWeight: 600 }}>
                      {diplome.numeroDiplome || '-'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#334155' }}>
                      <div>
                        <div style={{ fontWeight: 500 }}>
                          {diplome.etudiant?.etudiantNom || `${diplome.etudiant?.nom} ${diplome.etudiant?.prenom}`}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{diplome.etudiant?.matricule}</div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#334155' }}>{diplome.parcours?.nom}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#334155' }}>
                      <span style={{
                        padding: '4px 8px',
                        background: '#f1f5f9',
                        borderRadius: 6,
                        fontSize: 12
                      }}>
                        {diplome.typeDiplome}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, textAlign: 'center', fontWeight: 600 }}>
                      {diplome.moyenneFinale?.toFixed(2)}/20
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 500,
                        background: `${getMentionColor(diplome.mentionGenerale)}20`,
                        color: getMentionColor(diplome.mentionGenerale)
                      }}>
                        {diplome.mentionGenerale}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#334155' }}>
                      {new Date(diplome.dateObtention).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 500,
                        background: `${getStatutColor(diplome.statut)}20`,
                        color: getStatutColor(diplome.statut)
                      }}>
                        {diplome.statut.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        style={{
                          padding: '6px 12px',
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          fontSize: 13,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <Download size={14} />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiplomesPage;

// Made with Bob
