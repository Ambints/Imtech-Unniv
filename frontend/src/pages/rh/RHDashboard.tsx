import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import {
  Users, FileText, CreditCard, MapPin, Sparkles, Target,
  TrendingUp, DollarSign, Award, Clock, AlertCircle, CheckCircle
} from 'lucide-react';

export const RHDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { tenant } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/rh/stats');
      setStats(response.data);
    } catch (error: any) {
      console.error('Erreur chargement stats:', error);
      // Si erreur 403 (pas de permissions), charger les données depuis les autres endpoints
      if (error.response?.status === 403) {
        try {
          // Charger les contrats pour calculer les stats
          const contratsRes = await api.get('/rh/contrats');
          const contrats = contratsRes.data || [];
          
          const effectifs = contrats.filter((c: any) => c.actif).length;
          const masseSalariale = contrats
            .filter((c: any) => c.actif)
            .reduce((sum: number, c: any) => sum + (c.salaireBrut || 0), 0);
          
          const repartitionMap = new Map();
          contrats.forEach((c: any) => {
            if (c.actif) {
              const count = repartitionMap.get(c.typeContrat) || 0;
              repartitionMap.set(c.typeContrat, count + 1);
            }
          });
          
          const repartitionContrats = Array.from(repartitionMap.entries()).map(([type, count]) => ({
            type_contrat: type,
            count: count.toString()
          }));
          
          // Charger les congés en attente
          const congesRes = await api.get('/rh/conges', { params: { statut: 'demande' } });
          const congesEnAttente = (congesRes.data || []).length;
          
          setStats({
            effectifs,
            masseSalarialeMensuelle: masseSalariale,
            repartitionContrats,
            congesEnAttente
          });
        } catch (fallbackError) {
          console.error('Erreur fallback:', fallbackError);
          // Utiliser des stats par défaut en dernier recours
          setStats({
            effectifs: 0,
            masseSalarialeMensuelle: 0,
            repartitionContrats: [],
            congesEnAttente: 0
          });
        }
      } else {
        // Utiliser des stats par défaut pour autres erreurs
        setStats({
          effectifs: 0,
          masseSalarialeMensuelle: 0,
          repartitionContrats: [],
          congesEnAttente: 0
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      label: 'Total Personnel',
      value: stats?.effectifs || 0,
      icon: <Users size={20} />,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      route: '/rh/personnel'
    },
    {
      label: 'Masse Salariale',
      value: `${(stats?.masseSalarialeMensuelle || 0).toLocaleString()} Ar`,
      icon: <DollarSign size={20} />,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      route: '/rh/paie'
    },
    {
      label: 'Congés en attente',
      value: stats?.congesEnAttente || 0,
      icon: <MapPin size={20} />,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      route: '/rh/conges'
    },
    {
      label: 'Contrats actifs',
      value: stats?.repartitionContrats?.reduce((sum: number, c: any) => sum + parseInt(c.count), 0) || 0,
      icon: <FileText size={20} />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      route: '/rh/contrats'
    }
  ];

  const menuItems = [
    {
      title: 'Personnel',
      description: 'Gestion des employés et contrats',
      icon: <Users size={24} />,
      color: '#3b82f6',
      route: '/rh/personnel'
    },
    {
      title: 'Contrats',
      description: 'Gestion des contrats de travail',
      icon: <FileText size={24} />,
      color: '#10b981',
      route: '/rh/contrats'
    },
    {
      title: 'Paie & Vacations',
      description: 'Fiches de paie et heures complémentaires',
      icon: <CreditCard size={24} />,
      color: '#8b5cf6',
      route: '/rh/paie'
    },
    {
      title: 'Congés & Absences',
      description: 'Gestion des demandes de congés',
      icon: <MapPin size={24} />,
      color: '#f59e0b',
      route: '/rh/conges'
    },
    {
      title: 'Évaluations',
      description: 'Évaluations annuelles du personnel',
      icon: <Sparkles size={24} />,
      color: '#ec4899',
      route: '/rh/evaluations'
    },
    {
      title: 'Recrutement',
      description: 'Processus de recrutement',
      icon: <Target size={24} />,
      color: '#06b6d4',
      route: '/rh/recrutement'
    },
    {
      title: 'Affectation Cours',
      description: 'Gestion des UE et affectation aux enseignants',
      icon: <Users size={24} />,
      color: '#14b8a6',
      route: '/rh/affectation-cours'
    }
  ];

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: '0 0 8px' }}>
          Ressources Humaines
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Gestion du personnel, contrats, paie et évaluations
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 32 }}>
        {statsCards.map((stat, idx) => (
          <div
            key={idx}
            onClick={() => navigate(stat.route)}
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 20,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: stat.bgColor,
                  color: stat.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {stat.icon}
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Menu Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {menuItems.map((item, idx) => (
          <div
            key={idx}
            onClick={() => navigate(item.route)}
            style={{
              background: '#fff',
              borderRadius: 14,
              padding: 24,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: '2px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
              e.currentTarget.style.borderColor = item.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                background: `${item.color}15`,
                color: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}
            >
              {item.icon}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
              {item.title}
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
              {item.description}
            </p>
          </div>
        ))}
      </div>

      {/* Répartition des contrats */}
      {stats?.repartitionContrats && stats.repartitionContrats.length > 0 && (
        <div style={{ marginTop: 32, background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 20 }}>
            Répartition des Contrats
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
            {stats.repartitionContrats.map((contrat: any, idx: number) => (
              <div key={idx} style={{ textAlign: 'center', padding: 16, background: '#f8fafc', borderRadius: 10 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>
                  {contrat.count}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                  {contrat.type_contrat}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RHDashboard;

// Made with Bob
