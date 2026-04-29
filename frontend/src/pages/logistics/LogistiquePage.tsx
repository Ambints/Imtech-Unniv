import React, { useState, useEffect } from 'react';
import { logisticsApi } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { Wrench, AlertTriangle, Package, Plus, AlertCircle, CheckCircle2, MapPin } from 'lucide-react';
import type { Ticket, StockConsommable } from '../../types';

export const LogistiquePage: React.FC = () => {
  const { user } = useAuthStore();
  const tid = user?.tenantId || '';
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stocks, setStocks] = useState<StockConsommable[]>([]);
  const [alertes, setAlertes] = useState<StockConsommable[]>([]);
  const [tab, setTab] = useState<'tickets' | 'stocks' | 'nettoyage'>('tickets');
  const [form, setForm] = useState({ titre: '', description: '', localisation: '', priorite: 'medium' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!tid) return;
    logisticsApi.getTickets(tid).then(r => setTickets(r.data)).catch(() => {});
    logisticsApi.getStocks(tid).then(r => setStocks(r.data)).catch(() => {});
    logisticsApi.getAlertes(tid).then(r => setAlertes(r.data)).catch(() => {});
  }, [tid]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await logisticsApi.createTicket(tid, form);
      setTickets(prev => [data, ...prev]);
      setShowForm(false);
      toast.success('Ticket créé !');
      setForm({ titre: '', description: '', localisation: '', priorite: 'medium' });
    } catch { toast.error('Erreur création ticket'); }
  };

  const prioriteColor = (p: string) => ({ urgent: '#e74c3c', high: '#f39c12', medium: '#2980b9', low: '#148f77' }[p] || '#94a3b8');
  const statusBadge = (s: string) => ({
    open: ['#fff3cd', '#856404', 'Ouvert'],
    in_progress: ['#cfe2ff', '#084298', 'En cours'],
    resolved: ['#d1e7dd', '#0a3622', 'Résolu'],
  }[s] || ['#f8f9fa', '#6c757d', s]);

  return (
    <div style={{ padding: 32, background: '#F5F5F0', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10 }}><Wrench size={28} /> Logistique & Maintenance</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>Tickets, stocks et planning d'entretien</p>
        </div>
        {alertes.length > 0 && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'flex' }}><AlertTriangle size={18} color="#991b1b" /></span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#991b1b' }}>{alertes.length} articles sous seuil critique</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#fff', borderRadius: 12, padding: 4, marginBottom: 20, width: 'fit-content', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        {[
          { key: 'tickets', label: 'Tickets', count: tickets.length, icon: <Wrench size={14} /> },
          { key: 'stocks', label: 'Stocks', count: stocks.length, icon: <Package size={14} /> },
          { key: 'nettoyage', label: 'Nettoyage', count: 0, icon: <Wrench size={14} /> },
        ].map(tabItem => (
          <button key={tabItem.key} onClick={() => setTab(tabItem.key as any)} style={{
            padding: '9px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
            background: tab === tabItem.key ? '#1a5276' : 'transparent',
            color: tab === tabItem.key ? '#fff' : '#64748b',
            fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{tabItem.icon} {tabItem.label}</span> {tabItem.count > 0 && <span style={{ background: tab === tabItem.key ? 'rgba(255,255,255,0.25)' : '#e2e8f0', borderRadius: 999, padding: '1px 7px', fontSize: 11 }}>{tabItem.count}</span>}
          </button>
        ))}
      </div>

      {/* Tickets */}
      {tab === 'tickets' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 18px', background: '#1a5276', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
<Plus size={16} style={{ marginRight: 6 }} /> Nouveau Ticket
            </button>
          </div>

          {showForm && (
            <div style={{ background: '#fff', borderRadius: 14, padding: 24, marginBottom: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
              <form onSubmit={handleCreateTicket}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Titre</label>
                    <input value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} required
                      placeholder="Projecteur en panne - Salle B3"
                      style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14, outline: 'none' }}
                      onFocus={e => e.target.style.borderColor = '#1a5276'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Localisation</label>
                    <input value={form.localisation} onChange={e => setForm(f => ({ ...f, localisation: e.target.value }))} required
                      placeholder="Bâtiment A, Salle 201"
                      style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14, outline: 'none' }}
                      onFocus={e => e.target.style.borderColor = '#1a5276'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Description</label>
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required rows={3}
                      placeholder="Décrire le problème..."
                      style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14, outline: 'none', resize: 'vertical' }}
                      onFocus={e => e.target.style.borderColor = '#1a5276'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Priorité</label>
                    <select value={form.priorite} onChange={e => setForm(f => ({ ...f, priorite: e.target.value }))}
                      style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14, background: '#fff' }}>
                      <option value="urgent">● Urgent</option>
                      <option value="high">● Haute</option>
                      <option value="medium">● Moyenne</option>
                      <option value="low">● Basse</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                    <button type="submit" style={{ flex: 1, padding: '11px', background: '#1a5276', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                      Soumettre le Ticket
                    </button>
                    <button type="button" onClick={() => setShowForm(false)} style={{ padding: '11px 16px', background: '#f1f5f9', border: 'none', borderRadius: 9, fontSize: 14, cursor: 'pointer' }}>
                      Annuler
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          <div style={{ display: 'grid', gap: 12 }}>
            {tickets.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center' }}>
                <p style={{ color: '#94a3b8', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><CheckCircle2 size={16} color="#148f77" /> Aucun ticket de maintenance ouvert</p>
              </div>
            ) : tickets.map(t => {
              const [bg, color, label] = statusBadge(t.status);
              return (
                <div key={t.id} style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', gap: 16, alignItems: 'flex-start', borderLeft: `4px solid ${prioriteColor(t.priorite)}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>{t.titre}</h4>
                      <span style={{ padding: '2px 8px', background: bg as string, color: color as string, borderRadius: 999, fontSize: 11, fontWeight: 700 }}>{label as string}</span>
                      <span style={{ padding: '2px 8px', background: prioriteColor(t.priorite) + '20', color: prioriteColor(t.priorite), borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                        {t.priorite}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 6px' }}>{t.description}</p>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {t.localisation} · {new Date(t.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stocks */}
      {tab === 'stocks' && (
        <div>
          {alertes.length > 0 && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '14px 18px', marginBottom: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#991b1b', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={16} /> Articles sous seuil d'alerte</h4>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {alertes.map(a => (
                  <span key={a.id} style={{ padding: '6px 12px', background: '#fff', border: '1px solid #fecaca', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#991b1b' }}>
                    {a.nom} : {a.quantite} {a.unite} (seuil: {a.seuilAlerte})
                  </span>
                ))}
              </div>
            </div>
          )}
          <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Article', 'Catégorie', 'Quantité', 'Unité', 'Seuil Alerte', 'Statut'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stocks.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#94a3b8', fontSize: 13 }}>Aucun article en stock</td></tr>
                ) : stocks.map(s => {
                  const isAlerte = Number(s.quantite) <= Number(s.seuilAlerte);
                  return (
                    <tr key={s.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{s.nom}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{s.categorie}</td>
                      <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700, color: isAlerte ? '#e74c3c' : '#0f172a' }}>{s.quantite}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{s.unite || '—'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#94a3b8' }}>{s.seuilAlerte}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: isAlerte ? '#fef2f2' : '#f0fdf4', color: isAlerte ? '#991b1b' : '#166534', display: 'flex', alignItems: 'center', gap: 4 }}>
                          {isAlerte ? <><AlertCircle size={12} /> Critique</> : <><CheckCircle2 size={12} /> OK</>}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'nettoyage' && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 32, textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
          <Wrench size={48} color="#94a3b8" />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '16px 0 8px' }}>Planning de Nettoyage</h3>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>Gérez les cycles de nettoyage des salles, bureaux et espaces communs</p>
        </div>
      )}
    </div>
  );
};