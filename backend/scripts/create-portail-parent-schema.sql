-- ================================================================
-- PORTAIL PARENT - SCHEMA COMPLET
-- Gestion des comptes parents avec accès au suivi académique et financier
-- ================================================================

-- Table principale des parents/tuteurs
CREATE TABLE IF NOT EXISTS portail_parent (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    utilisateur_id UUID REFERENCES utilisateur(id) ON DELETE CASCADE,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    telephone VARCHAR(30),
    telephone_secondaire VARCHAR(30),
    adresse TEXT,
    profession VARCHAR(100),
    lieu_travail VARCHAR(200),
    telephone_travail VARCHAR(30),
    
    -- Authentification
    mot_de_passe VARCHAR(255) NOT NULL,
    actif BOOLEAN DEFAULT true,
    email_verifie BOOLEAN DEFAULT false,
    date_verification_email TIMESTAMP WITH TIME ZONE,
    token_verification VARCHAR(255),
    
    -- Sécurité
    derniere_connexion TIMESTAMP WITH TIME ZONE,
    tentatives_connexion_echouees SMALLINT DEFAULT 0,
    compte_verrouille BOOLEAN DEFAULT false,
    date_verrouillage TIMESTAMP WITH TIME ZONE,
    
    -- Préférences
    langue VARCHAR(10) DEFAULT 'fr',
    notifications_email BOOLEAN DEFAULT true,
    notifications_sms BOOLEAN DEFAULT false,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT portail_parent_langue_check CHECK (langue IN ('fr', 'en', 'mg'))
);

-- Relation parent-étudiant (un parent peut avoir plusieurs enfants)
CREATE TABLE IF NOT EXISTS parent_etudiant (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID NOT NULL REFERENCES portail_parent(id) ON DELETE CASCADE,
    etudiant_id UUID NOT NULL REFERENCES etudiant(id) ON DELETE CASCADE,
    
    -- Type de relation
    lien_parente VARCHAR(50) NOT NULL,
    est_tuteur_legal BOOLEAN DEFAULT false,
    priorite_contact SMALLINT DEFAULT 1,
    
    -- Autorisations spécifiques
    acces_notes BOOLEAN DEFAULT true,
    acces_absences BOOLEAN DEFAULT true,
    acces_financier BOOLEAN DEFAULT true,
    acces_bulletins BOOLEAN DEFAULT true,
    peut_autoriser_sortie BOOLEAN DEFAULT false,
    peut_effectuer_paiement BOOLEAN DEFAULT false,
    
    -- Validité
    date_debut DATE DEFAULT CURRENT_DATE,
    date_fin DATE,
    actif BOOLEAN DEFAULT true,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT parent_etudiant_lien_check CHECK (lien_parente IN ('pere', 'mere', 'tuteur', 'tutrice', 'grand_parent', 'oncle', 'tante', 'autre')),
    CONSTRAINT parent_etudiant_priorite_check CHECK (priorite_contact BETWEEN 1 AND 5),
    UNIQUE(parent_id, etudiant_id)
);

-- Notifications pour les parents
CREATE TABLE IF NOT EXISTS notification_parent (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID NOT NULL REFERENCES portail_parent(id) ON DELETE CASCADE,
    etudiant_id UUID REFERENCES etudiant(id) ON DELETE CASCADE,
    
    -- Contenu
    type_notification VARCHAR(50) NOT NULL,
    titre VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    priorite VARCHAR(20) DEFAULT 'normale',
    
    -- Statut
    lue BOOLEAN DEFAULT false,
    date_lecture TIMESTAMP WITH TIME ZONE,
    archivee BOOLEAN DEFAULT false,
    
    -- Métadonnées
    reference_id UUID, -- ID de l'objet lié (paiement, note, absence, etc.)
    reference_type VARCHAR(50), -- Type d'objet (paiement, note, absence, etc.)
    action_requise BOOLEAN DEFAULT false,
    url_action VARCHAR(500),
    
    -- Envoi
    envoyee_email BOOLEAN DEFAULT false,
    date_envoi_email TIMESTAMP WITH TIME ZONE,
    envoyee_sms BOOLEAN DEFAULT false,
    date_envoi_sms TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT notification_parent_type_check CHECK (type_notification IN (
        'paiement_attendu', 'paiement_recu', 'paiement_retard',
        'note_disponible', 'bulletin_disponible',
        'absence_signale', 'retard_signale',
        'discipline_incident', 'convocation',
        'information_generale', 'urgence',
        'autorisation_requise', 'message_recu'
    )),
    CONSTRAINT notification_parent_priorite_check CHECK (priorite IN ('basse', 'normale', 'haute', 'urgente'))
);

-- Autorisations de sortie/absence en ligne
CREATE TABLE IF NOT EXISTS autorisation_parent (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID NOT NULL REFERENCES portail_parent(id) ON DELETE CASCADE,
    etudiant_id UUID NOT NULL REFERENCES etudiant(id) ON DELETE CASCADE,
    
    -- Type et détails
    type_autorisation VARCHAR(50) NOT NULL,
    motif TEXT NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    heure_debut TIME,
    heure_fin TIME,
    
    -- Justification
    justificatif_url VARCHAR(500),
    commentaire TEXT,
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'en_attente',
    traitee_par UUID REFERENCES utilisateur(id),
    date_traitement TIMESTAMP WITH TIME ZONE,
    commentaire_traitement TEXT,
    
    -- Validation
    validee_par UUID REFERENCES utilisateur(id),
    date_validation TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT autorisation_parent_type_check CHECK (type_autorisation IN (
        'absence_maladie', 'absence_familiale', 'absence_autre',
        'sortie_anticipee', 'arrivee_tardive', 'dispense_cours'
    )),
    CONSTRAINT autorisation_parent_statut_check CHECK (statut IN (
        'en_attente', 'approuvee', 'refusee', 'annulee'
    ))
);

-- Messagerie parent-établissement
CREATE TABLE IF NOT EXISTS message_parent (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID NOT NULL REFERENCES portail_parent(id) ON DELETE CASCADE,
    etudiant_id UUID REFERENCES etudiant(id) ON DELETE CASCADE,
    
    -- Destinataire
    destinataire_type VARCHAR(50) NOT NULL,
    destinataire_id UUID REFERENCES utilisateur(id),
    
    -- Contenu
    sujet VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    piece_jointe_url VARCHAR(500),
    
    -- Statut
    lu BOOLEAN DEFAULT false,
    date_lecture TIMESTAMP WITH TIME ZONE,
    repondu BOOLEAN DEFAULT false,
    archive BOOLEAN DEFAULT false,
    
    -- Réponse
    message_parent_id UUID REFERENCES message_parent(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT message_parent_destinataire_check CHECK (destinataire_type IN (
        'surveillant_general', 'secretariat', 'scolarite',
        'direction', 'enseignant', 'caissier'
    ))
);

-- Réponses aux messages
CREATE TABLE IF NOT EXISTS reponse_message_parent (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES message_parent(id) ON DELETE CASCADE,
    auteur_id UUID NOT NULL REFERENCES utilisateur(id),
    
    contenu TEXT NOT NULL,
    piece_jointe_url VARCHAR(500),
    
    lu BOOLEAN DEFAULT false,
    date_lecture TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Suivi des consultations (pour analytics)
CREATE TABLE IF NOT EXISTS consultation_parent (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID NOT NULL REFERENCES portail_parent(id) ON DELETE CASCADE,
    etudiant_id UUID REFERENCES etudiant(id) ON DELETE CASCADE,
    
    type_consultation VARCHAR(50) NOT NULL,
    reference_id UUID,
    duree_secondes INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT consultation_parent_type_check CHECK (type_consultation IN (
        'bulletin', 'notes', 'absences', 'paiements', 'echeancier',
        'messages', 'notifications', 'profil_etudiant'
    ))
);

-- Préférences de notification par parent
CREATE TABLE IF NOT EXISTS preference_notification_parent (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID NOT NULL REFERENCES portail_parent(id) ON DELETE CASCADE,
    
    type_notification VARCHAR(50) NOT NULL,
    actif BOOLEAN DEFAULT true,
    email BOOLEAN DEFAULT true,
    sms BOOLEAN DEFAULT false,
    push BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(parent_id, type_notification)
);

-- Historique des paiements effectués par les parents
CREATE TABLE IF NOT EXISTS paiement_parent (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID NOT NULL REFERENCES portail_parent(id) ON DELETE CASCADE,
    paiement_id UUID NOT NULL REFERENCES paiement(id) ON DELETE CASCADE,
    
    -- Délégation
    delegue_par UUID REFERENCES utilisateur(id),
    date_delegation TIMESTAMP WITH TIME ZONE,
    
    -- Confirmation
    confirme BOOLEAN DEFAULT false,
    date_confirmation TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Sessions de connexion (sécurité)
CREATE TABLE IF NOT EXISTS session_parent (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID NOT NULL REFERENCES portail_parent(id) ON DELETE CASCADE,
    
    token VARCHAR(500) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    date_connexion TIMESTAMP WITH TIME ZONE DEFAULT now(),
    date_expiration TIMESTAMP WITH TIME ZONE NOT NULL,
    date_deconnexion TIMESTAMP WITH TIME ZONE,
    
    actif BOOLEAN DEFAULT true
);

-- ================================================================
-- INDEX POUR PERFORMANCES
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_portail_parent_email ON portail_parent(email);
CREATE INDEX IF NOT EXISTS idx_portail_parent_utilisateur ON portail_parent(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_portail_parent_actif ON portail_parent(actif);

CREATE INDEX IF NOT EXISTS idx_parent_etudiant_parent ON parent_etudiant(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_etudiant_etudiant ON parent_etudiant(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_parent_etudiant_actif ON parent_etudiant(actif);

CREATE INDEX IF NOT EXISTS idx_notification_parent_parent ON notification_parent(parent_id);
CREATE INDEX IF NOT EXISTS idx_notification_parent_etudiant ON notification_parent(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_notification_parent_lue ON notification_parent(lue);
CREATE INDEX IF NOT EXISTS idx_notification_parent_type ON notification_parent(type_notification);
CREATE INDEX IF NOT EXISTS idx_notification_parent_created ON notification_parent(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_autorisation_parent_parent ON autorisation_parent(parent_id);
CREATE INDEX IF NOT EXISTS idx_autorisation_parent_etudiant ON autorisation_parent(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_autorisation_parent_statut ON autorisation_parent(statut);
CREATE INDEX IF NOT EXISTS idx_autorisation_parent_dates ON autorisation_parent(date_debut, date_fin);

CREATE INDEX IF NOT EXISTS idx_message_parent_parent ON message_parent(parent_id);
CREATE INDEX IF NOT EXISTS idx_message_parent_etudiant ON message_parent(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_message_parent_destinataire ON message_parent(destinataire_id);
CREATE INDEX IF NOT EXISTS idx_message_parent_lu ON message_parent(lu);
CREATE INDEX IF NOT EXISTS idx_message_parent_created ON message_parent(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reponse_message_parent_message ON reponse_message_parent(message_id);
CREATE INDEX IF NOT EXISTS idx_reponse_message_parent_auteur ON reponse_message_parent(auteur_id);

CREATE INDEX IF NOT EXISTS idx_consultation_parent_parent ON consultation_parent(parent_id);
CREATE INDEX IF NOT EXISTS idx_consultation_parent_type ON consultation_parent(type_consultation);
CREATE INDEX IF NOT EXISTS idx_consultation_parent_created ON consultation_parent(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_session_parent_parent ON session_parent(parent_id);
CREATE INDEX IF NOT EXISTS idx_session_parent_token ON session_parent(token);
CREATE INDEX IF NOT EXISTS idx_session_parent_actif ON session_parent(actif);

-- ================================================================
-- COMMENTAIRES
-- ================================================================

COMMENT ON TABLE portail_parent IS 'Comptes parents/tuteurs pour accès au portail';
COMMENT ON TABLE parent_etudiant IS 'Relation entre parents et étudiants avec autorisations';
COMMENT ON TABLE notification_parent IS 'Notifications envoyées aux parents';
COMMENT ON TABLE autorisation_parent IS 'Autorisations de sortie/absence soumises par les parents';
COMMENT ON TABLE message_parent IS 'Messages entre parents et établissement';
COMMENT ON TABLE reponse_message_parent IS 'Réponses aux messages des parents';
COMMENT ON TABLE consultation_parent IS 'Historique des consultations pour analytics';
COMMENT ON TABLE preference_notification_parent IS 'Préférences de notification par parent';
COMMENT ON TABLE paiement_parent IS 'Historique des paiements effectués par les parents';
COMMENT ON TABLE session_parent IS 'Sessions de connexion pour sécurité';

-- Made with Bob
