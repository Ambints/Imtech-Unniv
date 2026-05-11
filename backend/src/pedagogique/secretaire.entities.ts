import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Gestion des absences des enseignants
 */
@Entity('absence_enseignant')
export class AbsenceEnseignant {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'enseignant_id' })
  enseignantId: string;

  @Column({ name: 'seance_id', nullable: true })
  seanceId: string;

  @Column({ name: 'date_absence', type: 'date' })
  dateAbsence: Date;

  @Column({ name: 'heure_debut', type: 'time', nullable: true })
  heureDebut: string;

  @Column({ name: 'heure_fin', type: 'time', nullable: true })
  heureFin: string;

  @Column()
  motif: string; // maladie, formation, congres, personnel, autre

  @Column({ type: 'text', nullable: true })
  justification: string;

  @Column({ name: 'justificatif_url', nullable: true })
  justificatifUrl: string;

  @Column({ name: 'est_justifiee', default: false })
  estJustifiee: boolean;

  @Column({ default: 'declaree' })
  statut: string; // declaree, validee, refusee

  @Column({ name: 'declaree_par' })
  declareePar: string;

  @Column({ name: 'validee_par', nullable: true })
  valideePar: string;

  @Column({ name: 'date_validation', nullable: true })
  dateValidation: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

/**
 * Séances de rattrapage pour remplacer les cours manqués
 */
@Entity('rattrapage')
export class Rattrapage {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'absence_id' })
  absenceId: string;

  @Column({ name: 'affectation_id' })
  affectationId: string;

  @Column({ name: 'salle_id', nullable: true })
  salleId: string;

  @Column({ name: 'date_rattrapage', type: 'date' })
  dateRattrapage: Date;

  @Column({ name: 'heure_debut', type: 'time' })
  heureDebut: string;

  @Column({ name: 'heure_fin', type: 'time' })
  heureFin: string;

  @Column({ type: 'text', nullable: true })
  observations: string;

  @Column({ default: 'planifie' })
  statut: string; // planifie, effectue, annule

  @Column({ name: 'remplaceur_id', nullable: true })
  remplaceurId: string; // Enseignant remplaçant si différent

  @Column({ name: 'planifie_par' })
  planifiePar: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

/**
 * Convocations aux examens et réunions
 */
@Entity('convocation')
export class Convocation {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'etudiant_id', nullable: true })
  etudiantId: string;

  @Column({ name: 'session_examen_id', nullable: true })
  sessionExamenId: string;

  @Column({ name: 'soutenance_id', nullable: true })
  soutenanceId: string;

  @Column()
  type: string; // examen, rattrapage, soutenance, reunion, conseil_discipline

  @Column()
  libelle: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ name: 'date_convocation', type: 'date' })
  dateConvocation: Date;

  @Column({ name: 'heure_convocation', type: 'time', nullable: true })
  heureConvocation: string;

  @Column({ name: 'lieu', nullable: true })
  lieu: string;

  @Column({ name: 'salle_id', nullable: true })
  salleId: string;

  @Column({ default: 'brouillon' })
  statut: string; // brouillon, envoyee, lue, confirme, annule

  @Column({ name: 'date_envoi', nullable: true })
  dateEnvoi: Date;

  @Column({ name: 'date_lecture', nullable: true })
  dateLecture: Date;

  @Column({ name: 'date_confirmation', nullable: true })
  dateConfirmation: Date;

  @Column({ name: 'genere_par' })
  generePar: string;

  @Column({ name: 'fichier_url', nullable: true })
  fichierUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

/**
 * Notes dérogatoires saisies par le secrétaire
 * Flag spécial pour la scolarité centrale
 */
@Entity('note_derogatoire')
export class NoteDerogatoire {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'etudiant_id' })
  etudiantId: string;

  @Column({ name: 'ec_id', nullable: true })
  ecId: string;

  @Column({ name: 'ue_id', nullable: true })
  ueId: string;

  @Column({ name: 'session_examen_id', nullable: true })
  sessionExamenId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  valeur: number;

  @Column({ type: 'text' })
  motifDerogation: string;

  @Column({ default: 'cas_particulier' })
  typeDerogation: string; // cas_particulier, erreur_saisie, rattrapage_administratif, autre

  @Column({ default: true })
  estDerogatoire: boolean; // Flag spécifique pour la scolarité centrale

  @Column({ name: 'soumis_a_scolarite', default: false })
  soumisAScolarite: boolean;

  @Column({ name: 'valide_par_scolarite', nullable: true })
  valideParScolarite: string;

  @Column({ name: 'date_validation_scolarite', nullable: true })
  dateValidationScolarite: Date;

  @Column({ default: 'proposee' })
  statut: string; // proposee, soumise, validee, refusee

  @Column({ name: 'saisie_par' })
  saisiePar: string;

  @Column({ name: 'valide_par', nullable: true })
  validePar: string;

  @Column({ name: 'date_saisie', default: () => 'NOW()' })
  dateSaisie: Date;

  @Column({ type: 'text', nullable: true })
  observations: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

/**
 * Dossier étudiant - Documents administratifs archivés
 */
@Entity('dossier_etudiant')
export class DossierEtudiant {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'etudiant_id' })
  etudiantId: string;

  @Column()
  typeDocument: string; // certificat_scolarite, attestation_inscription, releve_notes, copie_diplome, etc.

  @Column()
  libelle: string;

  @Column({ name: 'fichier_url' })
  fichierUrl: string;

  @Column({ nullable: true })
  reference: string;

  @Column({ name: 'date_demande', nullable: true })
  dateDemande: Date;

  @Column({ name: 'date_delivrance', nullable: true })
  dateDelivrance: Date;

  @Column({ default: 'en_attente' })
  statut: string; // en_attente, en_preparation, delivre, refuse, archive

  @Column({ type: 'text', nullable: true })
  motifRefus: string;

  @Column({ name: 'demande_par', nullable: true })
  demandePar: string;

  @Column({ name: 'traite_par', nullable: true })
  traitePar: string;

  @Column({ name: 'est_archive', default: false })
  estArchive: boolean;

  @Column({ name: 'date_archivage', nullable: true })
  dateArchivage: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

/**
 * Suivi des demandes étudiantes (certificats, reports, etc.)
 */
@Entity('demande_etudiant')
export class DemandeEtudiant {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'etudiant_id' })
  etudiantId: string;

  @Column()
  typeDemande: string; // certificat_scolarite, attestation, report_examen, dispense, changement_parcours

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  justification: string;

  @Column({ name: 'piece_jointe_url', nullable: true })
  pieceJointeUrl: string;

  @Column({ name: 'date_soumission' })
  dateSoumission: Date;

  @Column({ default: 'soumise' })
  statut: string; // soumise, en_traitement, acceptee, refusee, completee

  @Column({ type: 'text', nullable: true })
  reponse: string;

  @Column({ name: 'traite_par', nullable: true })
  traitePar: string;

  @Column({ name: 'date_traitement', nullable: true })
  dateTraitement: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// Made with Bob
