import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity({ name: 'convention_partenariat' })
export class ConventionPartenariat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'numero_convention', length: 50, unique: true })
  numeroConvention: string;

  @Column({ length: 255 })
  titre: string;

  @Column({ name: 'type_partenaire', length: 50 })
  typePartenaire: 'eglise' | 'diocese' | 'congregation' | 'universite' | 'entreprise' | 'ong' | 'autre';

  @Column({ name: 'nom_partenaire', length: 255 })
  nomPartenaire: string;

  @Column({ name: 'contact_partenaire', length: 255, nullable: true })
  contactPartenaire: string;

  @Column({ name: 'email_partenaire', length: 254, nullable: true })
  emailPartenaire: string;

  @Column({ name: 'telephone_partenaire', length: 30, nullable: true })
  telephonePartenaire: string;

  @Column({ name: 'objet_convention', type: 'text' })
  objetConvention: string;

  @Column({ name: 'date_debut', type: 'date' })
  dateDebut: Date;

  @Column({ name: 'date_fin', type: 'date', nullable: true })
  dateFin: Date;

  @Column({ name: 'duree_mois', type: 'int', nullable: true })
  dureeMois: number;

  @Column({ name: 'montant_engagement', type: 'decimal', precision: 15, scale: 2, nullable: true })
  montantEngagement: number;

  @Column({ length: 10, default: 'MGA' })
  devise: string;

  @Column({ name: 'document_url', type: 'text', nullable: true })
  documentUrl: string;

  @Column({ name: 'document_hash', type: 'text', nullable: true })
  documentHash: string;

  @Column({ length: 30, default: 'brouillon' })
  statut: 'brouillon' | 'en_attente_signature' | 'signe' | 'actif' | 'expire' | 'resilie';

  @Column({ name: 'signataire_president_id', type: 'uuid', nullable: true })
  signatairePresidentId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'signataire_president_id' })
  signatairePresident: User;

  @Column({ name: 'date_signature_president', type: 'timestamptz', nullable: true })
  dateSignaturePresident: Date;

  @Column({ name: 'signataire_partenaire', length: 255, nullable: true })
  signatairePartenaire: string;

  @Column({ name: 'date_signature_partenaire', type: 'date', nullable: true })
  dateSignaturePartenaire: Date;

  @Column({ name: 'conditions_particulieres', type: 'text', nullable: true })
  conditionsParticulieres: string;

  @Column({ name: 'clauses_resiliation', type: 'text', nullable: true })
  clausesResiliation: string;

  @Column({ name: 'renouvellement_auto', type: 'boolean', default: false })
  renouvellementAuto: boolean;

  @Column({ name: 'responsable_suivi_id', type: 'uuid', nullable: true })
  responsableSuiviId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'responsable_suivi_id' })
  responsableSuivi: User;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// Made with Bob
