import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Note } from './note.entity';
import { Inscription } from './inscription.entity';
import { ResultatSemestre } from './resultat-semestre.entity';
import { Diplome } from './diplome.entity';
import { ArchiveScolarite } from './archive-scolarite.entity';
import { Parcours } from './parcours.entity';

@Entity('etudiant')
export class Etudiant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  matricule: string;

  @Column({ type: 'varchar', length: 100 })
  nom: string;

  @Column({ type: 'varchar', length: 200, name: 'prenom' })
  prenoms: string;

  @Column({ type: 'date', name: 'date_naissance' })
  dateNaissance: Date;

  @Column({ type: 'varchar', length: 100, name: 'lieu_naissance' })
  lieuNaissance: string;

  @Column({ type: 'varchar', length: 50 })
  nationalite: string;

  @Column({ type: 'varchar', length: 200 })
  email: string;

  @Column({ type: 'varchar', length: 20 })
  telephone: string;

  @Column({ type: 'varchar', length: 200 })
  adresse: string;

  @Column({ type: 'varchar', length: 10, default: 'M' })
  sexe: string;

  @Column({ type: 'varchar', length: 20, name: 'situation_familiale' })
  situationFamiliale: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'email_parent' })
  emailParent: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'telephone_parent' })
  telephoneParent: string;

  @Column({ type: 'boolean', nullable: true, default: true })
  actif: boolean;

  // Getter pour compatibilité avec l'ancien code
  get statut(): string {
    return this.actif ? 'actif' : 'inactif';
  }

  // Propriétés virtuelles (n'existent pas en DB mais dans inscription)
  dateInscription?: Date;
  observations?: string;
  typeBourse?: string;
  parcoursId?: string;
  parcours?: any; // Relation virtuelle pour compatibilité

  @OneToMany(() => Note, (note) => note.etudiant)
  notes: Note[];

  @OneToMany(() => Inscription, (inscription) => inscription.etudiant)
  inscriptions: Inscription[];

  @OneToMany(() => ResultatSemestre, (resultat) => resultat.etudiant)
  resultatsSemestre: ResultatSemestre[];

  @OneToMany(() => Diplome, (diplome) => diplome.etudiant)
  diplomes: Diplome[];

  @OneToMany(() => ArchiveScolarite, (archive) => archive.etudiant)
  archives: ArchiveScolarite[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
