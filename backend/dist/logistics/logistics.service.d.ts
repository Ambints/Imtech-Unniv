import { DataSource } from 'typeorm';
export declare class LogisticsService {
    private dataSource;
    private request;
    private readonly logger;
    private tenantSchema;
    constructor(dataSource: DataSource, request: any);
    private query;
    createTicket(tid: string, dto: any): Promise<any>;
    getTickets(tid: string, statut?: string): Promise<any[]>;
    updateTicket(id: string, dto: any): Promise<any>;
    createPlanning(tid: string, dto: any): Promise<any>;
    getPlanning(tid?: string): Promise<any[]>;
    createStock(tid: string, dto: any): Promise<any>;
    getStocks(tid?: string): Promise<any[]>;
    getStocksEnAlerte(tid?: string): Promise<any[]>;
    updateStock(id: string, quantiteStock: number): Promise<any>;
    createMouvement(dto: any): Promise<any>;
    getMouvements(stockId?: string): Promise<any[]>;
    reserver(tid: string, dto: any): Promise<any>;
    getReservations(tid: string, salleId?: string): Promise<any[]>;
    approuverReservation(id: string, approuvePar: string): Promise<any>;
    refuserReservation(id: string, approuvePar: string): Promise<any>;
    getStats(): Promise<any>;
}
