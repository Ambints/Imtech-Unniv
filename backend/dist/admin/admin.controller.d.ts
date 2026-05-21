import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getActivityLogs(req: any, limit?: string): Promise<any[]>;
    getDetailedStats(req: any): Promise<any>;
    getGlobalStats(): Promise<any>;
    bulkUpdateUserStatus(req: any, dto: {
        userIds: string[];
        active: boolean;
    }): Promise<any>;
    exportUsers(req: any, role?: string): Promise<any[]>;
    getSystemHealth(req: any): Promise<any>;
    createBackup(req: any): Promise<any>;
    listBackups(req: any): Promise<any[]>;
    restoreBackup(req: any, backupId: string): Promise<any>;
    cleanupBackups(): Promise<any>;
    defineSecretaireParcours(req: any, parcoursId: string, secretaireId: string): Promise<any>;
    getSecretairesParcours(req: any): Promise<any[]>;
    getSecretairesDisponibles(req: any): Promise<any[]>;
    removeSecretaireParcours(req: any, parcoursId: string): Promise<any>;
}
