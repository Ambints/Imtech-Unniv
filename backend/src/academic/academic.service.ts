import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parcours, UniteEnseignement, Note, Inscription, Presence, Salle, EmploiDuTemps, Departement, Etudiant } from './academic.entities';
import { TenantConnectionService } from '../tenants/tenant-connection.service';

@Injectable()
export class AcademicService {
  constructor(
    @InjectRepository(Parcours, 'tenant') private parcoursRepo: Repository<Parcours>,
    @InjectRepository(UniteEnseignement, 'tenant') private ueRepo: Repository<UniteEnseignement>,
    @InjectRepository(Note, 'tenant') private noteRepo: Repository<Note>,
    @InjectRepository(Inscription, 'tenant') private inscriptionRepo: Repository<Inscription>,
    @InjectRepository(Presence, 'tenant') private presenceRepo: Repository<Presence>,
    @InjectRepository(Salle, 'tenant') private salleRepo: Repository<Salle>,
    @InjectRepository(EmploiDuTemps, 'tenant') private edtRepo: Repository<EmploiDuTemps>,
    @InjectRepository(Departement, 'tenant') private departementRepo: Repository<Departement>,
    @InjectRepository(Etudiant, 'tenant') private etudiantRepo: Repository<Etudiant>,
    private readonly tenantConnection: TenantConnectionService,
  ) {}

  // Departements
  async getDepartements(tid: string) {
    await this.tenantConnection.setTenantSchema(tid);
    return this.departementRepo.find({ where: { actif: true }, order: { nom: 'ASC' } });
  }

  async createDepartement(tid: string, dto: any) {
    await this.tenantConnection.setTenantSchema(tid);
    return this.departementRepo.save(this.departementRepo.create(dto));
  }

  async updateDepartement(tid: string, id: string, dto: any) {
    await this.tenantConnection.setTenantSchema(tid);
    const dept = await this.departementRepo.findOne({ where: { id } });
    if (!dept) throw new NotFoundException('Département non trouvé');
    return this.departementRepo.save({ ...dept, ...dto });
  }

  async deleteDepartement(tid: string, id: string) {
    await this.tenantConnection.setTenantSchema(tid);
    const dept = await this.departementRepo.findOne({ where: { id } });
    if (!dept) throw new NotFoundException('Département non trouvé');
    await this.departementRepo.update(id, { actif: false });
    return { message: 'Département supprimé avec succès' };
  }

  // Parcours
  async createParcours(tid: string, dto: any) {
    await this.tenantConnection.setTenantSchema(tid);
    return this.parcoursRepo.save(this.parcoursRepo.create(dto));
  }

  async getParcours(tid?: string) {
    if (tid) await this.tenantConnection.setTenantSchema(tid);
    return this.parcoursRepo.find({ where: { actif: true }, order: { nom: 'ASC' } });
  }

  async updateParcours(tid: string, id: string, dto: any) {
    await this.tenantConnection.setTenantSchema(tid);
    const parcours = await this.parcoursRepo.findOne({ where: { id } });
    if (!parcours) throw new NotFoundException('Parcours non trouvé');
    return this.parcoursRepo.save({ ...parcours, ...dto });
  }

  async deleteParcours(tid: string, id: string) {
    await this.tenantConnection.setTenantSchema(tid);
    const parcours = await this.parcoursRepo.findOne({ where: { id } });
    if (!parcours) throw new NotFoundException('Parcours non trouvé');
    await this.parcoursRepo.update(id, { actif: false });
    return { message: 'Parcours supprimé avec succès' };
  }

  // UE
  async createUE(tid: string, dto: any) {
    await this.tenantConnection.setTenantSchema(tid);
    return this.ueRepo.save(this.ueRepo.create(dto));
  }

  async getUEByParcours(tid: string, parcoursId: string) {
    await this.tenantConnection.setTenantSchema(tid);
    return this.ueRepo.find({ where: { parcoursId, actif: true }, order: { semestre: 'ASC', code: 'ASC' } });
  }

  async updateUE(tid: string, id: string, dto: any) {
    await this.tenantConnection.setTenantSchema(tid);
    const ue = await this.ueRepo.findOne({ where: { id } });
    if (!ue) throw new NotFoundException('UE non trouvée');
    return this.ueRepo.save({ ...ue, ...dto });
  }

  async deleteUE(tid: string, id: string) {
    await this.tenantConnection.setTenantSchema(tid);
    const ue = await this.ueRepo.findOne({ where: { id } });
    if (!ue) throw new NotFoundException('UE non trouvée');
    await this.ueRepo.update(id, { actif: false });
    return { message: 'UE supprimée avec succès' };
  }

  // Etudiants
  async getEtudiants(tid: string, parcoursId?: string) {
    await this.tenantConnection.setTenantSchema(tid);
    console.log('[DEBUG Backend] getEtudiants called, fetching from schema...');
    if (parcoursId) {
      // Get students enrolled in a specific parcours
      const inscriptions = await this.inscriptionRepo.find({
        where: { parcoursId },
        order: { createdAt: 'DESC' }
      });
      const etudiantIds = inscriptions.map(i => i.etudiantId);
      if (etudiantIds.length === 0) return [];
      return this.etudiantRepo.findByIds(etudiantIds);
    }
    return this.etudiantRepo.find({ where: { actif: true }, order: { nom: 'ASC', prenom: 'ASC' } });
  }

  async createEtudiant(tid: string, dto: any) {
    await this.tenantConnection.setTenantSchema(tid);
    console.log('[DEBUG] Service createEtudiant called with dto:', dto);
    const data = { ...dto };
    if (data.dateNaissance) {
      data.dateNaissance = new Date(data.dateNaissance);
    }
    console.log('[DEBUG] Prepared data:', data);
    try {
      const entity = this.etudiantRepo.create(data);
      console.log('[DEBUG] Entity created:', entity);
      const result = await this.etudiantRepo.save(entity);
      console.log('[DEBUG] Entity saved:', result);
      return result;
    } catch (error) {
      console.error('[DEBUG] Error saving etudiant:', error);
      throw error;
    }
  }

  async updateEtudiant(tid: string, id: string, dto: any) {
    await this.tenantConnection.setTenantSchema(tid);
    const etudiant = await this.etudiantRepo.findOne({ where: { id } });
    if (!etudiant) throw new NotFoundException('Etudiant non trouvé');
    const data = { ...dto };
    if (data.dateNaissance) {
      data.dateNaissance = new Date(data.dateNaissance);
    }
    return this.etudiantRepo.save({ ...etudiant, ...data });
  }

  async deleteEtudiant(tid: string, id: string) {
    await this.tenantConnection.setTenantSchema(tid);
    const etudiant = await this.etudiantRepo.findOne({ where: { id } });
    if (!etudiant) throw new NotFoundException('Etudiant non trouvé');
    await this.etudiantRepo.update(id, { actif: false });
    return { message: 'Etudiant supprimé avec succès' };
  }

  // Notes
  async saisirNote(tid: string, dto: any, saisiPar: string) {
    const existing = await this.noteRepo.findOne({
      where: { etudiantId: dto.etudiantId, ueId: dto.ueId, sessionId: dto.sessionId }
    });
    if (existing?.verrouille) throw new BadRequestException('Note verrouillee apres deliberation');
    const valeur = dto.valeur;
    const mention = this.getMention(valeur);
    if (existing) {
      return this.noteRepo.save({ ...existing, ...dto, mention, saisiPar });
    }
    return this.noteRepo.save(this.noteRepo.create({ ...dto, mention, saisiPar }));
  }

  private calcMoyenne(cc: number, exam: number): number {
    if (!cc && !exam) return 0;
    if (!cc) return Number(exam);
    if (!exam) return Number(cc);
    return parseFloat((Number(cc) * 0.4 + Number(exam) * 0.6).toFixed(2));
  }

  private getMention(note: number): string {
    if (note >= 16) return 'Tres Bien';
    if (note >= 14) return 'Bien';
    if (note >= 12) return 'Assez Bien';
    if (note >= 10) return 'Passable';
    return 'Insuffisant';
  }

  async deliberer(tid: string, parcoursId: string, sessionId: string, annee?: string) {
    const notes = await this.noteRepo.find({ where: { sessionId } });
    await this.noteRepo.save(notes.map(n => ({ ...n, verrouille: true, dateVerrouillage: new Date() })));
    return { message: 'Deliberation effectuee, notes verrouillee', count: notes.length };
  }

  getReleverNotes(tid: string, etudiantId: string, sessionId: string) {
    return this.noteRepo.find({ where: { etudiantId, sessionId } });
  }

  // Inscriptions
  async inscrire(tid: string, dto: any) {
    const ex = await this.inscriptionRepo.findOne({
      where: { etudiantId: dto.etudiantId, parcoursId: dto.parcoursId, anneeAcademiqueId: dto.anneeAcademiqueId }
    });
    if (ex) throw new BadRequestException('Etudiant deja inscrit pour cette annee');
    return this.inscriptionRepo.save(this.inscriptionRepo.create(dto));
  }

  getInscriptions(tid: string, parcoursId?: string) {
    const where: any = {};
    if (parcoursId) where.parcoursId = parcoursId;
    return this.inscriptionRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  // Presences
  saisirPresence(tid: string, dto: any) {
    return this.presenceRepo.save(this.presenceRepo.create(dto));
  }
  getPresencesEtudiant(tid: string, etudiantId: string) {
    return this.presenceRepo.find({ where: { etudiantId } });
  }
  saisirAbsence(tid: string, dto: any) { return this.saisirPresence(tid, dto); }
  getAbsencesEtudiant(tid: string, etudiantId: string) { return this.getPresencesEtudiant(tid, etudiantId); }

  // Salles & EDT
  getSalles(tid: string) { return this.salleRepo.find(); }
  createSalle(tid: string, dto: any) {
    return this.salleRepo.save(this.salleRepo.create(dto));
  }
  getEDT(tid?: string, parcoursId?: string) {
    return this.edtRepo.find();
  }
  createEDT(tid: string, dto: any) {
    return this.edtRepo.save(this.edtRepo.create(dto));
  }
}