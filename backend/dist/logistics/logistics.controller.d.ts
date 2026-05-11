import { LogisticsService } from './logistics.service';
export declare class LogisticsController {
    private readonly svc;
    constructor(svc: LogisticsService);
    createTicket(dto: any): Promise<any>;
    getTickets(statut?: string): Promise<any[]>;
    updateTicket(id: string, dto: any): Promise<any>;
    createPlanning(dto: any): Promise<any>;
    getPlanning(): Promise<any[]>;
    createStock(dto: any): Promise<any>;
    getStocks(): Promise<any[]>;
    getAlertes(): Promise<any[]>;
    updateStock(id: string, body: any): Promise<any>;
    createMouvement(dto: any): Promise<any>;
    getMouvements(stockId?: string): Promise<any[]>;
    reserver(dto: any): Promise<any>;
    getReservations(salleId?: string): Promise<any[]>;
    approuver(id: string, body: any): Promise<any>;
    refuser(id: string, body: any): Promise<any>;
    getStats(): Promise<any>;
}
