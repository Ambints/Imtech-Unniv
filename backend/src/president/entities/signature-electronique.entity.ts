import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity({ name: 'signature_electronique' })
export class SignatureElectronique {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'type_document', length: 50 })
  typeDocument: 'diplome' | 'convention' | 'decision' | 'attestation' | 'autre';

  @Column({ name: 'document_id', type: 'uuid' })
  documentId: string;

  @Column({ name: 'reference_document', length: 100, nullable: true })
  referenceDocument: string;

  @Column({ name: 'signataire_id', type: 'uuid' })
  signataireId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'signataire_id' })
  signataire: User;

  @Column({ name: 'signature_hash', type: 'text' })
  signatureHash: string;

  @Column({ name: 'certificat_signature', type: 'text', nullable: true })
  certificatSignature: string;

  @Column({ name: 'date_signature', type: 'timestamptz' })
  dateSignature: Date;

  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ length: 100, nullable: true })
  localisation: string;

  @Column({ length: 20, default: 'valide' })
  statut: 'valide' | 'revoque' | 'expire';

  @Column({ name: 'raison_revocation', type: 'text', nullable: true })
  raisonRevocation: string;

  @Column({ name: 'date_revocation', type: 'timestamptz', nullable: true })
  dateRevocation: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// Made with Bob
