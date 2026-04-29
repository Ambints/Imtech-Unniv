import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('utilisateur')
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) email: string;
  @Column({ name: 'password_hash' }) password: string;
  @Column() nom: string;
  @Column() prenom: string;
  @Column({ nullable: true }) telephone: string;
  @Column({ name: 'photo_url', nullable: true }) photoUrl: string;
  @Column() role: string;
  @Column({ default: true, name: 'actif' }) actif: boolean;
  @Column({ name: 'email_verifie', default: false }) emailVerifie: boolean;
  @Column({ name: 'derniere_connexion', nullable: true }) derniereConnexion: Date;
  @Column({ name: 'token_reset', nullable: true }) tokenReset: string;
  @Column({ name: 'token_reset_expiry', nullable: true }) tokenResetExpiry: Date;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}