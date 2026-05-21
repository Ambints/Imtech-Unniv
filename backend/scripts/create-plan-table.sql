-- Script de création de la table plan_abonnement dans le schéma public
-- Cette table stocke les différents plans d'abonnement disponibles pour les universités

-- Créer la table plan_abonnement si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.plan_abonnement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    prix_mensuel DECIMAL(10, 2) NOT NULL,
    max_utilisateurs INTEGER,
    max_etudiants INTEGER,
    fonctionnalites JSONB DEFAULT '[]'::jsonb,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT plan_abonnement_nom_unique UNIQUE (nom),
    CONSTRAINT plan_abonnement_prix_positif CHECK (prix_mensuel >= 0),
    CONSTRAINT plan_abonnement_max_utilisateurs_positif CHECK (max_utilisateurs IS NULL OR max_utilisateurs > 0),
    CONSTRAINT plan_abonnement_max_etudiants_positif CHECK (max_etudiants IS NULL OR max_etudiants > 0)
);

-- Créer un index sur le nom pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_plan_abonnement_nom ON public.plan_abonnement(nom);

-- Créer un index sur actif pour filtrer les plans actifs
CREATE INDEX IF NOT EXISTS idx_plan_abonnement_actif ON public.plan_abonnement(actif);

-- Insérer les plans par défaut s'ils n'existent pas
INSERT INTO public.plan_abonnement (id, nom, description, prix_mensuel, max_utilisateurs, max_etudiants, fonctionnalites, actif)
VALUES 
    (
        'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
        'Basic',
        'Plan de démarrage pour petites universités',
        50000,
        50,
        500,
        '["LMS", "Support Email"]'::jsonb,
        true
    ),
    (
        'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
        'Standard',
        'Plan intermédiaire avec plus de fonctionnalités',
        100000,
        150,
        1500,
        '["LMS", "Finance", "Support Email"]'::jsonb,
        true
    ),
    (
        'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f',
        'Premium',
        'Plan complet pour grandes universités',
        200000,
        500,
        5000,
        '["LMS", "Finance", "RH", "Logistique", "Support 24/7"]'::jsonb,
        true
    ),
    (
        'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a',
        'Enterprise',
        'Solution sur mesure pour très grandes institutions',
        500000,
        NULL,
        NULL,
        '["Toutes fonctionnalités", "Support dédié", "API personnalisée"]'::jsonb,
        true
    )
ON CONFLICT (nom) DO NOTHING;

-- Afficher un message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Table plan_abonnement créée avec succès avec % plans par défaut', 
        (SELECT COUNT(*) FROM public.plan_abonnement);
END $$;

-- Made with Bob
