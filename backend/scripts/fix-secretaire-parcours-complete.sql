-- =====================================================
-- Script de correction complète pour Secrétaire/Parcours
-- =====================================================
-- Ce script doit être exécuté sur chaque schéma tenant
-- Remplacer 'tenant_ispm' par le nom du schéma approprié

-- 1. Ajouter les colonnes manquantes à la table proces_verbal
ALTER TABLE tenant_ispm.proces_verbal
ADD COLUMN IF NOT EXISTS transmis_a_scolarite BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS date_transmission_scolarite TIMESTAMP,
ADD COLUMN IF NOT EXISTS transmis_par VARCHAR(255);

-- Mettre à jour les enregistrements existants
UPDATE tenant_ispm.proces_verbal
SET transmis_a_scolarite = CASE 
  WHEN statut = 'transmis_scolarite' THEN true 
  ELSE false 
END
WHERE transmis_a_scolarite IS NULL;

-- 2. Ajouter la colonne parcours_assignes à la table utilisateur
ALTER TABLE tenant_ispm.utilisateur
ADD COLUMN IF NOT EXISTS parcours_assignes JSONB DEFAULT '[]'::jsonb;

-- 3. Migrer les assignations existantes depuis la table parcours
WITH secretaire_parcours AS (
  SELECT 
    secretaire_id,
    json_agg(id) as parcours_ids
  FROM tenant_ispm.parcours
  WHERE secretaire_id IS NOT NULL
  GROUP BY secretaire_id
)
UPDATE tenant_ispm.utilisateur u
SET parcours_assignes = sp.parcours_ids::jsonb
FROM secretaire_parcours sp
WHERE u.id = sp.secretaire_id
  AND u.role = 'secretaire'
  AND (u.parcours_assignes IS NULL OR u.parcours_assignes = '[]'::jsonb);

-- 4. Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_utilisateur_parcours_assignes 
ON tenant_ispm.utilisateur USING gin(parcours_assignes);

CREATE INDEX IF NOT EXISTS idx_proces_verbal_transmis 
ON tenant_ispm.proces_verbal(transmis_a_scolarite, parcours_id);

-- 5. Vérification des données
SELECT 
  'PV avec colonnes de transmission' as verification,
  COUNT(*) as total,
  SUM(CASE WHEN transmis_a_scolarite THEN 1 ELSE 0 END) as transmis
FROM tenant_ispm.proces_verbal;

SELECT 
  'Secrétaires avec parcours assignés' as verification,
  COUNT(*) as total_secretaires,
  COUNT(CASE WHEN parcours_assignes != '[]'::jsonb THEN 1 END) as avec_parcours
FROM tenant_ispm.utilisateur
WHERE role = 'secretaire';

-- =====================================================
-- Pour appliquer à tous les tenants actifs automatiquement:
-- =====================================================
-- DO $$
-- DECLARE
--   tenant_schema TEXT;
-- BEGIN
--   FOR tenant_schema IN 
--     SELECT schema_name FROM public.tenant WHERE actif = true
--   LOOP
--     RAISE NOTICE 'Processing schema: %', tenant_schema;
--     
--     -- Ajouter colonnes proces_verbal
--     EXECUTE format('
--       ALTER TABLE %I.proces_verbal
--       ADD COLUMN IF NOT EXISTS transmis_a_scolarite BOOLEAN DEFAULT false,
--       ADD COLUMN IF NOT EXISTS date_transmission_scolarite TIMESTAMP,
--       ADD COLUMN IF NOT EXISTS transmis_par VARCHAR(255)
--     ', tenant_schema);
--     
--     -- Ajouter colonne utilisateur
--     EXECUTE format('
--       ALTER TABLE %I.utilisateur
--       ADD COLUMN IF NOT EXISTS parcours_assignes JSONB DEFAULT ''[]''::jsonb
--     ', tenant_schema);
--     
--     -- Migrer les données
--     EXECUTE format('
--       WITH secretaire_parcours AS (
--         SELECT 
--           secretaire_id,
--           json_agg(id) as parcours_ids
--         FROM %I.parcours
--         WHERE secretaire_id IS NOT NULL
--         GROUP BY secretaire_id
--       )
--       UPDATE %I.utilisateur u
--       SET parcours_assignes = sp.parcours_ids::jsonb
--       FROM secretaire_parcours sp
--       WHERE u.id = sp.secretaire_id
--         AND u.role = ''secretaire''
--         AND (u.parcours_assignes IS NULL OR u.parcours_assignes = ''[]''::jsonb)
--     ', tenant_schema, tenant_schema);
--     
--     RAISE NOTICE 'Completed schema: %', tenant_schema;
--   END LOOP;
-- END $$;

-- Made with Bob
