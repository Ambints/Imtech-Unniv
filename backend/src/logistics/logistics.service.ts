import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketMaintenance, ReservationSalle, Stock, MouvementStock, PlanningEntretien, RapportEntretien } from './logistics.entities';

@Injectable()
export class LogisticsService {
  constructor(
    @InjectRepository(TicketMaintenance) private ticketRepo: Repository<TicketMaintenance>,
    @InjectRepository(PlanningEntretien) private planningRepo: Repository<PlanningEntretien>,
    @InjectRepository(Stock) private stockRepo: Repository<Stock>,
    @InjectRepository(MouvementStock) private mouvementRepo: Repository<MouvementStock>,
    @InjectRepository(ReservationSalle) private reservationRepo: Repository<ReservationSalle>,
  ) {}

  createTicket(tid: string, dto: any) {
    return this.ticketRepo.save(this.ticketRepo.create(dto));
  }
  getTickets(tid: string, statut?: string) {
    const where: any = {};
    if (statut) where.statut = statut;
    return this.ticketRepo.find({ where, order: { createdAt: 'DESC' } });
  }
  async updateTicket(id: string, dto: any) {
    await this.ticketRepo.update(id, dto);
    return this.ticketRepo.findOne({ where: { id } });
  }

  createPlanning(tid: string, dto: any) {
    return this.planningRepo.save(this.planningRepo.create(dto));
  }
  getPlanning(tid?: string) {
    return this.planningRepo.find({ where: { actif: true } });
  }

  createStock(tid: string, dto: any) {
    return this.stockRepo.save(this.stockRepo.create(dto));
  }
  getStocks(tid?: string) {
    return this.stockRepo.find();
  }
  async getStocksEnAlerte(tid?: string) {
    const stocks = await this.stockRepo.find();
    return stocks.filter(s => Number(s.quantiteStock) <= Number(s.seuilAlerte));
  }
  async updateStock(id: string, quantiteStock: number) {
    await this.stockRepo.update(id, { quantiteStock, derniereMiseAJour: new Date() });
    return this.stockRepo.findOne({ where: { id } });
  }
  createMouvement(dto: any) {
    return this.mouvementRepo.save(this.mouvementRepo.create(dto));
  }
  getMouvements(stockId?: string) {
    const where: any = {};
    if (stockId) where.stockId = stockId;
    return this.mouvementRepo.find({ where, order: { dateMouvement: 'DESC' } });
  }

  reserver(tid: string, dto: any) {
    return this.reservationRepo.save(this.reservationRepo.create(dto));
  }
  getReservations(tid: string, salleId?: string) {
    const where: any = {};
    if (salleId) where.salleId = salleId;
    return this.reservationRepo.find({ where, order: { dateReservation: 'ASC' } });
  }
  async approuverReservation(id: string, approuvePar: string) {
    await this.reservationRepo.update(id, { statut: 'approuve', approuvePar });
    return this.reservationRepo.findOne({ where: { id } });
  }
}