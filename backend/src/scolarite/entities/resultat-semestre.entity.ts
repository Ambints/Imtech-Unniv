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
import { Inscription } from './inscription.entity';
import { Deliberation } from './deliberation.entity';
import { ResultatUE } from './resultat-ue.entity';

@Entity('resultat_semestre')
@Unique(['etudiant', 'inscription', 'semestre', 'anneeNiveau'])
export class ResultatSemestre {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Etudiant, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'etudiant_id' })
  etudiant: Etudiant;

  @ManyToOne(() => Inscription, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'inscription_id' })
  inscription: Inscription;

  @Column({ type: 'smallint' })
  semestre: number;

  @Column({ type: 'smallint' })
  anneeNiveau: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  moyenneGenerale: number;

  @Column({ type: 'smallint', nullable: true })
  totalCreditsECTS: number;

  @Column({ type: 'smallint', default: 0 })
  creditsAcquis: number;

  @Column({ type: 'smallint', default: 0 })
  creditsManquants: number;

  @Column({ type: 'smallint', default: 0 })
  nombreUEs: number;

  @Column({ type: 'smallint', default: 0 })
  nombreUEsValidees: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'en_cours',
    enum: ['en_cours', 'valide', 'ajourne', 'redoublement'],
  })
  statut: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  mention: string;

  @ManyToOne(() => Deliberation, { nullable: true })
  @JoinColumn({ name: 'deliberation_id' })
  deliberation: Deliberation;

  @Column({ type: 'smallint', nullable: true })
  classement: number;

  @Column({ type: 'smallint', nullable: true })
  effectifPromotion: number;

  @Column({ type: 'timestamptz', nullable: true })
  dateValidation: Date;

  @OneToMany(() => ResultatUE, (resultatUE) => resultatUE.resultatSemestre)
  resultatsUE: ResultatUE[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
