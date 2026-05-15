-- Migration: Création de la table paiement_inscription
-- Description: Gestion des paiements d'inscription soumis par les étudiants

CREATE TABLE IF NOT EXISTS paiement_inscription (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inscription_id UUID NOT NULL REFERENCES inscription(id) ON DELETE CASCADE,
  etudiant_id UUID NOT NULL REFERENCES etudiant(id) ON DELETE CASCADE,
  montant DECIMAL(10,2) NOT NULL CHECK (montant > 0),
  methode_paiement VARCHAR(50) NOT NULL CHECK (methode_paiement IN ('virement', 'mobile_money', 'especes', 'cheque', 'carte_bancaire')),
  reference_paiement VARCHAR(255) NOT NULL,
  date_paiement TIMESTAMP NOT NULL,
  preuve_url TEXT,
  statut VARCHAR(50) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'valide', 'rejete')),
  valide_par UUID REFERENCES utilisateur(id),
  date_validation TIMESTAMP,
  note_validation TEXT,
  motif_rejet TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Contraintes
  CONSTRAINT unique_reference_paiement UNIQUE (reference_paiement),
  CONSTRAINT check_validation CHECK (
    (statut = 'valide' AND valide_par IS NOT NULL AND date_validation IS NOT NULL) OR
    (statut = 'rejete' AND valide_par IS NOT NULL AND date_validation IS NOT NULL AND motif_rejet IS NOT NULL) OR
    (statut = 'en_attente' AND valide_par IS NULL AND date_validation IS NULL)
  )
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_paiement_inscription_inscription ON paiement_inscription(inscription_id);
CREATE INDEX IF NOT EXISTS idx_paiement_inscription_etudiant ON paiement_inscription(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_paiement_inscription_statut ON paiement_inscription(statut);
CREATE INDEX IF NOT EXISTS idx_paiement_inscription_date ON paiement_inscription(date_paiement);
CREATE INDEX IF NOT EXISTS idx_paiement_inscription_reference ON paiement_inscription(reference_paiement);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_paiement_inscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_paiement_inscription_updated_at
  BEFORE UPDATE ON paiement_inscription
  FOR EACH ROW
  EXECUTE FUNCTION update_paiement_inscription_updated_at();

-- Commentaires
COMMENT ON TABLE paiement_inscription IS 'Paiements d''inscription soumis par les étudiants en attente de validation';
COMMENT ON COLUMN paiement_inscription.methode_paiement IS 'virement, mobile_money, especes, cheque, carte_bancaire';
COMMENT ON COLUMN paiement_inscription.statut IS 'en_attente, valide, rejete';
COMMENT ON COLUMN paiement_inscription.reference_paiement IS 'Numéro de transaction ou référence du paiement';
COMMENT ON COLUMN paiement_inscription.preuve_url IS 'URL de la capture d''écran ou preuve de paiement';

-- Made with Bob
