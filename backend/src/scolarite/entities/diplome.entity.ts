import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Etudiant } from './etudiant.entity';
import { Inscription } from './inscription.entity';
import { Parcours } from './parcours.entity';
import { Utilisateur } from './utilisateur.entity';
import { SuplementDiplome } from './suplement-diplome.entity';

@Entity('diplome')
@Unique(['numeroDiplome'])
export class Diplome {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Etudiant, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'etudiant_id' })
  etudiant: Etudiant;

  @ManyToOne(() => Inscription, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'inscription_id' })
  inscription: Inscription;

  @ManyToOne(() => Parcours, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'parcours_id' })
  parcours: Parcours;

  @Column({
    type: 'varchar',
    length: 50,
    enum: ['licence', 'master', 'doctorat', 'bts', 'dut', 'certificat'],
    name: 'type_diplome',
  })
  typeDiplome: string;

  @Column({ type: 'varchar', length: 30, nullable: true, name: 'mention_generale' })
  mentionGenerale: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'moyenne_finale' })
  moyenneFinale: number;

  @Column({ type: 'smallint', nullable: true, name: 'total_credits_ects' })
  totalCreditsECTS: number;

  @Column({ type: 'date', nullable: true, name: 'date_obtention' })
  dateObtention: Date;

  @Column({ type: 'varchar', length: 200, nullable: true, name: 'lieu_obtention' })
  lieuObtention: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true, name: 'numero_diplome' })
  numeroDiplome: string;

  @Column({ type: 'varchar', length: 128, nullable: true, name: 'hash_integrite' })
  hashIntegrite: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'qr_code_url' })
  qrCodeUrl: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'en_attente',
    enum: ['en_attente', 'delivre', 'retire', 'annule', 'remplace'],
  })
  statut: string;

  @ManyToOne(() => Utilisateur, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'delivre_par' })
  delivrePar: Utilisateur;

  @Column({ type: 'date', nullable: true, name: 'date_delivrance' })
  dateDelivrance: Date;

  @Column({ type: 'date', nullable: true, name: 'date_retrait' })
  dateRetrait: Date;

  @Column({ type: 'text', nullable: true })
  observations: string;

  @OneToOne(() => SuplementDiplome, (suplement) => suplement.diplome)
  suplementDiplome: SuplementDiplome;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
