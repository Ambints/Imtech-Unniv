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
import { Utilisateur } from '../scolarite/entities/utilisateur.entity';
import { Paiement } from '../finance/finance.entities';

@Entity('cloture_caisse')
@Unique(['dateCloture', 'caissierId'])
export class ClotureCaisse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date', unique: true })
  dateCloture: Date;

  @ManyToOne(() => Utilisateur, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'caissier_id' })
  caissier: Utilisateur;

  @Column({ type: 'uuid' })
  caissierId: string;

  // Totaux par mode de paiement
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalEspeces: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalCheques: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalVirements: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalCarteBancaire: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalMobileMoney: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalGeneral: number;

  // Détails des paiements
  @Column({ type: 'int', default: 0 })
  nombrePaiements: number;

  @Column({ type: 'jsonb', nullable: true })
  detailsPaiements: {
    inscription: { montant: number; nombre: number };
    scolarite: { montant: number; nombre: number };
    autres: { montant: number; nombre: number };
  };

  // Réconciliation bancaire
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  soldeBanqueTheorique: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  soldeBanqueReel: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  ecart: number;

  @Column({ type: 'text', nullable: true })
  motifEcart: string;

  // Validation
  @Column({ type: 'boolean', default: false })
  valide: boolean;

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
