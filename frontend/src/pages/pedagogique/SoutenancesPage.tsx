import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import {
  Users, Calendar, Clock, MapPin, CheckCircle, XCircle, Plus, X,
  Eye, Award, FileText, Search, Filter
} from 'lucide-react';

interface Soutenance {
  id: string;
  stageMemoireId: string;
  etudiantId: string;
  dateSoutenance: Date;
  heureDebut: string;
  heureFin: string;
  salleId?: string;
  jury: any[];
  presidentJuryId?: string;
  noteRapport?: number;
  noteSoutenance?: number;
  noteFinale?: number;
  mention?: string;
  observations?: string;
  pvUrl?: string;
  statut: string;
  organisePar: string;
  stageMemoire?: {
    id: string;
    titre: string;
    type: string;
  };
  etudiant?: {
    id: string;
    nom: string;
    prenom: string;
    matricule?: string;
  };
  salle?: {
    id: string;
    libelle: string;
    capacite?: number;
  };
}

export const SoutenancesPage: React.FC = () => {
  const { user, tenant } = useAuthStore();
  const tid = tenant?.id || '';
  
  const [loading, setLoading] = useState(true);
  const [soutenances, setSoutenances] = useState<Soutenance[]>([]);
  const [filterStatut, setFilterStatut] = useState<string>('tous');
  const [showForm, setShowForm] = useState(false);
  const [selectedSoutenance, setSelectedSoutenance] = useState<Soutenance | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [formData, setFormData] = useState({
    stageMemoireId: '',
    dateSoutenance: '',
    heureDebut: '',
    heureFin: '',
    salleId: '',
    jury: [] as string[],
    presidentJuryId: ''
  });

  useEffect(() => {
    if (tid) loadSoutenances();
  }, [tid]);

  const loadSoutenances = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/pedagogique/${tid}/soutenances`);
      setSoutenances(response.data || []);
    } catch (err: any) {
      // Fallback data
      setSoutenances([
        {
          id: '1',
          stageMemoireId: 's1',
          etudiantId: 'et1',
          dateSoutenance: new Date('2024-07-15'),
          heureDebut: '09:00',
          heureFin: '11:00',
          salleId: 'salle1',
          jury: [{ id: 'j1', nom: 'Dr. ALI', role: 'Président' }, { id: 'j2', nom: 'Mme KONE', role: 'Rapporteur' }],
          presidentJuryId: 'j1',
          noteRapport: 14,
          noteSoutenance: 16,
          noteFinale: 15,
          mention: 'Bien',
          statut: 'termine',
          organisePar: user?.id || '',
          stageMemoire: { id: 's1', titre: 'Développement application gestion', type: 'memoire' },
          etudiant: { id: 'et1', nom: 'KOUASSI', prenom: 'Marie', matricule: 'ET2021001' },
          salle: { id: 'salle1', libelle: 'Amphithéâtre A' }
        },
        {
          id: '2',
          stageMemoireId: 's2',
          etudiantId: 'et2',
          dateSoutenance: new Date('2024-07-20'),
          heureDebut: '14:00',
          heureFin: '16:00',
          salleId: 'salle2',
          jury: [{ id: 'j3', nom: 'Dr. MARTIN', role: 'Président' }],
          statut: 'planifie',
          organisePar: user?.id || '',
          stageMemoire: { id: 's2', titre: 'IA dans l\'éducation', type: 'memoire' },
          etudiant: { id: 'et2', nom: 'YAO', prenom: 'Koffi', matricule: 'ET2021002' },
          salle: { id: 'salle2', libelle: 'Salle B203' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/pedagogique/${tid}/soutenances`, {
        ...formData,
        organisePar: user?.id
      });
      toast.success('Soutenance planifiée avec succès');
      setShowForm(false);
      loadSoutenances();
    } catch (err: any) {
      toast.error('Erreur lors de la planification');
    }
  };

  const handleUpdateNotes = async (id: string, notes: any) => {
    try {
      await api.patch(`/pedagogique/${tid}/soutenances/${id}/notes`, notes);
      toast.success('Notes enregistrées');
      loadSoutenances();
    } catch (err: any) {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const getStatutBadge = (statut: string) => {
    const styles: Record<string, { bg: string; color: string; label: string }> = {
      planifie: { bg: '#dbeafe', color: '#1e40af', label: 'Planifié' },
      en_cours: { bg: '#fef3c7', color: '#92400e', label: 'En cours' },
      termine: { bg: '#d1fae5', color: '#065f46', label: 'Terminé' },
      annule: { bg: '#fee2e2', color: '#991b1b', label: 'Annulé' }
    };
    const style = styles[statut] || styles.planifie;
    return (
      <span style={{
        padding: '6px 12px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        background: style.bg,
        color: style.color
      }}>
        {style.label}
      </span>
    );
  };

  const filteredSoutenances = filterStatut === 'tous' 
    ? soutenances 
    : soutenances.filter(s => s.statut === filterStatut);

  const stats = {
    total: soutenances.length,
    planifiees: soutenances.filter(s => s.statut === 'planifie').length,
    terminees: soutenances.filter(s => s.statut === 'termine').length,
    moyenne: soutenances.filter(s => s.noteFinale !== undefined).length > 0
      ? (soutenances.filter(s => s.noteFinale !== undefined).reduce((acc, s) => acc + (s.noteFinale || 0), 0) / 
         soutenances.filter(s => s.noteFinale !== undefined).length).toFixed(2)
      : '-'
  };

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Users size={32} /> Soutenances
          </h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>
            Planification et organisation des soutenances
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #148f77, #1a5276)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Plus size={18} /> Planifier une soutenance
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Total</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#1e293b' }}>{stats.total}</div>
        </div>
        <div style={{ background: '#dbeafe', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: '#1e40af', marginBottom: 4 }}>Planifiées</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#1e40af' }}>{stats.planifiees}</div>
        </div>
        <div style={{ background: '#d1fae5', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: '#065f46', marginBottom: 4 }}>Terminées</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#065f46' }}>{stats.terminees}</div>
        </div>
        <div style={{ background: '#fef3c7', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: '#92400e', marginBottom: 4 }}>Moyenne générale</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#92400e' }}>{stats.moyenne}/20</div>
        </div>
      </div>

      {/* Filtres */}
      <div style={{ marginBottom: 24, display: 'flex', gap: 8 }}>
        {['tous', 'planifie', 'en_cours', 'termine'].map((statut) => (
          <button
            key={statut}
            onClick={() => setFilterStatut(statut)}
            style={{
              padding: '8px 16px',
              background: filterStatut === statut ? '#1a5276' : '#fff',
              color: filterStatut === statut ? '#fff' : '#64748b',
              border: '1px solid ' + (filterStatut === statut ? '#1a5276' : '#e5e7eb'),
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {statut === 'tous' ? 'Toutes' : statut === 'planifie' ? 'Planifiées' : statut === 'en_cours' ? 'En cours' : 'Terminées'}
          </button>
        ))}
      </div>

      {/* Formulaire */}
      {showForm && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 24, marginBottom: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>Planifier une soutenance</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={24} color="#64748b" />
            </button>
          </div>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Stage/Mémoire *</label>
                <select
                  required
                  value={formData.stageMemoireId}
                  onChange={(e) => setFormData({ ...formData, stageMemoireId: e.target.value })}
                  style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                >
                  <option value="">Sélectionner</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Date *</label>
                <input
                  type="date"
                  required
                  value={formData.dateSoutenance}
                  onChange={(e) => setFormData({ ...formData, dateSoutenance: e.target.value })}
                  style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Heure début *</label>
                <input
                  type="time"
                  required
                  value={formData.heureDebut}
                  onChange={(e) => setFormData({ ...formData, heureDebut: e.target.value })}
                  style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Heure fin *</label>
                <input
                  type="time"
                  required
                  value={formData.heureFin}
                  onChange={(e) => setFormData({ ...formData, heureFin: e.target.value })}
                  style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '13px',
                  background: 'linear-gradient(135deg, #148f77, #1a5276)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Planifier
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: '13px 24px',
                  background: '#fff',
                  color: '#64748b',
                  border: '2px solid #e5e7eb',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des soutenances */}
      <div style={{ display: 'grid', gap: 16 }}>
        {filteredSoutenances.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center' }}>
            <Users size={48} color="#cbd5e1" />
            <p style={{ color: '#64748b', marginTop: 12 }}>Aucune soutenance trouvée</p>
          </div>
        ) : (
          filteredSoutenances.map((soutenance) => (
            <div
              key={soutenance.id}
              style={{
                background: '#fff',
                borderRadius: 14,
                padding: 20,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      {soutenance.etudiant?.prenom} {soutenance.etudiant?.nom} - {soutenance.stageMemoire?.titre}
                    </h3>
                    {getStatutBadge(soutenance.statut)}
                  </div>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={14} />
                      {new Date(soutenance.dateSoutenance).toLocaleDateString('fr-FR')}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={14} />
                      {soutenance.heureDebut} - {soutenance.heureFin}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={14} />
                      {soutenance.salle?.libelle || 'Salle non définie'}
                    </span>
                    {soutenance.etudiant?.matricule && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FileText size={14} />
                        {soutenance.etudiant.matricule}
                      </span>
                    )}
                  </div>

                  {/* Jury */}
                  {soutenance.jury && soutenance.jury.length > 0 && (
                    <div style={{ marginTop: 12, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Jury:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {soutenance.jury.map((j: any, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: '4px 10px',
                              background: j.role === 'Président' ? '#fef3c7' : '#f1f5f9',
                              color: j.role === 'Président' ? '#92400e' : '#64748b',
                              borderRadius: 12,
                              fontSize: 12
                            }}
                          >
                            {j.nom} ({j.role})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {soutenance.noteFinale !== undefined && (
                    <div style={{ marginTop: 12, display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Award size={16} color="#1a5276" />
                        <span style={{ fontWeight: 700, color: '#1a5276', fontSize: 16 }}>
                          {soutenance.noteFinale}/20
                        </span>
                        <span style={{ fontSize: 12, color: '#64748b' }}>({soutenance.mention})</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>
                        Rapport: {soutenance.noteRapport}/20 • Soutenance: {soutenance.noteSoutenance}/20
                      </div>
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => { setSelectedSoutenance(soutenance); setShowDetailModal(true); }}
                    style={{
                      padding: '8px',
                      background: '#f1f5f9',
                      color: '#64748b',
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer'
                    }}
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SoutenancesPage;
