-- Script de migration pour ajouter les tables de surveillance
-- À exécuter sur chaque schéma tenant existant

-- Table: pointage_qr
CREATE TABLE IF NOT EXISTS pointage_qr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seance_id UUID NOT NULL,
    etudiant_id UUID NOT NULL,
    code_qr VARCHAR(255) UNIQUE NOT NULL,
    date_generation TIMESTAMP DEFAULT NOW(),
    date_scan TIMESTAMP,
    scanne_par UUID,
    statut VARCHAR(50) DEFAULT 'scanne',
    localisation_scan VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: presence_surveillance
CREATE TABLE IF NOT EXISTS presence_surveillance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    etudiant_id UUID NOT NULL,
    seance_id UUID NOT NULL,
    date_pointage DATE DEFAULT CURRENT_DATE,
    heure_arrivee TIME,
    heure_depart TIME,
    statut VARCHAR(50) DEFAULT 'present',
    justificatif_url TEXT,
    est_justifie BOOLEAN DEFAULT FALSE,
    justifie_par UUID,
    date_justification TIMESTAMP,
    mode_pointage VARCHAR(50) DEFAULT 'manuel',
    pointe_par UUID NOT NULL,
    observations TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: alerte_discipline
CREATE TABLE IF NOT EXISTS alerte_discipline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    etudiant_id UUID NOT NULL,
    type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    statut VARCHAR(50) DEFAULT 'non_lue',
    generee_par UUID NOT NULL,
    destinataire_role VARCHAR(100) DEFAULT 'secretariat',
    date_lecture TIMESTAMP,
    traitee_par UUID,
    date_traitement TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: configuration_examen
CREATE TABLE IF NOT EXISTS configuration_examen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_examen_id UUID NOT NULL,
    salle_id UUID NOT NULL,
    places_total INTEGER DEFAULT 0,
    places_attribuees INTEGER DEFAULT 0,
    plan_places JSONB DEFAULT '[]'::jsonb,
    surveillant_id UUID NOT NULL,
    statut VARCHAR(50) DEFAULT 'preparation',
    rapport_incident TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_pointage_qr_seance ON pointage_qr(seance_id);
CREATE INDEX IF NOT EXISTS idx_pointage_qr_etudiant ON pointage_qr(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_presence_surveillance_etudiant ON presence_surveillance(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_presence_surveillance_seance ON presence_surveillance(seance_id);
CREATE INDEX IF NOT EXISTS idx_presence_surveillance_date ON presence_surveillance(date_pointage);
CREATE INDEX IF NOT EXISTS idx_alerte_discipline_etudiant ON alerte_discipline(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_alerte_discipline_statut ON alerte_discipline(statut);
CREATE INDEX IF NOT EXISTS idx_configuration_examen_session ON configuration_examen(session_examen_id);
CREATE INDEX IF NOT EXISTS idx_configuration_examen_salle ON configuration_examen(salle_id);

-- Commentaires
COMMENT ON TABLE pointage_qr IS 'Gestion des QR codes pour le pointage des étudiants';
COMMENT ON TABLE presence_surveillance IS 'Suivi des présences et absences avec validation surveillant';
COMMENT ON TABLE alerte_discipline IS 'Alertes disciplinaires automatiques vers le secrétariat';
COMMENT ON TABLE configuration_examen IS 'Configuration des salles d''examen et attribution des places';

-- Made with Bob
