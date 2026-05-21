import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import {
  Users, Plus, Search, Filter, Edit2, Trash2, Eye, X, Save,
  Mail, Phone, MapPin, Calendar, Briefcase, DollarSign
} from 'lucide-react';

interface Personnel {
  id: string;
  utilisateurId: string;
  typeContrat: string;
  poste: string;
  departementId?: string;
  dateDebut: string;
  dateFin?: string;
  salaireBrut: number;
  salaireNet: number;
  volumeHoraireHebdo?: number;
  actif: boolean;
  observations?: string;
  utilisateurNom?: string;
  utilisateurPrenom?: string;
  departementNom?: string;
}

interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
}

interface Departement {
  id: string;
  nom: string;
  code: string;
}

export const ContratsPage: React.FC = () => {
  const { tenant } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterActif, setFilterActif] = useState<boolean | undefined>(undefined);

  const [formData, setFormData] = useState({
    utilisateurId: '',
    typeContrat: 'CDI',
    poste: '',
    departementId: '',
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: '',
    salaireBrut: 0,
    salaireNet: 0,
    volumeHoraireHebdo: 40,
    actif: true,
    observations: ''
  });

  useEffect(() => {
    loadData();
  }, [filterType, filterActif]);

  const loadData = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (filterType) filters.typeContrat = filterType;
      if (filterActif !== undefined) filters.actif = filterActif;

      const [contratsRes, utilisateursRes, departementsRes] = await Promise.all([
        api.get('/rh/contrats', { params: filters }),
        api.get('/rh/utilisateurs'),
        api.get('/rh/departements')
      ]);

      setPersonnel(contratsRes.data || []);
      setUtilisateurs(utilisateursRes.data || []);
      setDepartements(departementsRes.data || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des données');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        salaireBrut: Number(formData.salaireBrut),
        salaireNet: Number(formData.salaireNet),
        volumeHoraireHebdo: Number(formData.volumeHoraireHebdo),
        dateFin: formData.dateFin || null
      };

      if (editingId) {
        await api.patch(`/rh/contrats/${editingId}`, data);
        toast.success('Contrat mis à jour avec succès');
      } else {
        await api.post('/rh/contrats', data);
        toast.success('Contrat créé avec succès');
      }

      setShowForm(false);
      setEditingId(null);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Personnel) => {
    setFormData({
      utilisateurId: item.utilisateurId,
      typeContrat: item.typeContrat,
      poste: item.poste,
      departementId: item.departementId || '',
      dateDebut: item.dateDebut.split('T')[0],
      dateFin: item.dateFin ? item.dateFin.split('T')[0] : '',
      salaireBrut: item.salaireBrut,
      salaireNet: item.salaireNet,
      volumeHoraireHebdo: item.volumeHoraireHebdo || 40,
      actif: item.actif,
      observations: item.observations || ''
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleResilier = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir résilier ce contrat ?')) return;

    const motif = prompt('Motif de résiliation :');
    if (!motif) return;

    try {
      await api.patch(`/rh/contrats/${id}/resilier`, { motif });
      toast.success('Contrat résilié');
      loadData();
    } catch (error: any) {
      toast.error('Erreur lors de la résiliation');
    }
  };

  const resetForm = () => {
    setFormData({
      utilisateurId: '',
      typeContrat: 'CDI',
      poste: '',
      departementId: '',
      dateDebut: new Date().toISOString().split('T')[0],
      dateFin: '',
      salaireBrut: 0,
      salaireNet: 0,
      volumeHoraireHebdo: 40,
      actif: true,
      observations: ''
    });
    setEditingId(null);
  };

  const filteredPersonnel = personnel.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    return (
      p.utilisateurNom?.toLowerCase().includes(searchLower) ||
      p.utilisateurPrenom?.toLowerCase().includes(searchLower) ||
      p.poste?.toLowerCase().includes(searchLower) ||
      p.departementNom?.toLowerCase().includes(searchLower)
    );
  });

  const stats = {
    total: personnel.length,
    actifs: personnel.filter(p => p.actif).length,
    cdi: personnel.filter(p => p.typeContrat === 'CDI').length,
    cdd: personnel.filter(p => p.typeContrat === 'CDD').length,
    vacataires: personnel.filter(p => p.typeContrat === 'Vacation').length,
    masseSalariale: personnel.filter(p => p.actif).reduce((sum, p) => sum + p.salaireBrut, 0)
  };

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Briefcase size={32} /> Gestion des Contrats
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Gestion des contrats de travail (CDI, CDD, Vacation, Stage)
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Total Personnel</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#1e293b' }}>{stats.total}</div>
          <div style={{ fontSize: 11, color: '#10b981', marginTop: 4 }}>
            {stats.actifs} actifs
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>CDI</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>{stats.cdi}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>CDD</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#3b82f6' }}>{stats.cdd}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Vacataires</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#f59e0b' }}>{stats.vacataires}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Masse Salariale</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#8b5cf6' }}>
            {stats.masseSalariale.toLocaleString()} Ar
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 250, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '11px 11px 11px 40px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
        >
          <option value="">Tous les types</option>
          <option value="CDI">CDI</option>
          <option value="CDD">CDD</option>
          <option value="Vacation">Vacation</option>
          <option value="Stage">Stage</option>
        </select>
        <select
          value={filterActif === undefined ? '' : filterActif ? 'true' : 'false'}
          onChange={(e) => setFilterActif(e.target.value === '' ? undefined : e.target.value === 'true')}
          style={{ padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
        >
          <option value="">Tous les statuts</option>
          <option value="true">Actifs</option>
          <option value="false">Inactifs</option>
        </select>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          style={{
            padding: '11px 20px',
            background: 'linear-gradient(135deg, #148f77, #1a5276)',
            color: '#fff',
            border: 'none',
            borderRadius: 9,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Plus size={18} /> Nouveau Contrat
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 24, maxWidth: 800, width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {editingId ? 'Modifier le contrat' : 'Nouveau contrat'}
              </h3>
              <button onClick={() => { setShowForm(false); resetForm(); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Utilisateur *
                  </label>
                  <select
                    required
                    value={formData.utilisateurId}
                    onChange={(e) => setFormData(prev => ({ ...prev, utilisateurId: e.target.value }))}
                    style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                  >
                    <option value="">Sélectionner un utilisateur</option>
                    {utilisateurs.map(u => (
                      <option key={u.id} value={u.id}>{u.prenom} {u.nom} ({u.email})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Type de contrat *
                  </label>
                  <select
                    required
                    value={formData.typeContrat}
                    onChange={(e) => setFormData(prev => ({ ...prev, typeContrat: e.target.value }))}
                    style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                  >
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Vacation">Vacation</option>
                    <option value="Stage">Stage</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Poste *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.poste}
                    onChange={(e) => setFormData(prev => ({ ...prev, poste: e.target.value }))}
                    style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Département
                  </label>
                  <select
                    value={formData.departementId}
                    onChange={(e) => setFormData(prev => ({ ...prev, departementId: e.target.value }))}
                    style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                  >
                    <option value="">Aucun</option>
                    {departements.map(d => (
                      <option key={d.id} value={d.id}>{d.nom}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Date de début *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dateDebut}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateDebut: e.target.value }))}
                    style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                  />
                </div>

                {formData.typeContrat !== 'CDI' && (
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                      Date de fin {formData.typeContrat === 'CDD' ? '*' : ''}
                    </label>
                    <input
                      type="date"
                      required={formData.typeContrat === 'CDD'}
                      value={formData.dateFin}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateFin: e.target.value }))}
                      style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                    />
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Salaire brut (Ar) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.salaireBrut}
                    onChange={(e) => setFormData(prev => ({ ...prev, salaireBrut: Number(e.target.value) }))}
                    style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Salaire net (Ar) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.salaireNet}
                    onChange={(e) => setFormData(prev => ({ ...prev, salaireNet: Number(e.target.value) }))}
                    style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Volume horaire hebdo
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.volumeHoraireHebdo}
                    onChange={(e) => setFormData(prev => ({ ...prev, volumeHoraireHebdo: Number(e.target.value) }))}
                    style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#374151', marginTop: 28 }}>
                    <input
                      type="checkbox"
                      checked={formData.actif}
                      onChange={(e) => setFormData(prev => ({ ...prev, actif: e.target.checked }))}
                    />
                    Contrat actif
                  </label>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Observations
                  </label>
                  <textarea
                    value={formData.observations}
                    onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                    rows={3}
                    style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14, resize: 'vertical' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '13px',
                    background: loading ? '#94a3b8' : 'linear-gradient(135deg, #148f77, #1a5276)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <Save size={18} /> {loading ? 'Enregistrement...' : (editingId ? 'Mettre à jour' : 'Créer')}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); resetForm(); }}
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
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e5e7eb' }}>Nom</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e5e7eb' }}>Poste</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e5e7eb' }}>Département</th>
              <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e5e7eb' }}>Type</th>
              <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e5e7eb' }}>Statut</th>
              <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e5e7eb' }}>Salaire</th>
              <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
                  Chargement...
                </td>
              </tr>
            ) : filteredPersonnel.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: 'center' }}>
                  <Users size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
                  <p style={{ color: '#64748b' }}>Aucun personnel trouvé</p>
                </td>
              </tr>
            ) : (
              filteredPersonnel.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>
                      {p.utilisateurPrenom} {p.utilisateurNom}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748b' }}>{p.poste}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748b' }}>{p.departementNom || '-'}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 600,
                      background: p.typeContrat === 'CDI' ? '#dbeafe' : p.typeContrat === 'CDD' ? '#fce7f3' : '#fef3c7',
                      color: p.typeContrat === 'CDI' ? '#1e40af' : p.typeContrat === 'CDD' ? '#be185d' : '#f59e0b'
                    }}>
                      {p.typeContrat}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 600,
                      background: p.actif ? '#d1fae5' : '#fee2e2',
                      color: p.actif ? '#065f46' : '#991b1b'
                    }}>
                      {p.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                    {p.salaireBrut ? p.salaireBrut.toLocaleString() : '0'} Ar
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleEdit(p)}
                        style={{
                          padding: '8px',
                          background: '#f1f5f9',
                          color: '#64748b',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer'
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      {p.actif && (
                        <button
                          onClick={() => handleResilier(p.id)}
                          style={{
                            padding: '8px',
                            background: '#fef2f2',
                            color: '#dc2626',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContratsPage;

// Made with Bob
