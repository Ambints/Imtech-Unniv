import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from '../entities/note.entity';
import { ResultatSemestre } from '../entities/resultat-semestre.entity';
import { ResultatUE } from '../entities/resultat-ue.entity';
import { UniteEnseignement } from '../entities/unite-enseignement.entity';
import { ElementConstitutif } from '../entities/element-constitutif.entity';
import { Inscription } from '../entities/inscription.entity';

@Injectable()
export class CalculMoyenneService {
  constructor(
    @InjectRepository(Note, 'tenant')
    private readonly noteRepository: Repository<Note>,
    @InjectRepository(ResultatSemestre, 'tenant')
    private readonly resultatSemestreRepository: Repository<ResultatSemestre>,
    @InjectRepository(ResultatUE, 'tenant')
    private readonly resultatUERepository: Repository<ResultatUE>,
    @InjectRepository(UniteEnseignement, 'tenant')
    private readonly ueRepository: Repository<UniteEnseignement>,
    @InjectRepository(ElementConstitutif, 'tenant')
    private readonly ecRepository: Repository<ElementConstitutif>,
    @InjectRepository(Inscription, 'tenant')
    private readonly inscriptionRepository: Repository<Inscription>,
  ) {}

  /**
   * Calcule la moyenne générale d'un étudiant pour un semestre donné
   */
  async calculerMoyenneSemestre(
    etudiantId: string,
    inscriptionId: string,
    semestre: number,
    anneeNiveau: number,
  ): Promise<{ moyenne: number; details: any }> {
    // Récupérer les UE du semestre
    const ues = await this.ueRepository.find({
      where: {
        semestre,
        anneeNiveau,
        statut: 'actif',
      },
      relations: ['elementConstitutifs'],
    });

    if (ues.length === 0) {
      throw new NotFoundException('Aucune UE trouvée pour ce semestre');
    }

    const details = {
      ues: [],
      totalCoefficients: 0,
      totalPoints: 0,
      creditsTotal: 0,
      creditsAcquis: 0,
    };

    for (const ue of ues) {
      const ueResult = await this.calculerMoyenneUE(
        etudiantId,
        ue.id,
        inscriptionId,
      );

      details.ues.push(ueResult);
      details.totalCoefficients += ue.coefficient;
      details.totalPoints += ueResult.moyenne * ue.coefficient;
      details.creditsTotal += ue.creditsECTS;

      if (ueResult.moyenne >= 10) {
        details.creditsAcquis += ue.creditsECTS;
      }
    }

    const moyenne = details.totalCoefficients > 0 
      ? Math.round((details.totalPoints / details.totalCoefficients) * 100) / 100 
      : 0;

    return {
      moyenne,
      details,
    };
  }

  /**
   * Calcule la moyenne pour une UE spécifique
   */
  async calculerMoyenneUE(
    etudiantId: string,
    ueId: string,
    inscriptionId: string,
  ): Promise<{ 
    moyenne: number; 
    creditsECTS: number;
    coefficient: number;
    details: any;
  }> {
    const ue = await this.ueRepository.findOne({
      where: { id: ueId },
      relations: ['elementConstitutifs'],
    });

    if (!ue) {
      throw new NotFoundException('UE non trouvée');
    }

    const ecs = ue.elementsConstitutifs;
    const details = {
      ecs: [],
      totalCoefficients: 0,
      totalPoints: 0,
    };

    for (const ec of ecs) {
      const notes = await this.noteRepository.find({
        where: {
          etudiant: { id: etudiantId },
          ec: { id: ec.id },
          absenceJustifiee: false,
        },
        relations: ['sessionExamen'],
      });

      if (notes.length > 0) {
        // Prendre la meilleure note ou la note de la session normale
        const noteFinale = this.determinerNoteFinale(notes);
        
        details.ecs.push({
          ec: ec,
          note: noteFinale.valeur,
          coefficient: ec.coefficient,
          points: noteFinale.valeur * ec.coefficient,
        });

        details.totalCoefficients += ec.coefficient;
        details.totalPoints += noteFinale.valeur * ec.coefficient;
      }
    }

    const moyenne = details.totalCoefficients > 0 
      ? Math.round((details.totalPoints / details.totalCoefficients) * 100) / 100 
      : 0;

    return {
      moyenne,
      creditsECTS: ue.creditsECTS,
      coefficient: ue.coefficient,
      details,
    };
  }

  /**
   * Détermine la note finale à partir des différentes sessions
   */
  private determinerNoteFinale(notes: Note[]): Note {
    // Priorité: session normale > rattrapage > deuxième chance
    const sessionNormale = notes.find(n => 
      n.sessionExamen.typeSession === 'normale'
    );
    
    if (sessionNormale && sessionNormale.valeur >= 10) {
      return sessionNormale;
    }

    const sessionRattrapage = notes.find(n => 
      n.sessionExamen.typeSession === 'rattrapage'
    );

    if (sessionRattrapage) {
      return sessionRattrapage;
    }

    const sessionDeuxiemeChance = notes.find(n => 
      n.sessionExamen.typeSession === 'deuxieme_chance'
    );

    return sessionDeuxiemeChance || notes[0];
  }

  /**
   * Met à jour les résultats d'un semestre pour un étudiant
   */
  async mettreAJourResultatsSemestre(
    etudiantId: string,
    inscriptionId: string,
    semestre: number,
    anneeNiveau: number,
  ): Promise<ResultatSemestre> {
    // Calculer les moyennes
    const calculResult = await this.calculerMoyenneSemestre(
      etudiantId,
      inscriptionId,
      semestre,
      anneeNiveau,
    );

    // Récupérer ou créer le résultat semestre
    let resultatSemestre = await this.resultatSemestreRepository.findOne({
      where: {
        etudiant: { id: etudiantId },
        inscription: { id: inscriptionId },
        semestre,
        anneeNiveau,
      },
    });

    if (!resultatSemestre) {
      resultatSemestre = this.resultatSemestreRepository.create({
        etudiant: { id: etudiantId },
        inscription: { id: inscriptionId },
        semestre,
        anneeNiveau,
      });
    }

    // Mettre à jour les informations
    resultatSemestre.moyenneGenerale = calculResult.moyenne;
    resultatSemestre.totalCreditsECTS = calculResult.details.creditsTotal;
    resultatSemestre.creditsAcquis = calculResult.details.creditsAcquis;
    resultatSemestre.creditsManquants = calculResult.details.creditsTotal - calculResult.details.creditsAcquis;
    resultatSemestre.nombreUEs = calculResult.details.ues.length;
    resultatSemestre.nombreUEsValidees = calculResult.details.ues.filter(ue => ue.moyenne >= 10).length;

    // Déterminer le statut et la mention
    resultatSemestre.statut = this.determinerStatutSemestre(resultatSemestre);
    resultatSemestre.mention = this.determinerMention(calculResult.moyenne);

    // Sauvegarder le résultat semestre
    resultatSemestre = await this.resultatSemestreRepository.save(resultatSemestre);

    // Mettre à jour les résultats par UE
    await this.mettreAJourResultatsUE(
      etudiantId,
      inscriptionId,
      resultatSemestre.id,
      calculResult.details.ues,
    );

    return resultatSemestre;
  }

  /**
   * Met à jour les résultats par UE
   */
  private async mettreAJourResultatsUE(
    etudiantId: string,
    inscriptionId: string,
    resultatSemestreId: string,
    detailsUE: any[],
  ): Promise<void> {
    for (const ueDetail of detailsUE) {
      let resultatUE = await this.resultatUERepository.findOne({
        where: {
          etudiant: { id: etudiantId },
          uniteEnseignement: { id: ueDetail.ueId },
          resultatSemestre: { id: resultatSemestreId },
        },
      });

      if (!resultatUE) {
        resultatUE = this.resultatUERepository.create({
          etudiant: { id: etudiantId },
          uniteEnseignement: { id: ueDetail.ueId },
          resultatSemestre: { id: resultatSemestreId },
        });
      }

      resultatUE.moyenneUE = ueDetail.moyenne;
      resultatUE.creditsECTS = ueDetail.credits;
      resultatUE.statut = ueDetail.moyenne >= 10 ? 'valide' : 'non_valide';

      await this.resultatUERepository.save(resultatUE);
    }
  }

  /**
   * Détermine le statut du semestre
   */
  private determinerStatutSemestre(resultat: ResultatSemestre): string {
    if (resultat.moyenneGenerale >= 10 && resultat.creditsAcquis >= resultat.totalCreditsECTS * 0.8) {
      return 'valide';
    } else if (resultat.moyenneGenerale >= 8) {
      return 'ajourne';
    } else {
      return 'redoublement';
    }
  }

  /**
   * Détermine la mention selon la moyenne
   */
  private determinerMention(moyenne: number): string {
    if (moyenne >= 16) return 'Très Bien';
    if (moyenne >= 14) return 'Bien';
    if (moyenne >= 12) return 'Assez Bien';
    if (moyenne >= 10) return 'Passable';
    return 'Insuffisant';
  }

  /**
   * Calcule les statistiques d'une promotion
   */
  async calculerStatistiquesPromotion(
    parcoursId: string,
    semestre: number,
    anneeNiveau: number,
  ): Promise<any> {
    const resultats = await this.resultatSemestreRepository.find({
      where: {
        semestre,
        anneeNiveau,
        inscription: {
          parcours: { id: parcoursId },
          statut: 'validee',
        },
      },
      relations: ['etudiant', 'inscription'],
    });

    if (resultats.length === 0) {
      throw new NotFoundException('Aucun résultat trouvé pour cette promotion');
    }

    const stats = {
      effectifTotal: resultats.length,
      admis: resultats.filter(r => r.statut === 'valide').length,
      ajournes: resultats.filter(r => r.statut === 'ajourne').length,
      redoublants: resultats.filter(r => r.statut === 'redoublement').length,
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

    const moyennes = resultats.map(r => r.moyenneGenerale || 0);
    stats.moyennePromotion = Math.round((moyennes.reduce((a, b) => a + b, 0) / moyennes.length) * 100) / 100;
    stats.moyenneMax = Math.max(...moyennes);
    stats.moyenneMin = Math.min(...moyennes);

    // Distribution des mentions
    resultats.forEach(r => {
      if (r.mention && stats.distribution[r.mention] !== undefined) {
        stats.distribution[r.mention]++;
      }
    });

    // Calculer les classements
    const sortedResultats = resultats
      .sort((a, b) => (b.moyenneGenerale || 0) - (a.moyenneGenerale || 0))
      .map((r, index) => ({
        ...r,
        classement: index + 1,
      }));

    return {
      ...stats,
      classements: sortedResultats,
    };
  }

  /**
   * Vérifie les conditions de validation d'une UE
   */
  async verifierConditionsValidationUE(
    etudiantId: string,
    ueId: string,
  ): Promise<{ valide: boolean; conditions: any }> {
    const ue = await this.ueRepository.findOne({
      where: { id: ueId },
      relations: ['parcours'],
    });

    if (!ue) {
      throw new NotFoundException('UE non trouvée');
    }

    const ueResult = await this.calculerMoyenneUE(etudiantId, ueId, null);

    const conditions = {
      moyenneMinimale: ueResult.moyenne >= 10,
      creditsObtenus: ueResult.moyenne >= 10,
      conditionsSpeciales: [], // À implémenter selon les règles spécifiques
    };

    // Règles spéciales par type d'UE
    if (ue.typeUE === 'optionnel') {
      // Vérifier si l'UE optionnelle est validée
      conditions.moyenneMinimale = ueResult.moyenne >= 8;
    }

    const valide = Object.values(conditions).every(condition => 
      typeof condition === 'boolean' ? condition : true
    );

    return {
      valide,
      conditions,
    };
  }
}
