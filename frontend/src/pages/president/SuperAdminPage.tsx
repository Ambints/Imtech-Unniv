import React, { useState, useEffect } from 'react';
import { tenantsApi } from '../../api/client';
import toast from 'react-hot-toast';
import { Building2, Plus, Settings, LayoutDashboard, Mail, Crown } from 'lucide-react';
import type { Tenant } from '../../types';

export const SuperAdminPage: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', slogan: '', email: '', phone: '', primaryColor: '#1a5276', secondaryColor: '#148f77', accentColor: '#f39c12', subscriptionPlan: 'standard' });

  useEffect(() => {
    tenantsApi.getAll().then(r => setTenants(r.data)).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await tenantsApi.create(form);
      setTenants(prev => [data, ...prev]);
      setShowForm(false);
      toast.success('Université créée avec succès !');
      setForm({ name: '', slug: '', slogan: '', email: '', phone: '', primaryColor: '#1a5276', secondaryColor: '#148f77', accentColor: '#f39c12', subscriptionPlan: 'standard' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur création');
    }
  };

  return (
    <div style={{ padding: 32, background: '#F5F5F0', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10 }}><Building2 size={28} /> Super Administration</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>{tenants.length} universités enregistrées</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '12px 20px', background: '#1a5276', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
<Plus size={16} style={{ marginRight: 6 }} /> Nouvelle Université
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 20px', color: '#0f172a' }}>Créer une Université</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: "Nom de l'université", key: 'name', placeholder: 'Université Catholique de...' },
              { label: 'Slug (URL)', key: 'slug', placeholder: 'univ-catholique-lome' },
              { label: 'Slogan', key: 'slogan', placeholder: 'Vérité, Foi, Excellence' },
              { label: 'Email officiel', key: 'email', placeholder: 'contact@univ.tg' },
              { label: 'Téléphone', key: 'phone', placeholder: '+228 XX XX XX XX' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{f.label}</label>
                <input placeholder={f.placeholder} value={(form as any)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14, outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = '#1a5276'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Plan Abonnement</label>
              <select value={form.subscriptionPlan} onChange={e => setForm(p => ({ ...p, subscriptionPlan: e.target.value }))}
                style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14, background: '#fff' }}>
                <option value="basic">Basic</option><option value="standard">Standard</option><option value="premium">Premium</option>
              </select>
            </div>
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: 16, alignItems: 'center' }}>
              {['primaryColor', 'secondaryColor', 'accentColor'].map((c, i) => (
                <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                    {['Couleur principale', 'Secondaire', 'Accent'][i]}
                  </label>
                  <input type="color" value={(form as any)[c]}
                    onChange={e => setForm(p => ({ ...p, [c]: e.target.value }))}
                    style={{ width: 40, height: 36, border: '2px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', padding: 2 }}
                  />
                  <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>{(form as any)[c]}</span>
                </div>
              ))}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '11px 20px', background: '#f1f5f9', border: 'none', borderRadius: 9, fontSize: 14, cursor: 'pointer' }}>
                  Annuler
                </button>
                <button type="submit" style={{ padding: '11px 20px', background: '#1a5276', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  Créer l'Université
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><p style={{ color: '#94a3b8' }}>Chargement...</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {tenants.map(t => (
            <div key={t.id} style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
              <div style={{ height: 8, background: `linear-gradient(90deg, ${t.primaryColor}, ${t.secondaryColor})` }} />
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>{t.name}</h3>
                    <p style={{ color: '#94a3b8', fontSize: 12, margin: 0 }}>{t.slogan || '—'}</p>
                  </div>
                  <span style={{ padding: '3px 10px', background: t.isActive ? '#dcfce7' : '#fef2f2', color: t.isActive ? '#166534' : '#991b1b', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                    {t.isActive ? '● Actif' : '● Inactif'}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={14} /> {t.email || '—'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Crown size={14} /> Plan {t.subscriptionPlan || 'standard'} · ID: {t.slug}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button style={{ flex: 1, padding: '8px', background: t.primaryColor + '15', border: `1px solid ${t.primaryColor}30`, color: t.primaryColor, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
<Settings size={14} style={{ marginRight: 6 }} /> Configurer
                  </button>
                  <button style={{ flex: 1, padding: '8px', background: '#f1f5f9', border: 'none', color: '#64748b', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
<LayoutDashboard size={14} style={{ marginRight: 6 }} /> Dashboard
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
