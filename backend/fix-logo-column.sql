-- Migration pour augmenter la taille de la colonne logo_url
-- Exécutez ce script dans votre base de données PostgreSQL

ALTER TABLE public.tenant 
ALTER COLUMN logo_url TYPE TEXT;

-- Vérification
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'tenant' AND column_name = 'logo_url';

-- Made with Bob
