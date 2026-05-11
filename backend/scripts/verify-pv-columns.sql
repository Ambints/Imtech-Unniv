-- =============================================================================
-- SCRIPT: Vérification des colonnes de transmission dans proces_verbal
-- =============================================================================

-- Vérifier les colonnes existantes dans la table proces_verbal
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'proces_verbal' 
  AND table_schema = current_schema()
ORDER BY ordinal_position;

-- Vérifier spécifiquement les colonnes de transmission
SELECT 
    'transmis_a_scolarite' as colonne,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'proces_verbal' 
              AND column_name = 'transmis_a_scolarite'
              AND table_schema = current_schema()
        ) THEN '✅ Présente'
        ELSE '❌ Manquante'
    END as statut
UNION ALL
SELECT 
    'date_transmission_scolarite',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'proces_verbal' 
              AND column_name = 'date_transmission_scolarite'
              AND table_schema = current_schema()
        ) THEN '✅ Présente'
        ELSE '❌ Manquante'
    END
UNION ALL
SELECT 
    'transmis_par',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'proces_verbal' 
              AND column_name = 'transmis_par'
              AND table_schema = current_schema()
        ) THEN '✅ Présente'
        ELSE '❌ Manquante'
    END;
