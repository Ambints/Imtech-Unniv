-- Table pour stocker les messages envoyés par les enseignants
CREATE TABLE IF NOT EXISTS message_enseignant (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enseignant_id UUID NOT NULL,
    sujet VARCHAR(255) NOT NULL,
    contenu TEXT NOT NULL,
    type_message VARCHAR(50) NOT NULL CHECK (type_message IN ('direct', 'classe', 'parcours')),
    
    -- Pour message direct
    etudiant_id UUID,
    
    -- Pour message classe
    classe_id UUID,
    
    -- Pour message parcours
    parcours_id UUID,
    niveau_id UUID,
    
    -- Métadonnées
    nombre_destinataires INTEGER DEFAULT 0,
    date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(50) DEFAULT 'envoye' CHECK (statut IN ('envoye', 'lu', 'archive')),
    
    -- Contraintes
    CONSTRAINT fk_enseignant FOREIGN KEY (enseignant_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
    CONSTRAINT fk_etudiant FOREIGN KEY (etudiant_id) REFERENCES etudiant(id) ON DELETE CASCADE,
    CONSTRAINT fk_parcours FOREIGN KEY (parcours_id) REFERENCES parcours(id) ON DELETE SET NULL,
    CONSTRAINT fk_niveau FOREIGN KEY (niveau_id) REFERENCES niveau_etude(id) ON DELETE SET NULL
);

-- Table pour tracker les destinataires individuels et leur statut de lecture
CREATE TABLE IF NOT EXISTS message_destinataire (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL,
    etudiant_id UUID NOT NULL,
    lu BOOLEAN DEFAULT FALSE,
    date_lecture TIMESTAMP,
    
    CONSTRAINT fk_message FOREIGN KEY (message_id) REFERENCES message_enseignant(id) ON DELETE CASCADE,
    CONSTRAINT fk_etudiant_dest FOREIGN KEY (etudiant_id) REFERENCES etudiant(id) ON DELETE CASCADE,
    CONSTRAINT unique_message_etudiant UNIQUE (message_id, etudiant_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_message_enseignant_id ON message_enseignant(enseignant_id);
CREATE INDEX IF NOT EXISTS idx_message_type ON message_enseignant(type_message);
CREATE INDEX IF NOT EXISTS idx_message_date ON message_enseignant(date_envoi);
CREATE INDEX IF NOT EXISTS idx_destinataire_message ON message_destinataire(message_id);
CREATE INDEX IF NOT EXISTS idx_destinataire_etudiant ON message_destinataire(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_destinataire_lu ON message_destinataire(lu);

-- Commentaires
COMMENT ON TABLE message_enseignant IS 'Messages envoyés par les enseignants aux étudiants';
COMMENT ON TABLE message_destinataire IS 'Destinataires individuels des messages avec statut de lecture';
COMMENT ON COLUMN message_enseignant.type_message IS 'Type: direct (1 étudiant), classe (tous étudiants classe), parcours (filtré par parcours/niveau)';

-- Made with Bob
