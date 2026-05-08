-- =============================================================================
-- MIGRATION : Ajout des tables pour le module President
-- Date : 2026-05-05
-- Description : Ajoute 10 nouvelles tables pour les fonctionnalités du President
-- =============================================================================

-- 1. Table signature_electronique
CREATE TABLE IF NOT EXISTS signature_electronique (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_document VARCHAR(50) NOT NULL CHECK (type_document IN ('diplome', 'convention', 'decision', 'attestation', 'autre')),
    document_id UUID NOT NULL,
    reference_document VARCHAR(100),
    signataire_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE RESTRICT,
    signature_hash TEXT NOT NULL,
    certificat_signature TEXT,
    date_signature TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    localisation VARCHAR(100),
    statut VARCHAR(20) DEFAULT 'valide' CHECK (statut IN ('valide', 'revoque', 'expire')),
    raison_revocation TEXT,
    date_revocation TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_signature_type_document ON signature_electronique(type_document);
CREATE INDEX idx_signature_signataire ON signature_electronique(signataire_id);
CREATE INDEX idx_signature_date ON signature_electronique(date_signature);
CREATE INDEX idx_signature_statut ON signature_electronique(statut);

-- 2. Table validation_parcours
CREATE TABLE IF NOT EXISTS validation_parcours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parcours_id UUID NOT NULL REFERENCES parcours(id) ON DELETE RESTRICT,
    type_action VARCHAR(30) NOT NULL CHECK (type_action IN ('ouverture', 'fermeture', 'modification', 'suspension')),
    demandeur_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE RESTRICT,
    validateur_id UUID REFERENCES utilisateur(id) ON DELETE SET NULL,
    date_demande TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_validation TIMESTAMPTZ,
    statut VARCHAR(30) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'approuve', 'rejete', 'en_revision')),
    motif_demande TEXT NOT NULL,
    commentaire_validateur TEXT,
    justificatifs JSONB,
    impact_analyse TEXT,
    date_effet DATE,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_validation_parcours_statut ON validation_parcours(statut);
CREATE INDEX idx_validation_parcours_validateur ON validation_parcours(validateur_id);
CREATE INDEX idx_validation_parcours_date ON validation_parcours(date_demande);

-- 3. Table convention_partenariat
CREATE TABLE IF NOT EXISTS convention_partenariat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_convention VARCHAR(50) UNIQUE NOT NULL,
    titre VARCHAR(255) NOT NULL,
    type_partenaire VARCHAR(50) NOT NULL CHECK (type_partenaire IN ('eglise', 'diocese', 'congregation', 'universite', 'entreprise', 'ong', 'autre')),
    nom_partenaire VARCHAR(255) NOT NULL,
    contact_partenaire VARCHAR(255),
    email_partenaire VARCHAR(254),
    telephone_partenaire VARCHAR(30),
    objet_convention TEXT NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE,
    duree_mois INT,
    montant_engagement DECIMAL(15,2),
    devise VARCHAR(10) DEFAULT 'MGA',
    document_url TEXT,
    document_hash TEXT,
    statut VARCHAR(30) DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'en_attente_signature', 'signe', 'actif', 'expire', 'resilie')),
    signataire_president_id UUID REFERENCES utilisateur(id) ON DELETE SET NULL,
    date_signature_president TIMESTAMPTZ,
    signataire_partenaire VARCHAR(255),
    date_signature_partenaire DATE,
    conditions_particulieres TEXT,
    clauses_resiliation TEXT,
    renouvellement_auto BOOLEAN DEFAULT FALSE,
    responsable_suivi_id UUID REFERENCES utilisateur(id) ON DELETE SET NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_convention_type ON convention_partenariat(type_partenaire);
CREATE INDEX idx_convention_statut ON convention_partenariat(statut);
CREATE INDEX idx_convention_president ON convention_partenariat(signataire_president_id);
CREATE INDEX idx_convention_dates ON convention_partenariat(date_debut, date_fin);

-- 4. Table delegation_signature
CREATE TABLE IF NOT EXISTS delegation_signature (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_delegation VARCHAR(50) UNIQUE NOT NULL,
    delegant_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE RESTRICT,
    delegataire_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE RESTRICT,
    type_document VARCHAR(50) NOT NULL,
    portee_delegation TEXT NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE,
    actif BOOLEAN DEFAULT TRUE,
    conditions TEXT,
    montant_max_autorise DECIMAL(15,2),
    niveaux_autorises VARCHAR(100),
    raison_delegation TEXT,
    document_delegation_url TEXT,
    date_revocation TIMESTAMPTZ,
    raison_revocation TEXT,
    notifications_activees BOOLEAN DEFAULT TRUE,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_delegation_delegant ON delegation_signature(delegant_id);
CREATE INDEX idx_delegation_delegataire ON delegation_signature(delegataire_id);
CREATE INDEX idx_delegation_actif ON delegation_signature(actif);
CREATE INDEX idx_delegation_dates ON delegation_signature(date_debut, date_fin);

-- 5. Table validation_recrutement
CREATE TABLE IF NOT EXISTS validation_recrutement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_dossier VARCHAR(50) UNIQUE NOT NULL,
    candidat_nom VARCHAR(100) NOT NULL,
    candidat_prenom VARCHAR(100) NOT NULL,
    candidat_email VARCHAR(254),
    candidat_telephone VARCHAR(30),
    poste VARCHAR(100) NOT NULL,
    departement_id UUID REFERENCES departement(id) ON DELETE SET NULL,
    type_contrat VARCHAR(30) NOT NULL CHECK (type_contrat IN ('cdi', 'cdd', 'vacation', 'stage')),
    type_recrutement VARCHAR(30) NOT NULL CHECK (type_recrutement IN ('strategique', 'standard', 'urgent')),
    niveau_poste VARCHAR(30) CHECK (niveau_poste IN ('direction', 'cadre', 'employe', 'enseignant_titulaire', 'enseignant_vacataire')),
    demandeur_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE RESTRICT,
    validateur_rh_id UUID REFERENCES utilisateur(id) ON DELETE SET NULL,
    date_validation_rh TIMESTAMPTZ,
    validateur_president_id UUID REFERENCES utilisateur(id) ON DELETE SET NULL,
    date_validation_president TIMESTAMPTZ,
    statut VARCHAR(30) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'valide_rh', 'approuve', 'rejete', 'en_revision')),
    priorite VARCHAR(20) DEFAULT 'normale' CHECK (priorite IN ('haute', 'normale', 'basse')),
    salaire_propose DECIMAL(12,2) NOT NULL,
    devise VARCHAR(10) DEFAULT 'MGA',
    date_prise_fonction DATE,
    justification TEXT NOT NULL,
    competences_requises TEXT,
    cv_url TEXT,
    lettre_motivation_url TEXT,
    diplomes_urls JSONB,
    commentaire_rh TEXT,
    commentaire_president TEXT,
    decision_finale TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recrutement_statut ON validation_recrutement(statut);
CREATE INDEX idx_recrutement_type ON validation_recrutement(type_recrutement);
CREATE INDEX idx_recrutement_validateur ON validation_recrutement(validateur_president_id);
CREATE INDEX idx_recrutement_departement ON validation_recrutement(departement_id);

-- 6. Table validation_investissement
CREATE TABLE IF NOT EXISTS validation_investissement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_projet VARCHAR(50) UNIQUE NOT NULL,
    titre VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    categorie VARCHAR(50) NOT NULL CHECK (categorie IN ('infrastructure', 'equipement', 'informatique', 'mobilier', 'vehicule', 'autre')),
    sous_categorie VARCHAR(100),
    montant DECIMAL(15,2) NOT NULL,
    devise VARCHAR(10) DEFAULT 'MGA',
    departement_beneficiaire_id UUID REFERENCES departement(id) ON DELETE SET NULL,
    demandeur_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE RESTRICT,
    validateur_economat_id UUID REFERENCES utilisateur(id) ON DELETE SET NULL,
    date_validation_economat TIMESTAMPTZ,
    validateur_president_id UUID REFERENCES utilisateur(id) ON DELETE SET NULL,
    date_validation_president TIMESTAMPTZ,
    statut VARCHAR(30) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'valide_economat', 'approuve', 'rejete', 'en_revision', 'en_cours', 'termine')),
    priorite VARCHAR(20) DEFAULT 'normale' CHECK (priorite IN ('haute', 'normale', 'basse')),
    urgence BOOLEAN DEFAULT FALSE,
    justification TEXT NOT NULL,
    impact_attendu TEXT,
    alternatives_etudiees TEXT,
    source_financement VARCHAR(100),
    devis_urls JSONB,
    cahier_charges_url TEXT,
    date_debut_prevue DATE,
    date_fin_prevue DATE,
    duree_mois INT,
    fournisseur_propose VARCHAR(255),
    commentaire_economat TEXT,
    commentaire_president TEXT,
    decision_finale TEXT,
    conditions_approbation TEXT,
    suivi_realisation JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_investissement_statut ON validation_investissement(statut);
CREATE INDEX idx_investissement_categorie ON validation_investissement(categorie);
CREATE INDEX idx_investissement_validateur ON validation_investissement(validateur_president_id);
CREATE INDEX idx_investissement_montant ON validation_investissement(montant);
CREATE INDEX idx_investissement_priorite ON validation_investissement(priorite);

-- 7. Table arbitrage_discipline
CREATE TABLE IF NOT EXISTS arbitrage_discipline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_arbitrage VARCHAR(50) UNIQUE NOT NULL,
    incident_id UUID NOT NULL REFERENCES incident(id) ON DELETE RESTRICT,
    etudiant_id UUID REFERENCES utilisateur(id) ON DELETE SET NULL,
    conseil_discipline_date DATE,
    membres_conseil JSONB,
    decision_conseil TEXT,
    sanction_proposee VARCHAR(50),
    appel_demande BOOLEAN DEFAULT FALSE,
    motif_appel TEXT,
    date_appel TIMESTAMPTZ,
    arbitre_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE RESTRICT,
    date_arbitrage TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decision_arbitrale TEXT NOT NULL,
    sanction_finale VARCHAR(50) CHECK (sanction_finale IN ('aucune', 'avertissement', 'blame', 'exclusion_temporaire', 'exclusion_definitive', 'autre')),
    duree_exclusion_jours INT,
    conditions_reintegration TEXT,
    commentaire_president TEXT,
    statut VARCHAR(20) DEFAULT 'definitif' CHECK (statut IN ('definitif', 'en_appel', 'annule')),
    notification_envoyee BOOLEAN DEFAULT FALSE,
    date_notification TIMESTAMPTZ,
    document_decision_url TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_arbitrage_incident ON arbitrage_discipline(incident_id);
CREATE INDEX idx_arbitrage_arbitre ON arbitrage_discipline(arbitre_id);
CREATE INDEX idx_arbitrage_statut ON arbitrage_discipline(statut);
CREATE INDEX idx_arbitrage_date ON arbitrage_discipline(date_arbitrage);

-- 8. Table validation_calendrier
CREATE TABLE IF NOT EXISTS validation_calendrier (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    annee_academique_id UUID NOT NULL REFERENCES annee_academique(id) ON DELETE RESTRICT,
    type_calendrier VARCHAR(30) NOT NULL CHECK (type_calendrier IN ('general', 'examens', 'vacances', 'evenements')),
    proposeur_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE RESTRICT,
    date_proposition TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    validateur_id UUID REFERENCES utilisateur(id) ON DELETE SET NULL,
    date_validation TIMESTAMPTZ,
    statut VARCHAR(30) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'approuve', 'rejete', 'en_revision')),
    version INT DEFAULT 1,
    calendrier_data JSONB NOT NULL,
    commentaire_proposeur TEXT,
    commentaire_validateur TEXT,
    modifications_demandees TEXT,
    date_rentree DATE,
    date_fin_cours DATE,
    periodes_examens JSONB,
    periodes_vacances JSONB,
    evenements_importants JSONB,
    document_calendrier_url TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_calendrier_annee ON validation_calendrier(annee_academique_id);
CREATE INDEX idx_calendrier_validateur ON validation_calendrier(validateur_id);
CREATE INDEX idx_calendrier_statut ON validation_calendrier(statut);
CREATE INDEX idx_calendrier_type ON validation_calendrier(type_calendrier);

-- 9. Table politique_academique
CREATE TABLE IF NOT EXISTS politique_academique (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titre VARCHAR(255) NOT NULL,
    type_politique VARCHAR(50) NOT NULL CHECK (type_politique IN ('academique', 'spirituelle', 'pastorale', 'administrative', 'financiere')),
    description TEXT NOT NULL,
    objectifs TEXT,
    principes_directeurs TEXT,
    date_adoption DATE NOT NULL,
    date_revision DATE,
    date_expiration DATE,
    auteur_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE RESTRICT,
    validateur_id UUID REFERENCES utilisateur(id) ON DELETE SET NULL,
    statut VARCHAR(30) DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'en_revision', 'approuve', 'actif', 'archive')),
    version VARCHAR(20) NOT NULL,
    document_url TEXT,
    domaines_application JSONB,
    indicateurs_suivi JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_politique_type ON politique_academique(type_politique);
CREATE INDEX idx_politique_statut ON politique_academique(statut);
CREATE INDEX idx_politique_validateur ON politique_academique(validateur_id);

-- 10. Table kpi_strategique
CREATE TABLE IF NOT EXISTS kpi_strategique (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(100) NOT NULL,
    categorie VARCHAR(50) NOT NULL CHECK (categorie IN ('academique', 'financier', 'rh', 'pastoral', 'infrastructure', 'qualite')),
    description TEXT,
    formule_calcul TEXT,
    unite_mesure VARCHAR(30),
    valeur_cible DECIMAL(15,2) NOT NULL,
    valeur_actuelle DECIMAL(15,2),
    seuil_alerte DECIMAL(15,2),
    frequence_mesure VARCHAR(30) CHECK (frequence_mesure IN ('quotidien', 'hebdomadaire', 'mensuel', 'trimestriel', 'annuel')),
    responsable_suivi_id UUID REFERENCES utilisateur(id) ON DELETE SET NULL,
    actif BOOLEAN DEFAULT TRUE,
    date_debut DATE NOT NULL,
    date_fin DATE,
    historique_valeurs JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kpi_categorie ON kpi_strategique(categorie);
CREATE INDEX idx_kpi_actif ON kpi_strategique(actif);
CREATE INDEX idx_kpi_responsable ON kpi_strategique(responsable_suivi_id);

-- 11. Table audit_president (pour la traçabilité)
CREATE TABLE IF NOT EXISTS audit_president (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_id UUID NOT NULL REFERENCES utilisateur(id),
    action VARCHAR(100) NOT NULL,
    entite VARCHAR(50) NOT NULL,
    entite_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    date_action TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_utilisateur ON audit_president(utilisateur_id);
CREATE INDEX idx_audit_action ON audit_president(action);
CREATE INDEX idx_audit_date ON audit_president(date_action);

-- =============================================================================
-- FIN DE LA MIGRATION
-- =============================================================================

-- Made with Bob
