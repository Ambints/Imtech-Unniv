import { LogisticsService } from './logistics.service';
export declare class LogisticsController {
    private readonly svc;
    constructor(svc: LogisticsService);
    createTicket(tid: string, dto: any): Promise<import("./logistics.entities").TicketMaintenance[]>;
    getTickets(tid: string, status?: string): Promise<import("./logistics.entities").TicketMaintenance[]>;
    updateTicket(id: string, dto: any): Promise<import("./logistics.entities").TicketMaintenance>;
    createPlanning(tid: string, dto: any): Promise<import("./logistics.entities").PlanningEntretien[]>;
    getPlanning(tid: string): Promise<import("./logistics.entities").PlanningEntretien[]>;
    createStock(tid: string, dto: any): Promise<import("./logistics.entities").Stock[]>;
    getStocks(tid: string): Promise<import("./logistics.entities").Stock[]>;
    getAlertes(tid: string): Promise<import("./logistics.entities").Stock[]>;
    updateStock(id: string, body: any): Promise<import("./logistics.entities").Stock>;
    reserver(tid: string, dto: any): Promise<import("./logistics.entities").ReservationSalle[]>;
    getReservations(tid: string, sid?: string): Promise<import("./logistics.entities").ReservationSalle[]>;
    approuver(id: string, body: any): Promise<import("./logistics.entities").ReservationSalle>;
}
