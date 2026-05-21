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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/api/client';
import { useAuthStore } from '@/store/authStore';

interface Etudiant {
  id: string;
  matricule: string;
  nom: string;
  prenoms: string;
}

interface EC {
  id: string;
  code: string;
  intitule: string;
  coefficient: number;
  ue: {
    id: string;
    code: string;
    intitule: string;
  };
}

interface Note {
  id?: string;
  valeur: number | null;
  absenceJustifiee: boolean;
  observations?: string;
}

interface GrilleSaisieData {
  parcoursId: string;
  semestre: number;
  anneeNiveau: number;
  etudiants: Array<{
    etudiant: Etudiant;
    notes: Array<{
      ec: EC;
      note: Note | null;
    }>;
  }>;
  ecs: EC[];
  sessions: Array<{
    id: string;
    libelle: string;
  }>;
}

interface GrilleSaisieNotesProps {
  parcoursId: string;
  semestre: number;
  anneeNiveau: number;
  ecId?: string;
  onSave?: (data: any) => void;
}

export const GrilleSaisieNotes: React.FC<GrilleSaisieNotesProps> = ({
  parcoursId,
  semestre,
  anneeNiveau,
  ecId,
  onSave,
}) => {
  const [data, setData] = useState<GrilleSaisieData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [modifiedCells, setModifiedCells] = useState<Set<string>>(new Set());
  const [validationErrors, setValidationErrors] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    chargerGrille();
  }, [parcoursId, semestre, anneeNiveau, ecId]);

  const { user } = useAuthStore();
  const tenantId = user?.tenantId;

  const chargerGrille = async () => {
    if (!tenantId) return;
    
    try {
      setLoading(true);
      const params = new URLSearchParams({
        parcoursId,
        semestre: semestre.toString(),
        anneeNiveau: anneeNiveau.toString(),
        ...(ecId && { ecId }),
      });

      const grilleData = await apiClient.get(`/scolarite/${tenantId}/notes/grille-saisie?${params}`);
      setData(grilleData);
      
      // Sélectionner la première session par défaut
      if (grilleData.sessions && grilleData.sessions.length > 0) {
        setSelectedSession(grilleData.sessions[0].id);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la grille de saisie',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNoteChange = (etudiantIndex: number, ecIndex: number, value: string) => {
    if (!data) return;

    const cellKey = `${etudiantIndex}-${ecIndex}`;
    const numValue = value === '' ? null : parseFloat(value);

    // Validation
    if (numValue !== null && (numValue < 0 || numValue > 20)) {
      setValidationErrors(prev => new Map(prev).set(cellKey, 'La note doit être entre 0 et 20'));
      return;
    } else {
      setValidationErrors(prev => {
        const newMap = new Map(prev);
        newMap.delete(cellKey);
        return newMap;
      });
    }

    const newData = { ...data };
    const noteData = newData.etudiants[etudiantIndex].notes[ecIndex];
    
    if (!noteData.note) {
      noteData.note = {
        valeur: numValue,
        absenceJustifiee: false,
      };
    } else {
      noteData.note.valeur = numValue;
    }

    setData(newData);
    setModifiedCells(prev => new Set(prev).add(cellKey));
  };

  const handleAbsenceChange = (etudiantIndex: number, ecIndex: number) => {
    if (!data) return;

    const cellKey = `${etudiantIndex}-${ecIndex}`;
    const newData = { ...data };
    const noteData = newData.etudiants[etudiantIndex].notes[ecIndex];
    
    if (!noteData.note) {
      noteData.note = {
        valeur: null,
        absenceJustifiee: true,
      };
    } else {
      noteData.note.absenceJustifiee = !noteData.note.absenceJustifiee;
    }

    setData(newData);
    setModifiedCells(prev => new Set(prev).add(cellKey));
  };

  const sauvegarderNotes = async () => {
    if (!data || !selectedSession || !tenantId) return;

    if (validationErrors.size > 0) {
      toast({
        title: 'Erreur de validation',
        description: 'Veuillez corriger les erreurs avant de sauvegarder',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);

      // Préparer les données pour l'API
      const notesToSave = [];
      data.etudiants.forEach((etudiantData, etudiantIndex) => {
        etudiantData.notes.forEach((noteData, ecIndex) => {
          const cellKey = `${etudiantIndex}-${ecIndex}`;
          if (modifiedCells.has(cellKey) && noteData.note) {
            notesToSave.push({
              etudiantId: etudiantData.etudiant.id,
              ecId: noteData.ec.id,
              sessionId: selectedSession,
              valeur: noteData.note.valeur,
              absenceJustifiee: noteData.note.absenceJustifiee,
              observations: noteData.note.observations,
            });
          }
        });
      });

      const result = await apiClient.post(`/scolarite/${tenantId}/notes/saisie-massive`, {
        sessionId: selectedSession,
        ecId: ecId || data.ecs[0]?.id,
        notes: notesToSave,
        userId: user?.id,
      });
      
      toast({
        title: 'Succès',
        description: `${result.succes} notes sauvegardées avec succès`,
      });

      if (result.erreurs && result.erreurs.length > 0) {
        toast({
          title: 'Attention',
          description: `${result.erreurs.length} erreurs rencontrées`,
          variant: 'destructive',
        });
      }

      setModifiedCells(new Set());
      onSave?.(result);

    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les notes',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const exporterExcel = async () => {
    if (!data || !tenantId) return;

    try {
      const params = new URLSearchParams({
        parcoursId,
        semestre: semestre.toString(),
        anneeNiveau: anneeNiveau.toString(),
        format: 'excel',
        ...(ecId && { ecId }),
      });

      // Note: apiClient.get returns JSON, for blob we need fetch
      const response = await fetch(`/api/v1/scolarite/${tenantId}/notes/export/excel?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Erreur lors de l\'export');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notes-${parcoursId}-S${semestre}-N${anneeNiveau}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Succès',
        description: 'Fichier Excel exporté avec succès',
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'exporter le fichier',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Chargement de la grille...</span>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Impossible de charger les données. Veuillez réessayer.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Grille de Saisie des Notes</CardTitle>
            <CardDescription>
              Semestre {semestre} - Niveau {anneeNiveau}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={selectedSession} onValueChange={setSelectedSession}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sélectionner une session" />
              </SelectTrigger>
              <SelectContent>
                {data.sessions.map((session) => (
                  <SelectItem key={session.id} value={session.id}>
                    {session.libelle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exporterExcel}>
              <Download className="h-4 w-4 mr-2" />
              Exporter Excel
            </Button>
            <Button 
              onClick={sauvegarderNotes} 
              disabled={saving || modifiedCells.size === 0}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Sauvegarder ({modifiedCells.size})
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {validationErrors.size > 0 && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {validationErrors.size} erreur(s) de validation à corriger
            </AlertDescription>
          </Alert>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background">Matricule</TableHead>
                <TableHead className="sticky left-24 bg-background">Nom</TableHead>
                <TableHead className="sticky left-64 bg-background">Prénoms</TableHead>
                {data.ecs.map((ec) => (
                  <TableHead key={ec.id} className="min-w-32">
                    <div className="text-center">
                      <div className="font-semibold">{ec.code}</div>
                      <div className="text-xs text-muted-foreground">{ec.intitule}</div>
                      <Badge variant="secondary" className="text-xs">
                        Coef: {ec.coefficient}
                      </Badge>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.etudiants.map((etudiantData, etudiantIndex) => (
                <TableRow key={etudiantData.etudiant.id}>
                  <TableCell className="sticky left-0 bg-background font-medium">
                    {etudiantData.etudiant.matricule}
                  </TableCell>
                  <TableCell className="sticky left-24 bg-background">
                    {etudiantData.etudiant.nom}
                  </TableCell>
                  <TableCell className="sticky left-64 bg-background">
                    {etudiantData.etudiant.prenoms}
                  </TableCell>
                  {etudiantData.notes.map((noteData, ecIndex) => {
                    const cellKey = `${etudiantIndex}-${ecIndex}`;
                    const isModified = modifiedCells.has(cellKey);
                    const hasError = validationErrors.has(cellKey);

                    return (
                      <TableCell key={noteData.ec.id} className="p-2">
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min="0"
                            max="20"
                            step="0.5"
                            value={noteData.note?.valeur ?? ''}
                            onChange={(e) => handleNoteChange(etudiantIndex, ecIndex, e.target.value)}
                            className={`w-16 h-8 text-center ${
                              isModified ? 'border-orange-300 bg-orange-50' : ''
                            } ${hasError ? 'border-red-300' : ''}`}
                            placeholder="-"
                          />
                          <input
                            type="checkbox"
                            checked={noteData.note?.absenceJustifiee ?? false}
                            onChange={() => handleAbsenceChange(etudiantIndex, ecIndex)}
                            className="h-4 w-4"
                            title="Absence justifiée"
                          />
                          {isModified && (
                            <CheckCircle className="h-4 w-4 text-orange-500" />
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <div>
            {data.etudiants.length} étudiant(s) • {data.ecs.length} EC(s)
          </div>
          <div>
            {modifiedCells.size} modification(s) non sauvegardée(s)
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
