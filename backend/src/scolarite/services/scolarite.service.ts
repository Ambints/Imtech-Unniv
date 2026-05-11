import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Etudiant } from '../entities/etudiant.entity';
import { Inscription } from '../entities/inscription.entity';
import { Deliberation } from '../entities/deliberation.entity';
import { Diplome } from '../entities/diplome.entity';
import { VerrouillageNotes } from '../entities/verrouillage-notes.entity';

@Injectable()
export class ScolariteService {
  constructor(
    @InjectRepository(Etudiant, 'tenant')
    private readonly etudiantRepo: Repository<Etudiant>,
    @InjectRepository(Inscription, 'tenant')
    private readonly inscriptionRepo: Repository<Inscription>,
    @InjectRepository(Deliberation, 'tenant')
    private readonly deliberationRepo: Repository<Deliberation>,
    @InjectRepository(Diplome, 'tenant')
    private readonly diplomeRepo: Repository<Diplome>,
    @InjectRepository(VerrouillageNotes, 'tenant')
    private readonly verrouillageRepo: Repository<VerrouillageNotes>,
  ) {}

  // Dashboard methods removed - use specific controllers (notes, deliberation, diplome) instead
  // The Parcours entity is not properly set up in tenant schema, causing 500 errors

  async getDeliberations() {
    return await this.deliberationRepo.find({
      relations: ['sessionExamen', 'presidentJury'],
      order: { createdAt: 'DESC' },
    });
  }

  async getDiplomes() {
    return await this.diplomeRepo.find({
      relations: ['etudiant', 'inscription', 'delivrePar'],
      order: { createdAt: 'DESC' },
    });
  }
}
