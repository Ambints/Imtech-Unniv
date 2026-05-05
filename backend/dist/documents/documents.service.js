"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DocumentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const documents_entities_1 = require("./documents.entities");
let DocumentsService = DocumentsService_1 = class DocumentsService {
    constructor(releveRepo, attestationRepo, diplomeRepo) {
        this.releveRepo = releveRepo;
        this.attestationRepo = attestationRepo;
        this.diplomeRepo = diplomeRepo;
        this.logger = new common_1.Logger(DocumentsService_1.name);
    }
    async genererReleve(data) {
        const numero = await this.genererNumero('RN');
        const releve = this.releveRepo.create({ ...data, numeroReleve: numero, statut: 'brouillon' });
        return this.releveRepo.save(releve);
    }
    async findRelevesByEtudiant(etudiantId) {
        return this.releveRepo.find({
            where: { etudiantId },
            order: { dateGeneration: 'DESC' },
        });
    }
    async validerReleve(id, validePar) {
        await this.releveRepo.update(id, { statut: 'valide', validePar, dateValidation: new Date() });
        return this.releveRepo.findOne({ where: { id } });
    }
    async signerReleve(id, signePar) {
        await this.releveRepo.update(id, { statut: 'signe', signePar, dateSignature: new Date() });
        return this.releveRepo.findOne({ where: { id } });
    }
    async demanderAttestation(data) {
        const numero = await this.genererNumero('AT');
        const attestation = this.attestationRepo.create({ ...data, numeroAttestation: numero });
        return this.attestationRepo.save(attestation);
    }
    async findAttestationsByEtudiant(etudiantId) {
        return this.attestationRepo.find({
            where: { etudiantId },
            order: { dateDemande: 'DESC' },
        });
    }
    async validerAttestation(id, validePar) {
        await this.attestationRepo.update(id, {
            statut: 'valide',
            validePar,
            dateValidation: new Date()
        });
        return this.attestationRepo.findOne({ where: { id } });
    }
    async signerAttestation(id, signePar) {
        await this.attestationRepo.update(id, {
            statut: 'signe',
            signePar,
            dateSignature: new Date()
        });
        return this.attestationRepo.findOne({ where: { id } });
    }
    async delivrerAttestation(id) {
        await this.attestationRepo.update(id, {
            statut: 'delivre',
            dateDelivrance: new Date()
        });
        return this.attestationRepo.findOne({ where: { id } });
    }
    async genererDiplome(data) {
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
    async findDiplomesByEtudiant(etudiantId) {
        return this.diplomeRepo.find({
            where: { etudiantId },
            order: { dateObtention: 'DESC' },
        });
    }
    async signerDiplomeNumeriquement(id, signatureUrl) {
        await this.diplomeRepo.update(id, {
            signeNumeriquement: true,
            signaturePresidentUrl: signatureUrl,
            dateSignature: new Date(),
            statut: 'signe',
        });
        return this.diplomeRepo.findOne({ where: { id } });
    }
    async delivrerDiplome(id) {
        await this.diplomeRepo.update(id, {
            statut: 'delivre',
            dateDelivrance: new Date(),
        });
        return this.diplomeRepo.findOne({ where: { id } });
    }
    async genererNumero(prefix) {
        const date = new Date();
        const annee = date.getFullYear();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${prefix}-${annee}-${random}`;
    }
    async getStatsDocuments() {
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
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = DocumentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(documents_entities_1.ReleveNote)),
    __param(1, (0, typeorm_1.InjectRepository)(documents_entities_1.Attestation)),
    __param(2, (0, typeorm_1.InjectRepository)(documents_entities_1.Diplome)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map