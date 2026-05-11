import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArchiveScolarite } from '../entities/archive-scolarite.entity';

@Injectable()
export class ArchiveService {
  constructor(
    @InjectRepository(ArchiveScolarite, 'tenant')
    private readonly archiveRepository: Repository<ArchiveScolarite>,
  ) {}

  async findAll(etudiantId?: string): Promise<ArchiveScolarite[]> {
    const queryBuilder = this.archiveRepository
      .createQueryBuilder('archive')
      .leftJoinAndSelect('archive.etudiant', 'etudiant')
      .leftJoinAndSelect('archive.archiveePar', 'archiveePar');

    if (etudiantId) {
      queryBuilder.andWhere('etudiant.id = :etudiantId', { etudiantId });
    }

    return await queryBuilder
      .orderBy('archive.dateArchivage', 'DESC')
      .getMany();
  }

  async archiveDocument(
    etudiantId: string,
    typeDocument: string,
    titreDocument: string,
    fichierUrl: string,
    userId: string,
  ): Promise<ArchiveScolarite> {
    const archive = this.archiveRepository.create({
      etudiant: { id: etudiantId },
      typeDocument,
      titreDocument,
      fichierOriginalUrl: fichierUrl,
      archivePar: { id: userId } as any,
    });

    return await this.archiveRepository.save(archive);
  }
}
