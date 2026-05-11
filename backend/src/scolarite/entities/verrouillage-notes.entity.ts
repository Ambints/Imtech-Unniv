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
import { Deliberation } from './deliberation.entity';
import { Etudiant } from './etudiant.entity';
import { SessionExamen } from './session-examen.entity';
import { Utilisateur } from './utilisateur.entity';

@Entity('verrouillage_notes')
@Unique(['deliberation', 'etudiant', 'sessionExamen'])
export class VerrouillageNotes {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Deliberation, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'deliberation_id' })
  deliberation: Deliberation;

  @ManyToOne(() => Etudiant, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'etudiant_id' })
  etudiant: Etudiant;

  @ManyToOne(() => SessionExamen, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'session_examen_id' })
  sessionExamen: SessionExamen;

  // Verrouillage
  @Column({
    type: 'varchar',
    length: 20,
    default: 'deverrouille',
    enum: ['deverrouille', 'verrouille', 'modification_autorisee'],
  })
  statut: string;

  @Column({ type: 'timestamptz', nullable: true })
  dateVerrouillage: Date;

  @ManyToOne(() => Utilisateur, { nullable: true })
  @JoinColumn({ name: 'verrouille_par' })
  verrouillePar: Utilisateur;

  // Autorisations exceptionnelles
  @Column({ type: 'boolean', default: false })
  autorisationModif: boolean;

  @Column({ type: 'text', nullable: true })
  motifAutorisation: string;

  @ManyToOne(() => Utilisateur, { nullable: true })
  @JoinColumn({ name: 'autorise_par' })
  autorisePar: Utilisateur;

  @Column({ type: 'timestamptz', nullable: true })
  dateAutorisation: Date;

  @Column({ type: 'date', nullable: true })
  dateFinAutorisation: Date;

  // Historique
  @Column({ type: 'jsonb', default: [] })
  historiqueModifs: Array<{
    date: Date;
    utilisateur: string;
    action: string;
    motif?: string;
  }>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
