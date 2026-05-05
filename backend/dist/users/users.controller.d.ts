import { UsersService } from './users.service';
export declare class UsersController {
    private readonly svc;
    constructor(svc: UsersService);
    create(dto: any): Promise<any>;
    findAll(tid?: string, role?: string, university?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: any): Promise<any>;
    remove(id: string): Promise<void>;
}
