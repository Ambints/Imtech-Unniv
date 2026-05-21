-- =============================================================================
-- MIGRATION: Création de la table secretaire_parcours et ajout de colonne ownership
-- =============================================================================
-- Description: 
-- 1. Crée la table secretaire_parcours pour la gestion des affectations SP
-- 2. Ajoute la colonne created_by_id dans emploi_du_temps pour l'ownership
-- =============================================================================

-- =============================================================================
-- PARTIE 1: Création de la table secretaire_parcours
-- =============================================================================

CREATE TABLE IF NOT EXISTS secretaire_parcours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    secretaire_id UUID NOT NULL,
    parcours_id UUID NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID,
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_secretaire_parcours_secretaire 
ON secretaire_parcours(secretaire_id) WHERE actif = TRUE;

CREATE INDEX IF NOT EXISTS idx_secretaire_parcours_parcours 
ON secretaire_parcours(parcours_id) WHERE actif = TRUE;

-- Index unique composite pour éviter les doublons actifs
CREATE UNIQUE INDEX IF NOT EXISTS idx_secretaire_parcours_unique 
ON secretaire_parcours(secretaire_id, parcours_id) WHERE actif = TRUE;

-- Contraintes de clé étrangère
ALTER TABLE secretaire_parcours 
ADD CONSTRAINT fk_secretaire_parcours_parcours 
FOREIGN KEY (parcours_id) REFERENCES parcours(id) ON DELETE CASCADE;

-- Note: La FK vers utilisateur est optionnelle car les utilisateurs sont dans le schéma public
-- Si vous souhaitez l'ajouter, décommentez la ligne suivante:
-- ALTER TABLE secretaire_parcours 
-- ADD CONSTRAINT fk_secretaire_parcours_user 
-- FOREIGN KEY (secretaire_id) REFERENCES public.utilisateur(id) ON DELETE CASCADE;

-- Commentaires
COMMENT ON TABLE secretaire_parcours IS 'Table de liaison entre secrétaires et parcours avec métadonnées d\'audit';
COMMENT ON COLUMN secretaire_parcours.secretaire_id IS 'ID du secrétaire (référence utilisateur)';
COMMENT ON COLUMN secretaire_parcours.parcours_id IS 'ID du parcours affecté';
COMMENT ON COLUMN secretaire_parcours.assigned_at IS 'Date d\'affectation';
COMMENT ON COLUMN secretaire_parcours.assigned_by IS 'ID de l\'admin ayant fait l\'affectation';
COMMENT ON COLUMN secretaire_parcours.actif IS 'Indique si l\'affectation est active (soft delete)';

-- =============================================================================
-- PARTIE 2: Ajout de la colonne created_by_id dans emploi_du_temps
-- =============================================================================

ALTER TABLE emploi_du_temps 
ADD COLUMN IF NOT EXISTS created_by_id UUID;

COMMENT ON COLUMN emploi_du_temps.created_by_id IS 'ID du secrétaire qui a créé l\'entrée d\'EDT (ownership)';

-- =============================================================================
-- PARTIE 3: Migration des données existantes (optionnel)
-- =============================================================================

-- Si vous avez déjà des données avec secretaire_id dans la table parcours,
-- vous pouvez les migrer vers la nouvelle table:

-- INSERT INTO secretaire_parcours (secretaire_id, parcours_id, assigned_at, actif)
-- SELECT secretaire_id, id, NOW(), TRUE
-- FROM parcours
-- WHERE secretaire_id IS NOT NULL;

-- =============================================================================
-- VÉRIFICATION
-- =============================================================================

SELECT 'Table secretaire_parcours créée avec succès' as result;
SELECT 'Colonne created_by_id ajoutée à emploi_du_temps' as result;

-- Vérifier la structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'secretaire_parcours' 
ORDER BY ordinal_position;
