import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usersApi, tenantsApi } from '../../api/client';
import { ArrowLeft, Save, User, Mail, Phone, Shield, Eye, EyeOff, Building2 } from 'lucide-react';

interface UserFormData {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  telephone: string;
  role: string;
  actif: boolean;
  tenantId?: string;
}

interface University {
  id: string;
  nom: string;
  slug: string;
  actif: boolean;
}

export const UserForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    telephone: '',
    role: 'president',
    actif: true,
    tenantId: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loadingUniversities, setLoadingUniversities] = useState(false);

  useEffect(() => {
    loadUniversities();
    if (isEdit) {
      loadUser();
    }
  }, [id]);

  const loadUniversities = async () => {
    try {
      setLoadingUniversities(true);
      const data = await tenantsApi.getAll();
      setUniversities(data.filter((u: University) => u.actif));
    } catch (err: any) {
      console.error('Erreur lors du chargement des universités:', err);
    } finally {
      setLoadingUniversities(false);
    }
  };

  const loadUser = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getOne(id!);
      setFormData({
        email: data.email || '',
        password: '', // Ne pas charger le mot de passe
        nom: data.nom || '',
        prenom: data.prenom || '',
        telephone: data.telephone || '',
        role: data.role || 'president',
        actif: data.actif !== undefined ? data.actif : true,
        tenantId: data.tenantId || ''
      });
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.nom || !formData.prenom || !formData.role) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!isEdit && !formData.password) {
      setError('Le mot de passe est obligatoire pour un nouvel utilisateur');
      return;
    }

    // Validation: université obligatoire pour président et admin
    const requiresUniversity = formData.role === 'president' || formData.role === 'admin';
    if (requiresUniversity && !formData.tenantId) {
      setError('Veuillez sélectionner une université pour ce rôle');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload: any = {
        email: formData.email,
        nom: formData.nom,
        prenom: formData.prenom,
        telephone: formData.telephone || null,
        role: formData.role,
        actif: formData.actif
      };

      // Ajouter le mot de passe seulement s'il est fourni
      if (formData.password) {
        payload.password = formData.password;
      }

      // Ajouter tenantId seulement si le rôle nécessite une université
      if (formData.role === 'president' || formData.role === 'admin') {
        payload.tenantId = formData.tenantId;
      }

      if (isEdit) {
        await usersApi.update(id!, payload);
      } else {
        await usersApi.create(payload);
      }

      navigate('/super-admin/users');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (loading && isEdit) {
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/super-admin/users')}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid rgba(15,25,35,0.10)',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#5A6472'
            }}
          >
            <ArrowLeft style={{ width: 16, height: 16 }} />
          </button>
          <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#0F1923', letterSpacing: '-0.01em' }}>
            {isEdit ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
          </h1>
        </div>
      </header>

      <div style={{
        padding: '24px 28px',
        flex: 1,
        maxWidth: '800px',
        width: '100%',
        margin: '0 auto'
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

        <form onSubmit={handleSubmit}>
          {/* Card principale */}
          <div style={{ 
            background: '#FAFAF7', 
            border: '1px solid rgba(15,25,35,0.10)', 
            borderRadius: '14px', 
            overflow: 'hidden',
            marginBottom: '16px'
          }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(15,25,35,0.10)' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#0F1923' }}>Informations personnelles</h2>
            </div>
            
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                {/* Prénom */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5A6472', marginBottom: '6px' }}>
                    Prénom <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User style={{ width: 14, height: 14, color: '#9AA3AE', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 36px',
                        fontSize: '13px',
                        border: '1px solid rgba(15,25,35,0.10)',
                        borderRadius: '8px',
                        background: '#fff'
                      }}
                      placeholder="Jean"
                    />
                  </div>
                </div>

                {/* Nom */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5A6472', marginBottom: '6px' }}>
                    Nom <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User style={{ width: 14, height: 14, color: '#9AA3AE', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 36px',
                        fontSize: '13px',
                        border: '1px solid rgba(15,25,35,0.10)',
                        borderRadius: '8px',
                        background: '#fff'
                      }}
                      placeholder="Dupont"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5A6472', marginBottom: '6px' }}>
                  Email <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ width: 14, height: 14, color: '#9AA3AE', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      fontSize: '13px',
                      border: '1px solid rgba(15,25,35,0.10)',
                      borderRadius: '8px',
                      background: '#fff'
                    }}
                    placeholder="jean.dupont@example.com"
                  />
                </div>
              </div>

              {/* Téléphone */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5A6472', marginBottom: '6px' }}>
                  Téléphone
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone style={{ width: 14, height: 14, color: '#9AA3AE', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      fontSize: '13px',
                      border: '1px solid rgba(15,25,35,0.10)',
                      borderRadius: '8px',
                      background: '#fff'
                    }}
                    placeholder="+243 123 456 789"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5A6472', marginBottom: '6px' }}>
                  Mot de passe {!isEdit && <span style={{ color: '#DC2626' }}>*</span>}
                  {isEdit && <span style={{ fontSize: '11px', fontWeight: 400, color: '#9AA3AE' }}> (laisser vide pour ne pas modifier)</span>}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!isEdit}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '13px',
                      border: '1px solid rgba(15,25,35,0.10)',
                      borderRadius: '8px',
                      background: '#fff',
                      paddingRight: '40px'
                    }}
                    placeholder={isEdit ? 'Nouveau mot de passe' : 'Mot de passe'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#9AA3AE',
                      padding: 0
                    }}
                  >
                    {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card rôle et statut */}
          <div style={{ 
            background: '#FAFAF7', 
            border: '1px solid rgba(15,25,35,0.10)', 
            borderRadius: '14px', 
            overflow: 'hidden',
            marginBottom: '16px'
          }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(15,25,35,0.10)' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#0F1923' }}>Rôle et permissions</h2>
            </div>
            
            <div style={{ padding: '20px' }}>
              {/* Rôle */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5A6472', marginBottom: '6px' }}>
                  Rôle <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Shield style={{ width: 14, height: 14, color: '#9AA3AE', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      fontSize: '13px',
                      border: '1px solid rgba(15,25,35,0.10)',
                      borderRadius: '8px',
                      background: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="president">Président</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              {/* Université - Conditionnel selon le rôle */}
              {(formData.role === 'president' || formData.role === 'admin') && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5A6472', marginBottom: '6px' }}>
                    Université <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Building2 style={{ width: 14, height: 14, color: '#9AA3AE', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                    <select
                      name="tenantId"
                      value={formData.tenantId}
                      onChange={handleChange}
                      required
                      disabled={loadingUniversities}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 36px',
                        fontSize: '13px',
                        border: '1px solid rgba(15,25,35,0.10)',
                        borderRadius: '8px',
                        background: '#fff',
                        cursor: loadingUniversities ? 'wait' : 'pointer'
                      }}
                    >
                      <option value="">
                        {loadingUniversities ? 'Chargement...' : 'Sélectionner une université'}
                      </option>
                      {universities.map((univ) => (
                        <option key={univ.id} value={univ.id}>
                          {univ.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p style={{ fontSize: '11px', color: '#9AA3AE', marginTop: '4px' }}>
                    L'utilisateur sera créé dans le schéma de cette université
                  </p>
                </div>
              )}

              {/* Message informatif pour super_admin */}
              {formData.role === 'super_admin' && (
                <div style={{
                  marginBottom: '16px',
                  padding: '12px 16px',
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: '8px'
                }}>
                  <p style={{ fontSize: '12px', color: '#1E40AF', margin: 0 }}>
                    ℹ️ Les super admins n'appartiennent à aucune université spécifique
                  </p>
                </div>
              )}

              {/* Statut actif */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  name="actif"
                  id="actif"
                  checked={formData.actif}
                  onChange={handleChange}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="actif" style={{ fontSize: '13px', color: '#5A6472', cursor: 'pointer' }}>
                  Compte actif
                </label>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => navigate('/super-admin/users')}
              style={{
                padding: '10px 20px',
                background: '#fff',
                color: '#5A6472',
                border: '1px solid rgba(15,25,35,0.10)',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                background: loading ? '#9CA3AF' : '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Save style={{ width: 16, height: 16 }} />
              {loading ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;

// Made with Bob
