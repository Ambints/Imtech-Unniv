import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from '../tenants/plan.entity';
import { CreatePlanDto } from '../tenants/dto/create-plan.dto';
import { UpdatePlanDto } from '../tenants/dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan, 'default')
    private readonly planRepo: Repository<Plan>,
  ) {}

  async findAll(): Promise<Plan[]> {
    return this.planRepo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Plan> {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) {
      throw new NotFoundException(`Plan avec l'ID ${id} non trouvé`);
    }
    return plan;
  }

  async create(dto: CreatePlanDto): Promise<Plan> {
    const plan = this.planRepo.create(dto);
    return this.planRepo.save(plan);
  }

  async update(id: string, dto: UpdatePlanDto): Promise<Plan> {
    const plan = await this.findOne(id);
    Object.assign(plan, dto);
    return this.planRepo.save(plan);
  }

  async remove(id: string): Promise<void> {
    const plan = await this.findOne(id);
    
    // Check if there are linked subscriptions
    const linkedSubscriptions = await this.planRepo.query(
      'SELECT COUNT(*) as count FROM public.abonnement WHERE plan_id = $1',
      [id]
    );
    
    if (parseInt(linkedSubscriptions[0].count) > 0) {
      throw new BadRequestException(
        `Impossible de supprimer ce plan : ${linkedSubscriptions[0].count} abonnement(s) y sont encore liés. ` +
        `Veuillez d'abord modifier ou supprimer ces abonnements.`
      );
    }
    
    await this.planRepo.remove(plan);
  }
}
