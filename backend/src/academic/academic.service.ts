import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parcours, UniteEnseignement, Note, Inscription, Presence, Salle, EmploiDuTemps } from './academic.entities';

@Injectable()
export class AcademicService {
  constructor(
    @InjectRepository(Parcours) private parcoursRepo: Repository<Parcours>,
    @InjectRepository(UniteEnseignement) private ueRepo: Repository<UniteEnseignement>,
    @InjectRepository(Note) private noteRepo: Repository<Note>,
    @InjectRepository(Inscription) private inscriptionRepo: Repository<Inscription>,
    @InjectRepository(Presence) private presenceRepo: Repository<Presence>,
    @InjectRepository(Salle) private salleRepo: Repository<Salle>,
    @InjectRepository(EmploiDuTemps) private edtRepo: Repository<EmploiDuTemps>,
  ) {}

  // Parcours
  createParcours(tid: string, dto: any) {
    return this.parcoursRepo.save(this.parcoursRepo.create(dto));
  }
  getParcours(tid?: string) {
    return this.parcoursRepo.find({ where: { actif: true } });
  }

  // UE
  createUE(tid: string, dto: any) {
    return this.ueRepo.save(this.ueRepo.create(dto));
  }
  getUEByParcours(tid: string, parcoursId: string) {
    return this.ueRepo.find({ where: { parcoursId } });
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