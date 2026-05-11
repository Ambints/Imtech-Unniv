import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Etudiant } from './etudiant.entity';
import { Parcours } from './parcours.entity';
import { AnneeAcademique } from './annee-academique.entity';
import { Utilisateur } from './utilisateur.entity';
import { ResultatSemestre } from './resultat-semestre.entity';
import { Diplome } from './diplome.entity';

@Entity('inscription')
@Unique(['etudiant', 'parcours', 'anneeAcademique'])
export class Inscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  etudiantId: string;

  @ManyToOne(() => Etudiant, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'etudiant_id' })
  etudiant: Etudiant;

  @Column({ type: 'uuid', nullable: true })
  parcoursId: string;

  @ManyToOne(() => Parcours, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'parcours_id' })
  parcours: Parcours;

  @ManyToOne(() => AnneeAcademique, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'annee_academique_id' })
  anneeAcademique: AnneeAcademique;

  @Column({ type: 'smallint', name: 'annee_niveau' })
  anneeNiveau: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'premiere',
    enum: ['premiere', 'reinscription', 'transfert', 'equivalence'],
  })
  typeInscription: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'en_attente',
    enum: ['en_attente', 'validee', 'annulee', 'abandonnee'],
  })
  statut: string;

  @Column({ type: 'varchar', length: 30, unique: true, nullable: true })
  numeroCarte: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  dateInscription: Date;

  @Column({ type: 'boolean', default: false })
  bourse: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  typeBourse: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'montant_bourse' })
  montantBourse: number;

  @Column({ type: 'text', nullable: true })
  observations: string;

  @ManyToOne(() => Utilisateur, { nullable: true })
  @JoinColumn({ name: 'validee_par' })
  valideePar: Utilisateur;

  @OneToMany(() => ResultatSemestre, (resultat) => resultat.inscription)
  resultatsSemestre: ResultatSemestre[];

  @OneToMany(() => Diplome, (diplome) => diplome.inscription)
  diplomes: Diplome[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
