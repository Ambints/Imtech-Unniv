import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly svc;
    constructor(svc: AuthService);
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            role: any;
            photoUrl: any;
            tenantId: any;
        };
        tenant: any;
    }>;
    refresh(body: {
        userId: string;
        refreshToken: string;
    }): Promise<{
        accessToken: string;
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    changePassword(req: any, body: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        success: boolean;
        message: string;
        passwordResetRequired: boolean;
    }>;
    getMe(req: any): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        photoUrl: string;
        tenantId: string;
        passwordResetRequired: boolean;
        lastPasswordReset: Date;
        actif: boolean;
    }>;
}
