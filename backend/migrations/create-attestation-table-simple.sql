-- Script de création de la table attestation pour tous les tenants
-- À exécuter manuellement dans PostgreSQL

-- Fonction pour créer la table dans un schéma donné
CREATE OR REPLACE FUNCTION create_attestation_table_in_schema(schema_name TEXT) 
RETURNS void AS $$
BEGIN
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.attestation (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            etudiant_id UUID NOT NULL REFERENCES %I.etudiant(id) ON DELETE CASCADE,
            inscription_id UUID REFERENCES %I.inscription(id) ON DELETE SET NULL,
            type_attestation VARCHAR(50) NOT NULL,
            numero_attestation VARCHAR(100) UNIQUE NOT NULL,
            annee_academique_id UUID REFERENCES %I.annee_academique(id) ON DELETE SET NULL,
            motif TEXT,
            observations TEXT,
            statut VARCHAR(20) DEFAULT ''en_attente'' CHECK (statut IN (''en_attente'', ''validee'', ''rejetee'', ''delivree'', ''annulee'')),
            date_emission TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            date_validation TIMESTAMP,
            validateur_id UUID REFERENCES %I.utilisateur(id) ON DELETE SET NULL,
            motif_rejet TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_attestation_etudiant ON %I.attestation(etudiant_id);
        CREATE INDEX IF NOT EXISTS idx_attestation_statut ON %I.attestation(statut);
        CREATE INDEX IF NOT EXISTS idx_attestation_type ON %I.attestation(type_attestation);
        CREATE INDEX IF NOT EXISTS idx_attestation_numero ON %I.attestation(numero_attestation);
    ', schema_name, schema_name, schema_name, schema_name, schema_name, schema_name, schema_name, schema_name, schema_name);
    
    RAISE NOTICE 'Table attestation créée dans le schéma %', schema_name;
END;
$$ LANGUAGE plpgsql;

-- Appliquer à tous les schémas tenant existants
DO $$
DECLARE
    tenant_schema TEXT;
BEGIN
    FOR tenant_schema IN 
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name LIKE 'tenant_%'
    LOOP
        PERFORM create_attestation_table_in_schema(tenant_schema);
    END LOOP;
END $$;

-- Nettoyer la fonction temporaire
DROP FUNCTION IF EXISTS create_attestation_table_in_schema(TEXT);

-- Vérification
SELECT 
    schemaname, 
    tablename 
FROM pg_tables 
WHERE tablename = 'attestation' 
AND schemaname LIKE 'tenant_%'
ORDER BY schemaname;

-- Made with Bob
