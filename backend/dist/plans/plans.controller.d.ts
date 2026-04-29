import { PlansService } from './plans.service';
import { CreatePlanDto } from '../tenants/dto/create-plan.dto';
import { UpdatePlanDto } from '../tenants/dto/update-plan.dto';
export declare class PlansController {
    private readonly plansService;
    constructor(plansService: PlansService);
    findAll(): Promise<import("../tenants/plan.entity").Plan[]>;
    findOne(id: string): Promise<import("../tenants/plan.entity").Plan>;
    create(dto: CreatePlanDto): Promise<import("../tenants/plan.entity").Plan>;
    update(id: string, dto: UpdatePlanDto): Promise<import("../tenants/plan.entity").Plan>;
    remove(id: string): Promise<void>;
}
