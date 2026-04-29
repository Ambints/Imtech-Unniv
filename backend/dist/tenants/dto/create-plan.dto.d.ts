export declare class CreatePlanDto {
    name: string;
    description?: string;
    monthlyPrice: number;
    maxUsers: number;
    maxStudents?: number;
    features?: string[];
    isActive?: boolean;
    displayOrder?: number;
}
