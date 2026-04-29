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
var TenantCreationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantCreationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const fs_1 = require("fs");
const path_1 = require("path");
function getErrorMessage(error) {
    if (error instanceof Error)
        return error.message;
    return String(error);
}
let TenantCreationService = TenantCreationService_1 = class TenantCreationService {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(TenantCreationService_1.name);
    }
    async createTenantSchema(schemaName) {
        const queryRunner = this.dataSource.createQueryRunner();
        try {
            await queryRunner.connect();
            this.logger.log(`Création du schéma: ${schemaName}`);
            await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
            const sqlPath = process.env.NODE_ENV === 'production'
                ? (0, path_1.join)(__dirname, 'tenant-schema.sql')
                : (0, path_1.join)(__dirname, '../../src/tenants/tenant-schema.sql');
            const sqlScript = (0, fs_1.readFileSync)(sqlPath, 'utf-8');
            this.logger.log(`Initialisation des tables dans ${schemaName}`);
            const statements = this.splitSqlScript(sqlScript);
            for (const statement of statements) {
                const trimmed = statement.trim();
                if (trimmed && !trimmed.startsWith('--') && !trimmed.startsWith('/*')) {
                    try {
                        await queryRunner.query(`SET search_path TO "${schemaName}"; ${trimmed}`);
                    }
                    catch (error) {
                        const msg = getErrorMessage(error);
                        if (!msg.includes('already exists') && !msg.includes('n\'existe pas')) {
                            this.logger.warn(`Commande ignorée: ${msg}`);
                        }
                    }
                }
            }
            await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
            await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
            this.logger.log(`Schéma ${schemaName} créé avec succès`);
        }
        catch (error) {
            this.logger.error(`Erreur lors de la création du schéma ${schemaName}: ${getErrorMessage(error)}`);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async dropTenantSchema(schemaName) {
        const queryRunner = this.dataSource.createQueryRunner();
        try {
            await queryRunner.connect();
            this.logger.log(`Suppression du schéma: ${schemaName}`);
            await queryRunner.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
            this.logger.log(`Schéma ${schemaName} supprimé`);
        }
        catch (error) {
            this.logger.error(`Erreur lors de la suppression du schéma ${schemaName}: ${getErrorMessage(error)}`);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async seedTenantData(schemaName, adminEmail, adminPassword) {
        const queryRunner = this.dataSource.createQueryRunner();
        try {
            await queryRunner.connect();
            this.logger.log(`Insertion des données initiales dans ${schemaName}`);
            await queryRunner.query(`
        SET search_path TO "${schemaName}";
        INSERT INTO annee_academique (libelle, date_debut, date_fin, active)
        VALUES ('2025-2026', '2025-09-01', '2026-07-31', TRUE)
        ON CONFLICT DO NOTHING;
      `);
            await queryRunner.query(`
        SET search_path TO "${schemaName}";
        INSERT INTO utilisateur (email, password_hash, nom, prenom, role, actif, email_verifie)
        VALUES (
          '${adminEmail}',
          crypt('${adminPassword}', gen_salt('bf')),
          'ADMIN',
          'Système',
          'admin',
          TRUE,
          TRUE
        )
        ON CONFLICT (email) DO NOTHING;
      `);
            await queryRunner.query(`
        SET search_path TO "${schemaName}";
        INSERT INTO departement (code, nom) VALUES
          ('INFO', 'Département Informatique et Numérique'),
          ('GESTION', 'Département Gestion et Commerce'),
          ('DROIT', 'Département Droit et Sciences Politiques')
        ON CONFLICT DO NOTHING;
      `);
            await queryRunner.query(`
        SET search_path TO "${schemaName}";
        INSERT INTO batiment (nom, code) VALUES
          ('Bloc A - Sciences', 'BLOCA'),
          ('Bloc B - Administration', 'BLOCB'),
          ('Amphithéâtre Central', 'AMPHI')
        ON CONFLICT DO NOTHING;
      `);
            this.logger.log(`Données initiales insérées dans ${schemaName}`);
        }
        catch (error) {
            this.logger.error(`Erreur lors du seed de ${schemaName}: ${getErrorMessage(error)}`);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    splitSqlScript(script) {
        const statements = [];
        let current = '';
        let inDollarQuote = false;
        let dollarTag = '';
        for (let i = 0; i < script.length; i++) {
            const char = script[i];
            const nextChars = script.substring(i, i + 10);
            if (!inDollarQuote && char === '$') {
                const match = nextChars.match(/\$(\w*)\$/);
                if (match) {
                    inDollarQuote = true;
                    dollarTag = match[1];
                    current += match[0];
                    i += match[0].length - 1;
                    continue;
                }
            }
            if (inDollarQuote && char === '$') {
                const endTag = `$${dollarTag}$`;
                if (script.substring(i, i + endTag.length) === endTag) {
                    inDollarQuote = false;
                    dollarTag = '';
                    current += endTag;
                    i += endTag.length - 1;
                    continue;
                }
            }
            if (!inDollarQuote && char === ';') {
                statements.push(current);
                current = '';
                continue;
            }
            current += char;
        }
        if (current.trim()) {
            statements.push(current);
        }
        return statements;
    }
};
exports.TenantCreationService = TenantCreationService;
exports.TenantCreationService = TenantCreationService = TenantCreationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], TenantCreationService);
//# sourceMappingURL=tenant-creation.service.js.map