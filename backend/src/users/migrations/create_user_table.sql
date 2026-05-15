-- Migration pour créer la table utilisateur dans tous les schémas de tenants
-- À exécuter manuellement ou via un script de migration

-- Créer la table utilisateur si elle n'existe pas
CREATE TABLE IF NOT EXISTS utilisateur (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(254) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    telephone VARCHAR(30),
    photo_url VARCHAR(500),
    role VARCHAR(50) NOT NULL,
    actif BOOLEAN DEFAULT true,
    email_verifie BOOLEAN DEFAULT false,
    derniere_connexion TIMESTAMPTZ,
    token_reset TEXT,
    token_reset_expiry TIMESTAMPTZ,
    tenant_id UUID,
    password_reset_required BOOLEAN DEFAULT false,
    last_password_reset TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer les indexes pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_utilisateur_email ON utilisateur(email);
CREATE INDEX IF NOT EXISTS idx_utilisateur_role ON utilisateur(role);
CREATE INDEX IF NOT EXISTS idx_utilisateur_actif ON utilisateur(actif);
CREATE INDEX IF NOT EXISTS idx_utilisateur_tenant_id ON utilisateur(tenant_id);

-- Créer le trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_utilisateur_updated_at 
    BEFORE UPDATE ON utilisateur 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
