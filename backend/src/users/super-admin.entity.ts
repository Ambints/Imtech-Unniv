import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'super_admin', schema: 'public' })
export class SuperAdmin {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) email: string;
  @Column({ name: 'password_hash' }) password: string;
  @Column() nom: string;
  @Column() prenom: string;
  @Column({ default: true }) actif: boolean;
  @Column({ name: 'derniere_connexion', nullable: true }) derniereConnexion: Date;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @Column({ name: 'password_reset_required', default: false }) passwordResetRequired: boolean;
  @Column({ name: 'last_password_reset', nullable: true }) lastPasswordReset: Date;
}
