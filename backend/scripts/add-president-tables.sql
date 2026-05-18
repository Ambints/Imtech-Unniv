-- =====================================================
-- SCRIPT SQL - TABLES ET COLONNES MODULE PRÉSIDENT
-- IMTECH UNIVERSITY - Multi-tenant
-- =====================================================
-- Ce script ajoute les tables et colonnes nécessaires
-- pour le module Président dans chaque schéma tenant
-- =====================================================

-- FONCTION POUR APPLIQUER LES MODIFICATIONS À UN TENANT
CREATE OR REPLACE FUNCTION add_president_tables_to_tenant(tenant_schema TEXT)
RETURNS void AS $$
BEGIN
  -- Validation du schéma
  IF tenant_schema !~ '^tenant_[a-z0-9_]+$' THEN
    RAISE EXCEPTION 'Nom de schéma invalide: %', tenant_schema;
  END IF;

  RAISE NOTICE 'Application des modifications au schéma: %', tenant_schema;

  -- =====================================================
  -- 1. TABLE CONVENTION (Signatures conventions)
  -- =====================================================
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.convention (
      id SERIAL PRIMARY KEY,
      intitule VARCHAR(255) NOT NULL,
      partenaire VARCHAR(255) NOT NULL,
      type_partenaire VARCHAR(50) NOT NULL CHECK (type_partenaire IN (''eglise'', ''diocese'', ''etat'', ''entreprise'', ''universite'')),
      objet_convention TEXT NOT NULL,
      date_proposee DATE NOT NULL,
      document_url TEXT,
      statut VARCHAR(50) NOT NULL DEFAULT ''en_attente_signature'' CHECK (statut IN (''en_attente_signature'', ''signee'', ''rejetee'', ''expiree'')),
      signe_president BOOLEAN DEFAULT false,
      date_signature TIMESTAMP,
      signature_hash VARCHAR(255),
      representant_partenaire VARCHAR(255),
      date_effet DATE,
      remarques_president TEXT,
      cree_par INTEGER,
      cree_le TIMESTAMP DEFAULT NOW(),
      modifie_le TIMESTAMP DEFAULT NOW()
    )', tenant_schema);

  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_convention_statut ON %I.convention(statut)', tenant_schema);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_convention_type_partenaire ON %I.convention(type_partenaire)', tenant_schema);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_convention_date_proposee ON %I.convention(date_proposee)', tenant_schema);

  RAISE NOTICE '✓ Table convention créée';

  -- =====================================================
  -- 2. TABLE DELEGATION_SIGNATURE (Délégations)
  -- =====================================================
  -- Créer la table delegation_signature SANS contrainte FK
  -- La contrainte FK sera ajoutée manuellement plus tard si nécessaire
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.delegation_signature (
      id SERIAL PRIMARY KEY,
      delegataire_id INTEGER NOT NULL,
      types_actes TEXT[] NOT NULL,
      date_debut DATE NOT NULL,
      date_fin DATE NOT NULL,
      conditions TEXT,
      revoquee BOOLEAN DEFAULT false,
      revoquee_le TIMESTAMP,
      revoquee_par INTEGER,
      cree_par INTEGER NOT NULL,
      cree_le TIMESTAMP DEFAULT NOW(),
      CONSTRAINT check_dates CHECK (date_fin > date_debut)
    )', tenant_schema);

  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_delegation_delegataire ON %I.delegation_signature(delegataire_id)', tenant_schema);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_delegation_dates ON %I.delegation_signature(date_debut, date_fin)', tenant_schema);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_delegation_revoquee ON %I.delegation_signature(revoquee)', tenant_schema);

  RAISE NOTICE '✓ Table delegation_signature créée';

  -- =====================================================
  -- 3. COLONNES TABLE CONTRAT_PERSONNEL
  -- =====================================================
  -- Vérifier et ajouter les colonnes si elles n'existent pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = tenant_schema 
    AND table_name = 'contrat_personnel' 
    AND column_name = 'valide_par'
  ) THEN
    EXECUTE format('ALTER TABLE %I.contrat_personnel ADD COLUMN valide_par INTEGER', tenant_schema);
    RAISE NOTICE '✓ Colonne valide_par ajoutée à contrat_personnel';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = tenant_schema 
    AND table_name = 'contrat_personnel' 
    AND column_name = 'valide_le'
  ) THEN
    EXECUTE format('ALTER TABLE %I.contrat_personnel ADD COLUMN valide_le TIMESTAMP', tenant_schema);
    RAISE NOTICE '✓ Colonne valide_le ajoutée à contrat_personnel';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = tenant_schema 
    AND table_name = 'contrat_personnel' 
    AND column_name = 'commentaire_president'
  ) THEN
    EXECUTE format('ALTER TABLE %I.contrat_personnel ADD COLUMN commentaire_president TEXT', tenant_schema);
    RAISE NOTICE '✓ Colonne commentaire_president ajoutée à contrat_personnel';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = tenant_schema 
    AND table_name = 'contrat_personnel' 
    AND column_name = 'conditions_speciales'
  ) THEN
    EXECUTE format('ALTER TABLE %I.contrat_personnel ADD COLUMN conditions_speciales TEXT', tenant_schema);
    RAISE NOTICE '✓ Colonne conditions_speciales ajoutée à contrat_personnel';
  END IF;

  -- =====================================================
  -- 4. COLONNES TABLE DEPENSE
  -- =====================================================
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = tenant_schema 
    AND table_name = 'depense' 
    AND column_name = 'valide_par_president'
  ) THEN
    EXECUTE format('ALTER TABLE %I.depense ADD COLUMN valide_par_president INTEGER', tenant_schema);
    RAISE NOTICE '✓ Colonne valide_par_president ajoutée à depense';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = tenant_schema 
    AND table_name = 'depense' 
    AND column_name = 'valide_le'
  ) THEN
    EXECUTE format('ALTER TABLE %I.depense ADD COLUMN valide_le TIMESTAMP', tenant_schema);
    RAISE NOTICE '✓ Colonne valide_le ajoutée à depense';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = tenant_schema 
    AND table_name = 'depense' 
    AND column_name = 'motif_decision'
  ) THEN
    EXECUTE format('ALTER TABLE %I.depense ADD COLUMN motif_decision TEXT', tenant_schema);
    RAISE NOTICE '✓ Colonne motif_decision ajoutée à depense';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = tenant_schema 
    AND table_name = 'depense' 
    AND column_name = 'conditions_speciales'
  ) THEN
    EXECUTE format('ALTER TABLE %I.depense ADD COLUMN conditions_speciales TEXT', tenant_schema);
    RAISE NOTICE '✓ Colonne conditions_speciales ajoutée à depense';
  END IF;

  -- =====================================================
  -- 5. COLONNES TABLE DIPLOME
  -- =====================================================
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = tenant_schema 
    AND table_name = 'diplome' 
    AND column_name = 'signe_president'
  ) THEN
    EXECUTE format('ALTER TABLE %I.diplome ADD COLUMN signe_president BOOLEAN DEFAULT false', tenant_schema);
    RAISE NOTICE '✓ Colonne signe_president ajoutée à diplome';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = tenant_schema 
    AND table_name = 'diplome' 
    AND column_name = 'date_signature'
  ) THEN
    EXECUTE format('ALTER TABLE %I.diplome ADD COLUMN date_signature TIMESTAMP', tenant_schema);
    RAISE NOTICE '✓ Colonne date_signature ajoutée à diplome';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = tenant_schema 
    AND table_name = 'diplome' 
    AND column_name = 'signature_hash'
  ) THEN
    EXECUTE format('ALTER TABLE %I.diplome ADD COLUMN signature_hash VARCHAR(255)', tenant_schema);
    RAISE NOTICE '✓ Colonne signature_hash ajoutée à diplome';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = tenant_schema 
    AND table_name = 'diplome' 
    AND column_name = 'mention_speciale'
  ) THEN
    EXECUTE format('ALTER TABLE %I.diplome ADD COLUMN mention_speciale TEXT', tenant_schema);
    RAISE NOTICE '✓ Colonne mention_speciale ajoutée à diplome';
  END IF;

  -- =====================================================
  -- 6. COLONNES TABLE CONSEIL_DISCIPLINE (si elle existe)
  -- =====================================================
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = tenant_schema
    AND table_name = 'conseil_discipline'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = tenant_schema
      AND table_name = 'conseil_discipline'
      AND column_name = 'decision_president'
    ) THEN
      EXECUTE format('ALTER TABLE %I.conseil_discipline ADD COLUMN decision_president VARCHAR(50)', tenant_schema);
      RAISE NOTICE '✓ Colonne decision_president ajoutée à conseil_discipline';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = tenant_schema
      AND table_name = 'conseil_discipline'
      AND column_name = 'motivation'
    ) THEN
      EXECUTE format('ALTER TABLE %I.conseil_discipline ADD COLUMN motivation TEXT', tenant_schema);
      RAISE NOTICE '✓ Colonne motivation ajoutée à conseil_discipline';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = tenant_schema
      AND table_name = 'conseil_discipline'
      AND column_name = 'duree_suspension'
    ) THEN
      EXECUTE format('ALTER TABLE %I.conseil_discipline ADD COLUMN duree_suspension INTEGER', tenant_schema);
      RAISE NOTICE '✓ Colonne duree_suspension ajoutée à conseil_discipline';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = tenant_schema
      AND table_name = 'conseil_discipline'
      AND column_name = 'mesures_accompagnement'
    ) THEN
      EXECUTE format('ALTER TABLE %I.conseil_discipline ADD COLUMN mesures_accompagnement TEXT', tenant_schema);
      RAISE NOTICE '✓ Colonne mesures_accompagnement ajoutée à conseil_discipline';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = tenant_schema
      AND table_name = 'conseil_discipline'
      AND column_name = 'statue_le'
    ) THEN
      EXECUTE format('ALTER TABLE %I.conseil_discipline ADD COLUMN statue_le TIMESTAMP', tenant_schema);
      RAISE NOTICE '✓ Colonne statue_le ajoutée à conseil_discipline';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = tenant_schema
      AND table_name = 'conseil_discipline'
      AND column_name = 'statue_par'
    ) THEN
      EXECUTE format('ALTER TABLE %I.conseil_discipline ADD COLUMN statue_par INTEGER', tenant_schema);
      RAISE NOTICE '✓ Colonne statue_par ajoutée à conseil_discipline';
    END IF;
  ELSE
    RAISE NOTICE '⚠️  Table conseil_discipline non trouvée, colonnes non ajoutées';
  END IF;

  -- =====================================================
  -- 7. COLONNES TABLE PARCOURS
  -- =====================================================
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = tenant_schema 
    AND table_name = 'parcours' 
    AND column_name = 'date_ouverture'
  ) THEN
    EXECUTE format('ALTER TABLE %I.parcours ADD COLUMN date_ouverture DATE', tenant_schema);
    RAISE NOTICE '✓ Colonne date_ouverture ajoutée à parcours';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = tenant_schema 
    AND table_name = 'parcours' 
    AND column_name = 'motif_ouverture'
  ) THEN
    EXECUTE format('ALTER TABLE %I.parcours ADD COLUMN motif_ouverture TEXT', tenant_schema);
    RAISE NOTICE '✓ Colonne motif_ouverture ajoutée à parcours';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = tenant_schema 
    AND table_name = 'parcours' 
    AND column_name = 'conditions_ouverture'
  ) THEN
    EXECUTE format('ALTER TABLE %I.parcours ADD COLUMN conditions_ouverture TEXT', tenant_schema);
    RAISE NOTICE '✓ Colonne conditions_ouverture ajoutée à parcours';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = tenant_schema 
    AND table_name = 'parcours' 
    AND column_name = 'date_fermeture'
  ) THEN
    EXECUTE format('ALTER TABLE %I.parcours ADD COLUMN date_fermeture DATE', tenant_schema);
    RAISE NOTICE '✓ Colonne date_fermeture ajoutée à parcours';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = tenant_schema 
    AND table_name = 'parcours' 
    AND column_name = 'motif_fermeture'
  ) THEN
    EXECUTE format('ALTER TABLE %I.parcours ADD COLUMN motif_fermeture TEXT', tenant_schema);
    RAISE NOTICE '✓ Colonne motif_fermeture ajoutée à parcours';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = tenant_schema 
    AND table_name = 'parcours' 
    AND column_name = 'valide_par_president'
  ) THEN
    EXECUTE format('ALTER TABLE %I.parcours ADD COLUMN valide_par_president INTEGER', tenant_schema);
    RAISE NOTICE '✓ Colonne valide_par_president ajoutée à parcours';
  END IF;

  -- =====================================================
  -- 8. COLONNES TABLE CALENDRIER_ACADEMIQUE
  -- =====================================================
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = tenant_schema 
    AND table_name = 'calendrier_academique' 
    AND column_name = 'valide_par_president'
  ) THEN
    EXECUTE format('ALTER TABLE %I.calendrier_academique ADD COLUMN valide_par_president INTEGER', tenant_schema);
    RAISE NOTICE '✓ Colonne valide_par_president ajoutée à calendrier_academique';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = tenant_schema 
    AND table_name = 'calendrier_academique' 
    AND column_name = 'valide_le'
  ) THEN
    EXECUTE format('ALTER TABLE %I.calendrier_academique ADD COLUMN valide_le TIMESTAMP', tenant_schema);
    RAISE NOTICE '✓ Colonne valide_le ajoutée à calendrier_academique';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = tenant_schema 
    AND table_name = 'calendrier_academique' 
    AND column_name = 'commentaire_president'
  ) THEN
    EXECUTE format('ALTER TABLE %I.calendrier_academique ADD COLUMN commentaire_president TEXT', tenant_schema);
    RAISE NOTICE '✓ Colonne commentaire_president ajoutée à calendrier_academique';
  END IF;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Modifications appliquées avec succès au schéma: %', tenant_schema;
  RAISE NOTICE '========================================';

END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTAIRES SUR LES TABLES
-- =====================================================
COMMENT ON FUNCTION add_president_tables_to_tenant IS 
'Ajoute les tables et colonnes nécessaires pour le module Président dans un schéma tenant';

-- Made with Bob
