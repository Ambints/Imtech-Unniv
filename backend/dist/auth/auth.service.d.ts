import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private users;
    private jwt;
    constructor(users: UsersService, jwt: JwtService);
    login(email: string, password: string): Promise<{
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
    refresh(userId: string, token: string): Promise<{
        accessToken: string;
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
}
