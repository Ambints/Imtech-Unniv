import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// Référentiel de compétences
@Entity('referentiel_competences')
export class ReferentielCompetences {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'parcours_id' }) parcoursId: string;
  @Column() code: string;
  @Column() intitule: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ nullable: true }) niveau: string; // Licence, Master, etc.
  @Column({ type: 'jsonb', default: [] }) competences: any[]; // Liste des compétences
  @Column({ name: 'valide_par', nullable: true }) validePar: string;
  @Column({ name: 'date_validation', nullable: true }) dateValidation: Date;
  @Column({ default: 'brouillon' }) statut: string; // brouillon, valide, archive
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

// Validation des sujets d'examens
@Entity('sujet_examen')
export class SujetExamen {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'session_examen_id' }) sessionExamenId: string;
  @Column({ name: 'ue_id', nullable: true }) ueId: string;
  @Column({ name: 'ec_id', nullable: true }) ecId: string;
  @Column({ name: 'enseignant_id' }) enseignantId: string;
  @Column() titre: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ name: 'fichier_url', nullable: true }) fichierUrl: string;
  @Column({ name: 'duree_minutes', default: 120 }) dureeMinutes: number;
  @Column({ name: 'bareme_total', default: 20, type: 'decimal', precision: 5, scale: 2 }) baremeTotal: number;
  @Column({ default: 'soumis' }) statut: string; // soumis, en_relecture, valide, rejete
  @Column({ name: 'soumis_par' }) soumisPar: string;
  @Column({ name: 'date_soumission', default: () => 'NOW()' }) dateSoumission: Date;
  @Column({ name: 'relu_par', nullable: true }) reluPar: string;
  @Column({ name: 'date_relecture', nullable: true }) dateRelecture: Date;
  @Column({ name: 'valide_par', nullable: true }) validePar: string;
  @Column({ name: 'date_validation', nullable: true }) dateValidation: Date;
  @Column({ type: 'text', nullable: true }) commentaires: string;
  @Column({ type: 'text', nullable: true }) motif_rejet: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

// Procès-verbaux de délibération
@Entity('proces_verbal')
export class ProcesVerbal {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'session_examen_id' }) sessionExamenId: string;
  @Column({ name: 'parcours_id' }) parcoursId: string;
  @Column({ name: 'annee_academique_id' }) anneeAcademiqueId: string;
  @Column() numero: string;
  @Column({ name: 'date_deliberation' }) dateDeliberation: Date;
  @Column({ type: 'jsonb', default: [] }) membres_jury: any[]; // Liste des membres du jury
  @Column({ type: 'jsonb', default: [] }) resultats: any[]; // Résultats par étudiant
  @Column({ name: 'nb_admis', default: 0 }) nbAdmis: number;
  @Column({ name: 'nb_ajournes', default: 0 }) nbAjournes: number;
  @Column({ name: 'nb_absents', default: 0 }) nbAbsents: number;
  @Column({ name: 'taux_reussite', type: 'decimal', precision: 5, scale: 2, default: 0 }) tauxReussite: number;
  @Column({ type: 'text', nullable: true }) observations: string;
  @Column({ name: 'fichier_url', nullable: true }) fichierUrl: string;
  @Column({ default: 'brouillon' }) statut: string; // brouillon, valide, transmis_scolarite, archive
  @Column({ name: 'redige_par' }) redigePar: string;
  @Column({ name: 'valide_par', nullable: true }) validePar: string;
  @Column({ name: 'date_validation', nullable: true }) dateValidation: Date;
  // Champs pour transmission à la scolarité centrale (secrétaire par parcours)
  @Column({ name: 'transmis_a_scolarite', default: false }) transmisAScolarite: boolean;
  @Column({ name: 'date_transmission_scolarite', nullable: true }) dateTransmissionScolarite: Date;
  @Column({ name: 'transmis_par', nullable: true }) transmisPar: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

// Suivi des stages et mémoires
@Entity('stage_memoire')
export class StageMemoire {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'etudiant_id' }) etudiantId: string;
  @Column({ name: 'parcours_id' }) parcoursId: string;
  @Column({ name: 'annee_academique_id' }) anneeAcademiqueId: string;
  @Column() type: string; // stage, memoire, projet
  @Column() titre: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ name: 'entreprise_organisme', nullable: true }) entrepriseOrganisme: string;
  @Column({ name: 'maitre_stage', nullable: true }) maitreStage: string;
  @Column({ name: 'encadrant_id', nullable: true }) encadrantId: string; // Enseignant encadrant
  @Column({ name: 'date_debut', nullable: true }) dateDebut: Date;
  @Column({ name: 'date_fin', nullable: true }) dateFin: Date;
  @Column({ name: 'date_soutenance', nullable: true }) dateSoutenance: Date;
  @Column({ name: 'lieu_soutenance', nullable: true }) lieuSoutenance: string;
  @Column({ type: 'jsonb', default: [] }) jury: any[]; // Membres du jury
  @Column({ name: 'note_finale', nullable: true, type: 'decimal', precision: 5, scale: 2 }) noteFinale: number;
  @Column({ nullable: true }) mention: string;
  @Column({ name: 'rapport_url', nullable: true }) rapportUrl: string;
  @Column({ name: 'fiche_evaluation_url', nullable: true }) ficheEvaluationUrl: string;
  @Column({ default: 'en_cours' }) statut: string; // en_cours, termine, valide, abandonne
  @Column({ type: 'text', nullable: true }) observations: string;
  @Column({ name: 'valide_par', nullable: true }) validePar: string;
  @Column({ name: 'date_validation', nullable: true }) dateValidation: Date;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

// Statistiques et performances
@Entity('statistique_parcours')
export class StatistiqueParcours {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'parcours_id' }) parcoursId: string;
  @Column({ name: 'annee_academique_id' }) anneeAcademiqueId: string;
  @Column({ name: 'nb_inscrits', default: 0 }) nbInscrits: number;
  @Column({ name: 'nb_presents', default: 0 }) nbPresents: number;
  @Column({ name: 'taux_assiduite', type: 'decimal', precision: 5, scale: 2, default: 0 }) tauxAssiduite: number;
  @Column({ name: 'taux_reussite', type: 'decimal', precision: 5, scale: 2, default: 0 }) tauxReussite: number;
  @Column({ name: 'moyenne_generale', type: 'decimal', precision: 5, scale: 2, default: 0 }) moyenneGenerale: number;
  @Column({ name: 'nb_abandons', default: 0 }) nbAbandons: number;
  @Column({ name: 'nb_redoublants', default: 0 }) nbRedoublants: number;
  @Column({ type: 'jsonb', default: {} }) details_par_ue: any; // Statistiques détaillées par UE
  @Column({ name: 'date_calcul', default: () => 'NOW()' }) dateCalcul: Date;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

// Contenu de cours validé
@Entity('contenu_cours')
export class ContenuCours {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'ue_id', nullable: true }) ueId: string;
  @Column({ name: 'ec_id', nullable: true }) ecId: string;
  @Column({ name: 'enseignant_id' }) enseignantId: string;
  @Column() titre: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ type: 'text', nullable: true }) objectifs: string;
  @Column({ type: 'jsonb', default: [] }) plan_cours: any[]; // Plan détaillé du cours
  @Column({ type: 'jsonb', default: [] }) bibliographie: any[];
  @Column({ type: 'jsonb', default: [] }) ressources: any[]; // URLs, fichiers, etc.
  @Column({ name: 'fichier_syllabus_url', nullable: true }) fichierSyllabusUrl: string;
  @Column({ default: 'brouillon' }) statut: string; // brouillon, soumis, valide, rejete
  @Column({ name: 'soumis_par' }) soumisPar: string;
  @Column({ name: 'date_soumission', nullable: true }) dateSoumission: Date;
  @Column({ name: 'valide_par', nullable: true }) validePar: string;
  @Column({ name: 'date_validation', nullable: true }) dateValidation: Date;
  @Column({ type: 'text', nullable: true }) commentaires: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

// Organisation des soutenances
@Entity('soutenance')
export class Soutenance {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'stage_memoire_id' }) stageMemoireId: string;
  @Column({ name: 'etudiant_id' }) etudiantId: string;
  @Column({ name: 'date_soutenance' }) dateSoutenance: Date;
  @Column({ name: 'heure_debut', type: 'time' }) heureDebut: string;
  @Column({ name: 'heure_fin', type: 'time' }) heureFin: string;
  @Column({ name: 'salle_id', nullable: true }) salleId: string;
  @Column({ type: 'jsonb', default: [] }) jury: any[]; // président, rapporteur, examinateurs
  @Column({ name: 'president_jury_id', nullable: true }) presidentJuryId: string;
  @Column({ name: 'note_rapport', nullable: true, type: 'decimal', precision: 5, scale: 2 }) noteRapport: number;
  @Column({ name: 'note_soutenance', nullable: true, type: 'decimal', precision: 5, scale: 2 }) noteSoutenance: number;
  @Column({ name: 'note_finale', nullable: true, type: 'decimal', precision: 5, scale: 2 }) noteFinale: number;
  @Column({ nullable: true }) mention: string;
  @Column({ type: 'text', nullable: true }) observations: string;
  @Column({ name: 'pv_url', nullable: true }) pvUrl: string;
  @Column({ default: 'planifie' }) statut: string; // planifie, en_cours, termine, annule
  @Column({ name: 'organise_par' }) organisePar: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

// Made with Bob
