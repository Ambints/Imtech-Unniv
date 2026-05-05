import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PortailParentService {
  private readonly logger = new Logger(PortailParentService.name);

  constructor(@InjectDataSource() private dataSource: DataSource) {}

  private async verifierLienParentEnfant(parentUserId: string, etudiantId: string): Promise<void> {
    const parent = await this.dataSource.query(`
      SELECT email FROM utilisateur WHERE id = $1
    `, [parentUserId]);

    const lien = await this.dataSource.query(`
      SELECT 1 FROM etudiant e
      WHERE e.id = $1 AND (
        e.email_parent = $2 
        OR e.email_parent LIKE $3
      )
    `, [etudiantId, parent[0]?.email, `%${parent[0]?.email}%`]);

    if (!lien.length) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à consulter ces informations');
    }
  }

  async getEnfants(parentUserId: string): Promise<any> {
    const parent = await this.dataSource.query(`
      SELECT email, telephone FROM utilisateur WHERE id = $1
    `, [parentUserId]);

    if (!parent.length) {
      throw new NotFoundException('Parent non trouvé');
    }

    return this.dataSource.query(`
      SELECT 
        e.id,
        e.nom,
        e.prenom,
        e.matricule,
        e.photo_url,
        p.nom as parcours,
        p.code as parcours_code,
        aa.libelle as annee_academique,
        i.annee_niveau
      FROM etudiant e
      LEFT JOIN inscription i ON i.etudiant_id = e.id AND i.statut = 'validee'
      LEFT JOIN parcours p ON p.id = i.parcours_id
      LEFT JOIN annee_academique aa ON aa.id = i.annee_academique_id
      WHERE e.email_parent = $1 OR e.telephone_parent = $2
         OR e.nom_parent ILIKE $3
      ORDER BY e.nom, e.prenom
    `, [parent[0].email, parent[0].telephone, `%${parent[0].email.split('@')[0]}%`]);
  }

  async getBulletin(parentUserId: string, etudiantId: string, sessionId?: string): Promise<any> {
    await this.verifierLienParentEnfant(parentUserId, etudiantId);

    let sessionFilter = '';
    if (sessionId) {
      sessionFilter = `AND n.session_id = '${sessionId}'`;
    }

    const notes = await this.dataSource.query(`
      SELECT 
        n.*,
        ec.intitule as ec_nom,
        ec.code as ec_code,
        ue.intitule as ue_nom,
        ue.code as ue_code,
        ue.credits_ects,
        se.libelle as session_libelle,
        se.type_session
      FROM note n
      JOIN element_constitutif ec ON ec.id = n.ec_id
      JOIN unite_enseignement ue ON ue.id = ec.ue_id
      JOIN session_examen se ON se.id = n.session_id
      WHERE n.etudiant_id = $1 ${sessionFilter}
      ORDER BY se.date_debut DESC, ue.code, ec.code
    `, [etudiantId]);

    // Calcul des moyennes
    const moyennesUE = await this.dataSource.query(`
      SELECT 
        ue.id,
        ue.code,
        ue.intitule,
        ROUND(AVG(n.valeur), 2) as moyenne,
        COUNT(n.id) as nb_notes
      FROM note n
      JOIN element_constitutif ec ON ec.id = n.ec_id
      JOIN unite_enseignement ue ON ue.id = ec.ue_id
      WHERE n.etudiant_id = $1 ${sessionFilter}
      GROUP BY ue.id, ue.code, ue.intitule
    `, [etudiantId]);

    return { notes, moyennesUE };
  }

  async getAbsences(parentUserId: string, etudiantId: string): Promise<any> {
    await this.verifierLienParentEnfant(parentUserId, etudiantId);

    const [absences, stats] = await Promise.all([
      this.dataSource.query(`
        SELECT 
          pr.*,
          edt.date_seance,
          edt.heure_debut,
          edt.heure_fin,
          ec.intitule as cours_nom,
          pr.justifie
        FROM presence pr
        JOIN emploi_du_temps edt ON edt.id = pr.seance_id
        JOIN affectation_cours ac ON ac.id = edt.affectation_id
        JOIN element_constitutif ec ON ec.id = ac.ec_id
        WHERE pr.etudiant_id = $1
          AND pr.statut IN ('absent', 'retard')
        ORDER BY edt.date_seance DESC
        LIMIT 30
      `, [etudiantId]),
      this.dataSource.query(`
        SELECT 
          COUNT(*) FILTER (WHERE statut = 'absent' AND justifie = false) as absences_injustifiees,
          COUNT(*) FILTER (WHERE statut = 'retard') as retards,
          COUNT(*) FILTER (WHERE statut = 'absent' AND justifie = true) as absences_justifiees
        FROM presence
        WHERE etudiant_id = $1
      `, [etudiantId]),
    ]);

    return { absences, stats: stats[0] };
  }

  async getPaiements(parentUserId: string, etudiantId: string): Promise<any> {
    await this.verifierLienParentEnfant(parentUserId, etudiantId);

    return this.dataSource.query(`
      SELECT 
        p.*,
        e.num_tranche,
        e.date_echeance
      FROM paiement p
      JOIN inscription i ON i.id = p.inscription_id
      LEFT JOIN echeancier e ON e.id = p.echeancier_id
      WHERE i.etudiant_id = $1
      ORDER BY p.date_paiement DESC
    `, [etudiantId]);
  }

  async getSolde(parentUserId: string, etudiantId: string): Promise<any> {
    await this.verifierLienParentEnfant(parentUserId, etudiantId);

    const result = await this.dataSource.query(`
      SELECT 
        g.montant_total as montant_du,
        COALESCE(SUM(p.montant) FILTER (WHERE p.statut = 'valide'), 0) as montant_paye,
        g.montant_total - COALESCE(SUM(p.montant) FILTER (WHERE p.statut = 'valide'), 0) as solde,
        g.nb_tranches,
        i.bourse,
        i.type_bourse
      FROM inscription i
      JOIN grille_tarifaire g ON g.parcours_id = i.parcours_id 
        AND g.annee_academique_id = i.annee_academique_id
      LEFT JOIN paiement p ON p.inscription_id = i.id
      WHERE i.etudiant_id = $1 AND i.statut = 'validee'
      GROUP BY g.montant_total, g.nb_tranches, i.bourse, i.type_bourse
    `, [etudiantId]);

    return result[0] || { montant_du: 0, montant_paye: 0, solde: 0 };
  }

  async getEmploiDuTemps(
    parentUserId: string, 
    etudiantId: string, 
    dateDebut?: string, 
    dateFin?: string
  ): Promise<any> {
    await this.verifierLienParentEnfant(parentUserId, etudiantId);

    const etudiant = await this.dataSource.query(`
      SELECT i.annee_academique_id 
      FROM etudiant e
      JOIN inscription i ON i.etudiant_id = e.id AND i.statut = 'validee'
      WHERE e.id = $1
      ORDER BY i.date_inscription DESC
      LIMIT 1
    `, [etudiantId]);

    if (!etudiant.length) {
      throw new NotFoundException('Inscription non trouvée');
    }

    let dateFilter = '';
    if (dateDebut && dateFin) {
      dateFilter = `AND edt.date_seance BETWEEN '${dateDebut}' AND '${dateFin}'`;
    }

    return this.dataSource.query(`
      SELECT 
        edt.*,
        s.nom as salle_nom,
        ec.intitule as cours_nom,
        ens.nom as prof_nom
      FROM emploi_du_temps edt
      JOIN affectation_cours ac ON ac.id = edt.affectation_id
      JOIN element_constitutif ec ON ec.id = ac.ec_id
      JOIN enseignant ens ON ens.id = ac.enseignant_id
      LEFT JOIN salle s ON s.id = edt.salle_id
      WHERE ac.annee_academique_id = $1
        AND edt.statut = 'planifie'
        ${dateFilter}
      ORDER BY edt.date_seance, edt.heure_debut
    `, [etudiant[0].annee_academique_id]);
  }

  async autoriserSortie(parentUserId: string, dto: any): Promise<any> {
    await this.verifierLienParentEnfant(parentUserId, dto.etudiantId);

    await this.dataSource.query(`
      INSERT INTO autorisation_parent (
        etudiant_id, 
        parent_user_id, 
        type_autorisation, 
        date_sortie, 
        heure_sortie,
        motif,
        valide_jusqu
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      dto.etudiantId,
      parentUserId,
      dto.type || 'sortie_antipee',
      dto.dateSortie,
      dto.heureSortie,
      dto.motif,
      dto.valideJusqu,
    ]);

    return { message: 'Autorisation enregistrée' };
  }

  async justifierAbsenceParent(parentUserId: string, dto: any): Promise<any> {
    await this.verifierLienParentEnfant(parentUserId, dto.etudiantId);

    await this.dataSource.query(`
      UPDATE presence
      SET justifie = true,
          justificatif_parent_url = $1,
          motif = $2,
          justifie_par_parent = true,
          date_justification_parent = NOW()
      WHERE etudiant_id = $3 AND id = $4
    `, [dto.justificatifUrl, dto.motif, dto.etudiantId, dto.presenceId]);

    return { message: 'Absence justifiée par le parent' };
  }

  async getNotifications(parentUserId: string): Promise<any> {
    const parent = await this.dataSource.query(`
      SELECT email, telephone FROM utilisateur WHERE id = $1
    `, [parentUserId]);

    return this.dataSource.query(`
      SELECT * FROM notification
      WHERE destinataire_type = 'parent'
        AND (
          destinataire_contact = $1 
          OR destinataire_contact = $2
          OR created_at > NOW() - INTERVAL '30 days'
        )
      ORDER BY created_at DESC
      LIMIT 20
    `, [parent[0].email, parent[0].telephone]);
  }
}
