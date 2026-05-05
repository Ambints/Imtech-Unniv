import { Repository } from 'typeorm';
import { ReleveNote, Attestation, Diplome } from './documents.entities';
export declare class DocumentsService {
    private releveRepo;
    private attestationRepo;
    private diplomeRepo;
    private readonly logger;
    constructor(releveRepo: Repository<ReleveNote>, attestationRepo: Repository<Attestation>, diplomeRepo: Repository<Diplome>);
    genererReleve(data: Partial<ReleveNote>): Promise<ReleveNote>;
    findRelevesByEtudiant(etudiantId: string): Promise<ReleveNote[]>;
    validerReleve(id: string, validePar: string): Promise<ReleveNote>;
    signerReleve(id: string, signePar: string): Promise<ReleveNote>;
    demanderAttestation(data: Partial<Attestation>): Promise<Attestation>;
    findAttestationsByEtudiant(etudiantId: string): Promise<Attestation[]>;
    validerAttestation(id: string, validePar: string): Promise<Attestation>;
    signerAttestation(id: string, signePar: string): Promise<Attestation>;
    delivrerAttestation(id: string): Promise<Attestation>;
    genererDiplome(data: Partial<Diplome>): Promise<Diplome>;
    findDiplomesByEtudiant(etudiantId: string): Promise<Diplome[]>;
    signerDiplomeNumeriquement(id: string, signatureUrl: string): Promise<Diplome>;
    delivrerDiplome(id: string): Promise<Diplome>;
    private genererNumero;
    getStatsDocuments(): Promise<any>;
}
