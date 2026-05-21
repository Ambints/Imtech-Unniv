import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  GraduationCap,
  BookOpen,
  Award,
  FileText,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Filter,
  Loader2
} from 'lucide-react';
import { GrilleSaisieNotes } from '@/components/scolarite/GrilleSaisieNotes';
import { DeliberationPanel } from '@/components/scolarite/DeliberationPanel';
import { GestionDiplomes } from '@/components/scolarite/GestionDiplomes';
import { apiClient } from '@/api/client';
import { useAuthStore } from '@/store/authStore';

interface Parcours {
  id: string;
  code: string;
  nom: string;
  niveau: string;
}

interface Statistiques {
  totalEtudiants: number;
  totalInscriptions: number;
  totalDeliberations: number;
  totalDiplomes: number;
  deliberationsEnCours: number;
  diplomesEnAttente: number;
  tauxReussite?: number;
}

export const ScolariteDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const tenantId = user?.tenantId;

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedParcours, setSelectedParcours] = useState<string>('');
  const [selectedSemestre, setSelectedSemestre] = useState<number>(1);
  const [selectedNiveau, setSelectedNiveau] = useState<number>(1);
  const [selectedEC, setSelectedEC] = useState<string>('');
  const [selectedDeliberation, setSelectedDeliberation] = useState<string>('');

  const [parcours, setParcours] = useState<Parcours[]>([]);
  const [statistiques, setStatistiques] = useState<Statistiques>({
    totalEtudiants: 0,
    totalInscriptions: 0,
    totalDeliberations: 0,
    totalDiplomes: 0,
    deliberationsEnCours: 0,
    diplomesEnAttente: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenantId) {
      chargerDonnees();
    }
  }, [tenantId]);

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      // Dashboard API removed - parcours endpoint was causing 500 errors
      // Data will be loaded from pedagogique module instead
      setParcours([]);
      setStatistiques({
        totalEtudiants: 0,
        totalInscriptions: 0,
        totalDeliberations: 0,
        totalDiplomes: 0,
        deliberationsEnCours: 0,
        diplomesEnAttente: 0,
      });
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const recentActivities = [
    {
      id: '1',
      type: 'deliberation',
      title: 'Délibération Licence Info - S2',
      description: 'Session normale terminée',
      date: '2024-01-15',
      statut: 'completed',
      icon: <CheckCircle className="h-4 w-4" />,
    },
    {
      id: '2',
      type: 'notes',
      title: 'Saisie notes - Algorithmique',
      description: '45 notes saisies',
      date: '2024-01-14',
      statut: 'completed',
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      id: '3',
      type: 'diplome',
      title: 'Génération diplôme',
      description: 'RAKOTO Jean - Licence Info',
      date: '2024-01-13',
      statut: 'pending',
      icon: <Clock className="h-4 w-4" />,
    },
    {
      id: '4',
      type: 'alert',
      title: 'Notes manquantes',
      description: '12 étudiants sans notes en BDD',
      date: '2024-01-12',
      statut: 'warning',
      icon: <AlertCircle className="h-4 w-4" />,
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'deliberation': return <GraduationCap className="h-4 w-4" />;
      case 'notes': return <BookOpen className="h-4 w-4" />;
      case 'diplome': return <Award className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'warning': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Module Scolarité et Notes</h1>
          <p className="text-muted-foreground">
            Gestion complète des notes, délibérations et diplômes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Rechercher
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle inscription
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="deliberation">Délibérations</TabsTrigger>
          <TabsTrigger value="diplomes">Diplômes</TabsTrigger>
          <TabsTrigger value="archives">Archives</TabsTrigger>
        </TabsList>

        {/* Onglet Aperçu */}
        <TabsContent value="overview" className="space-y-6">
          {/* Statistiques principales */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Chargement des statistiques...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Étudiants inscrits</p>
                      <p className="text-2xl font-bold">{statistiques.totalEtudiants}</p>
                      <p className="text-xs text-muted-foreground">
                        {statistiques.totalInscriptions} inscriptions actives
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Délibérations</p>
                      <p className="text-2xl font-bold">{statistiques.totalDeliberations}</p>
                      <p className="text-xs text-muted-foreground">
                        {statistiques.deliberationsEnCours} en cours
                      </p>
                    </div>
                    <GraduationCap className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Diplômes délivrés</p>
                      <p className="text-2xl font-bold">{statistiques.totalDiplomes}</p>
                      <p className="text-xs text-muted-foreground">
                        {statistiques.diplomesEnAttente} en attente
                      </p>
                    </div>
                    <Award className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Taux de réussite</p>
                      <p className="text-2xl font-bold text-green-600">
                        {statistiques.tauxReussite?.toFixed(1) || '0.0'}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Session en cours
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Activités récentes */}
          <Card>
            <CardHeader>
              <CardTitle>Activités récentes</CardTitle>
              <CardDescription>
                Dernières actions dans le module de scolarité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full bg-muted ${getStatutColor(activity.statut)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{activity.date}</p>
                      <Badge variant={activity.statut === 'completed' ? 'default' : 'secondary'}>
                        {activity.statut === 'completed' ? 'Terminé' : 
                         activity.statut === 'pending' ? 'En attente' : 'Alerte'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" 
                  onClick={() => setActiveTab('notes')}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Saisie des notes</p>
                    <p className="text-sm text-muted-foreground">
                      Accéder à la grille de saisie
                    </p>
                  </div>
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setActiveTab('deliberation')}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Nouvelle délibération</p>
                    <p className="text-sm text-muted-foreground">
                      Lancer une session de délibération
                    </p>
                  </div>
                  <GraduationCap className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setActiveTab('diplomes')}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Générer diplôme</p>
                    <p className="text-sm text-muted-foreground">
                      Créer un nouveau diplôme
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Notes */}
        <TabsContent value="notes" className="space-y-6">
          {/* Filtres pour la grille de saisie */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Gestion des Notes
              </CardTitle>
              <CardDescription>
                Saisie, modification et suivi des notes des étudiants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Select value={selectedParcours} onValueChange={setSelectedParcours} disabled={loading || parcours.length === 0}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder={loading ? "Chargement..." : parcours.length === 0 ? "Aucun parcours" : "Sélectionner un parcours"} />
                  </SelectTrigger>
                  <SelectContent>
                    {parcours.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.code} - {p.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedSemestre.toString()} onValueChange={(v) => setSelectedSemestre(parseInt(v))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Semestre 1</SelectItem>
                    <SelectItem value="2">Semestre 2</SelectItem>
                    <SelectItem value="3">Semestre 3</SelectItem>
                    <SelectItem value="4">Semestre 4</SelectItem>
                    <SelectItem value="5">Semestre 5</SelectItem>
                    <SelectItem value="6">Semestre 6</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedNiveau.toString()} onValueChange={(v) => setSelectedNiveau(parseInt(v))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Niveau 1</SelectItem>
                    <SelectItem value="2">Niveau 2</SelectItem>
                    <SelectItem value="3">Niveau 3</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedEC} onValueChange={setSelectedEC}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrer par EC (optionnel)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les EC</SelectItem>
                    {/* TODO: Charger la liste des EC selon le parcours/semestre */}
                    <SelectItem value="ec1">Algorithmique</SelectItem>
                    <SelectItem value="ec2">Base de données</SelectItem>
                    <SelectItem value="ec3">Développement Web</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Grille de saisie */}
          {selectedParcours && (
            <GrilleSaisieNotes
              parcoursId={selectedParcours}
              semestre={selectedSemestre}
              anneeNiveau={selectedNiveau}
              ecId={selectedEC || undefined}
              onSave={(data) => {
                console.log('Notes sauvegardées:', data);
              }}
            />
          )}

          {!selectedParcours && (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center text-muted-foreground">
                  <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Veuillez sélectionner un parcours pour afficher la grille de saisie</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Onglet Délibérations */}
        <TabsContent value="deliberation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Délibérations
              </CardTitle>
              <CardDescription>
                Gestion des sessions de délibération et validation des résultats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Select value={selectedDeliberation} onValueChange={setSelectedDeliberation}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Sélectionner une délibération" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* TODO: Charger la liste des délibérations */}
                    <SelectItem value="delib1">Licence Info - Semestre 2 - Session 1</SelectItem>
                    <SelectItem value="delib2">Master Info - Semestre 4 - Session 1</SelectItem>
                    <SelectItem value="delib3">Licence GC - Semestre 2 - Session 1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {selectedDeliberation ? (
            <DeliberationPanel
              deliberationId={selectedDeliberation}
              onDeliberationComplete={(deliberation) => {
                console.log('Délibération complétée:', deliberation);
              }}
            />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center text-muted-foreground">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Veuillez sélectionner une délibération pour afficher les détails</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Onglet Diplômes */}
        <TabsContent value="diplomes">
          <GestionDiplomes />
        </TabsContent>

        {/* Onglet Archives (placeholder) */}
        <TabsContent value="archives" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Archives Scolarité
              </CardTitle>
              <CardDescription>
                Consultation des documents archivés (relevés, attestations, diplômes)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Module d'archives à implémenter</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
