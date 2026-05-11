-- Ajouter simplement la colonne tenant_id à la table utilisateur
DO $$
BEGIN
    -- Vérifier si la colonne existe déjà
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'utilisateur' 
        AND column_name = 'tenant_id'
    ) THEN
        -- Ajouter la colonne tenant_id
        ALTER TABLE public.utilisateur 
        ADD COLUMN tenant_id UUID NULL;
        
        RAISE NOTICE '✅ Colonne tenant_id ajoutée à public.utilisateur';
    ELSE
        RAISE NOTICE 'ℹ️ Colonne tenant_id existe déjà dans public.utilisateur';
    END IF;
END $$;

-- Afficher la structure de la table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'utilisateur'
ORDER BY ordinal_position;

-- Made with Bob
