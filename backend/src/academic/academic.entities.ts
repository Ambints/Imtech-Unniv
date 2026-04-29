import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('parcours')
export class Parcours {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'departement_id' }) departementId: string;
  @Column() code: string;
  @Column() nom: string;
  @Column() niveau: string;
  @Column({ name: 'duree_annees', default: 3 }) dureeAnnees: number;
  @Column({ name: 'responsable_id', nullable: true }) responsableId: string;
  @Column({ nullable: true }) description: string;
  @Column({ default: true, name: 'actif' }) actif: boolean;
  @Column({ name: 'annee_ouverture', nullable: true }) anneeOuverture: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('unite_enseignement')
export class UniteEnseignement {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'parcours_id' }) parcoursId: string;
  @Column() code: string;
  @Column() intitule: string;
  @Column({ name: 'credits_ects', default: 3 }) creditsEcts: number;
  @Column({ type: 'decimal', precision: 4, scale: 2, default: 1.0 }) coefficient: number;
  @Column({ name: 'volume_cm', default: 0 }) volumeCm: number;
  @Column({ name: 'volume_td', default: 0 }) volumeTd: number;
  @Column({ name: 'volume_tp', default: 0 }) volumeTp: number;
  @Column() semestre: number;
  @Column({ name: 'annee_niveau' }) anneeNiveau: number;
  @Column({ name: 'type_ue', default: 'obligatoire' }) typeUe: string;
  @Column({ default: true, name: 'actif' }) actif: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('element_constitutif')
export class ElementConstitutif {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'ue_id' }) ueId: string;
  @Column() code: string;
  @Column() intitule: string;
  @Column({ type: 'decimal', precision: 4, scale: 2, default: 1.0 }) coefficient: number;
  @Column({ default: true, name: 'actif' }) actif: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('departement')
export class Departement {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() code: string;
  @Column() nom: string;
  @Column({ nullable: true }) description: string;
  @Column({ name: 'responsable_id', nullable: true }) responsableId: string;
  @Column({ default: true, name: 'actif' }) actif: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('annee_academique')
export class AnneeAcademique {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() libelle: string;
  @Column({ name: 'date_debut' }) dateDebut: Date;
  @Column({ name: 'date_fin' }) dateFin: Date;
  @Column({ default: false, name: 'active' }) active: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('calendrier_academique')
export class CalendrierAcademique {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'annee_academique_id' }) anneeAcademiqueId: string;
  @Column() evenement: string;
  @Column({ name: 'type_evenement' }) typeEvenement: string;
  @Column({ name: 'date_debut' }) dateDebut: Date;
  @Column({ name: 'date_fin' }) dateFin: Date;
  @Column({ name: 'parcours_id', nullable: true }) parcoursId: string;
  @Column({ nullable: true }) description: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('etudiant')
export class Etudiant {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'utilisateur_id', unique: true, nullable: true }) utilisateurId: string;
  @Column() matricule: string;
  @Column() nom: string;
  @Column() prenom: string;
  @Column({ name: 'date_naissance' }) dateNaissance: Date;
  @Column({ name: 'lieu_naissance', nullable: true }) lieuNaissance: string;
  @Column({ nullable: true }) sexe: string;
  @Column({ default: 'Malagasy' }) nationalite: string;
  @Column({ nullable: true }) adresse: string;
  @Column({ nullable: true }) telephone: string;
  @Column({ nullable: true }) email: string;
  @Column({ name: 'nom_parent', nullable: true }) nomParent: string;
  @Column({ name: 'telephone_parent', nullable: true }) telephoneParent: string;
  @Column({ name: 'email_parent', nullable: true }) emailParent: string;
  @Column({ nullable: true }) religion: string;
  @Column({ name: 'situation_familiale', nullable: true }) situationFamiliale: string;
  @Column({ name: 'photo_url', nullable: true }) photoUrl: string;
  @Column({ name: 'dossier_medical_url', nullable: true }) dossierMedicalUrl: string;
  @Column({ default: true, name: 'actif' }) actif: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('inscription')
export class Inscription {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'etudiant_id' }) etudiantId: string;
  @Column({ name: 'parcours_id' }) parcoursId: string;
  @Column({ name: 'annee_academique_id' }) anneeAcademiqueId: string;
  @Column({ name: 'annee_niveau' }) anneeNiveau: number;
  @Column({ name: 'type_inscription', default: 'premiere' }) typeInscription: string;
  @Column({ default: 'en_attente' }) statut: string;
  @Column({ name: 'numero_carte', unique: true, nullable: true }) numeroCarte: string;
  @Column({ name: 'date_inscription', default: () => 'CURRENT_DATE' }) dateInscription: Date;
  @Column({ default: false }) bourse: boolean;
  @Column({ name: 'type_bourse', nullable: true }) typeBourse: string;
  @Column({ name: 'montant_bourse', nullable: true, type: 'decimal', precision: 10, scale: 2 }) montantBourse: number;
  @Column({ nullable: true }) observations: string;
  @Column({ name: 'validee_par', nullable: true }) valideePar: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('enseignant')
export class Enseignant {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'utilisateur_id', unique: true, nullable: true }) utilisateurId: string;
  @Column() matricule: string;
  @Column() nom: string;
  @Column() prenom: string;
  @Column({ nullable: true }) titre: string;
  @Column({ nullable: true }) grade: string;
  @Column({ nullable: true }) specialite: string;
  @Column({ name: 'type_contrat', default: 'permanent' }) typeContrat: string;
  @Column({ name: 'departement_id', nullable: true }) departementId: string;
  @Column({ nullable: true }) email: string;
  @Column({ nullable: true }) telephone: string;
  @Column({ default: true, name: 'actif' }) actif: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('affectation_cours')
export class AffectationCours {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'enseignant_id' }) enseignantId: string;
  @Column({ name: 'ue_id', nullable: true }) ueId: string;
  @Column({ name: 'ec_id', nullable: true }) ecId: string;
  @Column({ name: 'annee_academique_id' }) anneeAcademiqueId: string;
  @Column({ name: 'type_seance', default: 'CM' }) typeSeance: string;
  @Column({ name: 'volume_prevu', default: 0 }) volumePrevu: number;
  @Column({ name: 'volume_realise', default: 0 }) volumeRealise: number;
  @Column({ name: 'valide_par', nullable: true }) validePar: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('salle')
export class Salle {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'batiment_id', nullable: true }) batimentId: string;
  @Column() nom: string;
  @Column({ unique: true, nullable: true }) code: string;
  @Column() capacite: number;
  @Column({ name: 'type_salle', default: 'cours' }) typeSalle: string;
  @Column({ type: 'jsonb', default: {} }) equipements: any;
  @Column({ default: true, name: 'disponible' }) disponible: boolean;
  @Column({ default: 0 }) etage: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('batiment')
export class Batiment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() nom: string;
  @Column({ unique: true, nullable: true }) code: string;
  @Column({ nullable: true }) adresse: string;
  @Column({ default: true, name: 'actif' }) actif: boolean;
}

@Entity('emploi_du_temps')
export class EmploiDuTemps {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'annee_academique_id' }) anneeAcademiqueId: string;
  @Column({ name: 'affectation_id' }) affectationId: string;
  @Column({ name: 'salle_id', nullable: true }) salleId: string;
  @Column({ name: 'date_seance' }) dateSeance: Date;
  @Column({ name: 'heure_debut', type: 'time' }) heureDebut: string;
  @Column({ name: 'heure_fin', type: 'time' }) heureFin: string;
  @Column({ name: 'type_seance', default: 'CM' }) typeSeance: string;
  @Column({ default: 'planifie' }) statut: string;
  @Column({ name: 'motif_annulation', nullable: true }) motifAnnulation: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('presence')
export class Presence {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'etudiant_id' }) etudiantId: string;
  @Column({ name: 'seance_id' }) seanceId: string;
  @Column({ default: 'absent' }) statut: string;
  @Column({ name: 'heure_arrivee', nullable: true, type: 'time' }) heureArrivee: string;
  @Column({ default: false }) justifie: boolean;
  @Column({ name: 'justificatif_url', nullable: true }) justificatifUrl: string;
  @Column({ nullable: true }) motif: string;
  @Column({ name: 'mode_pointage', default: 'manuel' }) modePointage: string;
  @Column({ name: 'saisi_par', nullable: true }) saisiPar: string;
  @Column({ name: 'valide_par', nullable: true }) validePar: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('session_examen')
export class SessionExamen {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'annee_academique_id' }) anneeAcademiqueId: string;
  @Column() libelle: string;
  @Column({ name: 'type_session', default: 'normale' }) typeSession: string;
  @Column() semestre: number;
  @Column({ name: 'date_debut', nullable: true }) dateDebut: Date;
  @Column({ name: 'date_fin', nullable: true }) dateFin: Date;
  @Column({ default: 'planifie' }) statut: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('note')
export class Note {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'etudiant_id' }) etudiantId: string;
  @Column({ name: 'ec_id', nullable: true }) ecId: string;
  @Column({ name: 'ue_id', nullable: true }) ueId: string;
  @Column({ name: 'session_id' }) sessionId: string;
  @Column({ type: 'decimal', precision: 5, scale: 2 }) valeur: number;
  @Column({ name: 'type_evaluation', default: 'examen_final' }) typeEvaluation: string;
  @Column({ name: 'absence_justifiee', default: false }) absenceJustifiee: boolean;
  @Column({ nullable: true }) mention: string;
  @Column({ default: false }) verrouille: boolean;
  @Column({ name: 'hash_integrite', nullable: true }) hashIntegrite: string;
  @Column({ name: 'saisi_par' }) saisiPar: string;
  @Column({ name: 'valide_par', nullable: true }) validePar: string;
  @Column({ name: 'date_saisie', default: () => 'NOW()' }) dateSaisie: Date;
  @Column({ name: 'date_verrouillage', nullable: true }) dateVerrouillage: Date;
  @Column({ nullable: true }) observations: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}