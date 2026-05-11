import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Etudiant } from './etudiant.entity';
import { Parcours } from './parcours.entity';
import { UniteEnseignement } from './unite-enseignement.entity';
import { Utilisateur } from './utilisateur.entity';

@Entity('transfert_etudiant')
export class TransfertEtudiant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Etudiant, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'etudiant_id' })
  etudiant: Etudiant;

  @Column({ type: 'varchar', length: 200 })
  etablissementOrigine: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  paysOrigine: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  diplomeOrigine: string;

  @Column({ type: 'integer', nullable: true })
  anneeObtentionOrigine: number;

  @ManyToOne(() => Parcours, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'parcours_destination_id' })
  parcoursDestination: Parcours;

  @Column({ type: 'smallint' })
  niveauDestination: number;

  // Documents fournis
  @Column('text', { array: true, nullable: true })
  relevesNotesOrigine: string[];

  @Column('text', { array: true, nullable: true })
  attestationsOrigine: string[];

  @Column({ type: 'text', nullable: true })
  programmeOrigine: string;

  // Décision d'équivalence
  @Column({
    type: 'varchar',
    length: 20,
    default: 'en_attente',
    enum: ['en_attente', 'acceptee', 'refusee', 'complementaire'],
  })
  decisionEquivalence: string;

  @Column({ type: 'smallint', default: 0 })
  creditsReconnus: number;

  @Column('uuid', { array: true, default: [] })
  uesValidees: string[];

  @Column({ type: 'text', nullable: true })
  conditionsComplementaires: string;

  // Validation
  @ManyToOne(() => Utilisateur, { nullable: true })
  @JoinColumn({ name: 'valide_par' })
  validePar: Utilisateur;

  @Column({ type: 'timestamptz', nullable: true })
  dateValidation: Date;

  @Column({ type: 'text', nullable: true })
  observations: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
