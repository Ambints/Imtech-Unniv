-- =============================================================================
-- MIGRATION: ALIGNEMENT DU SCHÉMA TENANT AVEC LA PRODUCTION
-- Date: 2026-05-18
-- Description: Ajoute les tables et colonnes manquantes identifiées dans BD.sql
-- =============================================================================
-- IMPORTANT: Ce script doit être exécuté sur chaque schéma tenant existant
-- Utilisation: SELECT apply_tenant_schema_alignment('tenant_nom');
-- =============================================================================

CREATE OR REPLACE FUNCTION public.apply_tenant_schema_alignment(p_schema_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    v_result text := '';
BEGIN
    -- Validation du schéma
    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = p_schema_name) THEN
        RETURN 'ERREUR: Le schéma ' || p_schema_name || ' n''existe pas';
    END IF;

    RAISE NOTICE '🚀 Début de l''alignement du schéma: %', p_schema_name;

    -- =============================================================================
    -- ÉTAPE 1: AJOUT DES COLONNES MANQUANTES
    -- =============================================================================
    RAISE NOTICE '📝 Ajout des colonnes manquantes...';

    -- Table: utilisateur
    EXECUTE format('ALTER TABLE %I.utilisateur ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(100)', p_schema_name);
    EXECUTE format('ALTER TABLE %I.utilisateur ADD COLUMN IF NOT EXISTS parcours_assignes JSONB', p_schema_name);

    -- Table: parcours
    EXECUTE format('ALTER TABLE %I.parcours ADD COLUMN IF NOT EXISTS date_ouverture DATE', p_schema_name);
    EXECUTE format('ALTER TABLE %I.parcours ADD COLUMN IF NOT EXISTS motif_ouverture TEXT', p_schema_name);
    EXECUTE format('ALTER TABLE %I.parcours ADD COLUMN IF NOT EXISTS conditions_ouverture TEXT', p_schema_name);
    EXECUTE format('ALTER TABLE %I.parcours ADD COLUMN IF NOT EXISTS date_fermeture DATE', p_schema_name);
    EXECUTE format('ALTER TABLE %I.parcours ADD COLUMN IF NOT EXISTS motif_fermeture TEXT', p_schema_name);
    EXECUTE format('ALTER TABLE %I.parcours ADD COLUMN IF NOT EXISTS valide_par_president UUID', p_schema_name);

    -- Table: contrat_personnel
    EXECUTE format('ALTER TABLE %I.contrat_personnel ADD COLUMN IF NOT EXISTS valide_par UUID', p_schema_name);
    EXECUTE format('ALTER TABLE %I.contrat_personnel ADD COLUMN IF NOT EXISTS valide_le TIMESTAMPTZ', p_schema_name);
    EXECUTE format('ALTER TABLE %I.contrat_personnel ADD COLUMN IF NOT EXISTS commentaire_president TEXT', p_schema_name);
    EXECUTE format('ALTER TABLE %I.contrat_personnel ADD COLUMN IF NOT EXISTS conditions_speciales TEXT', p_schema_name);

    -- Table: depense
    EXECUTE format('ALTER TABLE %I.depense ADD COLUMN IF NOT EXISTS valide_par_president UUID', p_schema_name);
    EXECUTE format('ALTER TABLE %I.depense ADD COLUMN IF NOT EXISTS valide_le TIMESTAMPTZ', p_schema_name);
    EXECUTE format('ALTER TABLE %I.depense ADD COLUMN IF NOT EXISTS motif_decision TEXT', p_schema_name);
    EXECUTE format('ALTER TABLE %I.depense ADD COLUMN IF NOT EXISTS conditions_speciales TEXT', p_schema_name);

    -- Table: calendrier_academique
    EXECUTE format('ALTER TABLE %I.calendrier_academique ADD COLUMN IF NOT EXISTS valide_par_president UUID', p_schema_name);
    EXECUTE format('ALTER TABLE %I.calendrier_academique ADD COLUMN IF NOT EXISTS valide_le TIMESTAMPTZ', p_schema_name);
    EXECUTE format('ALTER TABLE %I.calendrier_academique ADD COLUMN IF NOT EXISTS commentaire_president TEXT', p_schema_name);

    -- Table: grille_tarifaire
    EXECUTE format('ALTER TABLE %I.grille_tarifaire ADD COLUMN IF NOT EXISTS montant_inscription NUMERIC(10,2)', p_schema_name);
    EXECUTE format('ALTER TABLE %I.grille_tarifaire ADD COLUMN IF NOT EXISTS montant_scolarite NUMERIC(10,2)', p_schema_name);
    EXECUTE format('ALTER TABLE %I.grille_tarifaire ADD COLUMN IF NOT EXISTS date_limite_paiement DATE', p_schema_name);
    EXECUTE format('ALTER TABLE %I.grille_tarifaire ADD COLUMN IF NOT EXISTS modalites_paiement TEXT', p_schema_name);

    -- Table: paiement
    EXECUTE format('ALTER TABLE %I.paiement ADD COLUMN IF NOT EXISTS type_paiement VARCHAR(50)', p_schema_name);
    EXECUTE format('ALTER TABLE %I.paiement ADD COLUMN IF NOT EXISTS cloture_caisse_id UUID', p_schema_name);
    EXECUTE format('ALTER TABLE %I.paiement ADD COLUMN IF NOT EXISTS details_paiement JSONB', p_schema_name);

    -- =============================================================================
    -- ÉTAPE 2: CRÉATION DES SÉQUENCES
    -- =============================================================================
    RAISE NOTICE '🔢 Création des séquences...';

    EXECUTE format('CREATE SEQUENCE IF NOT EXISTS %I.seq_recu START 1', p_schema_name);
    EXECUTE format('CREATE SEQUENCE IF NOT EXISTS %I.convention_id_seq START 1', p_schema_name);
    EXECUTE format('CREATE SEQUENCE IF NOT EXISTS %I.delegation_signature_id_seq START 1', p_schema_name);
    EXECUTE format('CREATE SEQUENCE IF NOT EXISTS %I.evaluation_personnel_id_seq START 1', p_schema_name);

    -- =============================================================================
    -- ÉTAPE 3: CRÉATION DES TABLES MANQUANTES
    -- =============================================================================
    RAISE NOTICE '📊 Création des tables manquantes...';

    -- Table: archive_scolarite
    EXECUTE format($table$
        CREATE TABLE IF NOT EXISTS %I.archive_scolarite (
            id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
            etudiant_id UUID NOT NULL,
            type_document VARCHAR(50) NOT NULL CHECK (type_document IN (
                'releve_notes', 'attestation_reussite', 'diplome', 
                'suplement_diplome', 'certificat_scolarite', 'transcript'
            )),
            titre_document VARCHAR(200) NOT NULL,
            annee_academique VARCHAR(20) NOT NULL,
            semestre SMALLINT,
            fichier_original_url VARCHAR(500),
            fichier_pdf_url VARCHAR(500),
            hash_integrite VARCHAR(128),
            format VARCHAR(20) DEFAULT 'PDF',
            taille_octets BIGINT,
            langue VARCHAR(10) DEFAULT 'FR',
            acces_public BOOLEAN DEFAULT FALSE,
            date_limite_acces DATE,
            archive_par UUID NOT NULL,
            date_archivage TIMESTAMPTZ DEFAULT NOW(),
            duree_conservation INTEGER DEFAULT 10,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    $table$, p_schema_name);

    -- Table: attestation
    EXECUTE format($table$
        CREATE TABLE IF NOT EXISTS %I.attestation (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            etudiant_id UUID NOT NULL,
            inscription_id UUID,
            type_attestation VARCHAR(50) NOT NULL CHECK (type_attestation IN (
                'scolarite', 'reussite', 'inscription', 'preinscription', 'stage', 'autre'
            )),
            numero_attestation VARCHAR(100) NOT NULL,
            annee_academique_id UUID,
            motif TEXT,
            observations TEXT,
            statut VARCHAR(30) DEFAULT 'en_attente' CHECK (statut IN (
                'en_attente', 'validee', 'refusee', 'annulee'
            )),
            genere_par UUID,
            date_generation TIMESTAMP DEFAULT NOW(),
            fichier_url VARCHAR(500),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            date_emission TIMESTAMP DEFAULT NOW()
        )
    $table$, p_schema_name);

    -- Table: deliberation
    EXECUTE format($table$
        CREATE TABLE IF NOT EXISTS %I.deliberation (
            id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
            parcours_id UUID NOT NULL,
            annee_academique_id UUID NOT NULL,
            semestre SMALLINT NOT NULL,
            date_deliberation DATE NOT NULL,
            type_deliberation VARCHAR(50) DEFAULT 'ordinaire' CHECK (type_deliberation IN (
                'ordinaire', 'rattrapage', 'exceptionnelle'
            )),
            statut VARCHAR(30) DEFAULT 'planifiee' CHECK (statut IN (
                'planifiee', 'en_cours', 'terminee', 'annulee'
            )),
            president_jury_id UUID,
            secretaire_id UUID,
            membres_jury JSONB,
            observations TEXT,
            pv_genere BOOLEAN DEFAULT FALSE,
            pv_url VARCHAR(500),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    $table$, p_schema_name);

    -- Table: resultat_ue
    EXECUTE format($table$
        CREATE TABLE IF NOT EXISTS %I.resultat_ue (
            id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
            etudiant_id UUID NOT NULL,
            inscription_id UUID NOT NULL,
            ue_id UUID NOT NULL,
            semestre SMALLINT NOT NULL,
            moyenne NUMERIC(5,2),
            credits_obtenus INTEGER DEFAULT 0,
            statut VARCHAR(30) CHECK (statut IN ('valide', 'non_valide', 'en_cours', 'dispense')),
            session VARCHAR(20) DEFAULT 'normale' CHECK (session IN ('normale', 'rattrapage')),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    $table$, p_schema_name);

    -- Table: resultat_semestre
    EXECUTE format($table$
        CREATE TABLE IF NOT EXISTS %I.resultat_semestre (
            id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
            etudiant_id UUID NOT NULL,
            inscription_id UUID NOT NULL,
            semestre SMALLINT NOT NULL,
            moyenne_generale NUMERIC(5,2),
            credits_obtenus INTEGER DEFAULT 0,
            credits_requis INTEGER,
            decision VARCHAR(50) CHECK (decision IN (
                'admis', 'ajourné', 'redouble', 'exclu', 'en_attente'
            )),
            mention VARCHAR(50) CHECK (mention IN (
                'passable', 'assez_bien', 'bien', 'tres_bien', 'excellent', NULL
            )),
            rang INTEGER,
            effectif_classe INTEGER,
            deliberation_id UUID,
            observations TEXT,
            valide BOOLEAN DEFAULT FALSE,
            date_validation TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    $table$, p_schema_name);

    -- Table: verrouillage_notes
    EXECUTE format($table$
        CREATE TABLE IF NOT EXISTS %I.verrouillage_notes (
            id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
            ue_id UUID NOT NULL,
            semestre SMALLINT NOT NULL,
            annee_academique_id UUID NOT NULL,
            verrouille BOOLEAN DEFAULT FALSE,
            verrouille_par UUID,
            date_verrouillage TIMESTAMPTZ,
            motif TEXT,
            deverrouille_par UUID,
            date_deverrouillage TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    $table$, p_schema_name);

    -- Table: suplement_diplome
    EXECUTE format($table$
        CREATE TABLE IF NOT EXISTS %I.suplement_diplome (
            id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
            diplome_id UUID NOT NULL,
            etudiant_id UUID NOT NULL,
            parcours_suivi TEXT,
            competences_acquises TEXT,
            stages_effectues TEXT,
            projets_realises TEXT,
            activites_extra TEXT,
            langues_maitrisees JSONB,
            certifications JSONB,
            mobilite_internationale TEXT,
            systeme_notation TEXT,
            echelle_ects TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    $table$, p_schema_name);

    -- Table: transfert_etudiant
    EXECUTE format($table$
        CREATE TABLE IF NOT EXISTS %I.transfert_etudiant (
            id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
            etudiant_id UUID NOT NULL,
            parcours_origine_id UUID NOT NULL,
            parcours_destination_id UUID,
            etablissement_destination VARCHAR(200),
            type_transfert VARCHAR(50) NOT NULL CHECK (type_transfert IN (
                'interne', 'externe', 'reorientation'
            )),
            motif TEXT,
            date_demande DATE DEFAULT CURRENT_DATE,
            statut VARCHAR(30) DEFAULT 'en_attente' CHECK (statut IN (
                'en_attente', 'approuve', 'refuse', 'annule'
            )),
            traite_par UUID,
            date_traitement TIMESTAMPTZ,
            observations TEXT,
            documents_fournis JSONB,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    $table$, p_schema_name);

    -- Table: paiement_inscription
    EXECUTE format($table$
        CREATE TABLE IF NOT EXISTS %I.paiement_inscription (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            inscription_id UUID NOT NULL,
            montant_total NUMERIC(10,2) NOT NULL,
            montant_paye NUMERIC(10,2) DEFAULT 0,
            montant_restant NUMERIC(10,2),
            statut VARCHAR(30) DEFAULT 'impaye' CHECK (statut IN (
                'impaye', 'partiel', 'complet', 'exonere'
            )),
            date_limite DATE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    $table$, p_schema_name);

    -- =============================================================================
    -- ÉTAPE 4: CRÉATION DES INDEX MANQUANTS
    -- =============================================================================
    RAISE NOTICE '🔍 Création des index manquants...';

    -- Index unique partiel pour secretaire_parcours
    EXECUTE format('CREATE UNIQUE INDEX IF NOT EXISTS idx_secretaire_parcours_unique 
                    ON %I.secretaire_parcours(utilisateur_id, parcours_id) 
                    WHERE actif = true', p_schema_name);

    -- Index sur niveau_etude
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_niveau_etude_code ON %I.niveau_etude(code)', p_schema_name);

    -- Index sur alerte_discipline
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_alerte_discipline_etudiant ON %I.alerte_discipline(etudiant_id)', p_schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_alerte_discipline_date ON %I.alerte_discipline(date_alerte)', p_schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_alerte_discipline_gravite ON %I.alerte_discipline(gravite)', p_schema_name);

    -- Index sur pointage_qr
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_pointage_qr_code ON %I.pointage_qr(qr_code)', p_schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_pointage_qr_etudiant ON %I.pointage_qr(etudiant_id)', p_schema_name);

    -- Index sur presence_surveillance
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_presence_surveillance_etudiant ON %I.presence_surveillance(etudiant_id)', p_schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_presence_surveillance_date ON %I.presence_surveillance(date_presence)', p_schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_presence_surveillance_statut ON %I.presence_surveillance(statut)', p_schema_name);

    -- Index sur cloture_caisse
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_cloture_caisse_date ON %I.cloture_caisse(date_cloture)', p_schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_cloture_caisse_caissier ON %I.cloture_caisse(caissier_id)', p_schema_name);

    -- Index sur frais_inscription
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_frais_inscription_parcours ON %I.frais_inscription(parcours_id)', p_schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_frais_inscription_niveau ON %I.frais_inscription(niveau_etude_id)', p_schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_frais_inscription_annee ON %I.frais_inscription(annee_academique_id)', p_schema_name);

    -- Index sur archive_scolarite
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_archive_scolarite_etudiant ON %I.archive_scolarite(etudiant_id)', p_schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_archive_scolarite_type ON %I.archive_scolarite(type_document)', p_schema_name);

    -- Index sur attestation
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_attestation_etudiant ON %I.attestation(etudiant_id)', p_schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_attestation_numero ON %I.attestation(numero_attestation)', p_schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_attestation_statut ON %I.attestation(statut)', p_schema_name);

    -- Index sur deliberation
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_deliberation_parcours ON %I.deliberation(parcours_id)', p_schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_deliberation_annee ON %I.deliberation(annee_academique_id)', p_schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_deliberation_statut ON %I.deliberation(statut)', p_schema_name);

    -- Index sur resultat_ue
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_resultat_ue_etudiant ON %I.resultat_ue(etudiant_id)', p_schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_resultat_ue_inscription ON %I.resultat_ue(inscription_id)', p_schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_resultat_ue_ue ON %I.resultat_ue(ue_id)', p_schema_name);

    -- Index sur resultat_semestre
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_resultat_semestre_etudiant ON %I.resultat_semestre(etudiant_id)', p_schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_resultat_semestre_inscription ON %I.resultat_semestre(inscription_id)', p_schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_resultat_semestre_deliberation ON %I.resultat_semestre(deliberation_id)', p_schema_name);

    -- Index sur verrouillage_notes
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_verrouillage_notes_ue ON %I.verrouillage_notes(ue_id)', p_schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_verrouillage_notes_annee ON %I.verrouillage_notes(annee_academique_id)', p_schema_name);

    -- =============================================================================
    -- ÉTAPE 5: AJOUT DES FOREIGN KEYS
    -- =============================================================================
    RAISE NOTICE '🔗 Ajout des contraintes de clés étrangères...';

    -- FK pour archive_scolarite
    EXECUTE format('ALTER TABLE %I.archive_scolarite 
                    ADD CONSTRAINT IF NOT EXISTS fk_archive_etudiant 
                    FOREIGN KEY (etudiant_id) REFERENCES %I.etudiant(id)', 
                    p_schema_name, p_schema_name);

    -- FK pour attestation
    EXECUTE format('ALTER TABLE %I.attestation 
                    ADD CONSTRAINT IF NOT EXISTS fk_attestation_etudiant 
                    FOREIGN KEY (etudiant_id) REFERENCES %I.etudiant(id)', 
                    p_schema_name, p_schema_name);
    EXECUTE format('ALTER TABLE %I.attestation 
                    ADD CONSTRAINT IF NOT EXISTS fk_attestation_inscription 
                    FOREIGN KEY (inscription_id) REFERENCES %I.inscription(id)', 
                    p_schema_name, p_schema_name);

    -- FK pour deliberation
    EXECUTE format('ALTER TABLE %I.deliberation 
                    ADD CONSTRAINT IF NOT EXISTS fk_deliberation_parcours 
                    FOREIGN KEY (parcours_id) REFERENCES %I.parcours(id)', 
                    p_schema_name, p_schema_name);
    EXECUTE format('ALTER TABLE %I.deliberation 
                    ADD CONSTRAINT IF NOT EXISTS fk_deliberation_annee 
                    FOREIGN KEY (annee_academique_id) REFERENCES %I.annee_academique(id)', 
                    p_schema_name, p_schema_name);

    -- FK pour resultat_ue
    EXECUTE format('ALTER TABLE %I.resultat_ue 
                    ADD CONSTRAINT IF NOT EXISTS fk_resultat_ue_etudiant 
                    FOREIGN KEY (etudiant_id) REFERENCES %I.etudiant(id)', 
                    p_schema_name, p_schema_name);
    EXECUTE format('ALTER TABLE %I.resultat_ue 
                    ADD CONSTRAINT IF NOT EXISTS fk_resultat_ue_inscription 
                    FOREIGN KEY (inscription_id) REFERENCES %I.inscription(id)', 
                    p_schema_name, p_schema_name);
    EXECUTE format('ALTER TABLE %I.resultat_ue 
                    ADD CONSTRAINT IF NOT EXISTS fk_resultat_ue_ue 
                    FOREIGN KEY (ue_id) REFERENCES %I.unite_enseignement(id)', 
                    p_schema_name, p_schema_name);

    -- FK pour resultat_semestre
    EXECUTE format('ALTER TABLE %I.resultat_semestre 
                    ADD CONSTRAINT IF NOT EXISTS fk_resultat_semestre_etudiant 
                    FOREIGN KEY (etudiant_id) REFERENCES %I.etudiant(id)', 
                    p_schema_name, p_schema_name);
    EXECUTE format('ALTER TABLE %I.resultat_semestre 
                    ADD CONSTRAINT IF NOT EXISTS fk_resultat_semestre_inscription 
                    FOREIGN KEY (inscription_id) REFERENCES %I.inscription(id)', 
                    p_schema_name, p_schema_name);
    EXECUTE format('ALTER TABLE %I.resultat_semestre 
                    ADD CONSTRAINT IF NOT EXISTS fk_resultat_semestre_deliberation 
                    FOREIGN KEY (deliberation_id) REFERENCES %I.deliberation(id)', 
                    p_schema_name, p_schema_name);

    -- FK pour verrouillage_notes
    EXECUTE format('ALTER TABLE %I.verrouillage_notes 
                    ADD CONSTRAINT IF NOT EXISTS fk_verrouillage_ue 
                    FOREIGN KEY (ue_id) REFERENCES %I.unite_enseignement(id)', 
                    p_schema_name, p_schema_name);
    EXECUTE format('ALTER TABLE %I.verrouillage_notes 
                    ADD CONSTRAINT IF NOT EXISTS fk_verrouillage_annee 
                    FOREIGN KEY (annee_academique_id) REFERENCES %I.annee_academique(id)', 
                    p_schema_name, p_schema_name);

    -- FK pour suplement_diplome
    EXECUTE format('ALTER TABLE %I.suplement_diplome 
                    ADD CONSTRAINT IF NOT EXISTS fk_suplement_diplome 
                    FOREIGN KEY (diplome_id) REFERENCES %I.diplome(id)', 
                    p_schema_name, p_schema_name);
    EXECUTE format('ALTER TABLE %I.suplement_diplome 
                    ADD CONSTRAINT IF NOT EXISTS fk_suplement_etudiant 
                    FOREIGN KEY (etudiant_id) REFERENCES %I.etudiant(id)', 
                    p_schema_name, p_schema_name);

    -- FK pour transfert_etudiant
    EXECUTE format('ALTER TABLE %I.transfert_etudiant 
                    ADD CONSTRAINT IF NOT EXISTS fk_transfert_etudiant 
                    FOREIGN KEY (etudiant_id) REFERENCES %I.etudiant(id)', 
                    p_schema_name, p_schema_name);
    EXECUTE format('ALTER TABLE %I.transfert_etudiant 
                    ADD CONSTRAINT IF NOT EXISTS fk_transfert_parcours_origine 
                    FOREIGN KEY (parcours_origine_id) REFERENCES %I.parcours(id)', 
                    p_schema_name, p_schema_name);

    -- FK pour paiement_inscription
    EXECUTE format('ALTER TABLE %I.paiement_inscription 
                    ADD CONSTRAINT IF NOT EXISTS fk_paiement_inscription 
                    FOREIGN KEY (inscription_id) REFERENCES %I.inscription(id)', 
                    p_schema_name, p_schema_name);

    -- =============================================================================
    -- RÉSULTAT
    -- =============================================================================
    v_result := 'SUCCÈS: Schéma ' || p_schema_name || ' aligné avec succès';
    RAISE NOTICE '✅ %', v_result;
    
    RETURN v_result;

EXCEPTION
    WHEN OTHERS THEN
        v_result := 'ERREUR dans ' || p_schema_name || ': ' || SQLERRM;
        RAISE NOTICE '❌ %', v_result;
        RETURN v_result;
END;
$$;

-- =============================================================================
-- FONCTION D'APPLICATION SUR TOUS LES TENANTS
-- =============================================================================

CREATE OR REPLACE FUNCTION public.apply_alignment_to_all_tenants()
RETURNS TABLE(schema_name text, result text)
LANGUAGE plpgsql
AS $$
DECLARE
    tenant_schema RECORD;
BEGIN
    FOR tenant_schema IN 
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name LIKE 'tenant_%'
        ORDER BY schema_name
    LOOP
        schema_name := tenant_schema.schema_name;
        result := apply_tenant_schema_alignment(tenant_schema.schema_name);
        RETURN NEXT;
    END LOOP;
END;
$$;

-- =============================================================================
-- INSTRUCTIONS D'UTILISATION
-- =============================================================================
/*
-- Pour appliquer sur un seul tenant:
SELECT apply_tenant_schema_alignment('tenant_ispm');

-- Pour appliquer sur tous les tenants:
SELECT * FROM apply_alignment_to_all_tenants();

-- Pour vérifier les tables créées dans un tenant:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'tenant_ispm' 
ORDER BY table_name;
*/

-- Made with Bob
