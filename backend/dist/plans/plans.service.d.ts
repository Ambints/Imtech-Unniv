import { Repository } from 'typeorm';
import { Plan } from '../tenants/plan.entity';
import { CreatePlanDto } from '../tenants/dto/create-plan.dto';
import { UpdatePlanDto } from '../tenants/dto/update-plan.dto';
export declare class PlansService {
    private readonly planRepo;
    constructor(planRepo: Repository<Plan>);
    findAll(): Promise<Plan[]>;
    findOne(id: string): Promise<Plan>;
    create(dto: CreatePlanDto): Promise<Plan>;
    update(id: string, dto: UpdatePlanDto): Promise<Plan>;
    remove(id: string): Promise<void>;
}
