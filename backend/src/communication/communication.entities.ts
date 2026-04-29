import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('annonce')
export class Annonce {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() titre: string;
  @Column() contenu: string;
  @Column({ name: 'type_annonce', default: 'information' }) typeAnnonce: string;
  @Column({ default: 'tous' }) cible: string;
  @Column({ name: 'parcours_id', nullable: true }) parcoursId: string;
  @Column({ default: false }) publie: boolean;
  @Column({ name: 'date_publication', nullable: true }) datePublication: Date;
  @Column({ name: 'date_expiration', nullable: true }) dateExpiration: Date;
  @Column({ name: 'auteur_id' }) auteurId: string;
  @Column({ name: 'photo_url', nullable: true }) photoUrl: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('notification')
export class Notification {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'utilisateur_id' }) utilisateurId: string;
  @Column() titre: string;
  @Column() message: string;
  @Column({ name: 'type_notification', default: 'info' }) typeNotification: string;
  @Column({ default: false }) lue: boolean;
  @Column({ name: 'lue_at', nullable: true }) lueAt: Date;
  @Column({ nullable: true }) lien: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('message')
export class Message {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'expediteur_id' }) expediteurId: string;
  @Column({ name: 'destinataire_id' }) destinataireId: string;
  @Column({ nullable: true }) sujet: string;
  @Column() contenu: string;
  @Column({ default: false }) lu: boolean;
  @Column({ name: 'lu_at', nullable: true }) luAt: Date;
  @Column({ name: 'parent_id', nullable: true }) parentId: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
