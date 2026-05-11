import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/text';
import { 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  Eye, 
  Lock, 
  Unlock,
  Users,
  TrendingUp,
  Award,
  FileText
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Etudiant {
  id: string;
  matricule: string;
  nom: string;
  prenoms: string;
}

interface ResultatSemestre {
  id: string;
  etudiant: Etudiant;
  semestre: number;
  anneeNiveau: number;
  moyenneGenerale: number;
  totalCreditsECTS: number;
  creditsAcquis: number;
  creditsManquants: number;
  nombreUEs: number;
  nombreUEsValidees: number;
  statut: string;
  mention: string;
  classement?: number;
  effectifPromotion?: number;
}

interface Deliberation {
  id: string;
  sessionExamen: {
    id: string;
    libelle: string;
  };
  parcours: {
    id: string;
    code: string;
    nom: string;
  };
  semestre: number;
  anneeNiveau: number;
  dateDeliberation: string;
  presidentJury: {
    id: string;
    nom: string;
    prenoms: string;
  };
  statut: string;
  observationsGenerales?: string;
  resultatsSemestre?: ResultatSemestre[];
}

interface Statistiques {
  effectifTotal: number;
  admis: number;
  ajournes: number;
  redoublants: number;
  moyennePromotion: number;
  moyenneMax: number;
  moyenneMin: number;
  distribution: {
    'Très Bien': number;
    'Bien': number;
    'Assez Bien': number;
    'Passable': number;
    'Insuffisant': number;
  };
}

interface DeliberationPanelProps {
  deliberationId?: string;
  onDeliberationComplete?: (deliberation: Deliberation) => void;
}

export const DeliberationPanel: React.FC<DeliberationPanelProps> = ({
  deliberationId,
  onDeliberationComplete,
}) => {
  const [deliberation, setDeliberation] = useState<Deliberation | null>(null);
  const [resultats, setResultats] = useState<ResultatSemestre[]>([]);
  const [statistiques, setStatistiques] = useState<Statistiques | null>(null);
  const [loading, setLoading] = useState(false);
  const [lancementEnCours, setLancementEnCours] = useState(false);
  const [validationEnCours, setValidationEnCours] = useState(false);
  const [showRapportDialog, setShowRapportDialog] = useState(false);

  useEffect(() => {
    if (deliberationId) {
      chargerDeliberation(deliberationId);
    }
  }, [deliberationId]);

  const chargerDeliberation = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/scolarite/deliberations/${id}`);
      if (!response.ok) throw new Error('Erreur lors du chargement');
      
      const data = await response.json();
      setDeliberation(data);
      setResultats(data.resultatsSemestre || []);
      
      // Calculer les statistiques si les résultats sont disponibles
      if (data.resultatsSemestre && data.resultatsSemestre.length > 0) {
        calculerStatistiques(data.resultatsSemestre);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la délibération',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const lancerDeliberation = async () => {
    if (!deliberation) return;

    try {
      setLancementEnCours(true);
      const response = await fetch(`/api/scolarite/deliberations/${deliberation.id}/lancer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'current-user-id', // TODO: Récupérer l'ID utilisateur
        }),
      });

      if (!response.ok) throw new Error('Erreur lors du lancement');

      const result = await response.json();
      setDeliberation(result.deliberation);
      setResultats(result.resultats);
      setStatistiques(result.statistiques);

      toast({
        title: 'Succès',
        description: 'Délibération lancée avec succès',
      });

    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de lancer la délibération',
        variant: 'destructive',
      });
    } finally {
      setLancementEnCours(false);
    }
  };

  const validerDeliberation = async (observations?: string) => {
    if (!deliberation) return;

    try {
      setValidationEnCours(true);
      const response = await fetch(`/api/scolarite/deliberations/${deliberation.id}/valider`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'current-user-id', // TODO: Récupérer l'ID utilisateur
          observations,
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la validation');

      const updatedDeliberation = await response.json();
      setDeliberation(updatedDeliberation);

      toast({
        title: 'Succès',
        description: 'Délibération validée avec succès',
      });

      onDeliberationComplete?.(updatedDeliberation);

    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de valider la délibération',
        variant: 'destructive',
      });
    } finally {
      setValidationEnCours(false);
    }
  };

  const calculerStatistiques = (resultatsData: ResultatSemestre[]) => {
    const stats: Statistiques = {
      effectifTotal: resultatsData.length,
      admis: resultatsData.filter(r => r.statut === 'valide').length,
      ajournes: resultatsData.filter(r => r.statut === 'ajourne').length,
      redoublants: resultatsData.filter(r => r.statut === 'redoublement').length,
      moyennePromotion: 0,
      moyenneMax: 0,
      moyenneMin: 20,
      distribution: {
        'Très Bien': 0,
        'Bien': 0,
        'Assez Bien': 0,
        'Passable': 0,
        'Insuffisant': 0,
      },
    };

    const moyennes = resultatsData.map(r => r.moyenneGenerale || 0);
    stats.moyennePromotion = moyennes.reduce((a, b) => a + b, 0) / moyennes.length;
    stats.moyenneMax = Math.max(...moyennes);
    stats.moyenneMin = Math.min(...moyennes);

    resultatsData.forEach(r => {
      if (r.mention && stats.distribution[r.mention] !== undefined) {
        stats.distribution[r.mention]++;
      }
    });

    setStatistiques(stats);
  };

  const exporterRapportPDF = async () => {
    if (!deliberation) return;

    try {
      const response = await fetch(`/api/scolarite/deliberations/${deliberation.id}/rapport/pdf`);
      if (!response.ok) throw new Error('Erreur lors de l\'export');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-deliberation-${deliberation.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Succès',
        description: 'Rapport PDF exporté avec succès',
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'exporter le rapport',
        variant: 'destructive',
      });
    }
  };

  const getStatutBadgeVariant = (statut: string) => {
    switch (statut) {
      case 'valide': return 'default';
      case 'ajourne': return 'secondary';
      case 'redoublement': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'valide': return <CheckCircle className="h-4 w-4" />;
      case 'ajourne': return <AlertCircle className="h-4 w-4" />;
      case 'redoublement': return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Chargement...</span>
        </CardContent>
      </Card>
    );
  }

  if (!deliberation) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Aucune délibération sélectionnée
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête de la délibération */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Délibération - {deliberation.parcours.code}
                <Badge variant={deliberation.statut === 'terminee' ? 'default' : 'secondary'}>
                  {deliberation.statut}
                </Badge>
              </CardTitle>
              <CardDescription>
                {deliberation.sessionExamen.libelle} • Semestre {deliberation.semestre} • 
                Niveau {deliberation.anneeNiveau}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {deliberation.statut === 'planifiee' && (
                <Button onClick={lancerDeliberation} disabled={lancementEnCours}>
                  {lancementEnCours ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Lancer la délibération
                </Button>
              )}
              
              {deliberation.statut === 'en_cours' && (
                <Button onClick={() => validerDeliberation()} disabled={validationEnCours}>
                  {validationEnCours ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Valider la délibération
                </Button>
              )}

              <Dialog open={showRapportDialog} onOpenChange={setShowRapportDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={resultats.length === 0}>
                    <Eye className="h-4 w-4 mr-2" />
                    Voir le rapport
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Rapport de Délibération</DialogTitle>
                    <DialogDescription>
                      {deliberation.parcours.nom} - Semestre {deliberation.semestre}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Tabs defaultValue="resultats" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="resultats">Résultats</TabsTrigger>
                      <TabsTrigger value="statistiques">Statistiques</TabsTrigger>
                      <TabsTrigger value="distribution">Distribution</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="resultats" className="space-y-4">
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Classement</TableHead>
                              <TableHead>Matricule</TableHead>
                              <TableHead>Nom</TableHead>
                              <TableHead>Moyenne</TableHead>
                              <TableHead>Crédits</TableHead>
                              <TableHead>Statut</TableHead>
                              <TableHead>Mention</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {resultats.map((resultat) => (
                              <TableRow key={resultat.id}>
                                <TableCell>{resultat.classement}</TableCell>
                                <TableCell>{resultat.etudiant.matricule}</TableCell>
                                <TableCell>
                                  {resultat.etudiant.nom} {resultat.etudiant.prenoms}
                                </TableCell>
                                <TableCell className="font-medium">
                                  {resultat.moyenneGenerale?.toFixed(2)}/20
                                </TableCell>
                                <TableCell>
                                  {resultat.creditsAcquis}/{resultat.totalCreditsECTS}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={getStatutBadgeVariant(resultat.statut)}>
                                    {getStatutIcon(resultat.statut)}
                                    {resultat.statut}
                                  </Badge>
                                </TableCell>
                                <TableCell>{resultat.mention}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="statistiques" className="space-y-4">
                      {statistiques && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <Card>
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Effectif total</p>
                                  <p className="text-2xl font-bold">{statistiques.effectifTotal}</p>
                                </div>
                                <Users className="h-8 w-8 text-muted-foreground" />
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Admis</p>
                                  <p className="text-2xl font-bold text-green-600">{statistiques.admis}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-600" />
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Ajournés</p>
                                  <p className="text-2xl font-bold text-yellow-600">{statistiques.ajournes}</p>
                                </div>
                                <AlertCircle className="h-8 w-8 text-yellow-600" />
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Moyenne promotion</p>
                                  <p className="text-2xl font-bold">{statistiques.moyennePromotion.toFixed(2)}</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-muted-foreground" />
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="distribution" className="space-y-4">
                      {statistiques && (
                        <div className="space-y-4">
                          {Object.entries(statistiques.distribution).map(([mention, count]) => (
                            <div key={mention} className="flex items-center justify-between">
                              <span className="font-medium">{mention}</span>
                              <div className="flex items-center gap-2 flex-1 max-w-xs ml-4">
                                <Progress 
                                  value={(count / statistiques.effectifTotal) * 100} 
                                  className="flex-1" 
                                />
                                <span className="text-sm text-muted-foreground w-12 text-right">
                                  {count}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={exporterRapportPDF}>
                      <Download className="h-4 w-4 mr-2" />
                      Exporter PDF
                    </Button>
                    <Button onClick={() => setShowRapportDialog(false)}>
                      Fermer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistiques principales */}
      {statistiques && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taux de réussite</p>
                  <p className="text-2xl font-bold text-green-600">
                    {((statistiques.admis / statistiques.effectifTotal) * 100).toFixed(1)}%
                  </p>
                </div>
                <Award className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Moyenne max</p>
                  <p className="text-2xl font-bold">{statistiques.moyenneMax.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Moyenne min</p>
                  <p className="text-2xl font-bold">{statistiques.moyenneMin.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notes verrouillées</p>
                  <p className="text-2xl font-bold">
                    {deliberation.statut === 'terminee' ? (
                      <span className="flex items-center">
                        <Lock className="h-5 w-5 mr-1" />
                        Oui
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Unlock className="h-5 w-5 mr-1" />
                        Non
                      </span>
                    )}
                  </p>
                </div>
                {deliberation.statut === 'terminee' ? (
                  <Lock className="h-8 w-8 text-green-600" />
                ) : (
                  <Unlock className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tableau des résultats */}
      {resultats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats par étudiant</CardTitle>
            <CardDescription>
              {resultats.length} étudiants • {deliberation.parcours.nom}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matricule</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead className="text-right">Moyenne</TableHead>
                    <TableHead className="text-right">Crédits ECTS</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Mention</TableHead>
                    <TableHead className="text-right">Classement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultats.slice(0, 10).map((resultat) => (
                    <TableRow key={resultat.id}>
                      <TableCell className="font-medium">
                        {resultat.etudiant.matricule}
                      </TableCell>
                      <TableCell>
                        {resultat.etudiant.nom} {resultat.etudiant.prenoms}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {resultat.moyenneGenerale?.toFixed(2)}/20
                      </TableCell>
                      <TableCell className="text-right">
                        {resultat.creditsAcquis}/{resultat.totalCreditsECTS}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatutBadgeVariant(resultat.statut)}>
                          {getStatutIcon(resultat.statut)}
                          {resultat.statut}
                        </Badge>
                      </TableCell>
                      <TableCell>{resultat.mention}</TableCell>
                      <TableCell className="text-right">
                        {resultat.classement}/{resultat.effectifPromotion}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {resultats.length > 10 && (
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Affichage des 10 premiers résultats sur {resultats.length}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
