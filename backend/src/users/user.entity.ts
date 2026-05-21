import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('utilisateur')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column({ unique: true, length: 254 })
  email: string;
  
  // ✅ CORRECTION: Utiliser password_hash comme dans la DB
  @Column({ name: 'password_hash', length: 255 })
  password: string;
  
  @Column({ length: 100 })
  nom: string;
  
  @Column({ length: 100 })
  prenom: string;
  
  @Column({ nullable: true, length: 30 })
  telephone: string;
  
  @Column({ name: 'photo_url', nullable: true, length: 500 })
  photoUrl: string;
  
  @Column({ length: 50 })
  role: string;
  
  @Column({ default: true, nullable: true })
  actif: boolean;
  
  @Column({ name: 'email_verifie', default: false, nullable: true })
  emailVerifie: boolean;
  
  @Column({ name: 'derniere_connexion', nullable: true, type: 'timestamptz' })
  derniereConnexion: Date;
  
  @Column({ name: 'token_reset', nullable: true, type: 'text' })
  tokenReset: string;
  
  @Column({ name: 'token_reset_expiry', nullable: true, type: 'timestamptz' })
  tokenResetExpiry: Date;

  @Column({ name: 'tenant_id', nullable: true, type: 'uuid' })
  tenantId: string;

  @Column({ name: 'password_reset_required', default: false, nullable: true })
  passwordResetRequired: boolean;

  @Column({ name: 'last_password_reset', nullable: true, type: 'timestamptz' })
  lastPasswordReset: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
  
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}