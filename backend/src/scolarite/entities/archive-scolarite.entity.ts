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
import { Utilisateur } from './utilisateur.entity';

@Entity('archive_scolarite')
export class ArchiveScolarite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Etudiant, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'etudiant_id' })
  etudiant: Etudiant;

  @Column({
    type: 'varchar',
    length: 50,
    enum: [
      'releve_notes',
      'attestation_reussite',
      'diplome',
      'suplement_diplome',
      'certificat_scolarite',
      'transcript',
    ],
  })
  typeDocument: string;

  @Column({ type: 'varchar', length: 200 })
  titreDocument: string;

  @Column({ type: 'varchar', length: 20 })
  anneeAcademique: string;

  @Column({ type: 'smallint', nullable: true })
  semestre: number;

  // Fichiers archivés
  @Column({ type: 'varchar', length: 500, nullable: true })
  fichierOriginalUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  fichierPdfUrl: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  hashIntegrite: string;

  // Métadonnées
  @Column({ type: 'varchar', length: 20, default: 'PDF' })
  format: string;

  @Column({ type: 'bigint', nullable: true })
  tailleOctets: number;

  @Column({ type: 'varchar', length: 10, default: 'FR' })
  langue: string;

  // Contrôle d'accès
  @Column({ type: 'boolean', default: false })
  accesPublic: boolean;

  @Column({ type: 'date', nullable: true })
  dateLimiteAcces: Date;

  // Archivage
  @ManyToOne(() => Utilisateur, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'archive_par' })
  archivePar: Utilisateur;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  dateArchivage: Date;

  @Column({ type: 'integer', default: 10 })
  dureeConservation: number; // années

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
