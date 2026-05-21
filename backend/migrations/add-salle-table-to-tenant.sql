-- =============================================================================
-- Migration: Add missing 'salle' table to existing tenant schema
-- Date: 2026-05-20
-- Issue: 500 error when loading salles - table doesn't exist
-- =============================================================================

-- Apply to tenant schema: tenant_324746c0_67d0_4d87_b9d6_1af7d149599b
SET search_path TO tenant_324746c0_67d0_4d87_b9d6_1af7d149599b;

-- Create salle table if it doesn't exist
CREATE TABLE IF NOT EXISTS salle (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    batiment_id     UUID        REFERENCES batiment(id) ON DELETE SET NULL,
    nom             VARCHAR(100) NOT NULL,
    code            VARCHAR(20) UNIQUE,
    capacite        SMALLINT    NOT NULL,
    type_salle      VARCHAR(30) NOT NULL DEFAULT 'cours'
                    CHECK (type_salle IN ('cours', 'amphitheatre', 'laboratoire', 'salle_info', 'salle_reunion', 'bibliotheque')),
    equipements     JSONB       DEFAULT '{}',
    disponible      BOOLEAN     DEFAULT TRUE,
    etage           SMALLINT    DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_salle_batiment ON salle(batiment_id);
CREATE INDEX IF NOT EXISTS idx_salle_disponible ON salle(disponible);
CREATE INDEX IF NOT EXISTS idx_salle_type ON salle(type_salle);

-- Insert some sample data if table is empty
INSERT INTO salle (nom, code, capacite, type_salle, disponible, etage)
SELECT 'Salle A101', 'A101', 30, 'cours', true, 1
WHERE NOT EXISTS (SELECT 1 FROM salle WHERE code = 'A101');

INSERT INTO salle (nom, code, capacite, type_salle, disponible, etage)
SELECT 'Salle A102', 'A102', 30, 'cours', true, 1
WHERE NOT EXISTS (SELECT 1 FROM salle WHERE code = 'A102');

INSERT INTO salle (nom, code, capacite, type_salle, disponible, etage)
SELECT 'Amphithéâtre 1', 'AMPHI1', 150, 'amphitheatre', true, 0
WHERE NOT EXISTS (SELECT 1 FROM salle WHERE code = 'AMPHI1');

INSERT INTO salle (nom, code, capacite, type_salle, disponible, etage)
SELECT 'Labo Informatique', 'LAB-INFO', 25, 'laboratoire', true, 2
WHERE NOT EXISTS (SELECT 1 FROM salle WHERE code = 'LAB-INFO');

-- Verify the table was created
SELECT 
    'salle' as table_name,
    COUNT(*) as row_count,
    'Table created successfully' as status
FROM salle;

-- Reset search path
RESET search_path;

-- Made with Bob
