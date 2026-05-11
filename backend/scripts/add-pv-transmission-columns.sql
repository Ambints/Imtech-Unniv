-- =============================================================================
-- MIGRATION: Ajout des colonnes de transmission à la scolarité centrale
-- Table: proces_verbal (schémas des tenants)
-- =============================================================================
-- Description: Ajoute les colonnes nécessaires pour la transmission des PV
-- par les secrétaires de parcours vers la scolarité centrale
-- =============================================================================

-- Ajouter la colonne transmis_a_scolarite (boolean, default false)
ALTER TABLE proces_verbal 
ADD COLUMN IF NOT EXISTS transmis_a_scolarite BOOLEAN DEFAULT FALSE;

-- Ajouter la colonne date_transmission_scolarite (timestamp, nullable)
ALTER TABLE proces_verbal 
ADD COLUMN IF NOT EXISTS date_transmission_scolarite TIMESTAMP WITH TIME ZONE NULL;

-- Ajouter la colonne transmis_par (UUID de l'utilisateur, nullable)
ALTER TABLE proces_verbal 
ADD COLUMN IF NOT EXISTS transmis_par UUID NULL;

-- Créer un index sur transmis_a_scolarite pour optimiser les requêtes de filtrage
CREATE INDEX IF NOT EXISTS idx_proces_verbal_transmis_a_scolarite 
ON proces_verbal(transmis_a_scolarite);

-- Créer un index composite pour les requêtes de PV à transmettre par parcours
CREATE INDEX IF NOT EXISTS idx_proces_verbal_parcours_transmis 
ON proces_verbal(parcours_id, transmis_a_scolarite, statut);

-- Commentaires sur les colonnes
COMMENT ON COLUMN proces_verbal.transmis_a_scolarite IS 'Indique si le PV a été transmis à la scolarité centrale';
COMMENT ON COLUMN proces_verbal.date_transmission_scolarite IS 'Date de transmission du PV à la scolarité centrale';
COMMENT ON COLUMN proces_verbal.transmis_par IS 'ID de l''utilisateur (secrétaire) ayant transmis le PV';
