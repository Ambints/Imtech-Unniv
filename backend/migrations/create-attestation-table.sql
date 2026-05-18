-- ================================================================
-- MIGRATION: Création table attestation
-- Date: 2026-05-18
-- Description: Ajout d'une table dédiée pour les attestations
-- ================================================================

-- Fonction pour créer la table dans un schema tenant
CREATE OR REPLACE FUNCTION create_attestation_table_in_schema(schema_name TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('
    -- Table attestation
    CREATE TABLE IF NOT EXISTS %I.attestation (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      etudiant_id UUID NOT NULL,
      inscription_id UUID,
      type_attestation VARCHAR(50) NOT NULL,
      numero_attestation VARCHAR(50) UNIQUE NOT NULL,
      annee_academique_id UUID,
      date_emission DATE DEFAULT CURRENT_DATE,
      date_validite DATE,
      statut VARCHAR(20) DEFAULT ''en_attente'',
      motif TEXT,
      observations TEXT,
      delivre_par UUID,
      date_delivrance TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      
      -- Contraintes
      CONSTRAINT fk_attestation_etudiant FOREIGN KEY (etudiant_id) 
        REFERENCES %I.etudiant(id) ON DELETE CASCADE,
      CONSTRAINT fk_attestation_inscription FOREIGN KEY (inscription_id) 
        REFERENCES %I.inscription(id) ON DELETE SET NULL,
      CONSTRAINT fk_attestation_annee FOREIGN KEY (annee_academique_id) 
        REFERENCES %I.annee_academique(id) ON DELETE SET NULL,
      CONSTRAINT fk_attestation_delivre_par FOREIGN KEY (delivre_par) 
        REFERENCES %I.utilisateur(id) ON DELETE SET NULL,
      CONSTRAINT chk_attestation_type CHECK (type_attestation IN (
        ''inscription'', ''scolarite'', ''reussite'', ''presence'', ''stage''
      )),
      CONSTRAINT chk_attestation_statut CHECK (statut IN (
        ''en_attente'', ''validee'', ''delivree'', ''annulee''
      ))
    );
    
    -- Index pour performances
    CREATE INDEX IF NOT EXISTS idx_attestation_etudiant ON %I.attestation(etudiant_id);
    CREATE INDEX IF NOT EXISTS idx_attestation_type ON %I.attestation(type_attestation);
    CREATE INDEX IF NOT EXISTS idx_attestation_statut ON %I.attestation(statut);
    CREATE INDEX IF NOT EXISTS idx_attestation_numero ON %I.attestation(numero_attestation);
    CREATE INDEX IF NOT EXISTS idx_attestation_date_emission ON %I.attestation(date_emission);
    
    -- Trigger pour updated_at
    CREATE TRIGGER update_attestation_updated_at
      BEFORE UPDATE ON %I.attestation
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  ', schema_name, schema_name, schema_name, schema_name, schema_name, 
     schema_name, schema_name, schema_name, schema_name, schema_name, schema_name);
  
  RAISE NOTICE 'Table attestation créée dans le schéma %', schema_name;
END;
$$ LANGUAGE plpgsql;

-- Appliquer la migration à tous les schémas tenant existants
DO $$
DECLARE
  tenant_record RECORD;
BEGIN
  FOR tenant_record IN 
    SELECT schema_name 
    FROM public.tenant 
    WHERE actif = true
  LOOP
    PERFORM create_attestation_table_in_schema(tenant_record.schema_name);
  END LOOP;
  
  RAISE NOTICE 'Migration terminée pour tous les tenants';
END $$;

-- Nettoyer la fonction temporaire
DROP FUNCTION IF EXISTS create_attestation_table_in_schema(TEXT);

-- ================================================================
-- COMMENTAIRES
-- ================================================================

COMMENT ON TABLE tenant_ispm.attestation IS 'Table des attestations et certificats délivrés aux étudiants';
COMMENT ON COLUMN tenant_ispm.attestation.type_attestation IS 'Type: inscription, scolarite, reussite, presence, stage';
COMMENT ON COLUMN tenant_ispm.attestation.statut IS 'Statut: en_attente, validee, delivree, annulee';
COMMENT ON COLUMN tenant_ispm.attestation.numero_attestation IS 'Numéro unique généré automatiquement';

-- ================================================================
-- FIN MIGRATION
-- ================================================================

-- Made with Bob
