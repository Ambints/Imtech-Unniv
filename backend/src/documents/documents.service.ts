import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReleveNote, Attestation, Diplome } from './documents.entities';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @InjectRepository(ReleveNote) private releveRepo: Repository<ReleveNote>,
    @InjectRepository(Attestation) private attestationRepo: Repository<Attestation>,
    @InjectRepository(Diplome) private diplomeRepo: Repository<Diplome>,
  ) {}

  // ========== RELEVÉS DE NOTES ==========
  async genererReleve(data: Partial<ReleveNote>): Promise<ReleveNote> {
    const numero = await this.genererNumero('RN');
    const releve = this.releveRepo.create({ ...data, numeroReleve: numero, statut: 'brouillon' });
    return this.releveRepo.save(releve);
  }

  async findRelevesByEtudiant(etudiantId: string): Promise<ReleveNote[]> {
    return this.releveRepo.find({
      where: { etudiantId },
      order: { dateGeneration: 'DESC' },
    });
  }

  async validerReleve(id: string, validePar: string): Promise<ReleveNote> {
    await this.releveRepo.update(id, { statut: 'valide', validePar, dateValidation: new Date() });
    return this.releveRepo.findOne({ where: { id } });
  }

  async signerReleve(id: string, signePar: string): Promise<ReleveNote> {
    await this.releveRepo.update(id, { statut: 'signe', signePar, dateSignature: new Date() });
    return this.releveRepo.findOne({ where: { id } });
  }

  // ========== ATTESTATIONS ==========
  async demanderAttestation(data: Partial<Attestation>): Promise<Attestation> {
    const numero = await this.genererNumero('AT');
    const attestation = this.attestationRepo.create({ ...data, numeroAttestation: numero });
    return this.attestationRepo.save(attestation);
  }

  async findAttestationsByEtudiant(etudiantId: string): Promise<Attestation[]> {
    return this.attestationRepo.find({
      where: { etudiantId },
      order: { dateDemande: 'DESC' },
    });
  }

  async validerAttestation(id: string, validePar: string): Promise<Attestation> {
    await this.attestationRepo.update(id, { 
      statut: 'valide', 
      validePar, 
      dateValidation: new Date() 
    });
    return this.attestationRepo.findOne({ where: { id } });
  }

  async signerAttestation(id: string, signePar: string): Promise<Attestation> {
    await this.attestationRepo.update(id, { 
      statut: 'signe', 
      signePar, 
      dateSignature: new Date() 
    });
    return this.attestationRepo.findOne({ where: { id } });
  }

  async delivrerAttestation(id: string): Promise<Attestation> {
    await this.attestationRepo.update(id, { 
      statut: 'delivre', 
      dateDelivrance: new Date() 
    });
    return this.attestationRepo.findOne({ where: { id } });
  }

  // ========== DIPLÔMES ==========
  async genererDiplome(data: Partial<Diplome>): Promise<Diplome> {
    const [numeroDiplome, numeroLivret] = await Promise.all([
      this.genererNumero('DP'),
      this.genererNumero('LV'),
    ]);
    const diplome = this.diplomeRepo.create({ 
      ...data, 
      numeroDiplome, 
      numeroLivret,
      statut: 'en_preparation' 
    });
    return this.diplomeRepo.save(diplome);
  }

  async findDiplomesByEtudiant(etudiantId: string): Promise<Diplome[]> {
    return this.diplomeRepo.find({
      where: { etudiantId },
      order: { dateObtention: 'DESC' },
    });
  }

  async signerDiplomeNumeriquement(id: string, signatureUrl: string): Promise<Diplome> {
    await this.diplomeRepo.update(id, {
      signeNumeriquement: true,
      signaturePresidentUrl: signatureUrl,
      dateSignature: new Date(),
      statut: 'signe',
    });
    return this.diplomeRepo.findOne({ where: { id } });
  }

  async delivrerDiplome(id: string): Promise<Diplome> {
    await this.diplomeRepo.update(id, {
      statut: 'delivre',
      dateDelivrance: new Date(),
    });
    return this.diplomeRepo.findOne({ where: { id } });
  }

  // ========== UTILITAIRES ==========
  private async genererNumero(prefix: string): Promise<string> {
    const date = new Date();
    const annee = date.getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${annee}-${random}`;
  }

  // ========== STATISTIQUES ==========
  async getStatsDocuments(): Promise<any> {
    const [totalReleves, totalAttestations, totalDiplomes] = await Promise.all([
      this.releveRepo.count(),
      this.attestationRepo.count(),
      this.diplomeRepo.count(),
    ]);

    return {
      totalReleves,
      totalAttestations,
      totalDiplomes,
      relevesGenereCeMois: await this.releveRepo.count({
        where: { dateGeneration: new Date() },
      }),
    };
  }
}
