-- Script pour corriger la colonne mention dans la table note
-- À exécuter dans pgAdmin ou votre client PostgreSQL

-- Se connecter au schéma du tenant
SET search_path TO "tenant_ispm";

-- Vérifier la structure actuelle de la table note
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'tenant_ispm' 
  AND table_name = 'note'
  AND column_name = 'mention';

-- Supprimer la contrainte NOT NULL sur la colonne mention
ALTER TABLE note ALTER COLUMN mention DROP NOT NULL;

-- Supprimer la valeur par défaut si elle existe
ALTER TABLE note ALTER COLUMN mention DROP DEFAULT;

-- Vérifier que la modification a été appliquée
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'tenant_ispm' 
  AND table_name = 'note'
  AND column_name = 'mention';

-- Message de confirmation
SELECT 'Colonne mention modifiée avec succès - nullable: true' AS status;

-- Made with Bob
