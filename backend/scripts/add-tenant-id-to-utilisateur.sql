-- Ajouter la colonne tenant_id à la table utilisateur si elle n'existe pas
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
        
        RAISE NOTICE 'Colonne tenant_id ajoutée à public.utilisateur';
    ELSE
        RAISE NOTICE 'Colonne tenant_id existe déjà dans public.utilisateur';
    END IF;
END $$;

-- Récupérer le premier tenant actif
DO $$
DECLARE
    default_tenant_id UUID;
    updated_count INTEGER;
BEGIN
    -- Récupérer le premier tenant actif
    SELECT id INTO default_tenant_id
    FROM public.tenants
    WHERE actif = true
    ORDER BY created_at
    LIMIT 1;
    
    IF default_tenant_id IS NOT NULL THEN
        -- Mettre à jour tous les utilisateurs sans tenant_id (sauf super_admin)
        UPDATE public.utilisateur
        SET tenant_id = default_tenant_id
        WHERE tenant_id IS NULL 
        AND role != 'super_admin';
        
        GET DIAGNOSTICS updated_count = ROW_COUNT;
        
        RAISE NOTICE 'Tenant ID % assigné à % utilisateur(s)', default_tenant_id, updated_count;
    ELSE
        RAISE WARNING 'Aucun tenant actif trouvé dans la base de données';
    END IF;
END $$;

-- Afficher un résumé
SELECT 
    COALESCE(t.nom, 'Sans tenant') as tenant_nom,
    u.role,
    COUNT(*) as count
FROM public.utilisateur u
LEFT JOIN public.tenants t ON u.tenant_id = t.id
GROUP BY t.nom, u.role
ORDER BY t.nom, u.role;

-- Made with Bob
