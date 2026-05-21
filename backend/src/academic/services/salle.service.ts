import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Salle } from '../entities/salle.entity';
import { CreateSalleDto } from '../dto/create-salle.dto';
import { UpdateSalleDto } from '../dto/update-salle.dto';
import { TenantConnectionService } from '../../tenants/tenant-connection.service';

@Injectable()
export class SalleService {
  constructor(
    @InjectRepository(Salle, 'tenant')
    private salleRepository: Repository<Salle>,
    private readonly tenantConnection: TenantConnectionService,
  ) {}

  async create(createSalleDto: CreateSalleDto): Promise<Salle> {
    // Vérifier si le code existe déjà
    const existingSalle = await this.salleRepository.findOne({
      where: { code: createSalleDto.code },
    });

    if (existingSalle) {
      throw new BadRequestException('Ce code de salle existe déjà');
    }

    const salle = this.salleRepository.create(createSalleDto);
    return await this.salleRepository.save(salle);
  }

  async findAll(tenantId: string): Promise<Salle[]> {
    await this.tenantConnection.setTenantSchema(tenantId);
    return await this.salleRepository.find({
      order: { code: 'ASC' },
    });
  }

  async search(tenantId: string, query: string): Promise<Salle[]> {
    await this.tenantConnection.setTenantSchema(tenantId);
    return await this.salleRepository.find({
      where: [
        { code: Like(`%${query}%`) },
        { nom: Like(`%${query}%`) },
      ],
      order: { code: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Salle> {
    const salle = await this.salleRepository.findOne({
      where: { id },
      relations: ['seances'],
    });

    if (!salle) {
      throw new NotFoundException('Salle non trouvée');
    }

    return salle;
  }

  async update(id: string, updateSalleDto: UpdateSalleDto): Promise<Salle> {
    const salle = await this.findOne(id);

    // Si le code est modifié, vérifier qu'il n'existe pas déjà
    if (updateSalleDto.code && updateSalleDto.code !== salle.code) {
      const existingSalle = await this.salleRepository.findOne({
        where: { code: updateSalleDto.code },
      });

      if (existingSalle) {
        throw new BadRequestException('Ce code de salle existe déjà');
      }
    }

    Object.assign(salle, updateSalleDto);
    return await this.salleRepository.save(salle);
  }

  async remove(id: string): Promise<void> {
    const salle = await this.findOne(id);

    // Vérifier si la salle est utilisée dans des séances
    const seanceCount = await this.salleRepository
      .createQueryBuilder('salle')
      .leftJoin('salle.seances', 'seance')
      .where('salle.id = :id', { id })
      .getCount();

    if (seanceCount > 0) {
      throw new BadRequestException('Impossible de supprimer cette salle car elle est utilisée dans des séances');
    }

    await this.salleRepository.remove(salle);
  }

  async getAvailableSalles(tenantId: string, dateDebut: Date, dateFin: Date): Promise<Salle[]> {
    await this.tenantConnection.setTenantSchema(tenantId);
    // Récupérer toutes les salles
    const allSalles = await this.findAll(tenantId);

    // Récupérer les salles occupées pendant la période
    const occupiedSalles = await this.salleRepository
      .createQueryBuilder('salle')
      .leftJoin('salle.seances', 'seance')
      .where('seance.dateDebut < :dateFin AND seance.dateFin > :dateDebut', {
        dateDebut,
        dateFin,
      })
      .getMany();

    const occupiedSalleIds = occupiedSalles.map(s => s.id);

    // Retourner les salles disponibles
    return allSalles.filter(salle => 
      !occupiedSalleIds.includes(salle.id) && salle.disponible
    );
  }

  async getSallesByType(tenantId: string, type: string): Promise<Salle[]> {
    await this.tenantConnection.setTenantSchema(tenantId);
    return await this.salleRepository.find({
      where: { type: type as any },
      order: { code: 'ASC' },
    });
  }

  async updateDisponibilite(id: string, disponible: boolean): Promise<Salle> {
    const salle = await this.findOne(id);
    salle.disponible = disponible;
    return await this.salleRepository.save(salle);
  }

  async getStatistics(tenantId: string): Promise<any> {
    await this.tenantConnection.setTenantSchema(tenantId);
    const total = await this.salleRepository.count();
    const disponibles = await this.salleRepository.count({ where: { disponible: true } });
    
    const statsByType = await this.salleRepository
      .createQueryBuilder('salle')
      .select('salle.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('salle.type')
      .getRawMany();

    return {
      total,
      disponibles,
      indisponibles: total - disponibles,
      parType: statsByType,
    };
  }
}
