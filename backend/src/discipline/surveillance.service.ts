import { Injectable, Logger, NotFoundException, BadRequestException, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as QRCode from 'qrcode';
import { TenantConnectionService } from '../tenants/tenant-connection.service';
import { NotificationsGateway } from './notifications.gateway';
import {
  PointageQR,
  PresenceSurveillance,
  AlerteDiscipline,
  ConfigurationExamen
} from './surveillance.entities';
import { Incident, Sanction, Avertissement } from './discipline.entities';

/**
 * DTOs pour la surveillance
 */
export interface GenerateQRDto {
  seanceId: string;
  etudiantId: string;
}

export interface ScanQRDto {
  codeQr: string;
  localisation?: string;
}

export interface PointageManuelDto {
  etudiantId: string;
  seanceId: string;
  statut: 'present' | 'absent' | 'retard' | 'sortie_anticipee';
  heureArrivee?: string;
  observations?: string;
}

export interface ValidationJustificationDto {
  presenceId: string;
  accepte: boolean;
  motifRefus?: string;
}

export interface CreateSanctionDto {
  etudiantId: string;
  incidentId?: string;
  type: 'avertissement' | 'blame' | 'exclusion_temporaire' | 'exclusion_definitive' | 'travail_communautaire';
  dateDebut: Date;
  dateFin?: Date;
  motif: string;
}

@Injectable()
export class SurveillanceService {
  private readonly logger = new Logger(SurveillanceService.name);

  constructor(
    @InjectRepository(PointageQR, 'tenant') private qrRepo: Repository<PointageQR>,
    @InjectRepository(PresenceSurveillance, 'tenant') private presenceRepo: Repository<PresenceSurveillance>,
    @InjectRepository(AlerteDiscipline, 'tenant') private alerteRepo: Repository<AlerteDiscipline>,
    @InjectRepository(ConfigurationExamen, 'tenant') private configExamenRepo: Repository<ConfigurationExamen>,
    @InjectRepository(Incident, 'tenant') private incidentRepo: Repository<Incident>,
    @InjectRepository(Sanction, 'tenant') private sanctionRepo: Repository<Sanction>,
    @InjectRepository(Avertissement, 'tenant') private avertissementRepo: Repository<Avertissement>,
    private readonly tenantConnection: TenantConnectionService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  // ==================== POINTAGE QR CODE ====================

  /**
   * Génère un QR Code unique pour un étudiant et une séance
   */
  async genererQRCode(tid: string, dto: GenerateQRDto, userId: string): Promise<{ qr: PointageQR; qrCodeImage: string }> {
    await this.tenantConnection.setTenantSchema(tid);

    // Générer un code unique avec UUID
    const codeQr = `QR-${dto.seanceId}-${dto.etudiantId}-${Date.now()}`;

    // Vérifier si un QR existe déjà
    const existing = await this.qrRepo.findOne({
      where: { seanceId: dto.seanceId, etudiantId: dto.etudiantId },
    });

    let qr: PointageQR;
    if (existing) {
      // Mettre à jour le code existant
      qr = await this.qrRepo.save({
        ...existing,
        codeQr,
        dateGeneration: new Date(),
        statut: 'scanne',
      });
    } else {
      qr = this.qrRepo.create({
        seanceId: dto.seanceId,
        etudiantId: dto.etudiantId,
        codeQr,
        statut: 'scanne',
      });
      qr = await this.qrRepo.save(qr);
    }

    // Générer l'image QR Code en base64
    try {
      const qrCodeImage = await QRCode.toDataURL(codeQr, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 1,
      });

      return { qr, qrCodeImage };
    } catch (error) {
      this.logger.error(`Erreur génération QR Code: ${error instanceof Error ? error.message : String(error)}`);
      return { qr, qrCodeImage: '' };
    }
  }

  /**
   * Scanne un QR Code et enregistre la présence
   */
  async scannerQRCode(tid: string, dto: ScanQRDto, userId: string): Promise<{ presence: PresenceSurveillance; qr: PointageQR }> {
    await this.tenantConnection.setTenantSchema(tid);

    const qr = await this.qrRepo.findOne({ where: { codeQr: dto.codeQr } });
    if (!qr) throw new NotFoundException('QR Code invalide');

    // Mettre à jour le QR
    qr.dateScan = new Date();
    qr.scannePar = userId;
    qr.localisationScan = dto.localisation || 'salle';
    await this.qrRepo.save(qr);

    // Créer ou mettre à jour la présence
    let presence = await this.presenceRepo.findOne({
      where: { etudiantId: qr.etudiantId, seanceId: qr.seanceId },
    });

    const now = new Date();
    const heureArrivee = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    if (presence) {
      presence.heureArrivee = heureArrivee;
      presence.statut = 'present';
      presence.modePointage = 'qr';
      presence.pointePar = userId;
    } else {
      presence = this.presenceRepo.create({
        etudiantId: qr.etudiantId,
        seanceId: qr.seanceId,
        heureArrivee,
        statut: 'present',
        modePointage: 'qr',
        pointePar: userId,
        datePointage: new Date(),
      });
    }

    const savedPresence = await this.presenceRepo.save(presence);

    return { presence: savedPresence, qr };
  }

  /**
   * Pointage manuel par le surveillant
   */
  async pointageManuel(tid: string, dto: PointageManuelDto, userId: string): Promise<PresenceSurveillance> {
    await this.tenantConnection.setTenantSchema(tid);

    let presence = await this.presenceRepo.findOne({
      where: { etudiantId: dto.etudiantId, seanceId: dto.seanceId },
    });

    if (presence) {
      presence.statut = dto.statut;
      presence.heureArrivee = dto.heureArrivee || presence.heureArrivee;
      presence.observations = dto.observations || presence.observations;
      presence.modePointage = 'manuel';
      presence.pointePar = userId;
    } else {
      presence = this.presenceRepo.create({
        etudiantId: dto.etudiantId,
        seanceId: dto.seanceId,
        statut: dto.statut,
        heureArrivee: dto.heureArrivee,
        observations: dto.observations,
        modePointage: 'manuel',
        pointePar: userId,
        datePointage: new Date(),
      });
    }

    return this.presenceRepo.save(presence);
  }

  /**
   * Récupère les présences d'une séance
   */
  async getPresencesSeance(tid: string, seanceId: string) {
    await this.tenantConnection.setTenantSchema(tid);

    const presences = await this.presenceRepo.find({
      where: { seanceId },
      order: { heureArrivee: 'ASC' },
    });

    return presences;
  }

  // ==================== VALIDATION DES JUSTIFICATIONS ====================

  /**
   * Récupère les absences à justifier
   */
  async getAbsencesAJustifier(tid: string, parcoursId?: string) {
    await this.tenantConnection.setTenantSchema(tid);

    const where: any = {
      statut: 'absent',
      estJustifie: false,
    };

    const presences = await this.presenceRepo.find({
      where,
      order: { datePointage: 'DESC' },
    });

    return presences;
  }

  /**
   * Valide ou refuse une justification d'absence
   */
  async validerJustification(tid: string, dto: ValidationJustificationDto, userId: string): Promise<PresenceSurveillance> {
    await this.tenantConnection.setTenantSchema(tid);

    const presence = await this.presenceRepo.findOne({ where: { id: dto.presenceId } });
    if (!presence) throw new NotFoundException('Présence non trouvée');

    if (dto.accepte) {
      presence.estJustifie = true;
      presence.justifiePar = userId;
      presence.dateJustification = new Date();
    } else {
      // Garder l'absence non justifiée mais noter le refus
      presence.observations = `Justification refusée: ${dto.motifRefus}`;
      presence.justifiePar = userId;
      presence.dateJustification = new Date();
    }

    return this.presenceRepo.save(presence);
  }

  // ==================== ALERTES AUTOMATIQUES ====================

  /**
   * Vérifie et génère les alertes automatiques
   */
  async verifierAlertes(tid: string, etudiantId: string, userId: string): Promise<AlerteDiscipline[]> {
    await this.tenantConnection.setTenantSchema(tid);

    const alertes: AlerteDiscipline[] = [];

    // Compter les absences non justifiées
    const absencesNonJustifiees = await this.presenceRepo.count({
      where: { etudiantId, statut: 'absent', estJustifie: false },
    });

    // Alerte si 3+ absences non justifiées
    if (absencesNonJustifiees >= 3) {
      const alerte = this.alerteRepo.create({
        etudiantId,
        type: 'absence_repetee',
        message: `${absencesNonJustifiees} absences non justifiées détectées`,
        genereePar: userId,
        destinataireRole: 'secretariat',
      });
      const savedAlerte = await this.alerteRepo.save(alerte);
      alertes.push(savedAlerte);

      // Notification WebSocket
      this.notificationsGateway.notifyAbsenceRepetee(tid, {
        etudiantId,
        nombreAbsences: absencesNonJustifiees,
        seuilAtteint: true,
      });
    }

    // Compter les retards
    const retards = await this.presenceRepo.count({
      where: { etudiantId, statut: 'retard' },
    });

    if (retards >= 5) {
      const alerte = this.alerteRepo.create({
        etudiantId,
        type: 'retard_cumule',
        message: `${retards} retards cumulés`,
        genereePar: userId,
        destinataireRole: 'secretariat',
      });
      const savedAlerte = await this.alerteRepo.save(alerte);
      alertes.push(savedAlerte);

      // Notification WebSocket
      this.notificationsGateway.notifyAlerteDisciplinaire(tid, {
        id: savedAlerte.id,
        type: 'retard_cumule',
        etudiantId,
        message: savedAlerte.message,
        gravite: 'moyenne',
      });
    }

    return alertes;
  }

  /**
   * Crée une alerte manuelle
   */
  async creerAlerte(tid: string, etudiantId: string, type: string, message: string, userId: string): Promise<AlerteDiscipline> {
    await this.tenantConnection.setTenantSchema(tid);

    const alerte = this.alerteRepo.create({
      etudiantId,
      type: type as any,
      message,
      genereePar: userId,
      destinataireRole: 'secretariat',
    });

    return this.alerteRepo.save(alerte);
  }

  /**
   * Récupère les alertes
   */
  async getAlertes(tid: string, statut?: string, destinataireRole?: string) {
    await this.tenantConnection.setTenantSchema(tid);

    const where: any = {};
    if (statut) where.statut = statut;
    if (destinataireRole) where.destinataireRole = destinataireRole;

    return this.alerteRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Marque une alerte comme traitée
   */
  async traiterAlerte(tid: string, alerteId: string, userId: string): Promise<AlerteDiscipline> {
    await this.tenantConnection.setTenantSchema(tid);

    const alerte = await this.alerteRepo.findOne({ where: { id: alerteId } });
    if (!alerte) throw new NotFoundException('Alerte non trouvée');

    return this.alerteRepo.save({
      ...alerte,
      statut: 'traitee',
      traiteePar: userId,
      dateTraitement: new Date(),
    });
  }

  // ==================== GESTION DES SANCTIONS ====================

  /**
   * Crée une sanction et génère une alerte si grave
   */
  async creerSanction(tid: string, dto: CreateSanctionDto, userId: string): Promise<{ sanction: Sanction; alerte?: AlerteDiscipline }> {
    await this.tenantConnection.setTenantSchema(tid);

    const sanction = this.sanctionRepo.create({
      ...dto,
      decidePar: userId,
      statut: 'en_cours',
    });

    const savedSanction = await this.sanctionRepo.save(sanction);

    let alerte: AlerteDiscipline | undefined;

    // Alerte automatique pour sanctions graves
    if (['exclusion_definitive', 'exclusion_temporaire'].includes(dto.type)) {
      alerte = await this.creerAlerte(
        tid,
        dto.etudiantId,
        'sanction_grave',
        `Sanction grave décidée: ${dto.type} - ${dto.motif}`,
        userId,
      );
    }

    return { sanction: savedSanction, alerte };
  }

  /**
   * Récupère les sanctions d'un étudiant
   */
  async getSanctions(tid: string, etudiantId?: string): Promise<Sanction[]> {
    await this.tenantConnection.setTenantSchema(tid);

    const where: any = {};
    if (etudiantId) where.etudiantId = etudiantId;

    return this.sanctionRepo.find({
      where,
      order: { dateDebut: 'DESC' },
    });
  }

  // ==================== CONFIGURATION EXAMENS ====================

  /**
   * Configure une salle d'examen
   */
  async configurerSalleExamen(tid: string, dto: any, userId: string): Promise<ConfigurationExamen> {
    await this.tenantConnection.setTenantSchema(tid);

    const config = this.configExamenRepo.create({
      ...dto,
      surveillantId: userId,
      statut: 'preparation',
    });

    const saved = await this.configExamenRepo.save(config);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  /**
   * Attribue une place à un étudiant
   */
  async attribuerPlace(tid: string, configId: string, etudiantId: string, place: string, rangee: string): Promise<ConfigurationExamen> {
    await this.tenantConnection.setTenantSchema(tid);

    const config = await this.configExamenRepo.findOne({ where: { id: configId } });
    if (!config) throw new NotFoundException('Configuration non trouvée');

    const planPlaces = config.plan_places || [];
    
    // Vérifier si la place est déjà occupée
    const placeOccupee = planPlaces.find((p: any) => p.place === place && p.rangee === rangee);
    if (placeOccupee) {
      throw new BadRequestException('Cette place est déjà attribuée');
    }

    planPlaces.push({ etudiantId, place, rangee });
    config.plan_places = planPlaces;
    config.placesAttribuees = planPlaces.length;

    const saved = await this.configExamenRepo.save(config);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  /**
   * Signale un incident pendant l'examen
   */
  async signalerIncidentExamen(tid: string, configId: string, rapport: string, userId: string): Promise<ConfigurationExamen> {
    await this.tenantConnection.setTenantSchema(tid);

    const config = await this.configExamenRepo.findOne({ where: { id: configId } });
    if (!config) throw new NotFoundException('Configuration non trouvée');

    // Créer aussi une alerte
    await this.creerAlerte(tid, 'systeme', 'incident_critique', `Incident examen: ${rapport}`, userId);

    // Notification WebSocket en temps réel
    this.notificationsGateway.notifyIncidentExamen(tid, {
      configExamenId: configId,
      salleId: config.salleId,
      rapport,
      gravite: 'critique',
    });

    return this.configExamenRepo.save({
      ...config,
      statut: 'incident',
      rapport_incident: rapport,
    });
  }

  // ==================== ABSENCES & RETARDS ====================

  /**
   * Récupère les absences et retards pour une date donnée
   */
  async getAbsences(tid: string, date?: string, type?: string) {
    await this.tenantConnection.setTenantSchema(tid);

    try {
      const queryBuilder = this.presenceRepo.createQueryBuilder('presence');

      // Filtrer par date si fournie
      if (date) {
        queryBuilder.where('DATE(presence.date_pointage) = :date', { date });
      } else {
        queryBuilder.where('DATE(presence.date_pointage) = CURRENT_DATE');
      }

      // Filtrer par type (absence ou retard)
      if (type && (type === 'absence' || type === 'retard')) {
        queryBuilder.andWhere('presence.statut = :statut', { statut: type === 'absence' ? 'absent' : 'retard' });
      } else {
        // Par défaut, retourner absences et retards
        queryBuilder.andWhere('presence.statut IN (:...statuts)', { statuts: ['absent', 'retard'] });
      }

      const absences = await queryBuilder
        .orderBy('presence.date_pointage', 'DESC')
        .addOrderBy('presence.heure_arrivee', 'ASC')
        .getMany();

      return absences;
    } catch (error) {
      this.logger.error(`Erreur getAbsences: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }

  /**
   * Justifie une absence ou un retard
   */
  async justifierAbsence(tid: string, presenceId: string, userId: string): Promise<PresenceSurveillance> {
    await this.tenantConnection.setTenantSchema(tid);

    const presence = await this.presenceRepo.findOne({ where: { id: presenceId } });
    if (!presence) throw new NotFoundException('Absence/Retard non trouvé(e)');

    presence.estJustifie = true;
    presence.justifiePar = userId;
    presence.dateJustification = new Date();

    return this.presenceRepo.save(presence);
  }

  // ==================== EXAMENS ====================

  /**
   * Récupère les examens pour une date donnée
   */
  async getExamens(tid: string, date?: string) {
    await this.tenantConnection.setTenantSchema(tid);

    try {
      const queryBuilder = this.configExamenRepo.createQueryBuilder('config');

      // Pour l'instant, retourner toutes les configurations d'examen
      // Dans une implémentation complète, il faudrait filtrer par date
      if (date) {
        // Filtrage par date à implémenter selon la structure de session_examen
        queryBuilder.where('DATE(config.created_at) = :date', { date });
      }

      const examens = await queryBuilder
        .orderBy('config.created_at', 'DESC')
        .getMany();

      return examens;
    } catch (error) {
      this.logger.error(`Erreur getExamens: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }

  // ==================== DASHBOARD SURVEILLANCE ====================

  async getDashboardSurveillance(tid: string) {
    await this.tenantConnection.setTenantSchema(tid);

    try {
      // Statistiques du jour - utiliser des requêtes simples sans filtrage de date complexe
      const presencesAujourdhui = await this.presenceRepo
        .createQueryBuilder('presence')
        .where('DATE(presence.date_pointage) = CURRENT_DATE')
        .andWhere('presence.statut = :statut', { statut: 'present' })
        .getCount();

      const absencesAujourdhui = await this.presenceRepo
        .createQueryBuilder('presence')
        .where('DATE(presence.date_pointage) = CURRENT_DATE')
        .andWhere('presence.statut = :statut', { statut: 'absent' })
        .getCount();

      const alertesNonLues = await this.alerteRepo.count({
        where: { statut: 'non_lue' },
      });

      const examensEnCours = await this.configExamenRepo.count({
        where: { statut: 'en_cours' },
      });

      return {
        presencesAujourdhui,
        absencesAujourdhui,
        alertesNonLues,
        examensEnCours,
      };
    } catch (error) {
      this.logger.error(`Erreur getDashboardSurveillance: ${error instanceof Error ? error.message : String(error)}`);
      // Retourner des valeurs par défaut en cas d'erreur
      return {
        presencesAujourdhui: 0,
        absencesAujourdhui: 0,
        alertesNonLues: 0,
        examensEnCours: 0,
      };
    }
  }
}

// Made with Bob
