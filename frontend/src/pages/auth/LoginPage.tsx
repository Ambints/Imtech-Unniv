import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/client';
import toast from 'react-hot-toast';
import { GraduationCap, Clock, Lock, Eye, EyeOff } from 'lucide-react';

const ROLE_ROUTES: Record<string, string> = {
  super_admin: '/super-admin', president: '/president',
  responsable_pedagogique: '/academic/parcours', secretaire_parcours: '/secretariat/inscriptions',
  surveillant_general: '/surveillance/presences', scolarite: '/scolarite/notes',
  economat: '/economat/budget', caissier: '/caisse',
  rh: '/rh/personnel', communication: '/communication',
  responsable_logistique: '/logistique/tickets', service_entretien: '/entretien/planning',
  etudiant: '/portail/etudiant', parent: '/portail/parent', professeur: '/portail/professeur',
  admin: '/admin',
};

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.login(email, password);
      console.log('Login réussi, données:', data);
      console.log('User role:', data.user?.role);
      
      // Stocker dans le store
      login(data.user, data.accessToken, data.refreshToken);
      
      // Vérifier que le token est bien stocké
      const stored = localStorage.getItem('imtech-auth-v1');
      console.log('Token stocké:', stored ? 'Oui' : 'Non');
      
      toast.success('Connexion réussie !');
      
      // Petite attente pour s'assurer que le store est mis à jour
      setTimeout(() => {
        const route = ROLE_ROUTES[data.user.role] || '/president';
        console.log('Navigation vers:', route);
        navigate(route);
      }, 100);
    } catch (err: any) {
      console.error('Erreur login:', err);
      toast.error(err.response?.data?.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0d2d45 0%, #1a5276 40%, #148f77 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative blobs */}
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', top: -100, right: -100 }} />
      <div style={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', background: 'rgba(244,162,18,0.08)', bottom: -80, left: -80 }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', animation: 'fadeIn 0.4s ease' }}>
        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.97)',
          borderRadius: 20,
          padding: '40px 36px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(20px)',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 18,
              background: 'linear-gradient(135deg, #1a5276, #148f77)',
              margin: '0 auto 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 34, boxShadow: '0 8px 20px rgba(26,82,118,0.4)',
            }}><GraduationCap size={36} color="#fff" /></div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#1a5276', letterSpacing: '-0.5px', margin: '0 0 4px' }}>
              IMTECH UNIVERSITY
            </h1>
            <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>Plateforme SaaS de Gestion Universitaire</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Adresse Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                style={{
                  width: '100%', padding: '13px 16px',
                  border: '2px solid #e5e7eb', borderRadius: 10,
                  fontSize: 14, outline: 'none', transition: 'border-color 0.2s',
                  background: '#fafafa',
                }}
                onFocus={e => e.target.style.borderColor = '#1a5276'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%', padding: '13px 44px 13px 16px',
                    border: '2px solid #e5e7eb', borderRadius: 10,
                    fontSize: 14, outline: 'none', transition: 'border-color 0.2s',
                    background: '#fafafa',
                  }}
                  onFocus={e => e.target.style.borderColor = '#1a5276'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
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
                    padding: '4px',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #1a5276 0%, #148f77 100%)',
                color: 'white', border: 'none', borderRadius: 10,
                fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', boxShadow: loading ? 'none' : '0 4px 15px rgba(26,82,118,0.35)',
                letterSpacing: '0.3px',
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; }}
            >
              {loading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Clock size={16} /> Connexion en cours...</span> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Lock size={16} /> Accéder à la plateforme</span>}
            </button>
          </form>

        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 20 }}>
          © {new Date().getFullYear()} IMTECH UNIVERSITY. Tous droits réservés.
        </p>
      </div>
    </div>
  );
};