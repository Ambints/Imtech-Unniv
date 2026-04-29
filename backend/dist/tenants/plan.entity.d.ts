export declare class Plan {
    id: string;
    name: string;
    description: string;
    monthlyPrice: number;
    maxStudents: number;
    maxUsers: number;
    features: Record<string, any>;
    isActive: boolean;
    createdAt: Date;
}
