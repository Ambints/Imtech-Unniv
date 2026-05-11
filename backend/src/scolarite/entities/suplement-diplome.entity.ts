import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Diplome } from './diplome.entity';
import { Utilisateur } from './utilisateur.entity';

@Entity('suplement_diplome')
export class SuplementDiplome {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Diplome, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'diplome_id' })
  diplome: Diplome;

  @Column({ type: 'varchar', length: 10, default: 'FR' })
  langue: string;

  // Informations sur le titulaire
  @Column({ type: 'jsonb', nullable: true })
  identiteTitulaire: {
    nom: string;
    prenoms: string;
    dateNaissance: string;
    lieuNaissance: string;
    nationalite: string;
  };

  // Informations sur le diplôme
  @Column({ type: 'varchar', length: 200 })
  nomDiplome: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  domaineEtudes: string;

  @Column({ type: 'text', nullable: true })
  objectifs: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  niveauQualification: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  dureeEtudes: string;

  // Informations sur l'établissement
  @Column({ type: 'varchar', length: 200 })
  nomEtablissement: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  statutEtablissement: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  langueEnseignement: string;

  // Détails du programme
  @Column({ type: 'jsonb', nullable: true })
  detailsProgramme: {
    semestres: Array<{
      numero: number;
      ues: Array<{
        code: string;
        intitule: string;
        credits: number;
        coefficient: number;
      }>;
    }>;
  };

  // Résultats détaillés
  @Column({ type: 'jsonb', nullable: true })
  resultatsDetailles: {
    semestres: Array<{
      numero: number;
      moyenne: number;
      creditsAcquis: number;
      ues: Array<{
        code: string;
        intitule: string;
        moyenne: number;
        credits: number;
        statut: string;
      }>;
    }>;
  };

  // Compétences acquises
  @Column({ type: 'jsonb', nullable: true })
  competences: {
    competencesTransversales: string[];
    competencesSpecifiques: string[];
    langues: Array<{
      langue: string;
      niveau: string;
    }>;
    experiencesProfessionnelles: Array<{
      entreprise: string;
      poste: string;
      duree: string;
    }>;
  };

  // Informations sur le système national
  @Column({ type: 'jsonb', nullable: true })
  systemeEducatif: {
    pays: string;
    systeme: string;
    grade: string;
    accesEtudesSuperieures: string;
  };

  // Informations complémentaires
  @Column({ type: 'jsonb', nullable: true })
  stage: {
    entreprises: Array<{
      nom: string;
      duree: string;
      description: string;
    }>;
    competencesAcquises: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  projet: {
    titre: string;
    description: string;
    duree: string;
    technologies: string[];
    resultat: string;
  };

  // Certification
  @ManyToOne(() => Utilisateur, { nullable: true })
  @JoinColumn({ name: 'certifie_par' })
  certifiePar: Utilisateur;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  dateCertification: Date;

  @Column({ type: 'varchar', length: 128, nullable: true })
  hashIntegrite: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
