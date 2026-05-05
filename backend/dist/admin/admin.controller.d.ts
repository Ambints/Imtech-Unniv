import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getActivityLogs(req: any, limit?: string): Promise<any[]>;
    getDetailedStats(req: any): Promise<any>;
    bulkUpdateUserStatus(req: any, dto: {
        userIds: string[];
        active: boolean;
    }): Promise<any>;
    exportUsers(req: any, role?: string): Promise<any[]>;
    getSystemHealth(req: any): Promise<any>;
    createBackup(req: any): Promise<any>;
}
