import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Seance } from './seance.entity';

@Entity('salles')
export class Salle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 200 })
  nom: string;

  @Column({ type: 'varchar', length: 50 })
  type: 'cm' | 'td' | 'tp' | 'amphi' | 'laboratoire';

  @Column({ type: 'integer' })
  capacite: number;

  @Column('text', { array: true, nullable: true })
  equipements: string[];

  @Column({ type: 'varchar', length: 50, default: 'RDC' })
  etage: string;

  @Column({ type: 'boolean', default: true })
  disponible: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  photo: string;

  @OneToMany(() => Seance, (seance) => seance.salle)
  seances: Seance[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
