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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Eye, 
  Award, 
  FileText, 
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  QrCode,
  Shield
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Etudiant {
  id: string;
  matricule: string;
  nom: string;
  prenoms: string;
}

interface Parcours {
  id: string;
  code: string;
  nom: string;
  niveau: string;
}

interface Diplome {
  id: string;
  etudiant: Etudiant;
  parcours: Parcours;
  typeDiplome: string;
  mentionGenerale: string;
  moyenneFinale: number;
  totalCreditsECTS: number;
  dateObtention: string;
  lieuObtention: string;
  numeroDiplome: string;
  hashIntegrite: string;
  statut: string;
  dateDelivrance: string;
  dateRetrait?: string;
}

interface VerificationConditions {
  peutObtenir: boolean;
  conditions: {
    tousSemestresValidés: boolean;
    tousCreditsAcquis: boolean;
    moyenneMinimale: boolean;
    totalCreditsAcquis: number;
    creditsRequis: number;
    moyenneFinale: number;
    nombreSemestresValidés: number;
    semestresRequis: number;
    detailsSemestres: Array<{
      semestre: number;
      statut: string;
      moyenne: number;
      credits: number;
    }>;
  };
  rapport: string;
}

export const GestionDiplomes: React.FC = () => {
  const [diplomes, setDiplomes] = useState<Diplome[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAnnee, setFilterAnnee] = useState<string>('all');
  const [selectedDiplome, setSelectedDiplome] = useState<Diplome | null>(null);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [showGenerationDialog, setShowGenerationDialog] = useState(false);
  const [verificationData, setVerificationData] = useState<VerificationConditions | null>(null);
  const [generationEnCours, setGenerationEnCours] = useState(false);

  useEffect(() => {
    chargerDiplomes();
  }, []);

  const chargerDiplomes = async (filters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/scolarite/diplomes?${params}`);
      if (!response.ok) throw new Error('Erreur lors du chargement');
      
      const data = await response.json();
      setDiplomes(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les diplômes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const verifierConditionsObtention = async (etudiantId: string, inscriptionId: string) => {
    try {
      const response = await fetch(`/api/scolarite/diplomes/verification/${etudiantId}/${inscriptionId}`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Erreur lors de la vérification');

      const data = await response.json();
      setVerificationData(data);
      setShowVerificationDialog(true);
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de vérifier les conditions',
        variant: 'destructive',
      });
    }
  };

  const genererDiplome = async (etudiantId: string, inscriptionId: string) => {
    try {
      setGenerationEnCours(true);
      const response = await fetch('/api/scolarite/diplomes/generer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          etudiantId,
          inscriptionId,
          userId: 'current-user-id', // TODO: Récupérer l'ID utilisateur
          dateObtention: new Date().toISOString().split('T')[0],
          lieuObtention: 'Antananarivo',
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la génération');

      const diplome = await response.json();
      
      toast({
        title: 'Succès',
        description: `Diplôme ${diplome.numeroDiplome} généré avec succès`,
      });

      setShowGenerationDialog(false);
      chargerDiplomes();

    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le diplôme',
        variant: 'destructive',
      });
    } finally {
      setGenerationEnCours(false);
    }
  };

  const telechargerDiplomePDF = async (diplomeId: string) => {
    try {
      const response = await fetch(`/api/scolarite/diplomes/${diplomeId}/pdf`);
      if (!response.ok) throw new Error('Erreur lors du téléchargement');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diplome-${diplomeId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Succès',
        description: 'Diplôme téléchargé avec succès',
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de télécharger le diplôme',
        variant: 'destructive',
      });
    }
  };

  const telechargerSuplementPDF = async (diplomeId: string) => {
    try {
      const response = await fetch(`/api/scolarite/diplomes/${diplomeId}/suplement/pdf`);
      if (!response.ok) throw new Error('Erreur lors du téléchargement');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `suplement-diplome-${diplomeId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Succès',
        description: 'Supplément au diplôme téléchargé avec succès',
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de télécharger le supplément',
        variant: 'destructive',
      });
    }
  };

  const marquerRetire = async (diplomeId: string) => {
    try {
      const response = await fetch(`/api/scolarite/diplomes/${diplomeId}/retirer`, {
        method: 'GET',
      });

      if (!response.ok) throw new Error('Erreur lors du marquage');

      toast({
        title: 'Succès',
        description: 'Diplôme marqué comme retiré',
      });

      chargerDiplomes();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de marquer le diplôme comme retiré',
        variant: 'destructive',
      });
    }
  };

  const filtrerDiplomes = () => {
    const filters: any = {};
    
    if (filterStatut !== 'all') filters.statut = filterStatut;
    if (filterType !== 'all') filters.typeDiplome = filterType;
    if (filterAnnee !== 'all') filters.annee = filterAnnee;
    
    chargerDiplomes(filters);
  };

  const getStatutBadgeVariant = (statut: string) => {
    switch (statut) {
      case 'delivre': return 'default';
      case 'retire': return 'secondary';
      case 'en_attente': return 'outline';
      default: return 'destructive';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'delivre': return <CheckCircle className="h-4 w-4" />;
      case 'retire': return <Award className="h-4 w-4" />;
      case 'en_attente': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const diplomesFiltres = diplomes.filter(diplome =>
    diplome.etudiant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    diplome.etudiant.prenoms.toLowerCase().includes(searchTerm.toLowerCase()) ||
    diplome.etudiant.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
    diplome.numeroDiplome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Chargement des diplômes...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Gestion des Diplômes
          </CardTitle>
          <CardDescription>
            Génération et suivi des diplômes délivrés par l'établissement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, prénom, matricule ou numéro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={filterStatut} onValueChange={setFilterStatut}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="delivre">Délivré</SelectItem>
                  <SelectItem value="retire">Retiré</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="licence">Licence</SelectItem>
                  <SelectItem value="master">Master</SelectItem>
                  <SelectItem value="doctorat">Doctorat</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterAnnee} onValueChange={setFilterAnnee}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Année" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={filtrerDiplomes} variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtrer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des diplômes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Liste des diplômes</CardTitle>
              <CardDescription>
                {diplomesFiltres.length} diplôme(s) trouvé(s)
              </CardDescription>
            </div>
            <Button onClick={() => setShowGenerationDialog(true)}>
              <Award className="h-4 w-4 mr-2" />
              Générer un diplôme
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Étudiant</TableHead>
                  <TableHead>Parcours</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Moyenne</TableHead>
                  <TableHead>Mention</TableHead>
                  <TableHead>Date obtention</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {diplomesFiltres.map((diplome) => (
                  <TableRow key={diplome.id}>
                    <TableCell className="font-medium">
                      {diplome.numeroDiplome || '-'}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {diplome.etudiant.nom} {diplome.etudiant.prenoms}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {diplome.etudiant.matricule}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{diplome.parcours.code}</div>
                        <div className="text-sm text-muted-foreground">
                          {diplome.parcours.niveau}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {diplome.typeDiplome}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {diplome.moyenneFinale?.toFixed(2)}/20
                    </TableCell>
                    <TableCell>{diplome.mentionGenerale}</TableCell>
                    <TableCell>
                      {new Date(diplome.dateObtention).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatutBadgeVariant(diplome.statut)}>
                        {getStatutIcon(diplome.statut)}
                        {diplome.statut}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {diplome.statut === 'delivre' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => telechargerDiplomePDF(diplome.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => telechargerSuplementPDF(diplome.id)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            {diplome.hashIntegrite && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    `https://imtech.edu/verification/${diplome.numeroDiplome}`
                                  );
                                  toast({
                                    title: 'Lien copié',
                                    description: 'Lien de vérification copié dans le presse-papiers',
                                  });
                                }}
                              >
                                <QrCode className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedDiplome(diplome)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {diplomesFiltres.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun diplôme trouvé pour les critères sélectionnés
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogue de vérification des conditions */}
      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vérification des conditions d'obtention</DialogTitle>
            <DialogDescription>
              Analyse de l'éligibilité au diplôme
            </DialogDescription>
          </DialogHeader>
          
          {verificationData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Semestres validés</p>
                        <p className="text-2xl font-bold">
                          {verificationData.conditions.nombreSemestresValidés}/
                          {verificationData.conditions.semestresRequis}
                        </p>
                      </div>
                      <CheckCircle className={`h-8 w-8 ${
                        verificationData.conditions.tousSemestresValidés 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Crédits ECTS</p>
                        <p className="text-2xl font-bold">
                          {verificationData.conditions.totalCreditsAcquis}/
                          {verificationData.conditions.creditsRequis}
                        </p>
                      </div>
                      <Award className={`h-8 w-8 ${
                        verificationData.conditions.tousCreditsAcquis 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Moyenne finale</p>
                        <p className="text-2xl font-bold">
                          {verificationData.conditions.moyenneFinale.toFixed(2)}/20
                        </p>
                      </div>
                      <Shield className={`h-8 w-8 ${
                        verificationData.conditions.moyenneMinimale 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Éligibilité</p>
                        <p className="text-2xl font-bold">
                          {verificationData.peutObtenir ? 'OUI' : 'NON'}
                        </p>
                      </div>
                      <CheckCircle className={`h-8 w-8 ${
                        verificationData.peutObtenir 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <AlertDescription className="whitespace-pre-line">
                  {verificationData.rapport}
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVerificationDialog(false)}>
              Fermer
            </Button>
            {verificationData?.peutObtenir && (
              <Button 
                onClick={() => {
                  // TODO: Implémenter la génération depuis ce dialogue
                  toast({
                    title: 'Info',
                    description: 'Génération à implémenter',
                  });
                }}
                disabled={generationEnCours}
              >
                {generationEnCours ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Award className="h-4 w-4 mr-2" />
                )}
                Générer le diplôme
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue des détails du diplôme */}
      <Dialog open={!!selectedDiplome} onOpenChange={(open) => !open && setSelectedDiplome(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du diplôme</DialogTitle>
            <DialogDescription>
              {selectedDiplome?.numeroDiplome}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDiplome && (
            <Tabs defaultValue="informations" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="informations">Informations</TabsTrigger>
                <TabsTrigger value="verification">Vérification</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="informations" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Étudiant</label>
                    <p className="font-medium">
                      {selectedDiplome.etudiant.nom} {selectedDiplome.etudiant.prenoms}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedDiplome.etudiant.matricule}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Parcours</label>
                    <p className="font-medium">{selectedDiplome.parcours.nom}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedDiplome.parcours.code} - {selectedDiplome.parcours.niveau}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Résultats</label>
                    <p className="font-medium">Moyenne: {selectedDiplome.moyenneFinale}/20</p>
                    <p className="text-sm text-muted-foreground">
                      Mention: {selectedDiplome.mentionGenerale}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Crédits</label>
                    <p className="font-medium">{selectedDiplome.totalCreditsECTS} ECTS</p>
                    <p className="text-sm text-muted-foreground">
                      Type: {selectedDiplome.typeDiplome}
                    </p>
                  </div>
                </div>
                
                {selectedDiplome.hashIntegrite && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Hash d'intégrité</label>
                    <p className="font-mono text-xs bg-muted p-2 rounded">
                      {selectedDiplome.hashIntegrite}
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="verification" className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Ce diplôme est authentifié par un hash cryptographique SHA-512 garantissant 
                    son intégrité et son authenticité.
                  </AlertDescription>
                </Alert>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Lien de vérification publique</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={`https://imtech.edu/verification/${selectedDiplome.numeroDiplome}`}
                      readOnly
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `https://imtech.edu/verification/${selectedDiplome.numeroDiplome}`
                        );
                        toast({
                          title: 'Lien copié',
                          description: 'Lien de vérification copié dans le presse-papiers',
                        });
                      }}
                    >
                      Copier
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="documents" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => telechargerDiplomePDF(selectedDiplome.id)}
                    className="h-20 flex-col"
                  >
                    <Download className="h-8 w-8 mb-2" />
                    Diplôme PDF
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => telechargerSuplementPDF(selectedDiplome.id)}
                    className="h-20 flex-col"
                  >
                    <FileText className="h-8 w-8 mb-2" />
                    Supplément PDF
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedDiplome(null)}>
              Fermer
            </Button>
            {selectedDiplome?.statut === 'delivre' && (
              <Button 
                variant="destructive"
                onClick={() => {
                  marquerRetire(selectedDiplome.id);
                  setSelectedDiplome(null);
                }}
              >
                Marquer comme retiré
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
