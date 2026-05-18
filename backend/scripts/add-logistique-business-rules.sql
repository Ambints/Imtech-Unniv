-- =============================================================================
-- RÈGLES MÉTIER LOGISTIQUE & MAINTENANCE - Migration SQL
-- Architecture Multi-Tenant IMTECH University
-- =============================================================================
-- 
-- RÈGLES IMPLÉMENTÉES:
-- 01. Une salle ne peut être réservée que si elle n'est pas déjà occupée sur le même créneau horaire
-- 02. Un ticket de maintenance doit être assigné à un responsable dans les 48h suivant sa création
-- 03. Le stock d'un produit d'entretien sous le seuil critique déclenche automatiquement une alerte
-- 04. Une réservation de salle pour événement hors cours requiert la validation du responsable logistique
-- 05. Le planning de nettoyage ne peut être modifié que par le responsable logistique
-- 06. Un équipement doit être codifié avant enregistrement dans l'inventaire
-- 07. Tout mouvement de stock est obligatoirement tracé avec date, quantité et responsable
-- 08. La consommation énergétique est enregistrée mensuellement
-- 09. Un prestataire ménage externalisé est validé sur feuille de présence
-- 10. Aucune infrastructure ne peut être mise hors service sans validation double
-- 
-- =============================================================================

-- -----------------------------------------------------------------------------
-- NOUVELLES TABLES NÉCESSAIRES
-- -----------------------------------------------------------------------------

-- Table pour la consommation énergétique (Règle 08)
CREATE TABLE IF NOT EXISTS consommation_energetique (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batiment_id UUID REFERENCES batiment(id),
    type_energie VARCHAR(50) NOT NULL CHECK (type_energie IN ('electricite', 'eau', 'gaz', 'autre')),
    mois SMALLINT NOT NULL CHECK (mois BETWEEN 1 AND 12),
    annee SMALLINT NOT NULL,
    consommation NUMERIC(12,2) NOT NULL,
    unite VARCHAR(20) NOT NULL, -- kWh, m3, etc.
    cout NUMERIC(12,2),
    releve_par UUID REFERENCES utilisateur(id),
    date_releve DATE NOT NULL DEFAULT CURRENT_DATE,
    observations TEXT,
    transmis_economat BOOLEAN DEFAULT FALSE,
    date_transmission TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (batiment_id, type_energie, mois, annee)
);

-- Table pour les prestataires externes (Règle 09)
CREATE TABLE IF NOT EXISTS prestataire_externe (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(200) NOT NULL,
    type_service VARCHAR(50) NOT NULL CHECK (type_service IN ('menage', 'securite', 'maintenance', 'autre')),
    contact VARCHAR(100),
    telephone VARCHAR(30),
    email VARCHAR(254),
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les feuilles de présence prestataires (Règle 09)
CREATE TABLE IF NOT EXISTS feuille_presence_prestataire (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prestataire_id UUID NOT NULL REFERENCES prestataire_externe(id),
    date_intervention DATE NOT NULL,
    heure_debut TIME NOT NULL,
    heure_fin TIME NOT NULL,
    zone_intervention VARCHAR(200),
    taches_effectuees TEXT,
    valide_par UUID REFERENCES utilisateur(id), -- Responsable logistique
    date_validation TIMESTAMPTZ,
    observations TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour la mise hors service d'infrastructures (Règle 10)
CREATE TABLE IF NOT EXISTS mise_hors_service (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_infrastructure VARCHAR(50) NOT NULL CHECK (type_infrastructure IN ('batiment', 'salle', 'equipement')),
    infrastructure_id UUID NOT NULL,
    motif TEXT NOT NULL,
    date_debut DATE NOT NULL,
    date_fin_prevue DATE,
    demande_par UUID NOT NULL REFERENCES utilisateur(id),
    date_demande TIMESTAMPTZ DEFAULT NOW(),
    valide_responsable_logistique UUID REFERENCES utilisateur(id),
    date_validation_logistique TIMESTAMPTZ,
    valide_president UUID REFERENCES utilisateur(id),
    date_validation_president TIMESTAMPTZ,
    statut VARCHAR(30) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'valide_logistique', 'valide_president', 'active', 'terminee', 'annulee')),
    observations TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour l'inventaire des équipements (Règle 06)
CREATE TABLE IF NOT EXISTS equipement (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code_equipement VARCHAR(50) NOT NULL UNIQUE, -- Codification obligatoire
    libelle VARCHAR(200) NOT NULL,
    categorie VARCHAR(50) NOT NULL CHECK (categorie IN ('informatique', 'mobilier', 'audiovisuel', 'laboratoire', 'autre')),
    salle_id UUID REFERENCES salle(id),
    batiment_id UUID REFERENCES batiment(id),
    date_acquisition DATE,
    valeur_acquisition NUMERIC(12,2),
    etat VARCHAR(30) DEFAULT 'bon' CHECK (etat IN ('neuf', 'bon', 'moyen', 'mauvais', 'hors_service')),
    numero_serie VARCHAR(100),
    fournisseur VARCHAR(200),
    garantie_jusqu_au DATE,
    observations TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- RÈGLE 01: Vérifier qu'une salle n'est pas déjà réservée sur le créneau
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_reservation_salle_conflit()
RETURNS TRIGGER AS $$
DECLARE
    v_conflit_count INTEGER;
BEGIN
    -- Vérifier les conflits avec d'autres réservations
    SELECT COUNT(*) INTO v_conflit_count
    FROM reservation_salle rs
    WHERE rs.salle_id = NEW.salle_id
    AND rs.date_reservation = NEW.date_reservation
    AND rs.statut NOT IN ('refusee', 'annulee')
    AND rs.id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
    AND (
        -- Chevauchement de créneaux horaires
        (NEW.heure_debut >= rs.heure_debut AND NEW.heure_debut < rs.heure_fin)
        OR (NEW.heure_fin > rs.heure_debut AND NEW.heure_fin <= rs.heure_fin)
        OR (NEW.heure_debut <= rs.heure_debut AND NEW.heure_fin >= rs.heure_fin)
    );
    
    IF v_conflit_count > 0 THEN
        RAISE EXCEPTION 'Cette salle est déjà réservée sur ce créneau horaire. Veuillez choisir un autre créneau.';
    END IF;
    
    -- Vérifier aussi les conflits avec l'emploi du temps des cours
    SELECT COUNT(*) INTO v_conflit_count
    FROM emploi_du_temps edt
    WHERE edt.salle_id = NEW.salle_id
    AND edt.jour_semaine = EXTRACT(ISODOW FROM NEW.date_reservation)
    AND (
        (NEW.heure_debut >= edt.heure_debut AND NEW.heure_debut < edt.heure_fin)
        OR (NEW.heure_fin > edt.heure_debut AND NEW.heure_fin <= edt.heure_fin)
        OR (NEW.heure_debut <= edt.heure_debut AND NEW.heure_fin >= edt.heure_fin)
    );
    
    IF v_conflit_count > 0 THEN
        RAISE EXCEPTION 'Cette salle est occupée par un cours sur ce créneau. Veuillez consulter l''emploi du temps.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- RÈGLE 02: Vérifier qu'un ticket est assigné dans les 48h
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_ticket_assignment_deadline()
RETURNS TABLE(
    ticket_id UUID,
    titre VARCHAR,
    date_signalement TIMESTAMPTZ,
    heures_ecoulees NUMERIC,
    priorite VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tm.id,
        tm.titre,
        tm.date_signalement,
        EXTRACT(EPOCH FROM (NOW() - tm.date_signalement)) / 3600 AS heures_ecoulees,
        tm.priorite
    FROM ticket_maintenance tm
    WHERE tm.assigne_a IS NULL
    AND tm.statut = 'ouvert'
    AND tm.date_signalement < NOW() - INTERVAL '48 hours'
    ORDER BY tm.date_signalement;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour notifier les tickets non assignés
CREATE OR REPLACE FUNCTION notify_unassigned_tickets()
RETURNS TRIGGER AS $$
DECLARE
    v_heures_ecoulees NUMERIC;
BEGIN
    -- Calculer les heures écoulées depuis la création
    v_heures_ecoulees := EXTRACT(EPOCH FROM (NOW() - NEW.date_signalement)) / 3600;
    
    -- Si le ticket n'est toujours pas assigné après 48h, créer une notification
    IF NEW.assigne_a IS NULL AND v_heures_ecoulees >= 48 THEN
        INSERT INTO notification (utilisateur_id, titre, message, type_notification)
        SELECT u.id,
               'Ticket maintenance non assigné',
               'Le ticket "' || NEW.titre || '" n''a pas été assigné depuis ' || ROUND(v_heures_ecoulees) || ' heures.',
               'alerte'
        FROM utilisateur u
        WHERE u.role IN ('logistique', 'admin') AND u.actif = TRUE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- RÈGLE 03: Alerte automatique stock sous seuil (vérifier si existe déjà)
-- -----------------------------------------------------------------------------
-- Note: Cette règle existe déjà dans le système via trigger_alerte_stock()
-- On va créer une vue pour faciliter le suivi

CREATE OR REPLACE VIEW vue_stock_critique AS
SELECT 
    s.id,
    s.reference,
    s.libelle,
    s.categorie,
    s.quantite_stock,
    s.seuil_alerte,
    s.unite,
    s.prix_unitaire,
    s.fournisseur,
    s.emplacement,
    ROUND(((s.quantite_stock / NULLIF(s.seuil_alerte, 0)) * 100)::NUMERIC, 2) AS pourcentage_seuil,
    CASE 
        WHEN s.quantite_stock = 0 THEN 'RUPTURE'
        WHEN s.quantite_stock <= s.seuil_alerte * 0.5 THEN 'CRITIQUE'
        WHEN s.quantite_stock <= s.seuil_alerte THEN 'ALERTE'
        ELSE 'NORMAL'
    END AS niveau_alerte
FROM stock s
WHERE s.quantite_stock <= s.seuil_alerte
ORDER BY 
    CASE 
        WHEN s.quantite_stock = 0 THEN 1
        WHEN s.quantite_stock <= s.seuil_alerte * 0.5 THEN 2
        ELSE 3
    END,
    s.quantite_stock ASC;

-- -----------------------------------------------------------------------------
-- RÈGLE 04: Validation obligatoire pour réservation événement
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION require_validation_for_event_reservation()
RETURNS TRIGGER AS $$
BEGIN
    -- Si c'est une nouvelle réservation, elle doit être en attente de validation
    IF TG_OP = 'INSERT' THEN
        NEW.statut := 'en_attente';
        NEW.approuve_par := NULL;
    END IF;
    
    -- Empêcher l'approbation directe sans validation du responsable logistique
    IF TG_OP = 'UPDATE' AND OLD.statut = 'en_attente' AND NEW.statut = 'approuvee' THEN
        IF NEW.approuve_par IS NULL THEN
            RAISE EXCEPTION 'Une réservation de salle doit être validée par le responsable logistique.';
        END IF;
        
        -- Vérifier que l'approbateur a le rôle logistique
        IF NOT EXISTS (
            SELECT 1 FROM utilisateur u
            WHERE u.id = NEW.approuve_par
            AND u.role IN ('logistique', 'admin')
            AND u.actif = TRUE
        ) THEN
            RAISE EXCEPTION 'Seul le responsable logistique ou un administrateur peut approuver une réservation.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- RÈGLE 05: Modification planning nettoyage restreinte au responsable logistique
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION restrict_planning_entretien_modification()
RETURNS TRIGGER AS $$
DECLARE
    v_user_role VARCHAR(50);
BEGIN
    -- Récupérer le rôle de l'utilisateur qui modifie (via session variable)
    v_user_role := current_setting('app.current_user_role', TRUE);
    
    IF v_user_role IS NULL THEN
        -- Si pas de variable de session, on laisse passer (pour les migrations)
        RETURN NEW;
    END IF;
    
    IF v_user_role NOT IN ('logistique', 'admin') THEN
        RAISE EXCEPTION 'Seul le responsable logistique peut modifier le planning de nettoyage.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- RÈGLE 06: Codification obligatoire des équipements
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION validate_equipement_code()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier que le code n'est pas vide
    IF NEW.code_equipement IS NULL OR TRIM(NEW.code_equipement) = '' THEN
        RAISE EXCEPTION 'Le code équipement est obligatoire. Format recommandé: CAT-YYYY-NNNN (ex: INF-2024-0001)';
    END IF;
    
    -- Vérifier le format du code (optionnel mais recommandé)
    IF NEW.code_equipement !~ '^[A-Z]{3}-[0-9]{4}-[0-9]{4}$' THEN
        RAISE WARNING 'Format de code non standard. Format recommandé: CAT-YYYY-NNNN (ex: INF-2024-0001)';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- RÈGLE 07: Traçabilité obligatoire des mouvements de stock
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION enforce_stock_movement_traceability()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier que tous les champs obligatoires sont renseignés
    IF NEW.utilisateur_id IS NULL THEN
        RAISE EXCEPTION 'Le responsable du mouvement de stock doit être identifié.';
    END IF;
    
    IF NEW.motif IS NULL OR TRIM(NEW.motif) = '' THEN
        RAISE EXCEPTION 'Le motif du mouvement de stock est obligatoire.';
    END IF;
    
    IF NEW.quantite IS NULL OR NEW.quantite = 0 THEN
        RAISE EXCEPTION 'La quantité du mouvement doit être spécifiée et non nulle.';
    END IF;
    
    -- S'assurer que la date est renseignée
    IF NEW.date_mouvement IS NULL THEN
        NEW.date_mouvement := NOW();
    END IF;
    
    -- Mettre à jour le stock
    IF NEW.type_mouvement = 'entree' THEN
        UPDATE stock SET 
            quantite_stock = quantite_stock + NEW.quantite,
            derniere_mise_a_jour = NOW()
        WHERE id = NEW.stock_id;
    ELSIF NEW.type_mouvement = 'sortie' THEN
        UPDATE stock SET 
            quantite_stock = quantite_stock - NEW.quantite,
            derniere_mise_a_jour = NOW()
        WHERE id = NEW.stock_id;
    ELSIF NEW.type_mouvement = 'ajustement' THEN
        UPDATE stock SET 
            quantite_stock = NEW.quantite,
            derniere_mise_a_jour = NOW()
        WHERE id = NEW.stock_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- RÈGLE 08: Enregistrement mensuel consommation énergétique
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION validate_consommation_energetique()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier que le relevé est fait par un utilisateur autorisé
    IF NEW.releve_par IS NULL THEN
        RAISE EXCEPTION 'Le relevé doit être effectué par un utilisateur identifié.';
    END IF;
    
    -- Vérifier que la consommation est positive
    IF NEW.consommation <= 0 THEN
        RAISE EXCEPTION 'La consommation doit être une valeur positive.';
    END IF;
    
    -- Notifier l'économat automatiquement
    IF NEW.transmis_economat = FALSE THEN
        INSERT INTO notification (utilisateur_id, titre, message, type_notification)
        SELECT u.id,
               'Nouveau relevé énergétique',
               'Relevé ' || NEW.type_energie || ' pour ' || TO_CHAR(TO_DATE(NEW.annee || '-' || NEW.mois || '-01', 'YYYY-MM-DD'), 'Month YYYY') || ': ' || NEW.consommation || ' ' || NEW.unite,
               'info'
        FROM utilisateur u
        WHERE u.role IN ('economat', 'admin') AND u.actif = TRUE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- RÈGLE 09: Validation feuille de présence prestataire
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION validate_feuille_presence_prestataire()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier que la validation est faite par un responsable logistique
    IF NEW.valide_par IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM utilisateur u
            WHERE u.id = NEW.valide_par
            AND u.role IN ('logistique', 'admin')
            AND u.actif = TRUE
        ) THEN
            RAISE EXCEPTION 'Seul le responsable logistique peut valider une feuille de présence.';
        END IF;
        
        -- Enregistrer la date de validation
        IF NEW.date_validation IS NULL THEN
            NEW.date_validation := NOW();
        END IF;
    END IF;
    
    -- Vérifier la cohérence des heures
    IF NEW.heure_fin <= NEW.heure_debut THEN
        RAISE EXCEPTION 'L''heure de fin doit être postérieure à l''heure de début.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- RÈGLE 10: Validation double pour mise hors service
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION validate_mise_hors_service()
RETURNS TRIGGER AS $$
BEGIN
    -- Gestion du workflow de validation
    IF TG_OP = 'INSERT' THEN
        NEW.statut := 'en_attente';
    END IF;
    
    IF TG_OP = 'UPDATE' THEN
        -- Validation par le responsable logistique
        IF OLD.statut = 'en_attente' AND NEW.valide_responsable_logistique IS NOT NULL THEN
            IF NOT EXISTS (
                SELECT 1 FROM utilisateur u
                WHERE u.id = NEW.valide_responsable_logistique
                AND u.role IN ('logistique', 'admin')
                AND u.actif = TRUE
            ) THEN
                RAISE EXCEPTION 'Seul le responsable logistique peut effectuer la première validation.';
            END IF;
            NEW.statut := 'valide_logistique';
            NEW.date_validation_logistique := NOW();
        END IF;
        
        -- Validation par le président
        IF OLD.statut = 'valide_logistique' AND NEW.valide_president IS NOT NULL THEN
            IF NOT EXISTS (
                SELECT 1 FROM utilisateur u
                WHERE u.id = NEW.valide_president
                AND u.role IN ('president', 'admin')
                AND u.actif = TRUE
            ) THEN
                RAISE EXCEPTION 'Seul le président peut effectuer la validation finale.';
            END IF;
            NEW.statut := 'valide_president';
            NEW.date_validation_president := NOW();
        END IF;
        
        -- Activation effective de la mise hors service
        IF OLD.statut = 'valide_president' AND NEW.statut = 'active' THEN
            -- Mettre à jour l'infrastructure concernée
            IF NEW.type_infrastructure = 'salle' THEN
                UPDATE salle SET disponible = FALSE WHERE id = NEW.infrastructure_id;
            ELSIF NEW.type_infrastructure = 'batiment' THEN
                UPDATE batiment SET actif = FALSE WHERE id = NEW.infrastructure_id;
            ELSIF NEW.type_infrastructure = 'equipement' THEN
                UPDATE equipement SET etat = 'hors_service' WHERE id = NEW.infrastructure_id;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- CRÉATION DES TRIGGERS
-- -----------------------------------------------------------------------------

-- Règle 01: Conflit réservation salle
DROP TRIGGER IF EXISTS trigger_check_reservation_conflit_insert ON reservation_salle;
CREATE TRIGGER trigger_check_reservation_conflit_insert
    BEFORE INSERT ON reservation_salle
    FOR EACH ROW
    EXECUTE FUNCTION check_reservation_salle_conflit();

DROP TRIGGER IF EXISTS trigger_check_reservation_conflit_update ON reservation_salle;
CREATE TRIGGER trigger_check_reservation_conflit_update
    BEFORE UPDATE ON reservation_salle
    FOR EACH ROW
    WHEN (OLD.salle_id IS DISTINCT FROM NEW.salle_id 
          OR OLD.date_reservation IS DISTINCT FROM NEW.date_reservation
          OR OLD.heure_debut IS DISTINCT FROM NEW.heure_debut
          OR OLD.heure_fin IS DISTINCT FROM NEW.heure_fin)
    EXECUTE FUNCTION check_reservation_salle_conflit();

-- Règle 04: Validation réservation
DROP TRIGGER IF EXISTS trigger_require_validation_reservation ON reservation_salle;
CREATE TRIGGER trigger_require_validation_reservation
    BEFORE INSERT OR UPDATE ON reservation_salle
    FOR EACH ROW
    EXECUTE FUNCTION require_validation_for_event_reservation();

-- Règle 05: Restriction planning entretien
DROP TRIGGER IF EXISTS trigger_restrict_planning_modification ON planning_entretien;
CREATE TRIGGER trigger_restrict_planning_modification
    BEFORE UPDATE ON planning_entretien
    FOR EACH ROW
    EXECUTE FUNCTION restrict_planning_entretien_modification();

-- Règle 06: Validation code équipement
DROP TRIGGER IF EXISTS trigger_validate_equipement_code ON equipement;
CREATE TRIGGER trigger_validate_equipement_code
    BEFORE INSERT OR UPDATE ON equipement
    FOR EACH ROW
    EXECUTE FUNCTION validate_equipement_code();

-- Règle 07: Traçabilité stock
DROP TRIGGER IF EXISTS trigger_enforce_stock_traceability ON mouvement_stock;
CREATE TRIGGER trigger_enforce_stock_traceability
    BEFORE INSERT ON mouvement_stock
    FOR EACH ROW
    EXECUTE FUNCTION enforce_stock_movement_traceability();

-- Règle 08: Validation consommation énergétique
DROP TRIGGER IF EXISTS trigger_validate_consommation ON consommation_energetique;
CREATE TRIGGER trigger_validate_consommation
    BEFORE INSERT OR UPDATE ON consommation_energetique
    FOR EACH ROW
    EXECUTE FUNCTION validate_consommation_energetique();

-- Règle 09: Validation feuille présence
DROP TRIGGER IF EXISTS trigger_validate_feuille_presence ON feuille_presence_prestataire;
CREATE TRIGGER trigger_validate_feuille_presence
    BEFORE INSERT OR UPDATE ON feuille_presence_prestataire
    FOR EACH ROW
    EXECUTE FUNCTION validate_feuille_presence_prestataire();

-- Règle 10: Validation mise hors service
DROP TRIGGER IF EXISTS trigger_validate_mise_hors_service ON mise_hors_service;
CREATE TRIGGER trigger_validate_mise_hors_service
    BEFORE INSERT OR UPDATE ON mise_hors_service
    FOR EACH ROW
    EXECUTE FUNCTION validate_mise_hors_service();

-- -----------------------------------------------------------------------------
-- VUES UTILITAIRES
-- -----------------------------------------------------------------------------

-- Vue: Réservations de salles avec conflits potentiels
CREATE OR REPLACE VIEW vue_reservations_salles AS
SELECT 
    rs.id,
    rs.titre,
    s.nom AS salle_nom,
    s.code AS salle_code,
    b.nom AS batiment_nom,
    rs.date_reservation,
    rs.heure_debut,
    rs.heure_fin,
    u_demande.nom || ' ' || u_demande.prenom AS demandeur,
    u_approuve.nom || ' ' || u_approuve.prenom AS approbateur,
    rs.statut,
    rs.created_at
FROM reservation_salle rs
JOIN salle s ON rs.salle_id = s.id
LEFT JOIN batiment b ON s.batiment_id = b.id
JOIN utilisateur u_demande ON rs.demande_par = u_demande.id
LEFT JOIN utilisateur u_approuve ON rs.approuve_par = u_approuve.id
ORDER BY rs.date_reservation DESC, rs.heure_debut;

-- Vue: Tickets maintenance non assignés ou en retard
CREATE OR REPLACE VIEW vue_tickets_maintenance_alerte AS
SELECT 
    tm.id,
    tm.titre,
    tm.type_maintenance,
    tm.priorite,
    tm.statut,
    tm.date_signalement,
    EXTRACT(EPOCH FROM (NOW() - tm.date_signalement)) / 3600 AS heures_ecoulees,
    CASE 
        WHEN tm.assigne_a IS NULL AND EXTRACT(EPOCH FROM (NOW() - tm.date_signalement)) / 3600 >= 48 THEN 'NON_ASSIGNE_48H'
        WHEN tm.assigne_a IS NULL AND EXTRACT(EPOCH FROM (NOW() - tm.date_signalement)) / 3600 >= 24 THEN 'NON_ASSIGNE_24H'
        WHEN tm.assigne_a IS NULL THEN 'NON_ASSIGNE'
        ELSE 'ASSIGNE'
    END AS niveau_alerte,
    u_signale.nom || ' ' || u_signale.prenom AS signale_par_nom,
    u_assigne.nom || ' ' || u_assigne.prenom AS assigne_a_nom
FROM ticket_maintenance tm
JOIN utilisateur u_signale ON tm.signale_par = u_signale.id
LEFT JOIN utilisateur u_assigne ON tm.assigne_a = u_assigne.id
WHERE tm.statut IN ('ouvert', 'en_cours')
ORDER BY 
    CASE tm.priorite
        WHEN 'urgente' THEN 1
        WHEN 'haute' THEN 2
        WHEN 'normale' THEN 3
        ELSE 4
    END,
    tm.date_signalement;

-- Vue: Consommations énergétiques non transmises à l'économat
CREATE OR REPLACE VIEW vue_consommations_non_transmises AS
SELECT 
    ce.id,
    b.nom AS batiment,
    ce.type_energie,
    ce.mois,
    ce.annee,
    TO_CHAR(TO_DATE(ce.annee || '-' || ce.mois || '-01', 'YYYY-MM-DD'), 'Month YYYY') AS periode,
    ce.consommation,
    ce.unite,
    ce.cout,
    u.nom || ' ' || u.prenom AS releve_par_nom,
    ce.date_releve,
    EXTRACT(DAY FROM (NOW() - ce.date_releve)) AS jours_depuis_releve
FROM consommation_energetique ce
LEFT JOIN batiment b ON ce.batiment_id = b.id
JOIN utilisateur u ON ce.releve_par = u.id
WHERE ce.transmis_economat = FALSE
ORDER BY ce.annee DESC, ce.mois DESC, ce.date_releve;

-- Vue: Mises hors service en attente de validation
CREATE OR REPLACE VIEW vue_mises_hors_service_pending AS
SELECT 
    mhs.id,
    mhs.type_infrastructure,
    CASE mhs.type_infrastructure
        WHEN 'salle' THEN (SELECT nom FROM salle WHERE id = mhs.infrastructure_id)
        WHEN 'batiment' THEN (SELECT nom FROM batiment WHERE id = mhs.infrastructure_id)
        WHEN 'equipement' THEN (SELECT libelle FROM equipement WHERE id = mhs.infrastructure_id)
    END AS infrastructure_nom,
    mhs.motif,
    mhs.date_debut,
    mhs.date_fin_prevue,
    u_demande.nom || ' ' || u_demande.prenom AS demandeur,
    mhs.date_demande,
    mhs.statut,
    u_log.nom || ' ' || u_log.prenom AS valide_par_logistique,
    mhs.date_validation_logistique,
    u_pres.nom || ' ' || u_pres.prenom AS valide_par_president,
    mhs.date_validation_president
FROM mise_hors_service mhs
JOIN utilisateur u_demande ON mhs.demande_par = u_demande.id
LEFT JOIN utilisateur u_log ON mhs.valide_responsable_logistique = u_log.id
LEFT JOIN utilisateur u_pres ON mhs.valide_president = u_pres.id
WHERE mhs.statut IN ('en_attente', 'valide_logistique', 'valide_president')
ORDER BY 
    CASE mhs.statut
        WHEN 'en_attente' THEN 1
        WHEN 'valide_logistique' THEN 2
        WHEN 'valide_president' THEN 3
    END,
    mhs.date_demande;

-- -----------------------------------------------------------------------------
-- INDEX POUR OPTIMISATION
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_reservation_salle_date_heure ON reservation_salle(salle_id, date_reservation, heure_debut, heure_fin);
CREATE INDEX IF NOT EXISTS idx_ticket_maintenance_assignation ON ticket_maintenance(assigne_a, statut, date_signalement);
CREATE INDEX IF NOT EXISTS idx_stock_alerte ON stock(quantite_stock, seuil_alerte) WHERE quantite_stock <= seuil_alerte;
CREATE INDEX IF NOT EXISTS idx_consommation_transmission ON consommation_energetique(transmis_economat, date_releve);
CREATE INDEX IF NOT EXISTS idx_mise_hors_service_statut ON mise_hors_service(statut, date_demande);
CREATE INDEX IF NOT EXISTS idx_equipement_code ON equipement(code_equipement);
CREATE INDEX IF NOT EXISTS idx_mouvement_stock_date ON mouvement_stock(date_mouvement, utilisateur_id);

-- -----------------------------------------------------------------------------
-- COMMENTAIRES
-- -----------------------------------------------------------------------------

COMMENT ON FUNCTION check_reservation_salle_conflit() IS 'Vérifie qu''une salle n''est pas déjà réservée sur le créneau horaire demandé';
COMMENT ON FUNCTION check_ticket_assignment_deadline() IS 'Retourne les tickets non assignés depuis plus de 48h';
COMMENT ON FUNCTION validate_equipement_code() IS 'Valide que chaque équipement a un code unique avant enregistrement';
COMMENT ON FUNCTION enforce_stock_movement_traceability() IS 'Garantit la traçabilité complète de tous les mouvements de stock';
COMMENT ON FUNCTION validate_mise_hors_service() IS 'Gère le workflow de validation double (logistique + président) pour mise hors service';

COMMENT ON TABLE consommation_energetique IS 'Enregistrement mensuel des consommations énergétiques par bâtiment';
COMMENT ON TABLE prestataire_externe IS 'Gestion des prestataires externes (ménage, sécurité, etc.)';
COMMENT ON TABLE feuille_presence_prestataire IS 'Validation des interventions des prestataires externes';
COMMENT ON TABLE mise_hors_service IS 'Workflow de validation pour mise hors service d''infrastructures';
COMMENT ON TABLE equipement IS 'Inventaire des équipements avec codification obligatoire';

-- =============================================================================
-- FIN DE LA MIGRATION
-- =============================================================================

-- Made with Bob
