import React, { useEffect, useState } from 'react';
import { tenantsApi } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { LayoutDashboard, PenLine, GraduationCap, Trophy, Banknote, AlertTriangle, CheckCircle, Users, BookOpen, Target, Zap, Handshake, Calendar, Building2, XCircle, Info, TrendingUp, TrendingDown, Bell } from 'lucide-react';
import type { KPIs } from '../../types';

const DEMO_KPIS: KPIs = {
  totalStudents: 1247, activeStudents: 1198,
  totalRevenue: 185400000, pendingPayments: 23400000,
  successRate: 87.3, attendanceRate: 92.1,
  totalCourses: 84, totalTeachers: 67,
};

const TREND_DATA = [
  { mois: 'Août', etudiants: 850, recettes: 95 },
  { mois: 'Sep', etudiants: 1100, recettes: 140 },
  { mois: 'Oct', etudiants: 1247, recettes: 185 },
  { mois: 'Nov', etudiants: 1200, recettes: 170 },
  { mois: 'Déc', etudiants: 1180, recettes: 160 },
];

const BAR_DATA = [
  { parcours: 'Info L3', taux: 91 }, { parcours: 'Gestion M1', taux: 78 },
  { parcours: 'Droit L2', taux: 85 }, { parcours: 'Théologie', taux: 93 },
  { parcours: 'Médecine', taux: 72 }, { parcours: 'Philo M2', taux: 89 },
];

interface KPICardProps { label: string; value: string; icon: React.ReactNode; color: string; trend?: string; trendUp?: boolean; }
const KPICard: React.FC<KPICardProps> = ({ label, value, icon, color, trend, trendUp }) => (
  <div style={{
    background: '#fff', borderRadius: 14, padding: '22px 20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9',
    borderTop: `3px solid ${color}`, transition: 'transform 0.2s, box-shadow 0.2s',
  }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 30px rgba(0,0,0,0.12)'; }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)'; }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 8px' }}>{label}</p>
        <p style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-1px' }}>{value}</p>
        {trend && (
          <span style={{ fontSize: 12, fontWeight: 600, color: trendUp ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}>
            {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {trend}
          </span>
        )}
      </div>
      <div style={{ fontSize: 32, opacity: 0.9, color }}>{icon}</div>
    </div>
  </div>
);

export const PresidentDashboard: React.FC = () => {
  const { user, tenant } = useAuthStore();
  const [kpis, setKpis] = useState<KPIs>(DEMO_KPIS);

  useEffect(() => {
    if (user?.tenantId) {
      tenantsApi.getDashboard(user.tenantId).then(r => setKpis(r.data.kpis)).catch(() => {});
    }
  }, []);

  const fmt = (n: number) => n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M` : n.toLocaleString('fr');

  return (
    <div style={{
      padding: 32,
      background: '#f0f4f8',
      minHeight: '100%'
    }}>
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            Tableau de Bord Présidentiel <LayoutDashboard size={28} style={{ verticalAlign: 'middle', marginLeft: 8 }} />
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
            Bienvenue, {user?.firstName} · {tenant?.name || 'IMTECH UNIVERSITY'}
          </p>
          <p style={{ color: '#94a3b8', fontSize: 12, margin: '2px 0 0' }}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ padding: '10px 18px', background: '#1a5276', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
<PenLine size={14} style={{ marginRight: 6 }} /> Signer Diplômes
          </button>
          <button style={{ padding: '10px 18px', background: '#fff', color: '#1a5276', border: '2px solid #1a5276', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
<LayoutDashboard size={14} style={{ marginRight: 6 }} /> Rapport Annuel
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <KPICard label="Étudiants Inscrits" value={fmt(kpis.totalStudents)} icon={<GraduationCap size={32} />} color="#1a5276" trend="+5.2% vs 2023" trendUp />
        <KPICard label="Taux de Réussite" value={`${kpis.successRate}%`} icon={<Trophy size={32} />} color="#148f77" trend="+2.1 pts" trendUp />
        <KPICard label="Recettes Totales" value={`${fmt(kpis.totalRevenue)} FCFA`} icon={<Banknote size={32} />} color="#f39c12" trend="+8.7%" trendUp />
        <KPICard label="Impayés en attente" value={`${fmt(kpis.pendingPayments)} FCFA`} icon={<AlertTriangle size={32} />} color="#e74c3c" trend="-3.4%" trendUp={false} />
        <KPICard label="Taux d'Assiduité" value={`${kpis.attendanceRate}%`} icon={<CheckCircle size={32} />} color="#2980b9" trend="+1.2 pts" trendUp />
        <KPICard label="Enseignants Actifs" value={String(kpis.totalTeachers)} icon={<Users size={32} />} color="#8e44ad" trend="stable" />
        <KPICard label="Cours Dispensés" value={String(kpis.totalCourses)} icon={<BookOpen size={32} />} color="#16a085" trend="+12 cours" trendUp />
        <KPICard label="Parcours Actifs" value="12" icon={<Target size={32} />} color="#e67e22" trend="+1 ouvert" trendUp />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 20px' }}>
            Évolution Effectifs & Recettes (FCFA M)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={TREND_DATA}>
              <defs>
                <linearGradient id="gEtu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a5276" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1a5276" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gRec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#148f77" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#148f77" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mois" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 8px 25px rgba(0,0,0,0.12)' }} />
              <Area type="monotone" dataKey="etudiants" stroke="#1a5276" strokeWidth={2} fill="url(#gEtu)" name="Étudiants" />
              <Area type="monotone" dataKey="recettes" stroke="#148f77" strokeWidth={2} fill="url(#gRec)" name="Recettes (M FCFA)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 20px' }}>
            Taux de Réussite par Parcours (%)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={BAR_DATA} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="parcours" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 8px 25px rgba(0,0,0,0.12)' }} />
              <Bar dataKey="taux" fill="#148f77" radius={[6, 6, 0, 0]} name="Taux %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Actions & Alertes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}><Zap size={18} /> Actions Rapides</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'Signer Diplômes (15)', icon: <PenLine size={14} />, color: '#1a5276' },
              { label: 'Valider Recrutement', icon: <Users size={14} />, color: '#8e44ad' },
              { label: 'Arbitrage Discipline', icon: <AlertTriangle size={14} />, color: '#e74c3c' },
              { label: 'Convention Partenariat', icon: <Handshake size={14} />, color: '#2980b9' },
              { label: 'Calendrier Académique', icon: <Calendar size={14} />, color: '#e67e22' },
              { label: 'Rapport au Diocèse', icon: <Building2 size={14} />, color: '#148f77' },
            ].map(a => (
              <button key={a.label} style={{
                padding: '10px 12px', background: `${a.color}12`,
                border: `1px solid ${a.color}25`, borderRadius: 9,
                color: a.color, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6,
                transition: 'background 0.15s',
              }}>
                <span>{a.icon}</span><span>{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}><Bell size={18} /> Alertes Institutionnelles</h3>
          {[
            { type: 'danger', msg: '23 étudiants — impayés > 30 jours', time: '2h' },
            { type: 'warning', msg: 'Délibérations S2 dans 5 jours', time: '3h' },
            { type: 'success', msg: '15 diplômes en attente de signature', time: '5h' },
            { type: 'info', msg: 'Stock papier A4 sous seuil critique', time: '6h' },
            { type: 'warning', msg: 'Rentrée S2 — 47 non-réinscrits', time: '8h' },
          ].map((a, i) => {
            const colors: Record<string, [string, string]> = {
              danger: ['#fef2f2', '#e74c3c'], warning: ['#fffbeb', '#f39c12'],
              success: ['#f0fdf4', '#10b981'], info: ['#eff6ff', '#2980b9'],
            };
            const [bg, accent] = colors[a.type];
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', background: bg,
                borderRadius: 9, marginBottom: 6,
                borderLeft: `3px solid ${accent}`,
              }}>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  {a.type === 'danger' ? <XCircle size={16} color="#e74c3c" /> : a.type === 'warning' ? <AlertTriangle size={16} color="#f39c12" /> : a.type === 'success' ? <CheckCircle size={16} color="#10b981" /> : <Info size={16} color="#2980b9" />}
                </span>
                <span style={{ flex: 1, fontSize: 13, color: '#374151' }}>{a.msg}</span>
                <span style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>Il y a {a.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};