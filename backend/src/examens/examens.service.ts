import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SujetExamen, Deliberation, Jury, PVNote } from './examens.entities';

@Injectable()
export class ExamensService {
  private readonly logger = new Logger(ExamensService.name);

  constructor(
    @InjectRepository(SujetExamen) private sujetRepo: Repository<SujetExamen>,
    @InjectRepository(Deliberation) private deliberationRepo: Repository<Deliberation>,
    @InjectRepository(Jury) private juryRepo: Repository<Jury>,
    @InjectRepository(PVNote) private pvNoteRepo: Repository<PVNote>,
  ) {}

  // ========== SUJETS D'EXAMEN ==========
  async createSujet(data: Partial<SujetExamen>): Promise<SujetExamen> {
    const sujet = this.sujetRepo.create({ ...data, statut: 'soumis' });
    return this.sujetRepo.save(sujet);
  }

  async findSujets(filters?: { sessionId?: string; ecId?: string; statut?: string }): Promise<SujetExamen[]> {
    const query = this.sujetRepo.createQueryBuilder('s');
    if (filters?.sessionId) query.andWhere('s.sessionId = :sessionId', { sessionId: filters.sessionId });
    if (filters?.ecId) query.andWhere('s.ecId = :ecId', { ecId: filters.ecId });
    if (filters?.statut) query.andWhere('s.statut = :statut', { statut: filters.statut });
    return query.orderBy('s.dateDepot', 'DESC').getMany();
  }

  async validerSujet(id: string, validePar: string): Promise<SujetExamen> {
    await this.sujetRepo.update(id, { 
      statut: 'valide', 
      validePar, 
      dateValidation: new Date(),
      historique: () => `COALESCE(historique, '[]'::jsonb) || '[{"action": "validation", "date": "${new Date().toISOString()}"}]'::jsonb`
    });
    return this.sujetRepo.findOne({ where: { id } });
  }

  async refuserSujet(id: string, motif: string): Promise<SujetExamen> {
    await this.sujetRepo.update(id, { 
      statut: 'refuse',
      historique: () => `COALESCE(historique, '[]'::jsonb) || '[{"action": "refus", "motif": "${motif}", "date": "${new Date().toISOString()}"}]'::jsonb`
    });
    return this.sujetRepo.findOne({ where: { id } });
  }

  // ========== DÉLIBÉRATIONS ==========
  async createDeliberation(data: Partial<Deliberation>): Promise<Deliberation> {
    const deliberation = this.deliberationRepo.create(data);
    return this.deliberationRepo.save(deliberation);
  }

  async findDeliberations(sessionId: string): Promise<Deliberation[]> {
    return this.deliberationRepo.find({
      where: { sessionId },
      order: { dateDeliberation: 'DESC' },
    });
  }

  async verrouillerDeliberation(id: string, verrouillePar: string): Promise<Deliberation> {
    await this.deliberationRepo.update(id, {
      statut: 'verrouille',
      verrouillePar,
      dateVerrouillage: new Date(),
    });
    return this.deliberationRepo.findOne({ where: { id } });
  }

  async publierDeliberation(id: string): Promise<Deliberation> {
    await this.deliberationRepo.update(id, { statut: 'publie' });
    return this.deliberationRepo.findOne({ where: { id } });
  }

  // ========== JURY ==========
  async ajouterMembreJury(data: Partial<Jury>): Promise<Jury> {
    const membre = this.juryRepo.create(data);
    return this.juryRepo.save(membre);
  }

  async getJuryByDeliberation(deliberationId: string): Promise<Jury[]> {
    return this.juryRepo.find({ where: { deliberationId } });
  }

  // ========== PV NOTES ==========
  async createPVNote(data: Partial<PVNote>): Promise<PVNote> {
    const pv = this.pvNoteRepo.create(data);
    return this.pvNoteRepo.save(pv);
  }

  async getPVByDeliberation(deliberationId: string): Promise<PVNote[]> {
    return this.pvNoteRepo.find({
      where: { deliberationId },
      order: { moyenneGenerale: 'DESC' },
    });
  }

  async calculerStatsDeliberation(deliberationId: string): Promise<any> {
    const pvs = await this.pvNoteRepo.find({ where: { deliberationId } });
    const total = pvs.length;
    const reussites = pvs.filter(p => p.decision === 'passe').length;
    const moyenneGenerale = pvs.reduce((acc, p) => acc + Number(p.moyenneGenerale), 0) / total;

    return {
      totalEtudiants: total,
      passes: reussites,
      redoublants: pvs.filter(p => p.decision === 'redouble').length,
      exclus: pvs.filter(p => p.decision === 'exclu').length,
      tauxReussite: (reussites / total) * 100,
      moyenneGeneraleClasse: moyenneGenerale.toFixed(2),
    };
  }
}
