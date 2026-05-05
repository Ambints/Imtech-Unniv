import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Paiement, Echeancier } from '../finance/finance.entities';

@Injectable()
export class CaissierService {
  private readonly logger = new Logger(CaissierService.name);

  constructor(
    @InjectRepository(Paiement) private paiementRepo: Repository<Paiement>,
    @InjectRepository(Echeancier) private echeancierRepo: Repository<Echeancier>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  // ========== ENCAISSEMENTS ==========
  async createPaiement(data: any): Promise<any> {
    // Générer un numéro de reçu unique
    const numeroRecu = await this.genererNumeroRecu();
    
    const paiement = this.paiementRepo.create({
      ...data,
      numeroRecu,
      datePaiement: new Date(),
      statut: 'valide',
    });

    const saved: any = await this.paiementRepo.save(paiement);
    const savedPaiement = Array.isArray(saved) ? saved[0] : saved;

    // Mettre à jour l'échéancier si lié
    if (data.echeancierId) {
      await this.echeancierRepo.update(data.echeancierId, { statut: 'paye' });
    }

    // Vérifier si l'étudiant est maintenant à jour et débloquer les notes si nécessaire
    await this.verifierEtDebloquerNotes(data.inscriptionId);

    return savedPaiement;
  }

  async findPaiements(date?: string, mode?: string): Promise<Paiement[]> {
    const query = this.paiementRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.inscription', 'i')
      .leftJoinAndSelect('i.etudiant', 'e');

    if (date) {
      query.andWhere('DATE(p.datePaiement) = :date', { date });
    } else {
      // Par défaut, paiements du jour
      query.andWhere('DATE(p.datePaiement) = CURRENT_DATE');
    }

    if (mode) {
      query.andWhere('p.modePaiement = :mode', { mode });
    }

    return query.orderBy('p.datePaiement', 'DESC').getMany();
  }

  async findPaiementsByEtudiant(etudiantId: string): Promise<any[]> {
    return this.dataSource.query(`
      SELECT p.*, i.annee_academique_id, par.nom as parcours
      FROM paiement p
      JOIN inscription i ON i.id = p.inscription_id
      JOIN parcours par ON par.id = i.parcours_id
      WHERE i.etudiant_id = $1
      ORDER BY p.date_paiement DESC
    `, [etudiantId]);
  }

  async annulerPaiement(id: string, motif: string, annulePar: string): Promise<Paiement> {
    const paiement = await this.paiementRepo.findOne({ where: { id } });
    if (!paiement) throw new NotFoundException('Paiement non trouvé');

    await this.paiementRepo.update(id, {
      statut: 'annule',
      motifAnnulation: motif,
    });

    // Remettre l'échéancier en attente si nécessaire
    if (paiement.echeancierId) {
      await this.echeancierRepo.update(paiement.echeancierId, { statut: 'en_attente' });
    }

    return this.paiementRepo.findOne({ where: { id } });
  }

  async genererRecu(id: string): Promise<any> {
    const paiement = await this.dataSource.query(`
      SELECT 
        p.*,
        e.nom, e.prenom, e.matricule,
        par.nom as parcours,
        aa.libelle as annee_academique,
        i.annee_niveau
      FROM paiement p
      JOIN inscription i ON i.id = p.inscription_id
      JOIN etudiant e ON e.id = i.etudiant_id
      JOIN parcours par ON par.id = i.parcours_id
      JOIN annee_academique aa ON aa.id = i.annee_academique_id
      WHERE p.id = $1
    `, [id]);

    if (!paiement.length) throw new NotFoundException('Paiement non trouvé');

    // Retourner les données pour génération PDF
    return {
      ...paiement[0],
      typeDocument: 'recu_fiscal',
      dateGeneration: new Date(),
    };
  }

  // ========== ÉCHÉANCIERS ==========
  async createEcheancier(data: any): Promise<any> {
    const echeancier = this.echeancierRepo.create(data);
    const saved = await this.echeancierRepo.save(echeancier);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async findEcheances(dateDebut?: string, dateFin?: string, statut?: string): Promise<any[]> {
    const query = this.echeancierRepo.createQueryBuilder('e')
      .leftJoinAndSelect('e.inscription', 'i')
      .leftJoinAndSelect('i.etudiant', 'et');

    if (dateDebut && dateFin) {
      query.andWhere('e.dateEcheance BETWEEN :debut AND :fin', { debut: dateDebut, fin: dateFin });
    }

    if (statut) {
      query.andWhere('e.statut = :statut', { statut });
    }

    return query.orderBy('e.dateEcheance', 'ASC').getMany();
  }

  async findEcheancesByEtudiant(etudiantId: string): Promise<any[]> {
    return this.dataSource.query(`
      SELECT e.*, i.annee_academique_id, par.nom as parcours,
             CASE 
               WHEN e.date_echeance < NOW() AND e.statut != 'paye' THEN 'en_retard'
               ELSE e.statut
             END as statut_calcule
      FROM echeancier e
      JOIN inscription i ON i.id = e.inscription_id
      JOIN parcours par ON par.id = i.parcours_id
      WHERE i.etudiant_id = $1
      ORDER BY e.date_echeance
    `, [etudiantId]);
  }

  async modifierEcheance(id: string, dto: { nouvelleDate: string; motif: string }): Promise<Echeancier> {
    await this.echeancierRepo.update(id, {
      dateEcheance: new Date(dto.nouvelleDate),
    });

    // Logger le motif
    await this.dataSource.query(`
      INSERT INTO historique_echeancier (echeancier_id, action, motif, date_modification)
      VALUES ($1, 'report', $2, NOW())
    `, [id, dto.motif]);

    return this.echeancierRepo.findOne({ where: { id } });
  }

  // ========== RELANCES ET IMPAYÉS ==========
  async findImpayes(jours: number = 30): Promise<any[]> {
    return this.dataSource.query(`
      SELECT 
        i.id as inscription_id,
        e.id as etudiant_id,
        e.nom, e.prenom, e.email, e.telephone,
        par.nom as parcours,
        aa.libelle as annee_academique,
        gt.montant_total as montant_du,
        COALESCE(payes.total_paye, 0) as montant_paye,
        gt.montant_total - COALESCE(payes.total_paye, 0) as montant_restant,
        MAX(ec.date_echeance) as date_derniere_echeance,
        COUNT(ec.id) FILTER (WHERE ec.statut != 'paye' AND ec.date_echeance < NOW()) as nb_echeances_retard,
        CASE 
          WHEN notes_bloquees.id IS NOT NULL THEN true 
          ELSE false 
        END as notes_bloquees
      FROM inscription i
      JOIN etudiant e ON e.id = i.etudiant_id
      JOIN parcours par ON par.id = i.parcours_id
      JOIN annee_academique aa ON aa.id = i.annee_academique_id
      JOIN grille_tarifaire gt ON gt.parcours_id = i.parcours_id AND gt.annee_academique_id = i.annee_academique_id
      LEFT JOIN echeancier ec ON ec.inscription_id = i.id
      LEFT JOIN (
        SELECT inscription_id, SUM(montant) as total_paye
        FROM paiement WHERE statut = 'valide' GROUP BY inscription_id
      ) payes ON payes.inscription_id = i.id
      LEFT JOIN (
        SELECT inscription_id, id FROM blocage_notes WHERE actif = true
      ) notes_bloquees ON notes_bloquees.inscription_id = i.id
      WHERE i.statut = 'validee'
        AND gt.montant_total > COALESCE(payes.total_paye, 0)
        AND ec.date_echeance < NOW() - INTERVAL '${jours} days'
      GROUP BY i.id, e.id, e.nom, e.prenom, e.email, e.telephone, 
               par.nom, aa.libelle, gt.montant_total, payes.total_paye, notes_bloquees.id
      ORDER BY montant_restant DESC
    `);
  }

  async createRelance(data: any): Promise<any> {
    const relance = await this.dataSource.query(`
      INSERT INTO relance_impaye (
        inscription_id, type_relance, niveau_relance, message, 
        date_relance, statut, created_at
      ) VALUES ($1, $2, $3, $4, NOW(), 'preparation', NOW())
      RETURNING *
    `, [data.inscriptionId, data.typeRelance || 'email', data.niveau || 1, data.message]);

    return relance[0];
  }

  async envoyerRelance(id: string): Promise<any> {
    const relance = await this.dataSource.query(`
      SELECT r.*, e.email, e.telephone, e.nom, e.prenom
      FROM relance_impaye r
      JOIN inscription i ON i.id = r.inscription_id
      JOIN etudiant e ON e.id = i.etudiant_id
      WHERE r.id = $1
    `, [id]);

    if (!relance.length) throw new NotFoundException('Relance non trouvée');

    // Simuler l'envoi (intégrer service email/SMS ici)
    await this.dataSource.query(`
      UPDATE relance_impaye 
      SET statut = 'envoye', date_envoi = NOW()
      WHERE id = $1
    `, [id]);

    return { ...relance[0], statut: 'envoye', message: 'Relance envoyée avec succès' };
  }

  async bloquerNotes(inscriptionId: string): Promise<any> {
    await this.dataSource.query(`
      INSERT INTO blocage_notes (inscription_id, motif, date_blocage, actif)
      VALUES ($1, 'impayes', NOW(), true)
      ON CONFLICT (inscription_id) DO UPDATE SET actif = true, date_blocage = NOW()
    `, [inscriptionId]);

    return { message: 'Notes bloquées pour impayés' };
  }

  async debloquerNotes(inscriptionId: string): Promise<any> {
    await this.dataSource.query(`
      UPDATE blocage_notes 
      SET actif = false, date_deblocage = NOW()
      WHERE inscription_id = $1
    `, [inscriptionId]);

    return { message: 'Notes débloquées' };
  }

  private async verifierEtDebloquerNotes(inscriptionId: string): Promise<void> {
    // Vérifier si l'étudiant est maintenant à jour de paiement
    const solde = await this.dataSource.query(`
      SELECT gt.montant_total - COALESCE(SUM(p.montant), 0) as solde
      FROM inscription i
      JOIN grille_tarifaire gt ON gt.parcours_id = i.parcours_id AND gt.annee_academique_id = i.annee_academique_id
      LEFT JOIN paiement p ON p.inscription_id = i.id AND p.statut = 'valide'
      WHERE i.id = $1
      GROUP BY gt.montant_total
    `, [inscriptionId]);

    if (solde.length && parseFloat(solde[0].solde) <= 0) {
      // Solde nul ou négatif = à jour, débloquer les notes
      await this.debloquerNotes(inscriptionId);
    }
  }

  // ========== CLOTURE DE CAISSE ==========
  async getClotureJournaliere(date?: string): Promise<any> {
    const dateCible = date || new Date().toISOString().split('T')[0];

    const [totaux, details] = await Promise.all([
      this.dataSource.query(`
        SELECT 
          COALESCE(SUM(montant), 0) as total_encaisse,
          COUNT(*) as nb_transactions,
          COALESCE(SUM(montant) FILTER (WHERE mode_paiement = 'especes'), 0) as especes,
          COALESCE(SUM(montant) FILTER (WHERE mode_paiement = 'cheque'), 0) as cheques,
          COALESCE(SUM(montant) FILTER (WHERE mode_paiement = 'virement'), 0) as virements,
          COALESCE(SUM(montant) FILTER (WHERE mode_paiement = 'carte'), 0) as cartes
        FROM paiement
        WHERE DATE(date_paiement) = $1 AND statut = 'valide'
      `, [dateCible]),
      this.dataSource.query(`
        SELECT 
          mode_paiement,
          COUNT(*) as nb,
          SUM(montant) as total
        FROM paiement
        WHERE DATE(date_paiement) = $1 AND statut = 'valide'
        GROUP BY mode_paiement
      `, [dateCible]),
    ]);

    return {
      date: dateCible,
      totaux: totaux[0],
      details: details,
    };
  }

  async validerCloture(date: string, validePar: string): Promise<any> {
    const cloture = await this.dataSource.query(`
      INSERT INTO cloture_caisse (date_cloture, valide_par, date_validation, statut)
      VALUES ($1, $2, NOW(), 'valide')
      ON CONFLICT (date_cloture) DO UPDATE SET valide_par = $2, date_validation = NOW(), statut = 'valide'
      RETURNING *
    `, [date, validePar]);

    return cloture[0];
  }

  async getRapprochementBancaire(date?: string): Promise<any> {
    const dateCible = date || new Date().toISOString().split('T')[0];

    const virements = await this.dataSource.query(`
      SELECT 
        reference,
        montant,
        date_paiement,
        statut
      FROM paiement
      WHERE mode_paiement = 'virement'
        AND DATE(date_paiement) = $1
      ORDER BY date_paiement
    `, [dateCible]);

    return {
      date: dateCible,
      virementsAttendus: virements.filter((v: any) => v.statut === 'en_attente'),
      virementsRecus: virements.filter((v: any) => v.statut === 'valide'),
      totalVirements: virements.reduce((acc: number, v: any) => acc + parseFloat(v.montant), 0),
    };
  }

  // ========== STATISTIQUES ==========
  async getStatsJournalieres(date?: string): Promise<any> {
    const dateCible = date || new Date().toISOString().split('T')[0];
    return this.getClotureJournaliere(dateCible);
  }

  async getStatsMensuelles(mois: number, annee: number): Promise<any> {
    const [totaux, parMode, nouveauxPayeurs] = await Promise.all([
      this.dataSource.query(`
        SELECT 
          COALESCE(SUM(montant), 0) as total_encaisse,
          COUNT(*) as nb_transactions,
          COUNT(DISTINCT inscription_id) as nb_etudiants
        FROM paiement
        WHERE EXTRACT(MONTH FROM date_paiement) = $1 
          AND EXTRACT(YEAR FROM date_paiement) = $2
          AND statut = 'valide'
      `, [mois, annee]),
      this.dataSource.query(`
        SELECT 
          mode_paiement,
          COUNT(*) as nb,
          SUM(montant) as total
        FROM paiement
        WHERE EXTRACT(MONTH FROM date_paiement) = $1 
          AND EXTRACT(YEAR FROM date_paiement) = $2
          AND statut = 'valide'
        GROUP BY mode_paiement
      `, [mois, annee]),
      this.dataSource.query(`
        SELECT COUNT(DISTINCT inscription_id) as nb
        FROM paiement
        WHERE EXTRACT(MONTH FROM date_paiement) = $1 
          AND EXTRACT(YEAR FROM date_paiement) = $2
          AND statut = 'valide'
          AND created_at >= DATE_TRUNC('month', MAKE_DATE($2, $1, 1))
      `, [mois, annee]),
    ]);

    return {
      periode: `${mois}/${annee}`,
      totaux: totaux[0],
      repartitionParMode: parMode,
      nouveauxPayeurs: nouveauxPayeurs[0]?.nb || 0,
    };
  }

  // ========== UTILITAIRES ==========
  private async genererNumeroRecu(): Promise<string> {
    const date = new Date();
    const annee = date.getFullYear();
    const mois = String(date.getMonth() + 1).padStart(2, '0');
    const jour = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `REC-${annee}${mois}${jour}-${random}`;
  }
}
