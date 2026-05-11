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
import { SessionExamen } from './session-examen.entity';
import { Parcours } from './parcours.entity';
import { Utilisateur } from './utilisateur.entity';
import { ResultatSemestre } from './resultat-semestre.entity';
import { VerrouillageNotes } from './verrouillage-notes.entity';

@Entity('deliberation')
@Unique(['sessionExamen', 'parcours', 'semestre', 'anneeNiveau'])
export class Deliberation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SessionExamen, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'session_examen_id' })
  sessionExamen: SessionExamen;

  @ManyToOne(() => Parcours, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'parcours_id' })
  parcours: Parcours;

  @Column({ type: 'smallint' })
  semestre: number;

  @Column({ type: 'smallint', name: 'annee_niveau' })
  anneeNiveau: number;

  @Column({ type: 'date', name: 'date_deliberation' })
  dateDeliberation: Date;

  @ManyToOne(() => Utilisateur, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'president_jury_id' })
  presidentJury: Utilisateur;

  @Column('simple-array', { default: [], name: 'membres_jury' })
  membresJury: string[];

  @Column({
    type: 'varchar',
    length: 20,
    default: 'planifiee',
    enum: ['planifiee', 'en_cours', 'terminee', 'annulee'],
  })
  statut: string;

  @Column({ type: 'text', nullable: true, name: 'observations_generales' })
  observationsGenerales: string;

  @Column({ type: 'text', nullable: true, name: 'rapport_deliberation' })
  rapportDeliberation: string;

  @ManyToOne(() => Utilisateur, { nullable: true })
  @JoinColumn({ name: 'validee_par' })
  valideePar: Utilisateur;

  @Column({ type: 'timestamptz', nullable: true, name: 'date_validation' })
  dateValidation: Date;

  @OneToMany(() => ResultatSemestre, (resultat) => resultat.deliberation)
  resultatsSemestre: ResultatSemestre[];

  @OneToMany(() => VerrouillageNotes, (verrouillage) => verrouillage.deliberation)
  verrouillagesNotes: VerrouillageNotes[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
