import React, { useState, useEffect } from 'react';
import { academicApi } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import {
  BookOpen, Users, Calendar, MapPin, TrendingUp, Award,
  Clock, CheckCircle, AlertCircle, BarChart3, PieChart,
  Activity, FileText, Download, Settings, Eye
} from 'lucide-react';

interface DashboardStats {
  students: {
    total: number;
    actifs: number;
    diplomes: number;
    nouveauxCetteAnnee: number;
  };
  courses: {
    total: number;
    obligatoires: number;
    optionnelles: number;
    totalCredits: number;
  };
  salles: {
    total: number;
    disponibles: number;
    parType: Array<{ type: string; count: number }>;
  };
  seances: {
    total: number;
    cetteSemaine: number;
    parType: Array<{ type: string; count: number }>;
  };
  inscriptions: {
    total: number;
    nouvellesCetteAnnee: number;
    parStatut: Array<{ statut: string; count: number }>;
  };
}

export const AcademicDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const tid = user?.tenantId || '';
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    loadDashboardStats();
  }, [tid, selectedPeriod]);

  const loadDashboardStats = async () => {
    setLoading(true);
    try {
      // Pour l'instant, utiliser des données mockées car les endpoints de statistiques ne sont pas encore implémentés
      const mockStats = {
        students: {
          total: 1250,
          actifs: 1100,
          diplomes: 120,
          nouveauxCetteAnnee: 150
        },
        courses: {
          total: 85,
          obligatoires: 65,
          optionnelles: 20,
          totalCredits: 340
        },
        salles: {
          total: 45,
          disponibles: 38,
          parType: [
            { type: 'cm', count: 15 },
            { type: 'td', count: 20 },
            { type: 'tp', count: 8 },
            { type: 'amphi', count: 2 }
          ]
        },
        seances: {
          total: 320,
          cetteSemaine: 45,
          parType: [
            { type: 'cm', count: 120 },
            { type: 'td', count: 140 },
            { type: 'tp', count: 60 }
          ]
        },
        inscriptions: {
          total: 980,
          nouvellesCetteAnnee: 150,
          parStatut: [
            { statut: 'en_cours', count: 850 },
            { statut: 'valide', count: 100 },
            { statut: 'ajourne', count: 30 }
          ]
        }
      };

      setStats(mockStats);
    } catch (error) {
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    color = 'blue',
    trend 
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: any;
    color?: string;
    trend?: { value: number; label: string };
  }) => {
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
    };

    return (
      <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center mt-1">
                <TrendingUp 
                  size={16} 
                  className={`mr-1 ${trend.value > 0 ? 'text-green-500' : 'text-red-500'}`} 
                />
                <span className={`text-sm ${trend.value > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]} bg-opacity-10`}>
            <Icon size={24} className={`${colorClasses[color as keyof typeof colorClasses].replace('bg-', 'text-')}`} />
          </div>
        </div>
      </div>
    );
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tableau de Bord Académique</h2>
          <p className="text-gray-600">Vue d'ensemble des modules académiques</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
          <button
            onClick={loadDashboardStats}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Activity size={20} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Étudiants"
          value={stats.students.total}
          subtitle={`${stats.students.actifs} actifs`}
          icon={Users}
          color="blue"
          trend={{ value: 12, label: "cette année" }}
        />
        <StatCard
          title="Cours"
          value={stats.courses.total}
          subtitle={`${stats.courses.totalCredits} crédits ECTS`}
          icon={BookOpen}
          color="green"
        />
        <StatCard
          title="Salles"
          value={stats.salles.total}
          subtitle={`${stats.salles.disponibles} disponibles`}
          icon={MapPin}
          color="purple"
        />
        <StatCard
          title="Séances"
          value={stats.seances.total}
          subtitle={`${stats.seances.cetteSemaine} cette semaine`}
          icon={Calendar}
          color="orange"
        />
      </div>

      {/* Graphiques et détails */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des étudiants */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <PieChart size={20} className="mr-2" />
            Répartition des Étudiants
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Actifs</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(stats.students.actifs / stats.students.total) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.students.actifs}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Diplômés</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(stats.students.diplomes / stats.students.total) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.students.diplomes}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Nouveaux cette année</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${(stats.students.nouveauxCetteAnnee / stats.students.total) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.students.nouveauxCetteAnnee}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Types de salles */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 size={20} className="mr-2" />
            Types de Salles
          </h3>
          <div className="space-y-3">
            {stats.salles.parType.map((type, index) => {
              const colors = ['blue', 'green', 'purple', 'orange', 'red'];
              const color = colors[index % colors.length];
              return (
                <div key={type.type} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">{type.type}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className={`bg-${color}-500 h-2 rounded-full`} 
                        style={{ width: `${(type.count / stats.salles.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{type.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Types de cours */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BookOpen size={20} className="mr-2" />
            Types de Cours
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{stats.courses.obligatoires}</p>
              <p className="text-sm text-gray-600">Obligatoires</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{stats.courses.optionnelles}</p>
              <p className="text-sm text-gray-600">Optionnelles</p>
            </div>
          </div>
        </div>

        {/* Types de séances */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Clock size={20} className="mr-2" />
            Types de Séances
          </h3>
          <div className="space-y-3">
            {stats.seances.parType.map((type, index) => {
              const colors = ['blue', 'green', 'purple', 'orange', 'red'];
              const color = colors[index % colors.length];
              return (
                <div key={type.type} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">{type.type}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className={`bg-${color}-500 h-2 rounded-full`} 
                        style={{ width: `${(type.count / stats.seances.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{type.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Settings size={20} className="mr-2" />
          Actions Rapides
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <Users size={24} className="text-blue-600 mb-2" />
            <span className="text-sm font-medium">Gérer les Étudiants</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <BookOpen size={24} className="text-green-600 mb-2" />
            <span className="text-sm font-medium">Gérer les Cours</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <Calendar size={24} className="text-purple-600 mb-2" />
            <span className="text-sm font-medium">Gérer les Horaires</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
            <FileText size={24} className="text-orange-600 mb-2" />
            <span className="text-sm font-medium">Voir les Rapports</span>
          </button>
        </div>
      </div>
    </div>
  );
};
