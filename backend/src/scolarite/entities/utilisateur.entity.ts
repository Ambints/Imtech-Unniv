import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Note } from './note.entity';
import { Deliberation } from './deliberation.entity';
import { Diplome } from './diplome.entity';
import { ArchiveScolarite } from './archive-scolarite.entity';

@Entity('utilisateur')
export class Utilisateur {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100 })
  nom: string;

  @Column({ type: 'varchar', length: 200, name: 'prenom' })
  prenoms: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telephone: string;

  @Column({ type: 'varchar', length: 50 })
  role: string;

  @Column({ type: 'boolean', nullable: true, default: true })
  actif: boolean;

  // Getter pour compatibilité
  get statut(): string {
    return this.actif ? 'actif' : 'inactif';
  }

  @Column({ type: 'timestamptz', nullable: true, name: 'derniere_connexion' })
  derniereConnexion: Date;

  // Propriété virtuelle (n'existe pas en DB)
  observations?: string;

  @OneToMany(() => Note, (note) => note.saisiPar)
  notesSaisies: Note[];

  @OneToMany(() => Note, (note) => note.validePar)
  notesValidees: Note[];

  @OneToMany(() => Deliberation, (deliberation) => deliberation.presidentJury)
  deliberationsPresident: Deliberation[];

  @OneToMany(() => Deliberation, (deliberation) => deliberation.valideePar)
  deliberationsValidees: Deliberation[];

  @OneToMany(() => Diplome, (diplome) => diplome.delivrePar)
  diplomesDelivres: Diplome[];

  @OneToMany(() => ArchiveScolarite, (archive) => archive.archivePar)
  archives: ArchiveScolarite[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
