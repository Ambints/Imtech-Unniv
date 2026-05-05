import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private readonly svc;
    constructor(svc: DocumentsService);
    createReleve(dto: any): Promise<import("./documents.entities").ReleveNote>;
    findReleves(etudiantId: string): Promise<import("./documents.entities").ReleveNote[]>;
    validerReleve(id: string, validePar: string): Promise<import("./documents.entities").ReleveNote>;
    signerReleve(id: string, signePar: string): Promise<import("./documents.entities").ReleveNote>;
    demanderAttestation(dto: any): Promise<import("./documents.entities").Attestation>;
    findAttestations(etudiantId: string): Promise<import("./documents.entities").Attestation[]>;
    validerAttestation(id: string, validePar: string): Promise<import("./documents.entities").Attestation>;
    signerAttestation(id: string, signePar: string): Promise<import("./documents.entities").Attestation>;
    delivrerAttestation(id: string): Promise<import("./documents.entities").Attestation>;
    createDiplome(dto: any): Promise<import("./documents.entities").Diplome>;
    findDiplomes(etudiantId: string): Promise<import("./documents.entities").Diplome[]>;
    signerDiplomeNumerique(id: string, signatureUrl: string): Promise<import("./documents.entities").Diplome>;
    delivrerDiplome(id: string): Promise<import("./documents.entities").Diplome>;
    getStats(): Promise<any>;
}
