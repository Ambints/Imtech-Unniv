import React, { useState, useEffect } from 'react';
import { Eye, Activity, Users, Database, Server, AlertTriangle, CheckCircle, TrendingUp, Clock, RefreshCw, Download } from 'lucide-react';

interface KpiCardProps {
  icon: React.ReactNode;
  iconBg: string;
  trend: string;
  trendColor: string;
  value: string | number;
  valueColor?: string;
  label: string;
  subValue?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon, iconBg, trend, trendColor, value, valueColor, label, subValue }) => (
  <div style={{ background: '#FAFAF7', border: '1px solid rgba(15,25,35,0.10)', borderRadius: '12px', padding: '16px', transition: 'box-shadow 0.2s' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      <span style={{ fontSize: '11px', fontWeight: 600, color: trendColor }}>{trend}</span>
    </div>
    <div style={{ fontSize: '24px', fontWeight: 700, color: valueColor || '#0F1923', lineHeight: 1 }}>{value}</div>
    {subValue && <div style={{ fontSize: '11px', color: '#9AA3AE', marginTop: '4px' }}>{subValue}</div>}
    <div style={{ fontSize: '11px', color: '#9AA3AE', marginTop: '2px' }}>{label}</div>
  </div>
);

interface TenantMetrics {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  activeUsers: number;
  totalUsers: number;
  dbSize: number;
  apiCalls: number;
  responseTime: number;
  errorRate: number;
  lastBackup: string;
}

export const Supervision: React.FC = () => {
  const [metrics, setMetrics] = useState<TenantMetrics[]>([
    {
      id: 'ucm-001',
      name: 'Université Catholique de Madagascar',
      status: 'healthy',
      uptime: 99.8,
      activeUsers: 342,
      totalUsers: 500,
      dbSize: 2.4,
      apiCalls: 15420,
      responseTime: 145,
      errorRate: 0.2,
      lastBackup: '2024-01-15T03:00:00Z',
    },
    {
      id: 'iut-002',
      name: 'Institut Universitaire de Technologie',
      status: 'warning',
      uptime: 98.5,
      activeUsers: 156,
      totalUsers: 200,
      dbSize: 1.2,
      apiCalls: 8340,
      responseTime: 280,
      errorRate: 1.5,
      lastBackup: '2024-01-15T03:00:00Z',
    },
  ]);

  const [globalStats, setGlobalStats] = useState({
    totalTenants: 0,
    healthyTenants: 0,
    warningTenants: 0,
    criticalTenants: 0,
    totalUsers: 0,
    activeUsers: 0,
    avgResponseTime: 0,
    totalApiCalls: 0,
  });

  useEffect(() => {
    const healthy = metrics.filter(m => m.status === 'healthy').length;
    const warning = metrics.filter(m => m.status === 'warning').length;
    const critical = metrics.filter(m => m.status === 'critical').length;
    const totalUsers = metrics.reduce((sum, m) => sum + m.totalUsers, 0);
    const activeUsers = metrics.reduce((sum, m) => sum + m.activeUsers, 0);
    const avgResponse = metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length;
    const totalCalls = metrics.reduce((sum, m) => sum + m.apiCalls, 0);

    setGlobalStats({
      totalTenants: metrics.length,
      healthyTenants: healthy,
      warningTenants: warning,
      criticalTenants: critical,
      totalUsers,
      activeUsers,
      avgResponseTime: Math.round(avgResponse),
      totalApiCalls: totalCalls,
    });
  }, [metrics]);

  const getStatusBadge = (status: string) => {
    const styles = {
      healthy: { bg: '#D1FAE5', color: '#059669', border: 'rgba(5,150,105,0.3)' },
      warning: { bg: '#FEF3C7', color: '#D97706', border: 'rgba(217,119,6,0.3)' },
      critical: { bg: '#FEE2E2', color: '#DC2626', border: 'rgba(220,38,38,0.3)' },
    };
    const labels = { healthy: 'Sain', warning: 'Attention', critical: 'Critique' };
    const style = styles[status as keyof typeof styles];
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: style.color }} />
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatLastBackup = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Il y a ${days}j`;
  };

  return (
    <div className="min-h-screen" style={{ background: '#F5F5F0' }}>
      {/* Topbar - Style Maquette */}
      <header style={{ background: '#FAFAF7', borderBottom: '1px solid rgba(15,25,35,0.10)', padding: '0 28px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#0F1923', letterSpacing: '-0.01em' }}>Supervision</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button style={{ padding: '7px 12px', fontSize: '12px', fontWeight: 500, color: '#5A6472', background: '#F5F5F0', border: '1px solid rgba(15,25,35,0.10)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <RefreshCw style={{ width: 14, height: 14 }} /> Actualiser
          </button>
          <button style={{ padding: '7px 12px', fontSize: '12px', fontWeight: 500, color: '#5A6472', background: '#F5F5F0', border: '1px solid rgba(15,25,35,0.10)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <Download style={{ width: 14, height: 14 }} /> Rapport
          </button>
        </div>
      </header>

      <div style={{ padding: '24px 28px' }}>
        {/* KPI Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          <KpiCard 
            icon={<Server style={{ width: 16, height: 16, color: '#2563eb' }} />} 
            iconBg="#DBEAFE" 
            trend={`${globalStats.healthyTenants} saines`} 
            trendColor="#059669" 
            value={globalStats.totalTenants} 
            label="Universités monitorées"
            subValue={`${globalStats.warningTenants} alertes · ${globalStats.criticalTenants} critiques`}
          />
          <KpiCard 
            icon={<Users style={{ width: 16, height: 16, color: '#059669' }} />} 
            iconBg="#D1FAE5" 
            trend="Actifs" 
            trendColor="#059669" 
            value={globalStats.activeUsers} 
            label={`sur ${globalStats.totalUsers} total`}
          />
          <KpiCard 
            icon={<Activity style={{ width: 16, height: 16, color: '#7C3AED' }} />} 
            iconBg="#EDE9FE" 
            trend="-15%" 
            trendColor="#059669" 
            value={`${globalStats.avgResponseTime}ms`} 
            label="Temps de réponse moyen"
          />
          <KpiCard 
            icon={<Database style={{ width: 16, height: 16, color: '#D97706' }} />} 
            iconBg="#FEF3C7" 
            trend="Aujourd'hui" 
            trendColor="#9AA3AE" 
            value={`${(globalStats.totalApiCalls / 1000).toFixed(1)}K`} 
            label="Requêtes API"
          />
        </div>

        {/* Card - Monitoring des Universités */}
        <div style={{ background: '#FAFAF7', border: '1px solid rgba(15,25,35,0.10)', borderRadius: '14px', overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(15,25,35,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#0F1923' }}>Monitoring des Universités</h2>
            <span style={{ fontSize: '12px', color: '#9AA3AE' }}>{metrics.length} universités monitorées</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9AA3AE', textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid rgba(15,25,35,0.10)' }}>Université</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9AA3AE', textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid rgba(15,25,35,0.10)' }}>Status</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9AA3AE', textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid rgba(15,25,35,0.10)' }}>Uptime</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9AA3AE', textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid rgba(15,25,35,0.10)' }}>Utilisateurs</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9AA3AE', textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid rgba(15,25,35,0.10)' }}>DB Size</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9AA3AE', textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid rgba(15,25,35,0.10)' }}>API Calls</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9AA3AE', textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid rgba(15,25,35,0.10)' }}>Response</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9AA3AE', textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid rgba(15,25,35,0.10)' }}>Error Rate</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9AA3AE', textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid rgba(15,25,35,0.10)' }}>Backup</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric) => (
                  <tr key={metric.id} style={{ borderBottom: '1px solid rgba(15,25,35,0.04)' }}>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F5F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#5A6472' }}>{metric.name.charAt(0)}</div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F1923' }}>{metric.name}</div>
                          <div style={{ fontSize: '11px', color: '#9AA3AE' }}>{metric.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>{getStatusBadge(metric.status)}</td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F1923' }}>{metric.uptime}%</div>
                      <div style={{ width: '60px', height: '4px', background: '#F5F5F0', borderRadius: '2px', marginTop: '4px' }}>
                        <div style={{ height: '4px', borderRadius: '2px', background: metric.uptime >= 99 ? '#059669' : '#D97706', width: `${metric.uptime}%` }} />
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F1923' }}>{metric.activeUsers} <span style={{ color: '#9AA3AE' }}>/ {metric.totalUsers}</span></div>
                      <div style={{ fontSize: '11px', color: '#9AA3AE' }}>{Math.round((metric.activeUsers / metric.totalUsers) * 100)}% actifs</div>
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle', fontSize: '12px', fontWeight: 600, color: '#0F1923' }}>{metric.dbSize} <span style={{ fontWeight: 400, color: '#9AA3AE' }}>GB</span></td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle', fontSize: '12px', fontWeight: 600, color: '#0F1923' }}>{(metric.apiCalls / 1000).toFixed(1)}<span style={{ fontWeight: 400, color: '#9AA3AE' }}>K</span></td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle', fontSize: '12px', fontWeight: 600, color: metric.responseTime < 200 ? '#059669' : metric.responseTime < 300 ? '#D97706' : '#DC2626' }}>{metric.responseTime}ms</td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle', fontSize: '12px', fontWeight: 600, color: metric.errorRate < 1 ? '#059669' : metric.errorRate < 2 ? '#D97706' : '#DC2626' }}>{metric.errorRate}%</td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#5A6472' }}>
                        <Clock style={{ width: 14, height: 14, color: '#9AA3AE' }} />
                        {formatLastBackup(metric.lastBackup)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Health Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ background: '#FAFAF7', border: '1px solid rgba(15,25,35,0.10)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F1923' }}>Serveurs</h3>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Server style={{ width: 14, height: 14, color: '#2563eb' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['API Server', 'Database', 'Cache Redis'].map((server) => (
                <div key={server} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#5A6472' }}>{server}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle style={{ width: 14, height: 14 }} /> Online
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#FAFAF7', border: '1px solid rgba(15,25,35,0.10)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F1923' }}>Ressources</h3>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity style={{ width: 14, height: 14, color: '#7C3AED' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[{ label: 'CPU', value: 45 }, { label: 'RAM', value: 62 }, { label: 'Disk', value: 38 }].map((res) => (
                <div key={res.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#5A6472' }}>{res.label}</span>
                    <span style={{ fontWeight: 600, color: '#0F1923' }}>{res.value}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#F5F5F0', borderRadius: '3px' }}>
                    <div style={{ height: '6px', borderRadius: '3px', background: '#7C3AED', width: `${res.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#FAFAF7', border: '1px solid rgba(15,25,35,0.10)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F1923' }}>Alertes</h3>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle style={{ width: 14, height: 14, color: '#D97706' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px', padding: '10px', background: '#FEF3C7', borderRadius: '8px' }}>
                <AlertTriangle style={{ width: 16, height: 16, color: '#D97706', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#0F1923' }}>Temps de réponse élevé</p>
                  <p style={{ fontSize: '11px', color: '#9AA3AE' }}>IUT - 280ms</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', padding: '10px', background: '#D1FAE5', borderRadius: '8px' }}>
                <CheckCircle style={{ width: 16, height: 16, color: '#059669', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#0F1923' }}>Backup réussi</p>
                  <p style={{ fontSize: '11px', color: '#9AA3AE' }}>Toutes les universités</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Made with Bob
