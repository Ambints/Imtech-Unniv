-- =============================================================================
-- MODULE CAISSIER - Migration SQL Complémentaire
-- Architecture Multi-Tenant IMTECH University
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Table : FraisInscription (Gestion des frais d'inscription par parcours)
-- -----------------------------------------------------------------------------
CREATE TABLE frais_inscription (
    id                      UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcours_id             UUID        NOT NULL REFERENCES parcours(id) ON DELETE RESTRICT,
    annee_academique_id     UUID        NOT NULL REFERENCES annee_academique(id) ON DELETE RESTRICT,
    montant_inscription    DECIMAL(10,2) NOT NULL DEFAULT 0,
    montant_scolarite      DECIMAL(10,2) DEFAULT 0,
    montant_total          DECIMAL(10,2) NOT NULL,
    description             TEXT,
    actif                   BOOLEAN     DEFAULT TRUE,
    date_limite_paiement   DATE,
    modalites_paiement     JSONB       DEFAULT '{"especes": true, "cheque": true, "virement": true, "carte_bancaire": true, "echelonnement": false}',
    cree_par               UUID        REFERENCES utilisateur(id),
    modifie_par             UUID        REFERENCES utilisateur(id),
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (parcours_id, annee_academique_id)
);

-- -----------------------------------------------------------------------------
-- Table : ClotureCaisse (Clôture journalière de caisse)
-- -----------------------------------------------------------------------------
CREATE TABLE cloture_caisse (
    id                      UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    date_cloture            DATE        NOT NULL,
    caissier_id             UUID        NOT NULL REFERENCES utilisateur(id) ON DELETE RESTRICT,
    total_especes           DECIMAL(12,2) DEFAULT 0,
    total_cheques           DECIMAL(12,2) DEFAULT 0,
    total_virements         DECIMAL(12,2) DEFAULT 0,
    total_carte_bancaire    DECIMAL(12,2) DEFAULT 0,
    total_mobile_money      DECIMAL(12,2) DEFAULT 0,
    total_general           DECIMAL(12,2) DEFAULT 0,
    nombre_paiements        INT         DEFAULT 0,
    details_paiements       JSONB       DEFAULT '{"inscription": {"montant": 0, "nombre": 0}, "scolarite": {"montant": 0, "nombre": 0}, "autres": {"montant": 0, "nombre": 0}}',
    solde_banque_theorique  DECIMAL(12,2),
    solde_banque_reel       DECIMAL(12,2),
    ecart                   DECIMAL(12,2),
    motif_ecart             TEXT,
    valide                  BOOLEAN     DEFAULT FALSE,
    valide_par              UUID        REFERENCES utilisateur(id),
    date_validation         TIMESTAMPTZ,
    observations            TEXT,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (date_cloture, caissier_id)
);

-- -----------------------------------------------------------------------------
-- Ajout de colonnes à la table paiement existante
-- -----------------------------------------------------------------------------
ALTER TABLE paiement ADD COLUMN IF NOT EXISTS type_paiement VARCHAR(20) DEFAULT 'scolarite';
ALTER TABLE paiement ADD COLUMN IF NOT EXISTS cloture_caisse_id UUID REFERENCES cloture_caisse(id);
ALTER TABLE paiement ADD COLUMN IF NOT EXISTS details_paiement JSONB;

-- Contrainte pour le type de paiement
ALTER TABLE paiement ADD CONSTRAINT chk_type_paiement 
    CHECK (type_paiement IN ('inscription', 'scolarite', 'retard', 'autre', 'amende', 'divers'));

-- -----------------------------------------------------------------------------
-- Index pour optimisation des performances
-- -----------------------------------------------------------------------------

-- Index sur les frais d'inscription
CREATE INDEX idx_frais_inscription_parcours ON frais_inscription(parcours_id);
CREATE INDEX idx_frais_inscription_annee_academique ON frais_inscription(annee_academique_id);
CREATE INDEX idx_frais_inscription_actif ON frais_inscription(actif);
CREATE INDEX idx_frais_inscription_date_limite ON frais_inscription(date_limite_paiement);

-- Index sur les clôtures de caisse
CREATE INDEX idx_cloture_caisse_date ON cloture_caisse(date_cloture);
CREATE INDEX idx_cloture_caisse_caissier ON cloture_caisse(caissier_id);
CREATE INDEX idx_cloture_caisse_valide ON cloture_caisse(valide);

-- Index sur les paiements (nouvelles colonnes)
CREATE INDEX idx_paiement_type ON paiement(type_paiement);
CREATE INDEX idx_paiement_cloture ON paiement(cloture_caisse_id);

-- -----------------------------------------------------------------------------
-- Triggers et fonctions pour la gestion automatique
-- -----------------------------------------------------------------------------

-- Trigger pour mettre à jour automatiquement updated_at sur les nouvelles tables
CREATE TRIGGER update_frais_inscription_updated_at BEFORE UPDATE ON frais_inscription 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cloture_caisse_updated_at BEFORE UPDATE ON cloture_caisse 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour calculer automatiquement les totaux de clôture de caisse
CREATE OR REPLACE FUNCTION calculer_totaux_cloture(
    p_date_cloture DATE,
    p_caissier_id UUID
)
RETURNS VOID AS $$
BEGIN
    UPDATE cloture_caisse SET
        total_especes = COALESCE((
            SELECT COALESCE(SUM(montant), 0)
            FROM paiement
            WHERE DATE(date_paiement) = p_date_cloture
              AND mode_paiement = 'especes'
              AND statut = 'valide'
        ), 0),
        total_cheques = COALESCE((
            SELECT COALESCE(SUM(montant), 0)
            FROM paiement
            WHERE DATE(date_paiement) = p_date_cloture
              AND mode_paiement = 'cheque'
              AND statut = 'valide'
        ), 0),
        total_virements = COALESCE((
            SELECT COALESCE(SUM(montant), 0)
            FROM paiement
            WHERE DATE(date_paiement) = p_date_cloture
              AND mode_paiement = 'virement'
              AND statut = 'valide'
        ), 0),
        total_carte_bancaire = COALESCE((
            SELECT COALESCE(SUM(montant), 0)
            FROM paiement
            WHERE DATE(date_paiement) = p_date_cloture
              AND mode_paiement = 'carte_bancaire'
              AND statut = 'valide'
        ), 0),
        total_mobile_money = COALESCE((
            SELECT COALESCE(SUM(montant), 0)
            FROM paiement
            WHERE DATE(date_paiement) = p_date_cloture
              AND mode_paiement = 'mobile_money'
              AND statut = 'valide'
        ), 0),
        nombre_paiements = COALESCE((
            SELECT COUNT(*)
            FROM paiement
            WHERE DATE(date_paiement) = p_date_cloture
              AND statut = 'valide'
        ), 0),
        details_paiements = COALESCE((
            SELECT jsonb_build_object(
                'inscription', jsonb_build_object(
                    'montant', COALESCE(SUM(CASE WHEN type_paiement = 'inscription' THEN montant ELSE 0 END), 0),
                    'nombre', COUNT(CASE WHEN type_paiement = 'inscription' THEN 1 END)
                ),
                'scolarite', jsonb_build_object(
                    'montant', COALESCE(SUM(CASE WHEN type_paiement = 'scolarite' THEN montant ELSE 0 END), 0),
                    'nombre', COUNT(CASE WHEN type_paiement = 'scolarite' THEN 1 END)
                ),
                'autres', jsonb_build_object(
                    'montant', COALESCE(SUM(CASE WHEN type_paiement NOT IN ('inscription', 'scolarite') THEN montant ELSE 0 END), 0),
                    'nombre', COUNT(CASE WHEN type_paiement NOT IN ('inscription', 'scolarite') THEN 1 END)
                )
            )
            FROM paiement
            WHERE DATE(date_paiement) = p_date_cloture
              AND statut = 'valide'
        ), '{"inscription": {"montant": 0, "nombre": 0}, "scolarite": {"montant": 0, "nombre": 0}, "autres": {"montant": 0, "nombre": 0}}'),
        total_general = (
            COALESCE((
                SELECT COALESCE(SUM(montant), 0)
                FROM paiement
                WHERE DATE(date_paiement) = p_date_cloture
                  AND statut = 'valide'
            ), 0)
        ),
        updated_at = NOW()
    WHERE date_cloture = p_date_cloture AND caissier_id = p_caissier_id;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Vues pour les rapports et statistiques
-- -----------------------------------------------------------------------------

-- Vue des frais d'inscription actifs
CREATE VIEW vue_frais_inscription_actifs AS
SELECT 
    fi.*,
    p.code as parcours_code,
    p.nom as parcours_nom,
    d.nom as departement_nom,
    aa.libelle as annee_academique,
    aa.date_debut,
    aa.date_fin,
    COUNT(DISTINCT i.id) as nb_inscriptions,
    COALESCE(SUM(pa.montant), 0) as total_encaisse
FROM frais_inscription fi
JOIN parcours p ON p.id = fi.parcours_id
LEFT JOIN departement d ON d.id = p.departement_id
JOIN annee_academique aa ON aa.id = fi.annee_academique_id
LEFT JOIN inscription i ON i.parcours_id = fi.parcours_id AND i.annee_academique_id = fi.annee_academique_id
LEFT JOIN paiement pa ON pa.inscription_id = i.id AND pa.statut = 'valide'
WHERE fi.actif = true
GROUP BY fi.id, p.code, p.nom, d.nom, aa.libelle, aa.date_debut, aa.date_fin;

-- Vue des résumés journaliers de caisse
CREATE VIEW vue_resume_journalier_caisse AS
SELECT 
    DATE(p.date_paiement) as date,
    COUNT(*) as nb_transactions,
    COALESCE(SUM(p.montant), 0) as total_encaisse,
    COUNT(DISTINCT p.inscription_id) as nb_etudiants,
    COUNT(DISTINCT p.mode_paiement) as nb_modes_paiement,
    jsonb_object_agg(p.mode_paiement, jsonb_build_object(
        'montant', mode_total,
        'nombre', mode_count
    )) as repartition_modes
FROM (
    SELECT 
        p.*,
        COUNT(*) OVER (PARTITION BY DATE(p.date_paiement), p.mode_paiement) as mode_count,
        SUM(p.montant) OVER (PARTITION BY DATE(p.date_paiement), p.mode_paiement) as mode_total
    FROM paiement p
    WHERE p.statut = 'valide'
) p
GROUP BY DATE(p.date_paiement)
ORDER BY date DESC;

-- Vue des statistiques de paiement par parcours
CREATE VIEW vue_statistiques_paiement_parcours AS
SELECT 
    p.code as parcours_code,
    p.nom as parcours_nom,
    aa.date_debut,
    aa.date_fin,
    COUNT(DISTINCT pa.inscription_id) as nb_etudiants_payants,
    COUNT(DISTINCT i.id) as nb_etudiants_inscrits,
    COALESCE(SUM(pa.montant), 0) as total_encaisse,
    COALESCE(AVG(pa.montant), 0) as montant_moyen,
    COUNT(*) as nb_transactions
FROM parcours p
JOIN inscription i ON i.parcours_id = p.id
JOIN annee_academique aa ON aa.id = i.annee_academique_id
LEFT JOIN paiement pa ON pa.inscription_id = i.id AND pa.statut = 'valide'
GROUP BY p.id, p.code, p.nom, aa.date_debut, aa.date_fin
ORDER BY total_encaisse DESC;

-- -----------------------------------------------------------------------------
-- Commentaires sur les tables
-- -----------------------------------------------------------------------------
COMMENT ON TABLE frais_inscription IS 'Configuration des frais d''inscription et de scolarité par parcours et année académique';
COMMENT ON TABLE cloture_caisse IS 'Clôture journalière de caisse avec réconciliation bancaire';

COMMENT ON COLUMN frais_inscription.montant_inscription IS 'Frais d''inscription obligatoires';
COMMENT ON COLUMN frais_inscription.montant_scolarite IS 'Frais de scolarité annuels';
COMMENT ON COLUMN frais_inscription.modalites_paiement IS 'Modes de paiement acceptés et options d''échelonnement';
COMMENT ON COLUMN frais_inscription.date_limite_paiement IS 'Date limite pour le paiement sans pénalités';

COMMENT ON COLUMN cloture_caisse.total_general IS 'Total général des encaissements de la journée';
COMMENT ON COLUMN cloture_caisse.details_paiements IS 'Répartition des encaissements par type de paiement';
COMMENT ON COLUMN cloture_caisse.ecart IS 'Écart entre solde théorique et solde bancaire réel';
COMMENT ON COLUMN cloture_caisse.valide IS 'Indique si la clôture a été validée par un superviseur';

-- =============================================================================
-- FIN DE LA MIGRATION
-- =============================================================================
