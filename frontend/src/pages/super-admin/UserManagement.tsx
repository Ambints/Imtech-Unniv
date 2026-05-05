import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersApi, tenantsApi } from '../../api/client';
import { 
  Users, Plus, Edit, Trash2, Search, Filter, 
  CheckCircle, XCircle, Shield, User, Crown
} from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  photoUrl?: string;
  role: string;
  actif: boolean;
  createdAt: string;
  tenantId?: string;
  university?: string;
}

interface TenantOption {
  id: string;
  nom: string;
}

interface KpiCardProps {
  icon: React.ReactNode;
  iconBg: string;
  trend: string;
  trendColor: string;
  value: number;
  valueColor?: string;
  label: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon, iconBg, trend, trendColor, value, valueColor, label }) => (
  <div style={{
    background: '#FAFAF7',
    border: '1px solid rgba(15,25,35,0.10)',
    borderRadius: '12px',
    padding: '16px',
    transition: 'box-shadow 0.2s'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
      <div style={{
        width: '32px', 
        height: '32px', 
        borderRadius: '8px', 
        background: iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </div>
      <span style={{ fontSize: '11px', fontWeight: 600, color: trendColor }}>{trend}</span>
    </div>
    <div style={{ fontSize: '24px', fontWeight: 700, color: valueColor || '#0F1923', lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: '11px', color: '#9AA3AE', marginTop: '4px' }}>{label}</div>
  </div>
);

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    super_admin: 'Super Admin',
    president: 'Président',
    responsable_pedagogique: 'Resp. Pédagogique',
    secretaire_parcours: 'Secrétaire Parcours',
    surveillant_general: 'Surveillant Général',
    scolarite: 'Scolarité',
    rh: 'RH',
    economat: 'Économat',
    caissier: 'Caissier',
    communication: 'Communication',
    admin: 'Admin',
    responsable_logistique: 'Resp. Logistique',
    service_entretien: 'Service Entretien',
    etudiant: 'Étudiant',
    parent: 'Parent',
    professeur: 'Professeur'
  };
  return labels[role] || role;
};

const getRoleIcon = (role: string) => {
  if (role === 'super_admin') return <Crown style={{ width: 14, height: 14 }} />;
  if (role === 'president') return <Shield style={{ width: 14, height: 14 }} />;
  return <User style={{ width: 14, height: 14 }} />;
};

const getRoleBadgeStyle = (role: string) => {
  if (role === 'super_admin') {
    return { background: '#FEF3C7', color: '#92400E', border: '1px solid rgba(146,64,14,0.3)' };
  }
  if (role === 'president') {
    return { background: '#DBEAFE', color: '#1E40AF', border: '1px solid rgba(30,64,175,0.3)' };
  }
  if (role === 'admin') {
    return { background: '#D1FAE5', color: '#059669', border: '1px solid rgba(5,150,105,0.3)' };
  }
  return { background: '#E0E7FF', color: '#4338CA', border: '1px solid rgba(67,56,202,0.3)' };
};

// Rôles modifiables (super_admin, admin, president)
const EDITABLE_ROLES = ['super_admin', 'admin', 'president'];

export const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterUniversity, setFilterUniversity] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tenants, setTenants] = useState<TenantOption[]>([]);

  useEffect(() => {
    loadUsers();
    loadTenants();
  }, [filterRole, filterUniversity]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getAll(undefined, filterRole || undefined, filterUniversity || undefined);
      setUsers(data);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                           err.message || 
                           'Erreur lors du chargement des utilisateurs';
      setError(errorMessage);
      console.error('Erreur API:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTenants = async () => {
    try {
      const data = await tenantsApi.getAll();
      setTenants(data.map((t: any) => ({ id: t.id, nom: t.nom })));
    } catch (err) {
      console.warn('Could not load tenants for filter:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await usersApi.remove(id);
      setUsers(users.filter(u => u.id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.nom.toLowerCase().includes(searchLower) ||
      user.prenom.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F5F0' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%',
      background: '#F5F5F0'
    }}>
      {/* Topbar */}
      <header style={{ 
        background: '#FAFAF7', 
        borderBottom: '1px solid rgba(15,25,35,0.10)', 
        padding: '0 28px', 
        height: '56px',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#0F1923', letterSpacing: '-0.01em' }}>
          Gestion des Utilisateurs
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/super-admin/users/create')}
            style={{
              padding: '8px 16px',
              background: '#2563eb',
              color: '#fff',
              borderRadius: '8px',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus style={{ width: 16, height: 16 }} />
            Nouvel Utilisateur
          </button>
        </div>
      </header>

      <div style={{
        padding: '24px 28px',
        flex: 1
      }}>
        {error && (
          <div style={{ 
            marginBottom: '20px', 
            padding: '12px 16px', 
            background: '#FEF2F2', 
            border: '1px solid #FECACA',
            borderRadius: '10px',
            color: '#DC2626',
            fontSize: '13px'
          }}>
            {error}
          </div>
        )}

        {/* KPI Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          <KpiCard 
            icon={<Users style={{ width: 16, height: 16, color: '#2563eb' }} />}
            iconBg="#DBEAFE"
            trend="Total"
            trendColor="#6B7280"
            value={users.length}
            label="Utilisateurs"
          />
          <KpiCard 
            icon={<Crown style={{ width: 16, height: 16, color: '#92400E' }} />}
            iconBg="#FEF3C7"
            trend="Super Admins"
            trendColor="#92400E"
            value={users.filter(u => u.role === 'super_admin').length}
            valueColor="#92400E"
            label="Administrateurs"
          />
          <KpiCard 
            icon={<Shield style={{ width: 16, height: 16, color: '#1E40AF' }} />}
            iconBg="#DBEAFE"
            trend="Présidents"
            trendColor="#1E40AF"
            value={users.filter(u => u.role === 'president').length}
            valueColor="#1E40AF"
            label="Dirigeants"
          />
          <KpiCard 
            icon={<CheckCircle style={{ width: 16, height: 16, color: '#059669' }} />}
            iconBg="#D1FAE5"
            trend="Actifs"
            trendColor="#059669"
            value={users.filter(u => u.actif).length}
            valueColor="#059669"
            label="En service"
          />
        </div>

        {/* Card - Liste des utilisateurs */}
        <div style={{ background: '#FAFAF7', border: '1px solid rgba(15,25,35,0.10)', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(15,25,35,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#0F1923' }}>Liste des Utilisateurs</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ width: 14, height: 14, color: '#9AA3AE', position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  placeholder="Rechercher..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ padding: '7px 12px 7px 30px', fontSize: '12px', border: '1px solid rgba(15,25,35,0.10)', borderRadius: '8px', background: '#F5F5F0', width: '200px' }} 
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                style={{ 
                  padding: '7px 12px', 
                  fontSize: '12px', 
                  border: '1px solid rgba(15,25,35,0.10)', 
                  borderRadius: '8px', 
                  background: '#F5F5F0',
                  cursor: 'pointer',
                  minWidth: '150px'
                }}
              >
                <option value="">Tous les rôles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="president">Président</option>
                <option value="responsable_pedagogique">Resp. Pédagogique</option>
                <option value="secretaire_parcours">Secrétaire Parcours</option>
                <option value="surveillant_general">Surveillant Général</option>
                <option value="scolarite">Scolarité</option>
                <option value="rh">RH</option>
                <option value="economat">Économat</option>
                <option value="caissier">Caissier</option>
                <option value="communication">Communication</option>
                <option value="responsable_logistique">Resp. Logistique</option>
                <option value="service_entretien">Service Entretien</option>
                <option value="professeur">Professeur</option>
                <option value="etudiant">Étudiant</option>
                <option value="parent">Parent</option>
              </select>
              <select
                value={filterUniversity}
                onChange={(e) => setFilterUniversity(e.target.value)}
                style={{ 
                  padding: '7px 12px', 
                  fontSize: '12px', 
                  border: '1px solid rgba(15,25,35,0.10)', 
                  borderRadius: '8px', 
                  background: '#F5F5F0',
                  cursor: 'pointer',
                  minWidth: '180px'
                }}
              >
                <option value="">Toutes les universités</option>
                {tenants.map(tenant => (
                  <option key={tenant.id} value={tenant.id}>{tenant.nom}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9AA3AE', textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid rgba(15,25,35,0.10)' }}>Utilisateur</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9AA3AE', textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid rgba(15,25,35,0.10)' }}>Email</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9AA3AE', textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid rgba(15,25,35,0.10)' }}>Téléphone</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9AA3AE', textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid rgba(15,25,35,0.10)' }}>Université</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9AA3AE', textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid rgba(15,25,35,0.10)' }}>Rôle</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9AA3AE', textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid rgba(15,25,35,0.10)' }}>Status</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9AA3AE', textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid rgba(15,25,35,0.10)' }}>Créé le</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9AA3AE', textAlign: 'right', padding: '12px 16px', borderBottom: '1px solid rgba(15,25,35,0.10)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid rgba(15,25,35,0.04)' }}>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {user.photoUrl ? (
                          <img src={user.photoUrl} alt={`${user.prenom} ${user.nom}`} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(15,25,35,0.10)' }} />
                        ) : (
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#fff', backgroundColor: '#2563eb' }}>
                            {user.prenom.charAt(0).toUpperCase()}{user.nom.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F1923' }}>{user.prenom} {user.nom}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle', fontSize: '12px', color: '#5A6472' }}>
                      {user.email}
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle', fontSize: '12px', color: '#5A6472' }}>
                      {user.telephone || '-'}
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle', fontSize: '12px', color: '#5A6472' }}>
                      {user.university || '-'}
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <span style={{
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '11px', 
                        fontWeight: 600,
                        ...getRoleBadgeStyle(user.role)
                      }}>
                        {getRoleIcon(user.role)}
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                        ...(user.actif
                          ? { background: '#D1FAE5', color: '#059669', border: '1px solid rgba(5,150,105,0.3)' }
                          : { background: '#FEE2E2', color: '#DC2626', border: '1px solid rgba(220,38,38,0.3)' })
                      }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: user.actif ? '#059669' : '#DC2626' }} />
                        {user.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle', fontSize: '12px', color: '#5A6472' }}>
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                        {EDITABLE_ROLES.includes(user.role) ? (
                          <>
                            <button 
                              onClick={() => navigate(`/super-admin/users/${user.id}/edit`)} 
                              style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9AA3AE' }} 
                              title="Modifier"
                            >
                              <Edit style={{ width: 14, height: 14 }} />
                            </button>
                            {deleteConfirm === user.id ? (
                              <>
                                <button onClick={() => handleDelete(user.id)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: '#FEE2E2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
                                  <CheckCircle style={{ width: 14, height: 14 }} />
                                </button>
                                <button onClick={() => setDeleteConfirm(null)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9AA3AE' }}>
                                  <XCircle style={{ width: 14, height: 14 }} />
                                </button>
                              </>
                            ) : (
                              <button onClick={() => setDeleteConfirm(user.id)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9AA3AE' }} title="Supprimer">
                                <Trash2 style={{ width: 14, height: 14 }} />
                              </button>
                            )}
                          </>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#9AA3AE', fontStyle: 'italic' }}>Lecture seule</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#EEECEA', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Users style={{ width: 28, height: 28, color: '#9AA3AE' }} />
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F1923' }}>Aucun utilisateur</h3>
              <p style={{ fontSize: '12px', color: '#9AA3AE', marginTop: '4px' }}>Commencez par créer un nouvel utilisateur.</p>
              <button onClick={() => navigate('/super-admin/users/create')} style={{ marginTop: '16px', padding: '8px 16px', background: '#2563eb', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Plus style={{ width: 16, height: 16 }} />
                Créer un utilisateur
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;

// Made with Bob
