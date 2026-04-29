import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('plan_abonnement', { schema: 'public' })
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, name: 'nom' })
  name: string;

  @Column({ type: 'text', nullable: true, name: 'description' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'prix_mensuel' })
  monthlyPrice: number;

  @Column({ type: 'int', nullable: true, name: 'max_etudiants' })
  maxStudents: number;

  @Column({ type: 'int', nullable: true, name: 'max_utilisateurs' })
  maxUsers: number;

  @Column({ type: 'jsonb', default: {}, name: 'fonctionnalites' })
  features: Record<string, any>;

  @Column({ type: 'boolean', default: true, name: 'actif' })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
