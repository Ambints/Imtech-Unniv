import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import toast from 'react-hot-toast';
import { Users, Search, Mail, Phone, UserCheck, UserX, Briefcase, Eye, X, MapPin, Calendar, Building } from 'lucide-react';

interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  actif: boolean;
  telephone?: string;
  adresse?: string;
  dateNaissance?: string;
  dateEmbauche?: string;
  departement?: string;
}

export const PersonnelPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterActif, setFilterActif] = useState<boolean | undefined>(undefined);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Utilisateur | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/rh/utilisateurs');
      // Exclure les étudiants et le président
      const personnelOnly = (response.data || []).filter((u: Utilisateur) =>
        u.role !== 'etudiant' && u.role !== 'president'
      );
      setUtilisateurs(personnelOnly);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des utilisateurs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUtilisateurs = utilisateurs.filter(u => {
    const matchSearch = !searchTerm ||
      u.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchRole = !filterRole || u.role === filterRole;
    const matchActif = filterActif === undefined || u.actif === filterActif;
    
    return matchSearch && matchRole && matchActif;
  });

  const stats = {
    total: utilisateurs.length,
    actifs: utilisateurs.filter(u => u.actif).length,
    inactifs: utilisateurs.filter(u => !u.actif).length,
  };

  const handleViewDetails = (user: Utilisateur) => {
    setSelectedUser(user);
    setShowDetails(true);
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: '#3b82f6',
      enseignant: '#10b981',
      etudiant: '#f59e0b',
      secretaire: '#8b5cf6',
      rh: '#ec4899',
      caissier: '#14b8a6',
      default: '#64748b'
    };
    return colors[role] || colors.default;
  };

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 18, color: '#64748b' }}>Chargement...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Users size={32} /> Liste du Personnel
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Vue d'ensemble de tous les utilisateurs de l'établissement
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Total Personnel</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#1e293b' }}>{stats.total}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Actifs</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>{stats.actifs}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Inactifs</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#ef4444' }}>{stats.inactifs}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 250, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '11px 11px 11px 40px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          style={{ padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
        >
          <option value="">Tous les rôles</option>
          <option value="admin">Admin</option>
          <option value="enseignant">Enseignant</option>
          <option value="secretaire">Secrétaire</option>
          <option value="rh">RH</option>
          <option value="caissier">Caissier</option>
          <option value="responsable_pedagogique">Responsable Pédagogique</option>
          <option value="surveillant">Surveillant</option>
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
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Nom & Prénom
              </th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Email
              </th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Téléphone
              </th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Rôle
              </th>
              <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Statut
              </th>
              <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUtilisateurs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                  Aucun utilisateur trouvé
                </td>
              </tr>
            ) : (
              filteredUtilisateurs.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #148f77, #1a5276)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 14
                      }}>
                        {u.prenom[0]}{u.nom[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>
                          {u.prenom} {u.nom}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b' }}>
                      <Mail size={16} />
                      {u.email}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#64748b' }}>
                    {u.telephone ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Phone size={16} />
                        {u.telephone}
                      </div>
                    ) : (
                      <span style={{ color: '#cbd5e1' }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      background: `${getRoleBadgeColor(u.role)}15`,
                      color: getRoleBadgeColor(u.role)
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    {u.actif ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#10b981' }}>
                        <UserCheck size={18} />
                        <span style={{ fontSize: 13, fontWeight: 600 }}>Actif</span>
                      </div>
                    ) : (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#ef4444' }}>
                        <UserX size={18} />
                        <span style={{ fontSize: 13, fontWeight: 600 }}>Inactif</span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleViewDetails(u)}
                      style={{
                        padding: '8px 16px',
                        background: '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                    >
                      <Eye size={16} />
                      Détails
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Détails */}
      {showDetails && selectedUser && (
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
            background: '#fff',
            borderRadius: 16,
            maxWidth: 700,
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
          }}>
            {/* Header */}
            <div style={{
              padding: '24px 32px',
              borderBottom: '2px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #148f77, #1a5276)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 20
                }}>
                  {selectedUser.prenom[0]}{selectedUser.nom[0]}
                </div>
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: 0 }}>
                    {selectedUser.prenom} {selectedUser.nom}
                  </h2>
                  <span style={{
                    display: 'inline-block',
                    marginTop: 6,
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    background: `${getRoleBadgeColor(selectedUser.role)}15`,
                    color: getRoleBadgeColor(selectedUser.role)
                  }}>
                    {selectedUser.role}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 8,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: 32 }}>
              {/* Informations de contact */}
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Mail size={20} style={{ color: '#3b82f6' }} />
                  Informations de contact
                </h3>
                <div style={{ display: 'grid', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                    <Mail size={18} style={{ color: '#64748b', marginTop: 2 }} />
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Email</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{selectedUser.email}</div>
                    </div>
                  </div>
                  {selectedUser.telephone && (
                    <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                      <Phone size={18} style={{ color: '#64748b', marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Téléphone</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{selectedUser.telephone}</div>
                      </div>
                    </div>
                  )}
                  {selectedUser.adresse && (
                    <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                      <MapPin size={18} style={{ color: '#64748b', marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Adresse</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{selectedUser.adresse}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Informations professionnelles */}
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Briefcase size={20} style={{ color: '#3b82f6' }} />
                  Informations professionnelles
                </h3>
                <div style={{ display: 'grid', gap: 16 }}>
                  {selectedUser.departement && (
                    <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                      <Building size={18} style={{ color: '#64748b', marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Département</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{selectedUser.departement}</div>
                      </div>
                    </div>
                  )}
                  {selectedUser.dateEmbauche && (
                    <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                      <Calendar size={18} style={{ color: '#64748b', marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Date d'embauche</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                          {new Date(selectedUser.dateEmbauche).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                    {selectedUser.actif ? <UserCheck size={18} style={{ color: '#10b981', marginTop: 2 }} /> : <UserX size={18} style={{ color: '#ef4444', marginTop: 2 }} />}
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Statut</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: selectedUser.actif ? '#10b981' : '#ef4444' }}>
                        {selectedUser.actif ? 'Actif' : 'Inactif'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations personnelles */}
              {selectedUser.dateNaissance && (
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={20} style={{ color: '#3b82f6' }} />
                    Informations personnelles
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                    <Calendar size={18} style={{ color: '#64748b', marginTop: 2 }} />
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Date de naissance</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                        {new Date(selectedUser.dateNaissance).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div style={{ marginTop: 24, padding: 16, background: '#eff6ff', borderRadius: 12, border: '1px solid #bfdbfe' }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
          <Briefcase size={20} style={{ color: '#3b82f6', marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 600, color: '#1e40af', marginBottom: 4 }}>
              Gestion des contrats
            </div>
            <div style={{ fontSize: 14, color: '#1e40af' }}>
              Pour gérer les contrats de travail (CDI, CDD, Vacation), rendez-vous dans la section <strong>Contrats</strong>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonnelPage;

// Made with Bob