import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity({ name: 'tenant', schema: 'public' })
export class Tenant {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ unique: true, name: 'schema_name' })
  schemaName: string;

  @Column({ length: 200 })
  nom: string;

  @Column({ unique: true, length: 100 })
  slug: string;

  @Column({ nullable: true, length: 255 })
  slogan: string;

  @Column({ name: 'logo_url', nullable: true, type: 'text' })
  logoUrl: string;

  @Column({ name: 'couleur_principale', default: '#1a7a4a', length: 7 })
  couleurPrincipale: string;

  @Column({ name: 'couleur_secondaire', default: '#1565c0', length: 7 })
  couleurSecondaire: string;

  @Column({ name: 'couleur_accent', default: '#e65100', length: 7 })
  couleurAccent: string;

  @Column({ name: 'couleur_texte', default: '#ffffff', length: 7 })
  couleurTexte: string;

  @Column({ name: 'entete_document', nullable: true, type: 'text' })
  enteteDocument: string;

  @Column({ nullable: true, type: 'text' })
  adresse: string;

  @Column({ default: 'Madagascar', length: 100 })
  pays: string;

  @Column({ nullable: true, length: 30 })
  telephone: string;

  @Column({ name: 'email_contact', nullable: true, length: 200 })
  emailContact: string;

  @Column({ name: 'site_web', nullable: true, length: 300 })
  siteWeb: string;

  @Column({ name: 'type_etablissement', default: 'catholique', length: 50 })
  typeEtablissement: string;

  @Column({ name: 'actif', default: true })
  actif: boolean;

  // Subscription fields
  @Column({ name: 'plan_abonnement', default: 'basic', length: 20 })
  planAbonnement: string;

  @Column({ name: 'statut_abonnement', default: 'active', length: 20 })
  statutAbonnement: string;

  @Column({ name: 'date_debut_abonnement', type: 'date', nullable: true })
  dateDebutAbonnement: Date;

  @Column({ name: 'date_fin_abonnement', type: 'date', nullable: true })
  dateFinAbonnement: Date;

  @Column({ name: 'prix_mensuel', type: 'decimal', precision: 10, scale: 2, default: 50000 })
  prixMensuel: number;

  @Column({ name: 'max_utilisateurs', type: 'int', default: 100 })
  maxUtilisateurs: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}