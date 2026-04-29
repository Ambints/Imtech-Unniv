import { Repository } from 'typeorm';
import { TicketMaintenance, ReservationSalle, Stock, MouvementStock, PlanningEntretien } from './logistics.entities';
export declare class LogisticsService {
    private ticketRepo;
    private planningRepo;
    private stockRepo;
    private mouvementRepo;
    private reservationRepo;
    constructor(ticketRepo: Repository<TicketMaintenance>, planningRepo: Repository<PlanningEntretien>, stockRepo: Repository<Stock>, mouvementRepo: Repository<MouvementStock>, reservationRepo: Repository<ReservationSalle>);
    createTicket(tid: string, dto: any): Promise<TicketMaintenance[]>;
    getTickets(tid: string, statut?: string): Promise<TicketMaintenance[]>;
    updateTicket(id: string, dto: any): Promise<TicketMaintenance>;
    createPlanning(tid: string, dto: any): Promise<PlanningEntretien[]>;
    getPlanning(tid?: string): Promise<PlanningEntretien[]>;
    createStock(tid: string, dto: any): Promise<Stock[]>;
    getStocks(tid?: string): Promise<Stock[]>;
    getStocksEnAlerte(tid?: string): Promise<Stock[]>;
    updateStock(id: string, quantiteStock: number): Promise<Stock>;
    createMouvement(dto: any): Promise<MouvementStock[]>;
    getMouvements(stockId?: string): Promise<MouvementStock[]>;
    reserver(tid: string, dto: any): Promise<ReservationSalle[]>;
    getReservations(tid: string, salleId?: string): Promise<ReservationSalle[]>;
    approuverReservation(id: string, approuvePar: string): Promise<ReservationSalle>;
}
