import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Inscription } from './inscription.entity';
import { UniteEnseignement } from './unite-enseignement.entity';
import { Deliberation } from './deliberation.entity';
import { Diplome } from './diplome.entity';

@Entity('parcours')
export class Parcours {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 200 })
  nom: string;

  @Column({ type: 'varchar', length: 50 })
  niveau: string;

  @Column({ type: 'smallint', name: 'duree_annees' })
  dureeAnnees: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', nullable: true, default: true })
  actif: boolean;

  @Column({ type: 'integer', nullable: true, name: 'annee_ouverture' })
  anneeOuverture: number;

  // Propriétés virtuelles pour compatibilité (n'existent pas en DB)
  mention?: string;
  specialite?: string;
  statut?: string;
  domaine?: string;
  competencesVises?: string[];
  debouches?: string[];

  @OneToMany(() => Inscription, (inscription) => inscription.parcours)
  inscriptions: Inscription[];

  @OneToMany(() => UniteEnseignement, (ue) => ue.parcours)
  unitesEnseignement: UniteEnseignement[];

  @OneToMany(() => Deliberation, (deliberation) => deliberation.parcours)
  deliberations: Deliberation[];

  @OneToMany(() => Diplome, (diplome) => diplome.parcours)
  diplomes: Diplome[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
