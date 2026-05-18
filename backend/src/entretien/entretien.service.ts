import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  CreatePlanningEntretienDto,
  UpdatePlanningEntretienDto,
  CreateRapportEntretienDto,
  UpdateRapportEntretienDto,
  CreateTicketMaintenanceDto,
  UpdateTicketMaintenanceDto,
  CreateStockEntretienDto,
  MouvementStockEntretienDto,
  TraiterReservationDto,
  TraiterDemandeRessourceDto,
} from './dto';

@Injectable()
export class EntretienService {
  constructor(private readonly dataSource: DataSource) {}

  private schema(tenantSchema: string): string {
    if (!tenantSchema) throw new BadRequestException('tenantSchema manquant');
    if (!/^tenant_[a-z0-9_]+$/.test(tenantSchema)) {
      throw new BadRequestException(`Schéma tenant invalide: "${tenantSchema}"`);
    }
    return tenantSchema;
  }

  async getDashboard(tenantSchema: string) {
    const s = this.schema(tenantSchema);
    const [ticketsOuverts, ticketsUrgents, articlesAlerte, planningsActifs, reservationsAttente, statsRapports, depenses] = await Promise.all([
      this.dataSource.query(`SELECT COUNT(*)::int AS count FROM ${s}.ticket_maintenance WHERE statut IN ('ouvert', 'en_cours')`),
      this.dataSource.query(`SELECT COUNT(*)::int AS count FROM ${s}.ticket_maintenance WHERE priorite = 'urgente' AND statut NOT IN ('resolu', 'ferme', 'annule')`),
      this.dataSource.query(`SELECT COUNT(*)::int AS count FROM ${s}.stock WHERE quantite_stock <= seuil_alerte`),
      this.dataSource.query(`SELECT COUNT(*)::int AS count FROM ${s}.planning_entretien WHERE actif = true AND jour_semaine = EXTRACT(ISODOW FROM CURRENT_DATE)`),
      this.dataSource.query(`SELECT COUNT(*)::int AS count FROM ${s}.reservation_salle WHERE statut = 'en_attente'`),
      this.dataSource.query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE statut = 'realise')::int AS realises FROM ${s}.rapport_entretien WHERE date_realisation >= CURRENT_DATE - INTERVAL '30 days'`),
      this.dataSource.query(`SELECT COALESCE(SUM(montant), 0)::float AS total FROM ${s}.depense WHERE EXTRACT(MONTH FROM date_depense) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM date_depense) = EXTRACT(YEAR FROM CURRENT_DATE) AND (categorie ILIKE '%entretien%' OR categorie ILIKE '%nettoyage%')`)
    ]);
    const tauxExecution = statsRapports[0]?.total > 0 ? Math.round((statsRapports[0].realises / statsRapports[0].total) * 100) : 0;
    return {
      tickets_ouverts: ticketsOuverts[0]?.count || 0,
      tickets_urgents_non_resolus: ticketsUrgents[0]?.count || 0,
      articles_sous_seuil: articlesAlerte[0]?.count || 0,
      plannings_actifs_aujourd_hui: planningsActifs[0]?.count || 0,
      reservations_en_attente: reservationsAttente[0]?.count || 0,
      taux_execution_30j: tauxExecution,
      depenses_entretien_mois: depenses[0]?.total || 0,
    };
  }

  async getPlanning(tenantSchema: string, filters?: any) {
    const s = this.schema(tenantSchema);
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;
    if (filters?.actif !== undefined) { conditions.push(`pe.actif = $${idx++}`); params.push(filters.actif); }
    if (filters?.type_nettoyage) { conditions.push(`pe.type_nettoyage = $${idx++}`); params.push(filters.type_nettoyage); }
    if (filters?.batiment_id) { conditions.push(`pe.batiment_id = $${idx++}`); params.push(filters.batiment_id); }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return this.dataSource.query(`SELECT pe.*, s.nom AS salle_nom, s.code AS salle_code, b.nom AS batiment_nom, u.nom || ' ' || u.prenom AS responsable_nom FROM ${s}.planning_entretien pe LEFT JOIN ${s}.salle s ON s.id = pe.salle_id LEFT JOIN ${s}.batiment b ON b.id = pe.batiment_id LEFT JOIN ${s}.utilisateur u ON u.id = pe.responsable_id ${where} ORDER BY pe.jour_semaine, pe.heure_debut`, params);
  }

  async getPlanningHebdomadaire(tenantSchema: string) {
    const s = this.schema(tenantSchema);
    const plannings = await this.dataSource.query(`SELECT pe.*, s.nom AS salle_nom, b.nom AS batiment_nom FROM ${s}.planning_entretien pe LEFT JOIN ${s}.salle s ON s.id = pe.salle_id LEFT JOIN ${s}.batiment b ON b.id = pe.batiment_id WHERE pe.actif = true ORDER BY pe.jour_semaine, pe.heure_debut`);
    const grouped: Record<number, any[]> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
    plannings.forEach((p: any) => grouped[p.jour_semaine].push(p));
    return grouped;
  }

  async createPlanning(tenantSchema: string, dto: CreatePlanningEntretienDto) {
    const s = this.schema(tenantSchema);
    const result = await this.dataSource.query(`INSERT INTO ${s}.planning_entretien (salle_id, batiment_id, zone, type_nettoyage, responsable_id, jour_semaine, heure_debut, duree_minutes, actif) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true) RETURNING *`, [dto.salle_id || null, dto.batiment_id || null, dto.zone || null, dto.type_nettoyage, dto.responsable_id || null, dto.jour_semaine, dto.heure_debut || null, dto.duree_minutes || null]);
    return result[0];
  }

  async updatePlanning(tenantSchema: string, id: string, dto: UpdatePlanningEntretienDto) {
    const s = this.schema(tenantSchema);
    const sets: string[] = [];
    const params: any[] = [];
    let idx = 1;
    if (dto.salle_id !== undefined) { sets.push(`salle_id = $${idx++}`); params.push(dto.salle_id); }
    if (dto.batiment_id !== undefined) { sets.push(`batiment_id = $${idx++}`); params.push(dto.batiment_id); }
    if (dto.zone !== undefined) { sets.push(`zone = $${idx++}`); params.push(dto.zone); }
    if (dto.type_nettoyage) { sets.push(`type_nettoyage = $${idx++}`); params.push(dto.type_nettoyage); }
    if (dto.responsable_id !== undefined) { sets.push(`responsable_id = $${idx++}`); params.push(dto.responsable_id); }
    if (dto.jour_semaine) { sets.push(`jour_semaine = $${idx++}`); params.push(dto.jour_semaine); }
    if (dto.heure_debut !== undefined) { sets.push(`heure_debut = $${idx++}`); params.push(dto.heure_debut); }
    if (dto.duree_minutes !== undefined) { sets.push(`duree_minutes = $${idx++}`); params.push(dto.duree_minutes); }
    if (dto.actif !== undefined) { sets.push(`actif = $${idx++}`); params.push(dto.actif); }
    if (sets.length === 0) throw new BadRequestException('Aucune donnée à mettre à jour');
    params.push(id);
    const result = await this.dataSource.query(`UPDATE ${s}.planning_entretien SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`, params);
    if (result.length === 0) throw new NotFoundException('Planning non trouvé');
    return result[0];
  }

  async togglePlanning(tenantSchema: string, id: string) {
    const s = this.schema(tenantSchema);
    const result = await this.dataSource.query(`UPDATE ${s}.planning_entretien SET actif = NOT actif WHERE id = $1 RETURNING *`, [id]);
    if (result.length === 0) throw new NotFoundException('Planning non trouvé');
    return result[0];
  }

  async getRapports(tenantSchema: string, filters?: any) {
    const s = this.schema(tenantSchema);
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;
    if (filters?.dateDebut) { conditions.push(`re.date_realisation >= $${idx++}`); params.push(filters.dateDebut); }
    if (filters?.dateFin) { conditions.push(`re.date_realisation <= $${idx++}`); params.push(filters.dateFin); }
    if (filters?.statut) { conditions.push(`re.statut = $${idx++}`); params.push(filters.statut); }
    if (filters?.planning_id) { conditions.push(`re.planning_id = $${idx++}`); params.push(filters.planning_id); }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return this.dataSource.query(`SELECT re.*, pe.type_nettoyage, pe.zone, s.nom AS salle_nom, b.nom AS batiment_nom, u.nom || ' ' || u.prenom AS realise_par_nom FROM ${s}.rapport_entretien re LEFT JOIN ${s}.planning_entretien pe ON pe.id = re.planning_id LEFT JOIN ${s}.salle s ON s.id = pe.salle_id LEFT JOIN ${s}.batiment b ON b.id = pe.batiment_id LEFT JOIN ${s}.utilisateur u ON u.id = re.realise_par ${where} ORDER BY re.date_realisation DESC`, params);
  }

  async getRapportsStats(tenantSchema: string, jours: number = 30) {
    const s = this.schema(tenantSchema);
    const result = await this.dataSource.query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE statut = 'realise')::int AS realises, COUNT(*) FILTER (WHERE statut = 'partiel')::int AS partiels, COUNT(*) FILTER (WHERE statut = 'non_realise')::int AS non_realises FROM ${s}.rapport_entretien WHERE date_realisation >= CURRENT_DATE - INTERVAL '${jours} days'`);
    const stats = result[0];
    return { ...stats, taux_execution: stats.total > 0 ? Math.round((stats.realises / stats.total) * 100) : 0 };
  }

  async createRapport(tenantSchema: string, dto: CreateRapportEntretienDto) {
    const s = this.schema(tenantSchema);
    const result = await this.dataSource.query(`INSERT INTO ${s}.rapport_entretien (planning_id, realise_par, date_realisation, heure_debut, heure_fin, statut, observations) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [dto.planning_id || null, dto.realise_par, dto.date_realisation, dto.heure_debut || null, dto.heure_fin || null, dto.statut, dto.observations || null]);
    return result[0];
  }

  async updateRapport(tenantSchema: string, id: string, dto: UpdateRapportEntretienDto) {
    const s = this.schema(tenantSchema);
    const sets: string[] = [];
    const params: any[] = [];
    let idx = 1;
    if (dto.statut) { sets.push(`statut = $${idx++}`); params.push(dto.statut); }
    if (dto.observations !== undefined) { sets.push(`observations = $${idx++}`); params.push(dto.observations); }
    if (dto.heure_debut !== undefined) { sets.push(`heure_debut = $${idx++}`); params.push(dto.heure_debut); }
    if (dto.heure_fin !== undefined) { sets.push(`heure_fin = $${idx++}`); params.push(dto.heure_fin); }
    if (sets.length === 0) throw new BadRequestException('Aucune donnée à mettre à jour');
    params.push(id);
    const result = await this.dataSource.query(`UPDATE ${s}.rapport_entretien SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`, params);
    if (result.length === 0) throw new NotFoundException('Rapport non trouvé');
    return result[0];
  }

  async getTickets(tenantSchema: string, filters?: any) {
    const s = this.schema(tenantSchema);
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;
    if (filters?.statut) { conditions.push(`t.statut = $${idx++}`); params.push(filters.statut); }
    if (filters?.priorite) { conditions.push(`t.priorite = $${idx++}`); params.push(filters.priorite); }
    if (filters?.type) { conditions.push(`t.type_maintenance = $${idx++}`); params.push(filters.type); }
    if (filters?.batiment_id) { conditions.push(`t.batiment_id = $${idx++}`); params.push(filters.batiment_id); }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return this.dataSource.query(`SELECT t.*, b.nom AS batiment_nom, s.nom AS salle_nom, s.code AS salle_code, u_signal.nom || ' ' || u_signal.prenom AS signale_par_nom, u_assign.nom || ' ' || u_assign.prenom AS assigne_a_nom FROM ${s}.ticket_maintenance t LEFT JOIN ${s}.batiment b ON b.id = t.batiment_id LEFT JOIN ${s}.salle s ON s.id = t.salle_id LEFT JOIN ${s}.utilisateur u_signal ON u_signal.id = t.signale_par LEFT JOIN ${s}.utilisateur u_assign ON u_assign.id = t.assigne_a ${where} ORDER BY CASE t.priorite WHEN 'urgente' THEN 1 WHEN 'haute' THEN 2 WHEN 'normale' THEN 3 WHEN 'basse' THEN 4 END, t.date_signalement DESC`, params);
  }

  async getTicketsUrgents(tenantSchema: string) {
    const s = this.schema(tenantSchema);
    return this.dataSource.query(`SELECT t.*, b.nom AS batiment_nom, s.nom AS salle_nom FROM ${s}.ticket_maintenance t LEFT JOIN ${s}.batiment b ON b.id = t.batiment_id LEFT JOIN ${s}.salle s ON s.id = t.salle_id WHERE t.priorite IN ('urgente', 'haute') AND t.statut = 'ouvert' ORDER BY CASE t.priorite WHEN 'urgente' THEN 1 ELSE 2 END, t.date_signalement DESC`);
  }

  async getTicketsStats(tenantSchema: string, jours: number = 30) {
    const s = this.schema(tenantSchema);
    const [parStatut, parPriorite, parType] = await Promise.all([
      this.dataSource.query(`SELECT statut, COUNT(*)::int AS total, AVG(EXTRACT(EPOCH FROM (COALESCE(date_resolution, NOW()) - date_signalement))/3600)::int AS delai_moyen_heures FROM ${s}.ticket_maintenance WHERE date_signalement >= NOW() - INTERVAL '${jours} days' GROUP BY statut`),
      this.dataSource.query(`SELECT priorite, COUNT(*)::int AS total FROM ${s}.ticket_maintenance WHERE date_signalement >= NOW() - INTERVAL '${jours} days' GROUP BY priorite`),
      this.dataSource.query(`SELECT type_maintenance, COUNT(*)::int AS total FROM ${s}.ticket_maintenance WHERE date_signalement >= NOW() - INTERVAL '${jours} days' GROUP BY type_maintenance`)
    ]);
    return { par_statut: parStatut, par_priorite: parPriorite, par_type: parType };
  }

  async createTicket(tenantSchema: string, dto: CreateTicketMaintenanceDto, userId: string) {
    const s = this.schema(tenantSchema);
    const result = await this.dataSource.query(`INSERT INTO ${s}.ticket_maintenance (batiment_id, salle_id, titre, description, type_maintenance, priorite, signale_par, assigne_a, statut, date_signalement) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ouvert', NOW()) RETURNING *`, [dto.batiment_id || null, dto.salle_id || null, dto.titre, dto.description, dto.type_maintenance, dto.priorite || 'normale', userId, dto.assigne_a || null]);
    return result[0];
  }

  async updateTicket(tenantSchema: string, id: string, dto: UpdateTicketMaintenanceDto) {
    const s = this.schema(tenantSchema);
    const sets: string[] = ['updated_at = NOW()'];
    const params: any[] = [];
    let idx = 1;
    if (dto.statut) { sets.push(`statut = $${idx++}`); params.push(dto.statut); if (dto.statut === 'resolu') sets.push(`date_resolution = NOW()`); }
    if (dto.priorite) { sets.push(`priorite = $${idx++}`); params.push(dto.priorite); }
    if (dto.assigne_a !== undefined) { sets.push(`assigne_a = $${idx++}`); params.push(dto.assigne_a); }
    if (dto.cout_reparation !== undefined) { sets.push(`cout_reparation = $${idx++}`); params.push(dto.cout_reparation); }
    if (dto.observations !== undefined) { sets.push(`observations = $${idx++}`); params.push(dto.observations); }
    if (sets.length === 1) throw new BadRequestException('Aucune donnée à mettre à jour');
    params.push(id);
    const result = await this.dataSource.query(`UPDATE ${s}.ticket_maintenance SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`, params);
    if (result.length === 0) throw new NotFoundException('Ticket non trouvé');
    return result[0];
  }

  async getStock(tenantSchema: string, filters?: any) {
    const s = this.schema(tenantSchema);
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;
    if (filters?.categorie) { conditions.push(`categorie = $${idx++}`); params.push(filters.categorie); }
    if (filters?.alerte_only) conditions.push(`quantite_stock <= seuil_alerte`);
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return this.dataSource.query(`SELECT *, CASE WHEN quantite_stock <= seuil_alerte THEN true ELSE false END AS en_alerte, CASE WHEN quantite_stock <= seuil_alerte THEN (seuil_alerte - quantite_stock) ELSE 0 END AS deficit FROM ${s}.stock ${where} ORDER BY categorie, libelle`, params);
  }

  async getStockAlertes(tenantSchema: string) {
    const s = this.schema(tenantSchema);
    return this.dataSource.query(`SELECT *, (seuil_alerte - quantite_stock) AS deficit FROM ${s}.stock WHERE quantite_stock <= seuil_alerte ORDER BY deficit DESC`);
  }

  async getStockEnergie(tenantSchema: string) {
    const s = this.schema(tenantSchema);
    const [articles, historique] = await Promise.all([
      this.dataSource.query(`SELECT *, CASE WHEN quantite_stock <= seuil_alerte THEN true ELSE false END AS en_alerte FROM ${s}.stock WHERE categorie = 'energie' ORDER BY libelle`),
      this.dataSource.query(`SELECT TO_CHAR(ms.date_mouvement, 'YYYY-MM') AS mois, EXTRACT(YEAR FROM ms.date_mouvement)::int AS annee, SUM(CASE WHEN ms.type_mouvement = 'entree' THEN ms.quantite ELSE 0 END)::float AS total_entrees, SUM(CASE WHEN ms.type_mouvement = 'sortie' THEN ms.quantite ELSE 0 END)::float AS total_sorties, SUM(CASE WHEN ms.type_mouvement = 'sortie' THEN ms.quantite ELSE 0 END)::float AS consommation FROM ${s}.mouvement_stock ms JOIN ${s}.stock s ON s.id = ms.stock_id WHERE s.categorie = 'energie' AND ms.date_mouvement >= NOW() - INTERVAL '12 months' GROUP BY TO_CHAR(ms.date_mouvement, 'YYYY-MM'), EXTRACT(YEAR FROM ms.date_mouvement) ORDER BY mois DESC`)
    ]);
    return { articles, historique };
  }

  async createStock(tenantSchema: string, dto: CreateStockEntretienDto) {
    const s = this.schema(tenantSchema);
    const result = await this.dataSource.query(`INSERT INTO ${s}.stock (reference, libelle, categorie, unite, quantite_stock, seuil_alerte, prix_unitaire, fournisseur, emplacement, derniere_mise_a_jour) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) RETURNING *`, [dto.reference, dto.libelle, dto.categorie, dto.unite, dto.quantite_stock, dto.seuil_alerte, dto.prix_unitaire || null, dto.fournisseur || null, dto.emplacement || null]);
    return result[0];
  }

  async updateStock(tenantSchema: string, id: string, dto: Partial<CreateStockEntretienDto>) {
    const s = this.schema(tenantSchema);
    const sets: string[] = ['derniere_mise_a_jour = NOW()'];
    const params: any[] = [];
    let idx = 1;
    if (dto.libelle) { sets.push(`libelle = $${idx++}`); params.push(dto.libelle); }
    if (dto.seuil_alerte !== undefined) { sets.push(`seuil_alerte = $${idx++}`); params.push(dto.seuil_alerte); }
    if (dto.prix_unitaire !== undefined) { sets.push(`prix_unitaire = $${idx++}`); params.push(dto.prix_unitaire); }
    if (dto.fournisseur !== undefined) { sets.push(`fournisseur = $${idx++}`); params.push(dto.fournisseur); }
    if (dto.emplacement !== undefined) { sets.push(`emplacement = $${idx++}`); params.push(dto.emplacement); }
    if (sets.length === 1) throw new BadRequestException('Aucune donnée à mettre à jour');
    params.push(id);
    const result = await this.dataSource.query(`UPDATE ${s}.stock SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`, params);
    if (result.length === 0) throw new NotFoundException('Article non trouvé');
    return result[0];
  }

  async getMouvements(tenantSchema: string, stockId: string, page: number = 1, limit: number = 10) {
    const s = this.schema(tenantSchema);
    const offset = (page - 1) * limit;
    const [data, countResult] = await Promise.all([
      this.dataSource.query(`SELECT ms.*, u.nom || ' ' || u.prenom AS operateur, st.libelle AS article_libelle FROM ${s}.mouvement_stock ms LEFT JOIN ${s}.utilisateur u ON u.id = ms.utilisateur_id LEFT JOIN ${s}.stock st ON st.id = ms.stock_id WHERE ms.stock_id = $1 ORDER BY ms.date_mouvement DESC LIMIT $2 OFFSET $3`, [stockId, limit, offset]),
      this.dataSource.query(`SELECT COUNT(*)::int AS count FROM ${s}.mouvement_stock WHERE stock_id = $1`, [stockId])
    ]);
    return { data, total: countResult[0]?.count || 0, page, limit };
  }

  async enregistrerMouvement(tenantSchema: string, stockId: string, dto: MouvementStockEntretienDto, userId: string) {
    const s = this.schema(tenantSchema);
    const stock = await this.dataSource.query(`SELECT quantite_stock FROM ${s}.stock WHERE id = $1`, [stockId]);
    if (stock.length === 0) throw new NotFoundException('Article non trouvé');
    const currentStock = stock[0].quantite_stock;
    if (dto.type_mouvement === 'sortie' && currentStock < dto.quantite) throw new ConflictException(`Stock insuffisant. Disponible: ${currentStock}, Demandé: ${dto.quantite}`);
    await this.dataSource.query('BEGIN');
    try {
      let newQuantity = currentStock;
      if (dto.type_mouvement === 'entree') newQuantity += dto.quantite;
      else if (dto.type_mouvement === 'sortie') newQuantity -= dto.quantite;
      else if (dto.type_mouvement === 'ajustement') newQuantity = dto.quantite;
      await this.dataSource.query(`UPDATE ${s}.stock SET quantite_stock = $1, derniere_mise_a_jour = NOW() WHERE id = $2`, [newQuantity, stockId]);
      await this.dataSource.query(`INSERT INTO ${s}.mouvement_stock (stock_id, type_mouvement, quantite, motif, reference_doc, utilisateur_id, date_mouvement) VALUES ($1, $2, $3, $4, $5, $6, NOW())`, [stockId, dto.type_mouvement, dto.quantite, dto.motif || null, dto.reference_doc || null, userId]);
      await this.dataSource.query('COMMIT');
      return { success: true, nouvelle_quantite: newQuantity };
    } catch (error) {
      await this.dataSource.query('ROLLBACK');
      throw error;
    }
  }

  async getReservations(tenantSchema: string, filters?: any) {
    const s = this.schema(tenantSchema);
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;
    if (filters?.statut) { conditions.push(`r.statut = $${idx++}`); params.push(filters.statut); }
    if (filters?.dateDebut) { conditions.push(`r.date_reservation >= $${idx++}`); params.push(filters.dateDebut); }
    if (filters?.dateFin) { conditions.push(`r.date_reservation <= $${idx++}`); params.push(filters.dateFin); }
    if (filters?.salle_id) { conditions.push(`r.salle_id = $${idx++}`); params.push(filters.salle_id); }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return this.dataSource.query(`SELECT r.*, s.nom AS salle_nom, s.code AS salle_code, s.capacite, s.type_salle, b.nom AS batiment_nom, u.nom || ' ' || u.prenom AS demandeur_nom, u_app.nom || ' ' || u_app.prenom AS approuve_par_nom FROM ${s}.reservation_salle r JOIN ${s}.salle s ON s.id = r.salle_id LEFT JOIN ${s}.batiment b ON b.id = s.batiment_id JOIN ${s}.utilisateur u ON u.id = r.demande_par LEFT JOIN ${s}.utilisateur u_app ON u_app.id = r.approuve_par ${where} ORDER BY r.date_reservation DESC, r.heure_debut`, params);
  }

  async getCalendrier(tenantSchema: string, dateDebut: string, dateFin: string) {
    const s = this.schema(tenantSchema);
    return this.dataSource.query(`SELECT r.id, r.salle_id, s.nom AS salle_nom, r.date_reservation AS date, r.heure_debut, r.heure_fin, r.titre, r.statut, 'reservation' AS source, NULL AS type FROM ${s}.reservation_salle r JOIN ${s}.salle s ON s.id = r.salle_id WHERE r.date_reservation BETWEEN $1 AND $2 AND r.statut != 'annulee' UNION ALL SELECT e.id, e.salle_id, s.nom AS salle_nom, e.date_seance AS date, e.heure_debut, e.heure_fin, 'Cours' AS titre, e.statut, 'cours' AS source, e.type_seance AS type FROM ${s}.emploi_du_temps e JOIN ${s}.salle s ON s.id = e.salle_id WHERE e.date_seance BETWEEN $1 AND $2 AND e.statut != 'annule' AND e.salle_id IS NOT NULL ORDER BY salle_id, date, heure_debut`, [dateDebut, dateFin]);
  }

  async approuverReservation(tenantSchema: string, id: string, userId: string) {
    const s = this.schema(tenantSchema);
    const reservation = await this.dataSource.query(`SELECT salle_id, date_reservation, heure_debut, heure_fin FROM ${s}.reservation_salle WHERE id = $1 AND statut = 'en_attente'`, [id]);
    if (reservation.length === 0) throw new NotFoundException('Réservation non trouvée ou déjà traitée');
    const { salle_id, date_reservation, heure_debut, heure_fin } = reservation[0];
    const conflitsReservations = await this.dataSource.query(`SELECT COUNT(*)::int AS count FROM ${s}.reservation_salle WHERE salle_id = $1 AND date_reservation = $2 AND statut = 'approuvee' AND id != $3 AND (heure_debut < $5 AND heure_fin > $4)`, [salle_id, date_reservation, id, heure_debut, heure_fin]);
    if (conflitsReservations[0]?.count > 0) throw new ConflictException('Créneau déjà réservé');
    const conflitsEDT = await this.dataSource.query(`SELECT COUNT(*)::int AS count FROM ${s}.emploi_du_temps WHERE salle_id = $1 AND date_seance = $2 AND statut != 'annule' AND heure_debut < $4 AND heure_fin > $3`, [salle_id, date_reservation, heure_debut, heure_fin]);
    if (conflitsEDT[0]?.count > 0) throw new ConflictException('Salle occupée par un cours');
    const result = await this.dataSource.query(`UPDATE ${s}.reservation_salle SET statut = 'approuvee', approuve_par = $1 WHERE id = $2 RETURNING *`, [userId, id]);
    return result[0];
  }

  async refuserReservation(tenantSchema: string, id: string, dto: TraiterReservationDto) {
    const s = this.schema(tenantSchema);
    const result = await this.dataSource.query(`UPDATE ${s}.reservation_salle SET statut = 'refusee' WHERE id = $1 AND statut = 'en_attente' RETURNING *`, [id]);
    if (result.length === 0) throw new NotFoundException('Réservation non trouvée');
    return result[0];
  }

  async annulerReservation(tenantSchema: string, id: string) {
    const s = this.schema(tenantSchema);
    const result = await this.dataSource.query(`UPDATE ${s}.reservation_salle SET statut = 'annulee' WHERE id = $1 AND statut IN ('en_attente', 'approuvee') RETURNING *`, [id]);
    if (result.length === 0) throw new NotFoundException('Réservation non trouvée');
    return result[0];
  }

  async getDemandesRessource(tenantSchema: string, filters?: any) {
    const s = this.schema(tenantSchema);
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;
    if (filters?.statut) { conditions.push(`dr.statut = $${idx++}`); params.push(filters.statut); }
    if (filters?.type_ressource) { conditions.push(`dr.type_ressource = $${idx++}`); params.push(filters.type_ressource); }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return this.dataSource.query(`SELECT dr.*, u.nom || ' ' || u.prenom AS demandeur_nom, u.role AS demandeur_role, u_trait.nom || ' ' || u_trait.prenom AS traite_par_nom FROM ${s}.demande_ressource dr JOIN ${s}.utilisateur u ON u.id = dr.demandeur_id LEFT JOIN ${s}.utilisateur u_trait ON u_trait.id = dr.traite_par ${where} ORDER BY CASE dr.statut WHEN 'soumise' THEN 1 ELSE 2 END, dr.date_souhaitee`, params);
  }

  async traiterDemandeRessource(tenantSchema: string, id: string, dto: TraiterDemandeRessourceDto, userId: string) {
    const s = this.schema(tenantSchema);
    const result = await this.dataSource.query(`UPDATE ${s}.demande_ressource SET statut = $1, commentaire_rejet = $2, traite_par = $3, date_traitement = NOW() WHERE id = $4 RETURNING *`, [dto.statut, dto.commentaire_rejet || null, userId, id]);
    if (result.length === 0) throw new NotFoundException('Demande non trouvée');
    return result[0];
  }

  async getInventaireBatiments(tenantSchema: string) {
    const s = this.schema(tenantSchema);
    return this.dataSource.query(`SELECT b.id, b.nom, b.code, COUNT(DISTINCT s.id)::int AS nb_salles, COUNT(DISTINCT t.id) FILTER (WHERE t.statut IN ('ouvert', 'en_cours'))::int AS tickets_ouverts, COUNT(DISTINCT pe.id) FILTER (WHERE pe.actif = true)::int AS plannings_actifs FROM ${s}.batiment b LEFT JOIN ${s}.salle s ON s.batiment_id = b.id LEFT JOIN ${s}.ticket_maintenance t ON t.batiment_id = b.id LEFT JOIN ${s}.planning_entretien pe ON pe.batiment_id = b.id WHERE b.actif = true GROUP BY b.id, b.nom, b.code ORDER BY b.nom`);
  }

  async getInventaireSallesParType(tenantSchema: string) {
    const s = this.schema(tenantSchema);
    return this.dataSource.query(`SELECT type_salle, COUNT(*)::int AS total, COUNT(*) FILTER (WHERE disponible = true)::int AS disponibles, SUM(capacite)::int AS capacite_totale FROM ${s}.salle GROUP BY type_salle ORDER BY total DESC`);
  }

  async getInventaireStocksParCategorie(tenantSchema: string) {
    const s = this.schema(tenantSchema);
    return this.dataSource.query(`SELECT categorie, COUNT(*)::int AS nb_references, COUNT(*) FILTER (WHERE quantite_stock <= seuil_alerte)::int AS en_alerte, SUM(quantite_stock * COALESCE(prix_unitaire, 0))::float AS valeur_stock_totale FROM ${s}.stock GROUP BY categorie ORDER BY categorie`);
  }
}

// Made with Bob
