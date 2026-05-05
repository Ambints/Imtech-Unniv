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
            this.logger.log(`🔧 Création du schéma: ${schemaName}`);
            const createSchemaResult = await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
            this.logger.log(`✅ Schéma ${schemaName} créé ou déjà existant`);
            const schemaCheck = await queryRunner.query(`
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name = $1
      `, [schemaName]);
            if (schemaCheck.length === 0) {
                throw new Error(`Le schéma ${schemaName} n'a pas été créé correctement`);
            }
            this.logger.log(`✅ Vérification: schéma ${schemaName} existe dans la base`);
            this.logger.log(`🔧 Création des extensions PostgreSQL...`);
            await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public`);
            await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA public`);
            this.logger.log(`✅ Extensions créées dans le schéma public`);
            const sqlPath = process.env.NODE_ENV === 'production'
                ? (0, path_1.join)(__dirname, 'tenant-schema.sql')
                : (0, path_1.join)(__dirname, '../../src/tenants/tenant-schema.sql');
            this.logger.log(`📄 Lecture du script SQL: ${sqlPath}`);
            let sqlScript = (0, fs_1.readFileSync)(sqlPath, 'utf-8');
            this.logger.log(`🔧 Initialisation des tables dans ${schemaName}`);
            await queryRunner.query(`SET search_path TO "${schemaName}"`);
            this.logger.log(`✅ search_path défini sur ${schemaName}`);
            const statements = this.parseSqlStatements(sqlScript);
            this.logger.log(`📊 ${statements.length} instructions SQL à exécuter`);
            let successCount = 0;
            let skipCount = 0;
            for (let i = 0; i < statements.length; i++) {
                const stmt = statements[i];
                try {
                    await queryRunner.query(stmt);
                    successCount++;
                    if ((i + 1) % 10 === 0) {
                        this.logger.log(`   ⏳ Progression: ${i + 1}/${statements.length} instructions exécutées`);
                    }
                }
                catch (error) {
                    const msg = getErrorMessage(error);
                    if (!msg.includes('already exists') && !msg.includes('n\'existe pas') && !msg.includes('does not exist')) {
                        this.logger.error(`❌ Instruction ${i + 1} ÉCHOUÉE:`);
                        this.logger.error(`   SQL: ${stmt.substring(0, 200)}...`);
                        this.logger.error(`   Erreur: ${msg}`);
                    }
                    skipCount++;
                }
            }
            this.logger.log(`✅ Exécution terminée: ${successCount} réussies, ${skipCount} ignorées`);
            await queryRunner.query(`SET search_path TO public`);
            const tableCheck = await queryRunner.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = $1
        LIMIT 5
      `, [schemaName]);
            this.logger.log(`✅ ${tableCheck.length} tables créées dans ${schemaName}`);
            if (tableCheck.length > 0) {
                this.logger.log(`   Tables: ${tableCheck.map((t) => t.table_name).join(', ')}`);
            }
            this.logger.log(`🎉 Schéma ${schemaName} créé avec succès avec toutes ses tables`);
        }
        catch (error) {
            this.logger.error(`❌ Erreur lors de la création du schéma ${schemaName}: ${getErrorMessage(error)}`);
            this.logger.error(`Stack trace: ${error instanceof Error ? error.stack : 'N/A'}`);
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
            await queryRunner.query(`SET search_path TO "${schemaName}"`);
            await queryRunner.query(`
        INSERT INTO annee_academique (libelle, date_debut, date_fin, active)
        VALUES ('2025-2026', '2025-09-01', '2026-07-31', TRUE)
        ON CONFLICT DO NOTHING
      `);
            await queryRunner.query(`
        INSERT INTO utilisateur (email, password_hash, nom, prenom, role, actif, email_verifie)
        VALUES (
          $1,
          public.crypt($2, public.gen_salt('bf')),
          'ADMIN',
          'Système',
          'admin',
          TRUE,
          TRUE
        )
        ON CONFLICT (email) DO NOTHING
      `, [adminEmail, adminPassword]);
            await queryRunner.query(`
        INSERT INTO departement (code, nom) VALUES
          ('INFO', 'Département Informatique et Numérique'),
          ('GESTION', 'Département Gestion et Commerce'),
          ('DROIT', 'Département Droit et Sciences Politiques')
        ON CONFLICT DO NOTHING
      `);
            await queryRunner.query(`
        INSERT INTO batiment (nom, code) VALUES
          ('Bloc A - Sciences', 'BLOCA'),
          ('Bloc B - Administration', 'BLOCB'),
          ('Amphithéâtre Central', 'AMPHI')
        ON CONFLICT DO NOTHING
      `);
            await queryRunner.query(`SET search_path TO public`);
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
    parseSqlStatements(script) {
        const statements = [];
        let current = '';
        let inBlockComment = false;
        let inLineComment = false;
        let inDollarQuote = false;
        let dollarTag = '';
        for (let i = 0; i < script.length; i++) {
            const char = script[i];
            const nextChar = script[i + 1] || '';
            if (!inBlockComment && !inLineComment && !inDollarQuote && char === '/' && nextChar === '*') {
                inBlockComment = true;
                i++;
                continue;
            }
            if (inBlockComment && char === '*' && nextChar === '/') {
                inBlockComment = false;
                i++;
                continue;
            }
            if (inBlockComment || inLineComment) {
                if (inLineComment && char === '\n') {
                    inLineComment = false;
                }
                continue;
            }
            if (!inDollarQuote && char === '-' && nextChar === '-') {
                inLineComment = true;
                i++;
                continue;
            }
            if (!inDollarQuote && char === '$') {
                const remaining = script.substring(i);
                const match = remaining.match(/^\$(\w*)\$/);
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
                const remaining = script.substring(i);
                if (remaining.startsWith(endTag)) {
                    inDollarQuote = false;
                    current += endTag;
                    i += endTag.length - 1;
                    continue;
                }
            }
            if (!inDollarQuote && char === ';') {
                const trimmed = current.trim();
                if (trimmed) {
                    statements.push(trimmed + ';');
                }
                current = '';
                continue;
            }
            current += char;
        }
        const trimmed = current.trim();
        if (trimmed) {
            statements.push(trimmed + (trimmed.endsWith(';') ? '' : ';'));
        }
        return statements.filter(s => s.length > 0 && !s.startsWith('--'));
    }
};
exports.TenantCreationService = TenantCreationService;
exports.TenantCreationService = TenantCreationService = TenantCreationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], TenantCreationService);
//# sourceMappingURL=tenant-creation.service.js.map