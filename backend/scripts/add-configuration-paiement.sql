-- =============================================================================
-- Script: Ajout de la table configuration_paiement
-- Description: Table pour stocker les informations de paiement (comptes bancaires, Mobile Money)
--              configurables par l'administrateur
-- =============================================================================

-- Table de configuration des moyens de paiement
CREATE TABLE IF NOT EXISTS configuration_paiement (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    type_paiement           VARCHAR(50) NOT NULL CHECK (type_paiement IN ('virement', 'mobile_money', 'especes', 'cheque', 'carte_bancaire')),
    libelle                 VARCHAR(200) NOT NULL,
    actif                   BOOLEAN     DEFAULT TRUE,
    ordre_affichage         INTEGER     DEFAULT 0,
    
    -- Informations bancaires (pour virement)
    nom_banque              VARCHAR(200),
    numero_compte           VARCHAR(100),
    iban                    VARCHAR(50),
    swift_bic               VARCHAR(20),
    titulaire_compte        VARCHAR(200),
    
    -- Informations Mobile Money
    operateur               VARCHAR(100), -- Orange Money, MVola, Airtel Money, etc.
    numero_telephone        VARCHAR(30),
    nom_beneficiaire        VARCHAR(200),
    
    -- Instructions supplémentaires
    instructions            TEXT,
    logo_url                VARCHAR(500),
    
    -- Métadonnées
    cree_par                UUID        REFERENCES utilisateur(id),
    modifie_par             UUID        REFERENCES utilisateur(id),
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_config_paiement_type ON configuration_paiement(type_paiement);
CREATE INDEX IF NOT EXISTS idx_config_paiement_actif ON configuration_paiement(actif);
CREATE INDEX IF NOT EXISTS idx_config_paiement_ordre ON configuration_paiement(ordre_affichage);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER trigger_config_paiement_updated_at
    BEFORE UPDATE ON configuration_paiement
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Commentaires
COMMENT ON TABLE configuration_paiement IS 'Configuration des moyens de paiement disponibles pour les inscriptions';
COMMENT ON COLUMN configuration_paiement.type_paiement IS 'Type de paiement: virement, mobile_money, especes, cheque, carte_bancaire';
COMMENT ON COLUMN configuration_paiement.actif IS 'Indique si ce moyen de paiement est actuellement disponible';
COMMENT ON COLUMN configuration_paiement.ordre_affichage IS 'Ordre d''affichage dans l''interface (plus petit = affiché en premier)';

-- Données initiales par défaut
INSERT INTO configuration_paiement (type_paiement, libelle, actif, ordre_affichage, operateur, numero_telephone, nom_beneficiaire, instructions)
VALUES 
    ('mobile_money', 'Orange Money', true, 1, 'Orange Money', '032 XX XXX XX', 'IMTECH UNIVERSITY', 'Effectuez le paiement et indiquez la référence de transaction'),
    ('mobile_money', 'MVola', true, 2, 'MVola', '034 XX XXX XX', 'IMTECH UNIVERSITY', 'Effectuez le paiement et indiquez la référence de transaction')
ON CONFLICT DO NOTHING;

-- Vue pour récupérer facilement les moyens de paiement actifs
CREATE OR REPLACE VIEW vue_moyens_paiement_actifs AS
SELECT 
    id,
    type_paiement,
    libelle,
    ordre_affichage,
    nom_banque,
    numero_compte,
    iban,
    swift_bic,
    titulaire_compte,
    operateur,
    numero_telephone,
    nom_beneficiaire,
    instructions,
    logo_url
FROM configuration_paiement
WHERE actif = TRUE
ORDER BY ordre_affichage ASC, libelle ASC;

COMMENT ON VIEW vue_moyens_paiement_actifs IS 'Vue des moyens de paiement actifs triés par ordre d''affichage';

-- Made with Bob
