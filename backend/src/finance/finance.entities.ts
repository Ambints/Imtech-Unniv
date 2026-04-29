import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('grille_tarifaire')
export class GrilleTarifaire {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'parcours_id' }) parcoursId: string;
  @Column({ name: 'annee_academique_id' }) anneeAcademiqueId: string;
  @Column({ name: 'annee_niveau', nullable: true }) anneeNiveau: number;
  @Column({ name: 'montant_total', type: 'decimal', precision: 12, scale: 2 }) montantTotal: number;
  @Column({ name: 'nb_tranches', default: 1 }) nbTranches: number;
  @Column({ nullable: true }) description: string;
  @Column({ default: true, name: 'actif' }) actif: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('echeancier')
export class Echeancier {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'inscription_id' }) inscriptionId: string;
  @Column({ name: 'num_tranche' }) numTranche: number;
  @Column({ name: 'montant_du', type: 'decimal', precision: 12, scale: 2 }) montantDu: number;
  @Column({ name: 'date_echeance' }) dateEcheance: Date;
  @Column({ default: 'en_attente' }) statut: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('paiement')
export class Paiement {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'inscription_id' }) inscriptionId: string;
  @Column({ name: 'echeancier_id', nullable: true }) echeancierId: string;
  @Column({ type: 'decimal', precision: 12, scale: 2 }) montant: number;
  @Column({ name: 'mode_paiement' }) modePaiement: string;
  @Column({ name: 'date_paiement', default: () => 'NOW()' }) datePaiement: Date;
  @Column({ unique: true, nullable: true }) reference: string;
  @Column({ name: 'numero_recu', unique: true }) numeroRecu: string;
  @Column({ name: 'recu_url', nullable: true }) recuUrl: string;
  @Column({ name: 'caissier_id' }) caissierId: string;
  @Column({ default: 'valide' }) statut: string;
  @Column({ name: 'motif_annulation', nullable: true }) motifAnnulation: string;
  @Column({ nullable: true }) observations: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('budget')
export class Budget {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'annee_academique_id' }) anneeAcademiqueId: string;
  @Column({ name: 'departement_id', nullable: true }) departementId: string;
  @Column() categorie: string;
  @Column({ name: 'montant_prevu', type: 'decimal', precision: 15, scale: 2 }) montantPrevu: number;
  @Column({ name: 'montant_realise', type: 'decimal', precision: 15, scale: 2, default: 0 }) montantRealise: number;
  @Column({ nullable: true }) description: string;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('depense')
export class Depense {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'budget_id', nullable: true }) budgetId: string;
  @Column({ name: 'annee_academique_id' }) anneeAcademiqueId: string;
  @Column() libelle: string;
  @Column({ type: 'decimal', precision: 12, scale: 2 }) montant: number;
  @Column({ nullable: true }) categorie: string;
  @Column({ name: 'date_depense', default: () => 'CURRENT_DATE' }) dateDepense: Date;
  @Column({ nullable: true }) fournisseur: string;
  @Column({ name: 'numero_facture', nullable: true }) numeroFacture: string;
  @Column({ name: 'facture_url', nullable: true }) factureUrl: string;
  @Column({ default: 'en_attente' }) statut: string;
  @Column({ name: 'demande_par', nullable: true }) demandePar: string;
  @Column({ name: 'approuve_par', nullable: true }) approuvePar: string;
  @Column({ name: 'date_approbation', nullable: true }) dateApprobation: Date;
  @Column({ nullable: true }) observations: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('contrat_personnel')
export class ContratPersonnel {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'utilisateur_id' }) utilisateurId: string;
  @Column({ name: 'type_contrat' }) typeContrat: string;
  @Column() poste: string;
  @Column({ name: 'departement_id', nullable: true }) departementId: string;
  @Column({ name: 'date_debut' }) dateDebut: Date;
  @Column({ name: 'date_fin', nullable: true }) dateFin: Date;
  @Column({ name: 'salaire_brut', nullable: true, type: 'decimal', precision: 12, scale: 2 }) salaireBrut: number;
  @Column({ name: 'salaire_net', nullable: true, type: 'decimal', precision: 12, scale: 2 }) salaireNet: number;
  @Column({ name: 'volume_horaire_hebdo', nullable: true }) volumeHoraireHebdo: number;
  @Column({ default: true, name: 'actif' }) actif: boolean;
  @Column({ name: 'fichier_contrat_url', nullable: true }) fichierContratUrl: string;
  @Column({ nullable: true }) observations: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('conge_personnel')
export class CongePersonnel {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'utilisateur_id' }) utilisateurId: string;
  @Column({ name: 'type_conge' }) typeConge: string;
  @Column({ name: 'date_debut' }) dateDebut: Date;
  @Column({ name: 'date_fin' }) dateFin: Date;
  @Column({ nullable: true }) motif: string;
  @Column({ default: 'demande' }) statut: string;
  @Column({ name: 'approuve_par', nullable: true }) approuvePar: string;
  @Column({ name: 'date_approbation', nullable: true }) dateApprobation: Date;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('fiche_paie')
export class FichePaie {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'contrat_id' }) contratId: string;
  @Column() annee: number;
  @Column() mois: number;
  @Column({ name: 'salaire_brut', type: 'decimal', precision: 12, scale: 2 }) salaireBrut: number;
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 }) cotisations: number;
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 }) primes: number;
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 }) retenues: number;
  @Column({ name: 'net_a_payer', type: 'decimal', precision: 12, scale: 2 }) netAPayer: number;
  @Column({ name: 'heures_supp', type: 'decimal', precision: 6, scale: 2, default: 0 }) heuresSupp: number;
  @Column({ name: 'montant_heures_supp', type: 'decimal', precision: 12, scale: 2, default: 0 }) montantHeuresSupp: number;
  @Column({ default: 'brouillon' }) statut: string;
  @Column({ name: 'fichier_url', nullable: true }) fichierUrl: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}