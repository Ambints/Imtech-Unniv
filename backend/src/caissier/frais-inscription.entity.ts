import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Parcours } from '../scolarite/entities/parcours.entity';
import { AnneeAcademique } from '../scolarite/entities/annee-academique.entity';
import { Utilisateur } from '../scolarite/entities/utilisateur.entity';

@Entity('frais_inscription')
@Unique(['parcours', 'anneeAcademique'])
export class FraisInscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Parcours, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'parcours_id' })
  parcours: Parcours;

  @Column({ type: 'uuid' })
  parcoursId: string;

  @ManyToOne(() => AnneeAcademique, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'annee_academique_id' })
  anneeAcademique: AnneeAcademique;

  @Column({ type: 'uuid' })
  anneeAcademiqueId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  montantInscription: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  montantScolarite: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  montantTotal: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  actif: boolean;

  @Column({ type: 'date', nullable: true })
  dateLimitePaiement: Date;

  @Column({ type: 'jsonb', nullable: true })
  modalitesPaiement: {
    especes: boolean;
    cheque: boolean;
    virement: boolean;
    carte_bancaire: boolean;
    echelonnement: boolean;
    nombre_echeances_max?: number;
  };

  @ManyToOne(() => Utilisateur, { nullable: true })
  @JoinColumn({ name: 'cree_par' })
  creePar: Utilisateur;

  @ManyToOne(() => Utilisateur, { nullable: true })
  @JoinColumn({ name: 'modifie_par' })
  modifiePar: Utilisateur;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
