import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Parcours } from './parcours.entity';
import { ElementConstitutif } from './element-constitutif.entity';
import { Note } from './note.entity';
import { ResultatUE } from './resultat-ue.entity';
import { TransfertEtudiant } from './transfert-etudiant.entity';
import { Utilisateur } from './utilisateur.entity';

@Entity('unite_enseignement')
export class UniteEnseignement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 200 })
  intitule: string;

  @Column({ type: 'uuid', nullable: true })
  parcoursId: string;

  @ManyToOne(() => Parcours, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'parcours_id' })
  parcours: Parcours;

  @Column({ type: 'smallint' })
  semestre: number;

  @Column({ type: 'smallint' })
  anneeNiveau: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  coefficient: number;

  @Column({ type: 'smallint' })
  creditsECTS: number;

  @Column({ type: 'varchar', length: 50, default: 'fondamental' })
  typeUE: string;

  @Column({ type: 'varchar', length: 20, default: 'obligatoire' })
  categorie: string;

  @Column({ type: 'varchar', length: 20, default: 'actif' })
  statut: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  competencesVisees: string[];

  @Column({ type: 'jsonb', nullable: true })
  prerequis: string[];

  @Column({ type: 'uuid', nullable: true })
  enseignantId: string;

  @ManyToOne(() => Utilisateur, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'enseignant_id' })
  enseignant: Utilisateur;

  @OneToMany(() => ElementConstitutif, (ec) => ec.uniteEnseignement)
  elementsConstitutifs: ElementConstitutif[];

  @OneToMany(() => Note, (note) => note.ue)
  notes: Note[];

  @OneToMany(() => ResultatUE, (resultat) => resultat.uniteEnseignement)
  resultatsUE: ResultatUE[];

  // Note: TransfertEtudiant n'a pas de relation uniteEnseignement
  // @OneToMany(() => TransfertEtudiant, (transfert) => transfert.uniteEnseignement)
  // transferts: TransfertEtudiant[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
