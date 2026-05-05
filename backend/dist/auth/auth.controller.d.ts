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
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
            photoUrl: any;
            tenantId?: undefined;
        };
    } | {
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
}
