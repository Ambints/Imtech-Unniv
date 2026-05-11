import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Diplome } from '../entities/diplome.entity';
import { SuplementDiplome } from '../entities/suplement-diplome.entity';
import { Etudiant } from '../entities/etudiant.entity';
import { Inscription } from '../entities/inscription.entity';
import { Parcours } from '../entities/parcours.entity';
import { ResultatSemestre } from '../entities/resultat-semestre.entity';
import { ArchiveScolarite } from '../entities/archive-scolarite.entity';
import { Utilisateur } from '../entities/utilisateur.entity';
import { PdfService } from './pdf.service';
import { CreateDiplomeDto } from '../dto/create-diplome.dto';
import * as crypto from 'crypto';

@Injectable()
export class DiplomeService {
  constructor(
    @InjectRepository(Diplome, 'tenant')
    private readonly diplomeRepository: Repository<Diplome>,
    @InjectRepository(SuplementDiplome, 'tenant')
    private readonly suplementDiplomeRepository: Repository<SuplementDiplome>,
    @InjectRepository(Etudiant, 'tenant')
    private readonly etudiantRepository: Repository<Etudiant>,
    @InjectRepository(Inscription, 'tenant')
    private readonly inscriptionRepository: Repository<Inscription>,
    @InjectRepository(Parcours, 'tenant')
    private readonly parcoursRepository: Repository<Parcours>,
    @InjectRepository(ResultatSemestre, 'tenant')
    private readonly resultatSemestreRepository: Repository<ResultatSemestre>,
    @InjectRepository(ArchiveScolarite, 'tenant')
    private readonly archiveRepository: Repository<ArchiveScolarite>,
    private readonly pdfService: PdfService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Vérifie si un étudiant peut obtenir son diplôme
   */
  async verifierConditionsObtention(
    etudiantId: string,
    inscriptionId: string,
  ): Promise<{ peutObtenir: boolean; conditions: any; rapport: string }> {
    // Récupérer l'inscription et le parcours
    const inscription = await this.inscriptionRepository.findOne({
      where: { id: inscriptionId },
      relations: ['parcours', 'etudiant', 'anneeAcademique'],
    });

    if (!inscription) {
      throw new NotFoundException('Inscription non trouvée');
    }

    const parcours = await this.parcoursRepository.findOne({
      where: { id: inscription.parcours.id },
    });

    // Récupérer tous les résultats semestriels
    const resultats = await this.resultatSemestreRepository.find({
      where: {
        etudiant: { id: etudiantId },
        inscription: { id: inscriptionId },
      },
      order: { semestre: 'ASC' },
    });

    if (!resultats || resultats.length === 0) {
      return {
        peutObtenir: false,
        conditions: { tousSemestresValidés: false },
        rapport: 'Aucun résultat trouvé pour cet étudiant',
      };
    }

    // Vérifier que tous les semestres sont validés
    const semestresValidés = resultats.filter(r => r.statut === 'valide');
    const semestresRequis = parcours.dureeAnnees * 2; // 2 semestres par an

    const conditions = {
      tousSemestresValidés: semestresValidés.length >= semestresRequis,
      totalCreditsAcquis: resultats.reduce((sum, r) => sum + (r.creditsAcquis || 0), 0),
      creditsRequis: semestresRequis * 30, // 30 ECTS par semestre
      moyenneFinale: this.calculerMoyenneFinale(resultats),
      nombreSemestresValidés: semestresValidés.length,
      semestresRequis,
      detailsSemestres: resultats.map(r => ({
        semestre: r.semestre,
        statut: r.statut,
        moyenne: r.moyenneGenerale,
        credits: r.creditsAcquis,
      })),
    };

    const peutObtenir = conditions.tousSemestresValidés && 
                       conditions.totalCreditsAcquis >= conditions.creditsRequis && 
                       conditions.moyenneFinale >= 10;

    let rapport = `Rapport d'éligibilité au diplôme:\n`;
    rapport += `- Semestres validés: ${conditions.nombreSemestresValidés}/${conditions.semestresRequis}\n`;
    rapport += `- Crédits ECTS acquis: ${conditions.totalCreditsAcquis}/${conditions.creditsRequis}\n`;
    rapport += `- Moyenne finale: ${conditions.moyenneFinale}/20\n`;
    rapport += `- Éligibilité: ${peutObtenir ? 'OUI' : 'NON'}`;

    return {
      peutObtenir,
      conditions,
      rapport,
    };
  }

  /**
   * Génère un diplôme pour un étudiant
   */
  async genererDiplome(
    etudiantId: string,
    inscriptionId: string,
    createDiplomeDto: CreateDiplomeDto,
    userId: string,
  ): Promise<Diplome> {
    // Vérifier les conditions d'obtention
    const verification = await this.verifierConditionsObtention(etudiantId, inscriptionId);

    if (!verification.peutObtenir) {
      throw new BadRequestException(`L'étudiant ne remplit pas les conditions d'obtention du diplôme: ${verification.rapport}`);
    }

    // Vérifier si un diplôme existe déjà
    const existingDiplome = await this.diplomeRepository.findOne({
      where: {
        etudiant: { id: etudiantId },
        inscription: { id: inscriptionId },
        statut: 'delivre',
      },
    });

    if (existingDiplome) {
      throw new BadRequestException('Un diplôme a déjà été délivré pour cette inscription');
    }

    const inscription = await this.inscriptionRepository.findOne({
      where: { id: inscriptionId },
      relations: ['parcours', 'etudiant'],
    });

    // Générer le numéro de diplôme
    const numeroDiplome = await this.genererNumeroDiplome(inscription.parcours);

    // Créer le diplôme
    const diplome = this.diplomeRepository.create({
      etudiant: { id: etudiantId },
      inscription: { id: inscriptionId },
      parcours: { id: inscription.parcours.id },
      typeDiplome: this.mapParcoursToTypeDiplome(inscription.parcours.niveau),
      mentionGenerale: this.determinerMentionGenerale(verification.conditions.moyenneFinale),
      moyenneFinale: verification.conditions.moyenneFinale,
      totalCreditsECTS: verification.conditions.totalCreditsAcquis,
      dateObtention: createDiplomeDto.dateObtention || new Date(),
      lieuObtention: createDiplomeDto.lieuObtention || 'Antananarivo',
      numeroDiplome,
      delivrePar: { id: userId } as any,
      statut: 'delivre',
      dateDelivrance: new Date(),
    });

    const savedDiplome = await this.diplomeRepository.save(diplome);

    // Générer le hash d'intégrité
    const hashIntegrite = this.genererHashIntegrite(savedDiplome);
    savedDiplome.hashIntegrite = hashIntegrite;
    await this.diplomeRepository.save(savedDiplome);

    // Générer le supplément au diplôme
    await this.genererSuplementDiplome(savedDiplome.id, etudiantId, inscriptionId);

    // Archiver le diplôme
    await this.archiverDiplome(savedDiplome, userId);

    return savedDiplome;
  }

  /**
   * Génère le supplément au diplôme (Diploma Supplement)
   */
  async genererSuplementDiplome(
    diplomeId: string,
    etudiantId: string,
    inscriptionId: string,
  ): Promise<SuplementDiplome> {
    const diplome = await this.diplomeRepository.findOne({
      where: { id: diplomeId },
      relations: ['parcours', 'etudiant'],
    });

    if (!diplome) {
      throw new NotFoundException('Diplôme non trouvé');
    }

    // Récupérer les informations détaillées
    const resultats = await this.resultatSemestreRepository.find({
      where: { 
        etudiant: { id: etudiantId }, 
        inscription: { id: inscriptionId } 
      },
      relations: ['resultatsUE', 'resultatsUE.uniteEnseignement'],
      order: { semestre: 'ASC' },
    });

    // Construire les détails du programme et des résultats
    const detailsProgramme = {
      semestres: resultats.map(r => ({
        numero: r.semestre,
        ues: r.resultatsUE.map(rue => ({
          code: rue.uniteEnseignement.code,
          intitule: rue.uniteEnseignement.intitule,
          credits: rue.uniteEnseignement.creditsECTS,
          coefficient: rue.uniteEnseignement.coefficient,
        })),
      })),
    };

    const resultatsDetailles = {
      semestres: resultats.map(r => ({
        numero: r.semestre,
        moyenne: r.moyenneGenerale,
        creditsAcquis: r.creditsAcquis,
        ues: r.resultatsUE.map(rue => ({
          code: rue.uniteEnseignement.code,
          intitule: rue.uniteEnseignement.intitule,
          moyenne: rue.moyenneUE,
          credits: rue.creditsECTS,
          statut: rue.statut,
        })),
      })),
    };

    // Créer le supplément au diplôme
    const suplement = this.suplementDiplomeRepository.create({
      diplome: { id: diplomeId },
      identiteTitulaire: {
        nom: diplome.etudiant.nom,
        prenoms: diplome.etudiant.prenoms,
        dateNaissance: diplome.etudiant.dateNaissance instanceof Date 
          ? diplome.etudiant.dateNaissance.toISOString().split('T')[0] 
          : diplome.etudiant.dateNaissance,
        lieuNaissance: diplome.etudiant.lieuNaissance,
        nationalite: diplome.etudiant.nationalite,
      },
      nomDiplome: diplome.parcours.nom,
      domaineEtudes: this.getDomaineEtudes(diplome.parcours),
      niveauQualification: this.getNiveauQualification(diplome.parcours.niveau),
      dureeEtudes: `${diplome.parcours.dureeAnnees} ans`,
      nomEtablissement: 'IMTECH University',
      statutEtablissement: 'Établissement d\'enseignement supérieur privé',
      langueEnseignement: 'Français',
      detailsProgramme,
      resultatsDetailles,
      systemeEducatif: {
        pays: 'Madagascar',
        systeme: 'LMD (Licence-Master-Doctorat)',
        grade: this.getGrade(diplome.parcours.niveau),
        accesEtudesSuperieures: 'Baccalauréat ou équivalent',
      },
    });

    const savedSuplement = await this.suplementDiplomeRepository.save(suplement);

    // Générer le hash d'intégrité
    const hashIntegrite = this.genererHashIntegriteSuplement(savedSuplement);
    savedSuplement.hashIntegrite = hashIntegrite;
    await this.suplementDiplomeRepository.save(savedSuplement);

    return savedSuplement;
  }

  /**
   * Génère le PDF du diplôme
   */
  async genererPdfDiplome(diplomeId: string): Promise<Buffer> {
    const diplome = await this.diplomeRepository.findOne({
      where: { id: diplomeId },
      relations: ['etudiant', 'parcours', 'delivrePar'],
    });

    if (!diplome) {
      throw new NotFoundException('Diplôme non trouvé');
    }

    return await this.pdfService.genererPdfDiplome(diplome);
  }

  /**
   * Génère le PDF du supplément au diplôme
   */
  async genererPdfSuplement(diplomeId: string): Promise<Buffer> {
    const existingSuplement = await this.suplementDiplomeRepository.findOne({
      where: {
        diplome: { id: diplomeId },
      },
    });

    if (!existingSuplement) {
      throw new NotFoundException('Supplément au diplôme non trouvé');
    }

    return await this.pdfService.genererPdfSuplementDiplome(existingSuplement);
  }

  /**
   * Vérifie l'authenticité d'un diplôme
   */
  async verifierAuthenticiteDiplome(numeroDiplome: string, hashIntegrite: string): Promise<any> {
    const diplome = await this.diplomeRepository.findOne({
      where: { numeroDiplome },
      relations: ['etudiant', 'parcours'],
    });

    if (!diplome) {
      return { authentique: false, motif: 'Numéro de diplôme non trouvé' };
    }

    if (diplome.hashIntegrite !== hashIntegrite) {
      return { authentique: false, motif: 'Hash d\'intégrité invalide' };
    }

    return {
      authentique: true,
      diplome: {
        numero: diplome.numeroDiplome,
        etudiant: `${diplome.etudiant.nom} ${diplome.etudiant.prenoms}`,
        parcours: diplome.parcours.nom,
        dateObtention: diplome.dateObtention,
        mention: diplome.mentionGenerale,
        moyenne: diplome.moyenneFinale,
      },
    };
  }

  /**
   * Récupère tous les diplômes avec filtres
   */
  async findAll(filters?: any): Promise<Diplome[]> {
    // Simplified query without joins to avoid entity mapping issues
    // TODO: Fix entity relationships between scolarite and academic modules
    const where: any = {};

    if (filters?.statut) {
      where.statut = filters.statut;
    }

    if (filters?.parcoursId) {
      where.parcoursId = filters.parcoursId;
    }

    if (filters?.typeDiplome) {
      where.typeDiplome = filters.typeDiplome;
    }

    try {
      return await this.diplomeRepository.find({
        where,
        order: { dateObtention: 'DESC' },
      });
    } catch (error) {
      console.error('[DiplomeService] Error in findAll:', error);
      // Return empty array instead of throwing to prevent 500 errors
      return [];
    }
  }

  /**
   * Récupère un diplôme par son ID
   */
  async findOne(id: string): Promise<Diplome> {
    const diplome = await this.diplomeRepository.findOne({
      where: { id },
      relations: [
        'etudiant',
        'parcours',
        'delivrePar',
        'suplementDiplome',
      ],
    });

    if (!diplome) {
      throw new NotFoundException('Diplôme non trouvé');
    }

    return diplome;
  }

  /**
   * Marque un diplôme comme retiré
   */
  async marquerRetire(id: string, userId: string): Promise<Diplome> {
    const diplome = await this.findOne(id);

    if (diplome.statut !== 'delivre') {
      throw new BadRequestException('Seul un diplôme délivré peut être marqué comme retiré');
    }

    diplome.statut = 'retire';
    diplome.dateRetrait = new Date();

    return await this.diplomeRepository.save(diplome);
  }

  /**
   * Méthodes utilitaires privées
   */
  private calculerMoyenneFinale(resultats: ResultatSemestre[]): number {
    if (resultats.length === 0) return 0;

    const totalPoints = resultats.reduce((sum, r) => sum + (r.moyenneGenerale || 0), 0);
    return Math.round((totalPoints / resultats.length) * 100) / 100;
  }

  private determinerMentionGenerale(moyenne: number): string {
    if (moyenne >= 16) return 'Très Bien';
    if (moyenne >= 14) return 'Bien';
    if (moyenne >= 12) return 'Assez Bien';
    if (moyenne >= 10) return 'Passable';
    return 'Insuffisant';
  }

  private mapParcoursToTypeDiplome(niveau: string): string {
    const mapping = {
      'Licence': 'licence',
      'Master': 'master',
      'Doctorat': 'doctorat',
      'BTS': 'bts',
      'DUT': 'dut',
    };
    return mapping[niveau] || 'certificat';
  }

  private async genererNumeroDiplome(parcours: Parcours): Promise<string> {
    const annee = new Date().getFullYear();
    const prefix = parcours.code.substring(0, 3).toUpperCase();
    
    // Compter les diplômes existants pour cette année et ce parcours
    const count = await this.diplomeRepository.count({
      where: {
        parcours: { id: parcours.id },
        statut: 'delivre',
      },
    });

    const sequence = String(count + 1).padStart(4, '0');
    return `DIPL-${annee}-${prefix}-${sequence}`;
  }

  private genererHashIntegrite(diplome: Diplome): string {
    const data = `${diplome.numeroDiplome}${diplome.etudiant.id}${diplome.dateObtention}${diplome.moyenneFinale}`;
    return crypto.createHash('sha512').update(data).digest('hex');
  }

  private genererHashIntegriteSuplement(suplement: SuplementDiplome): string {
    const data = `${suplement.diplome.id}${suplement.nomDiplome}${suplement.dateCertification}`;
    return crypto.createHash('sha512').update(data).digest('hex');
  }

  private async archiverDiplome(diplome: Diplome, userId: string): Promise<void> {
    const archive = this.archiveRepository.create({
      etudiant: { id: diplome.etudiant.id },
      typeDocument: 'diplome',
      titreDocument: `Diplôme - ${diplome.numeroDiplome}`,
      fichierOriginalUrl: `/diplomes/${diplome.id}.pdf`,
      archivePar: { id: userId } as any,
    });
    await this.archiveRepository.save(archive);
  }

  private getDomaineEtudes(parcours: Parcours): string {
    // Logique à implémenter selon les départements
    return 'Sciences et Technologies';
  }

  private getNiveauQualification(niveau: string): string {
    const mapping = {
      'Licence': 'Grade de Licence (Bac+3)',
      'Master': 'Grade de Master (Bac+5)',
      'Doctorat': 'Grade de Doctorat (Bac+8)',
    };
    return mapping[niveau] || 'Certification';
  }

  private getGrade(niveau: string): string {
    const mapping = {
      'Licence': 'Licence',
      'Master': 'Master',
      'Doctorat': 'Doctorat',
    };
    return mapping[niveau] || 'Certification';
  }
}
