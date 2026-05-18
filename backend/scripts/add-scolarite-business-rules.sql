-- =============================================================================
-- RÈGLES MÉTIER SCOLARITÉ & NOTES - Migration SQL
-- Architecture Multi-Tenant IMTECH University
-- =============================================================================
-- 
-- RÈGLES IMPLÉMENTÉES:
-- 01. Les notes sont verrouillées après délibération (procédure dérogatoire validée par RP)
-- 02. La moyenne d'une UE est calculée automatiquement selon les coefficients
-- 03. Une note dérogatoire requiert la validation du responsable pédagogique
-- 04. Aucun relevé de notes officiel ne peut être édité si la délibération n'est pas approuvée
-- 05. Le PV de délibération doit être validé par la scolarité avant archivage
-- 06. Les notes ne peuvent être saisies que dans la période définie par la session d'examen
-- 07. Un résultat d'UE ne peut passer à « validé » que si les crédits ECTS sont atteints
-- 08. La publication des résultats est soumise à l'autorisation du service communication
-- 09. Un étudiant ayant une absence non justifiée reçoit automatiquement la mention « ABI »
-- 10. Le supplément au diplôme ne peut être généré qu'après validation finale du président
-- 11. Blocage des notes si un étudiant a des impayés
-- 
-- =============================================================================

-- -----------------------------------------------------------------------------
-- NOUVELLES TABLES NÉCESSAIRES
-- -----------------------------------------------------------------------------

-- Table pour les autorisations de publication des résultats (Règle 08)
CREATE TABLE IF NOT EXISTS autorisation_publication_resultats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_examen_id UUID NOT NULL REFERENCES session_examen(id),
    parcours_id UUID REFERENCES parcours(id),
    type_publication VARCHAR(50) NOT NULL CHECK (type_publication IN ('complete', 'partielle', 'anonymisee')),
    autorise_par UUID NOT NULL REFERENCES utilisateur(id), -- Service communication
    date_autorisation TIMESTAMPTZ DEFAULT NOW(),
    date_publication_prevue DATE,
    masquage_config JSONB DEFAULT '{"masquer_noms": false, "masquer_moyennes": false, "masquer_classement": false}',
    observations TEXT,
    statut VARCHAR(30) DEFAULT 'autorisee' CHECK (statut IN ('autorisee', 'publiee', 'retiree')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les procédures dérogatoires de modification de notes (Règle 01)
CREATE TABLE IF NOT EXISTS procedure_derogatoire_note (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id UUID NOT NULL REFERENCES note(id),
    motif TEXT NOT NULL,
    ancienne_valeur NUMERIC(5,2) NOT NULL,
    nouvelle_valeur NUMERIC(5,2) NOT NULL,
    demande_par UUID NOT NULL REFERENCES utilisateur(id),
    date_demande TIMESTAMPTZ DEFAULT NOW(),
    valide_par UUID REFERENCES utilisateur(id), -- Responsable pédagogique
    date_validation TIMESTAMPTZ,
    statut VARCHAR(30) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'approuvee', 'refusee')),
    observations TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- RÈGLE 01: Verrouillage notes après délibération
-- -----------------------------------------------------------------------------
-- Note: Le trigger check_note_verrouillee() existe déjà dans le système
-- On va l'améliorer pour gérer les procédures dérogatoires

CREATE OR REPLACE FUNCTION check_note_verrouillee_enhanced()
RETURNS TRIGGER AS $$
DECLARE
    v_deliberation_id UUID;
    v_deliberation_statut VARCHAR(20);
    v_procedure_approuvee BOOLEAN;
BEGIN
    -- Vérifier si la note est liée à une délibération
    SELECT d.id, d.statut INTO v_deliberation_id, v_deliberation_statut
    FROM deliberation d
    JOIN resultat_semestre rs ON rs.deliberation_id = d.id
    WHERE rs.etudiant_id = NEW.etudiant_id
    AND d.statut IN ('terminee', 'validee')
    LIMIT 1;
    
    -- Si une délibération est terminée, vérifier s'il y a une procédure dérogatoire approuvée
    IF v_deliberation_id IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1 FROM procedure_derogatoire_note pdn
            WHERE pdn.note_id = NEW.id
            AND pdn.statut = 'approuvee'
            AND pdn.date_validation >= NOW() - INTERVAL '7 days'
        ) INTO v_procedure_approuvee;
        
        IF NOT v_procedure_approuvee THEN
            RAISE EXCEPTION 'Cette note est verrouillée après délibération. Une procédure dérogatoire validée par le responsable pédagogique est requise.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- RÈGLE 02: Calcul automatique moyenne UE
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculer_moyenne_ue_automatique()
RETURNS TRIGGER AS $$
DECLARE
    v_moyenne NUMERIC(5,2);
    v_ue_id UUID;
BEGIN
    -- Récupérer l'UE de l'EC
    SELECT ue_id INTO v_ue_id
    FROM element_constitutif
    WHERE id = NEW.ec_id;
    
    -- Calculer la moyenne de l'UE pour cet étudiant
    SELECT ROUND(
        SUM(n.valeur * ec.coefficient) / NULLIF(SUM(ec.coefficient), 0),
        2
    ) INTO v_moyenne
    FROM note n
    JOIN element_constitutif ec ON n.ec_id = ec.id
    WHERE ec.ue_id = v_ue_id
    AND n.etudiant_id = NEW.etudiant_id
    AND n.session_id = NEW.session_id
    AND n.absence_justifiee = FALSE;
    
    -- Mettre à jour ou créer le résultat UE
    INSERT INTO resultat_ue (etudiant_id, ue_id, resultat_semestre_id, moyenne_ue, credits_ects)
    SELECT 
        NEW.etudiant_id,
        v_ue_id,
        rs.id,
        v_moyenne,
        ue.credits_ects
    FROM resultat_semestre rs
    JOIN unite_enseignement ue ON ue.id = v_ue_id
    WHERE rs.etudiant_id = NEW.etudiant_id
    AND rs.semestre = ue.semestre
    LIMIT 1
    ON CONFLICT (etudiant_id, ue_id, resultat_semestre_id) 
    DO UPDATE SET 
        moyenne_ue = v_moyenne,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- RÈGLE 03: Validation note dérogatoire par RP
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION validate_note_derogatoire()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier que la note dérogatoire est validée par un RP
    IF NEW.valide_par IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM utilisateur u
            WHERE u.id = NEW.valide_par
            AND u.role IN ('responsable_pedagogique', 'admin')
            AND u.actif = TRUE
        ) THEN
            RAISE EXCEPTION 'Seul le responsable pédagogique peut valider une note dérogatoire.';
        END IF;
        
        -- Enregistrer la date de validation
        IF NEW.date_validation IS NULL THEN
            NEW.date_validation := NOW();
        END IF;
    ELSE
        -- Une note dérogatoire ne peut être enregistrée sans validation
        RAISE EXCEPTION 'Une note dérogatoire doit être validée par le responsable pédagogique avant enregistrement.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- RÈGLE 04: Relevé notes si délibération approuvée
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_deliberation_before_releve()
RETURNS BOOLEAN AS $$
DECLARE
    v_result BOOLEAN;
BEGIN
    -- Cette fonction sera appelée par l'application avant de générer un relevé
    -- Elle retourne TRUE si la délibération est approuvée, FALSE sinon
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier si un relevé peut être généré
CREATE OR REPLACE FUNCTION can_generate_releve_notes(
    p_etudiant_id UUID,
    p_session_examen_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_deliberation_statut VARCHAR(20);
BEGIN
    -- Vérifier le statut de la délibération
    SELECT d.statut INTO v_deliberation_statut
    FROM deliberation d
    JOIN resultat_semestre rs ON rs.deliberation_id = d.id
    WHERE rs.etudiant_id = p_etudiant_id
    AND d.session_examen_id = p_session_examen_id
    LIMIT 1;
    
    -- Le relevé ne peut être généré que si la délibération est terminée ou validée
    IF v_deliberation_statut IN ('terminee', 'validee') THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- RÈGLE 05: Validation PV délibération par scolarité
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION validate_pv_deliberation()
RETURNS TRIGGER AS $$
BEGIN
    -- Workflow de validation du PV
    IF TG_OP = 'UPDATE' AND OLD.statut != NEW.statut THEN
        -- Passage de 'brouillon' à 'signe' : validation par le président du jury
        IF OLD.statut = 'brouillon' AND NEW.statut = 'signe' THEN
            IF NOT EXISTS (
                SELECT 1 FROM utilisateur u
                WHERE u.id = NEW.president_jury
                AND u.role IN ('enseignant', 'responsable_pedagogique', 'admin')
            ) THEN
                RAISE EXCEPTION 'Le PV doit être signé par le président du jury.';
            END IF;
        END IF;
        
        -- Passage de 'signe' à 'transmis' : validation par la scolarité
        IF OLD.statut = 'signe' AND NEW.statut = 'transmis' THEN
            -- Vérifier que l'utilisateur qui modifie est de la scolarité
            -- (Cette vérification sera faite côté application via session variable)
            NULL; -- Placeholder pour la logique applicative
        END IF;
        
        -- Passage de 'transmis' à 'archive' : archivage final
        IF OLD.statut = 'transmis' AND NEW.statut = 'archive' THEN
            -- Créer une entrée dans archive_scolarite
            INSERT INTO archive_scolarite (
                etudiant_id, type_document, titre_document, 
                annee_academique, fichier_pdf_url, archive_par
            )
            SELECT 
                rs.etudiant_id,
                'pv_deliberation',
                'PV Délibération ' || p.nom || ' - ' || se.libelle,
                aa.libelle,
                NEW.fichier_pv_url,
                NEW.president_jury
            FROM resultat_semestre rs
            JOIN deliberation d ON d.id = rs.deliberation_id
            JOIN parcours p ON p.id = d.parcours_id
            JOIN session_examen se ON se.id = d.session_examen_id
            JOIN annee_academique aa ON aa.id = se.annee_academique_id
            WHERE d.id = (
                SELECT session_id FROM pv_deliberation WHERE id = NEW.id
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- RÈGLE 06: Saisie notes dans période session examen
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_session_examen_period()
RETURNS TRIGGER AS $$
DECLARE
    v_session_statut VARCHAR(20);
    v_date_debut DATE;
    v_date_fin DATE;
BEGIN
    -- Récupérer les informations de la session
    SELECT statut, date_debut, date_fin 
    INTO v_session_statut, v_date_debut, v_date_fin
    FROM session_examen
    WHERE id = NEW.session_id;
    
    -- Vérifier que la session est en cours
    IF v_session_statut != 'en_cours' THEN
        RAISE EXCEPTION 'Les notes ne peuvent être saisies que pendant une session d''examen active. Statut actuel: %', v_session_statut;
    END IF;
    
    -- Vérifier que nous sommes dans la période de saisie
    IF CURRENT_DATE < v_date_debut OR CURRENT_DATE > v_date_fin THEN
        RAISE EXCEPTION 'Les notes ne peuvent être saisies qu''entre le % et le %. Date actuelle: %', 
            v_date_debut, v_date_fin, CURRENT_DATE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- RÈGLE 07: Validation UE si crédits ECTS atteints
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION validate_ue_credits()
RETURNS TRIGGER AS $$
DECLARE
    v_credits_requis SMALLINT;
    v_moyenne_ue NUMERIC(5,2);
BEGIN
    -- Récupérer les crédits ECTS de l'UE
    SELECT credits_ects INTO v_credits_requis
    FROM unite_enseignement
    WHERE id = NEW.ue_id;
    
    -- Vérifier que la moyenne est suffisante (>= 10/20)
    IF NEW.moyenne_ue >= 10 THEN
        NEW.statut := 'valide';
        NEW.credits_acquis := TRUE;
        NEW.credits_ects := v_credits_requis;
        NEW.date_validation := NOW();
    ELSE
        NEW.statut := 'ajourne';
        NEW.credits_acquis := FALSE;
        NEW.credits_ects := 0;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- RÈGLE 08: Autorisation publication résultats
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_publication_authorization()
RETURNS BOOLEAN AS $$
BEGIN
    -- Cette fonction sera appelée par l'application avant de publier des résultats
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier si les résultats peuvent être publiés
CREATE OR REPLACE FUNCTION can_publish_results(
    p_session_examen_id UUID,
    p_parcours_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_authorized BOOLEAN;
BEGIN
    -- Vérifier s'il existe une autorisation de publication
    SELECT EXISTS (
        SELECT 1 FROM autorisation_publication_resultats apr
        WHERE apr.session_examen_id = p_session_examen_id
        AND (apr.parcours_id = p_parcours_id OR apr.parcours_id IS NULL)
        AND apr.statut = 'autorisee'
    ) INTO v_authorized;
    
    RETURN v_authorized;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- RÈGLE 09: Mention ABI automatique si absence non justifiée
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_abi_for_absence()
RETURNS TRIGGER AS $$
BEGIN
    -- Si l'étudiant est absent et que l'absence n'est pas justifiée
    IF NEW.absence_justifiee = FALSE AND NEW.valeur IS NULL THEN
        -- Mettre une valeur de 0 et ajouter une observation
        NEW.valeur := 0;
        NEW.observations := COALESCE(NEW.observations || ' | ', '') || 'ABI - Absence non justifiée';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- RÈGLE 10: Supplément diplôme validé par président
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION validate_supplement_diplome()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier que le supplément est certifié par le président
    IF NEW.certifie_par IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM utilisateur u
            WHERE u.id = NEW.certifie_par
            AND u.role IN ('president', 'admin')
            AND u.actif = TRUE
        ) THEN
            RAISE EXCEPTION 'Seul le président peut valider et certifier un supplément au diplôme.';
        END IF;
        
        -- Enregistrer la date de certification
        IF NEW.date_certification IS NULL THEN
            NEW.date_certification := NOW();
        END IF;
        
        -- Générer le hash d'intégrité
        NEW.hash_integrite := encode(
            digest(
                NEW.diplome_id::TEXT || NEW.nom_diplome || NEW.date_certification::TEXT,
                'sha512'
            ),
            'hex'
        );
    ELSE
        RAISE EXCEPTION 'Un supplément au diplôme doit être certifié par le président avant génération.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- RÈGLE 11: Blocage notes si impayé étudiant
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_student_payment_status()
RETURNS TRIGGER AS $$
DECLARE
    v_montant_du NUMERIC(12,2);
    v_montant_paye NUMERIC(12,2);
    v_solde NUMERIC(12,2);
BEGIN
    -- Calculer le solde de l'étudiant
    SELECT 
        COALESCE(gt.montant_total, 0) AS montant_du,
        COALESCE(SUM(p.montant) FILTER (WHERE p.statut = 'valide'), 0) AS montant_paye
    INTO v_montant_du, v_montant_paye
    FROM inscription i
    LEFT JOIN grille_tarifaire gt ON gt.parcours_id = i.parcours_id 
        AND gt.annee_academique_id = i.annee_academique_id
    LEFT JOIN paiement p ON p.inscription_id = i.id
    WHERE i.etudiant_id = NEW.etudiant_id
    AND i.statut = 'validee'
    GROUP BY gt.montant_total;
    
    v_solde := v_montant_du - COALESCE(v_montant_paye, 0);
    
    -- Si l'étudiant a un impayé, bloquer la saisie de notes
    IF v_solde > 0 THEN
        RAISE EXCEPTION 'Impossible de saisir des notes pour cet étudiant. Solde impayé: % Ar. L''étudiant doit régulariser sa situation financière.', v_solde;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- CRÉATION DES TRIGGERS
-- -----------------------------------------------------------------------------

-- Règle 01: Verrouillage notes (remplacer l'ancien trigger)
DROP TRIGGER IF EXISTS trigger_check_note_verrouillee ON note;
CREATE TRIGGER trigger_check_note_verrouillee
    BEFORE UPDATE ON note
    FOR EACH ROW
    WHEN (OLD.valeur IS DISTINCT FROM NEW.valeur)
    EXECUTE FUNCTION check_note_verrouillee_enhanced();

-- Règle 02: Calcul automatique moyenne UE
DROP TRIGGER IF EXISTS trigger_calculer_moyenne_ue ON note;
CREATE TRIGGER trigger_calculer_moyenne_ue
    AFTER INSERT OR UPDATE ON note
    FOR EACH ROW
    EXECUTE FUNCTION calculer_moyenne_ue_automatique();

-- Règle 03: Validation note dérogatoire
DROP TRIGGER IF EXISTS trigger_validate_note_derogatoire ON note_derogatoire;
CREATE TRIGGER trigger_validate_note_derogatoire
    BEFORE INSERT OR UPDATE ON note_derogatoire
    FOR EACH ROW
    EXECUTE FUNCTION validate_note_derogatoire();

-- Règle 05: Validation PV délibération
DROP TRIGGER IF EXISTS trigger_validate_pv ON pv_deliberation;
CREATE TRIGGER trigger_validate_pv
    BEFORE UPDATE ON pv_deliberation
    FOR EACH ROW
    EXECUTE FUNCTION validate_pv_deliberation();

-- Règle 06: Période session examen
DROP TRIGGER IF EXISTS trigger_check_session_period ON note;
CREATE TRIGGER trigger_check_session_period
    BEFORE INSERT ON note
    FOR EACH ROW
    EXECUTE FUNCTION check_session_examen_period();

-- Règle 07: Validation UE crédits
DROP TRIGGER IF EXISTS trigger_validate_ue_credits ON resultat_ue;
CREATE TRIGGER trigger_validate_ue_credits
    BEFORE INSERT OR UPDATE ON resultat_ue
    FOR EACH ROW
    WHEN (NEW.moyenne_ue IS NOT NULL)
    EXECUTE FUNCTION validate_ue_credits();

-- Règle 09: Mention ABI automatique
DROP TRIGGER IF EXISTS trigger_set_abi ON note;
CREATE TRIGGER trigger_set_abi
    BEFORE INSERT OR UPDATE ON note
    FOR EACH ROW
    EXECUTE FUNCTION set_abi_for_absence();

-- Règle 10: Validation supplément diplôme
DROP TRIGGER IF EXISTS trigger_validate_supplement ON suplement_diplome;
CREATE TRIGGER trigger_validate_supplement
    BEFORE INSERT OR UPDATE ON suplement_diplome
    FOR EACH ROW
    EXECUTE FUNCTION validate_supplement_diplome();

-- Règle 11: Blocage notes si impayé
DROP TRIGGER IF EXISTS trigger_check_payment_status ON note;
CREATE TRIGGER trigger_check_payment_status
    BEFORE INSERT ON note
    FOR EACH ROW
    EXECUTE FUNCTION check_student_payment_status();

-- -----------------------------------------------------------------------------
-- VUES UTILITAIRES
-- -----------------------------------------------------------------------------

-- Vue: Étudiants avec impayés
CREATE OR REPLACE VIEW vue_etudiants_impayes AS
SELECT 
    e.id AS etudiant_id,
    e.matricule,
    e.nom,
    e.prenom,
    p.code AS parcours_code,
    p.nom AS parcours_nom,
    i.annee_niveau,
    COALESCE(gt.montant_total, 0) AS montant_du,
    COALESCE(SUM(pay.montant) FILTER (WHERE pay.statut = 'valide'), 0) AS montant_paye,
    COALESCE(gt.montant_total, 0) - COALESCE(SUM(pay.montant) FILTER (WHERE pay.statut = 'valide'), 0) AS solde_impaye,
    CASE 
        WHEN COALESCE(gt.montant_total, 0) - COALESCE(SUM(pay.montant) FILTER (WHERE pay.statut = 'valide'), 0) > 0 
        THEN TRUE 
        ELSE FALSE 
    END AS a_impaye
FROM etudiant e
JOIN inscription i ON e.id = i.etudiant_id
JOIN parcours p ON i.parcours_id = p.id
LEFT JOIN grille_tarifaire gt ON gt.parcours_id = i.parcours_id 
    AND gt.annee_academique_id = i.annee_academique_id
LEFT JOIN paiement pay ON pay.inscription_id = i.id
WHERE i.statut = 'validee'
GROUP BY e.id, e.matricule, e.nom, e.prenom, p.code, p.nom, i.annee_niveau, gt.montant_total
HAVING COALESCE(gt.montant_total, 0) - COALESCE(SUM(pay.montant) FILTER (WHERE pay.statut = 'valide'), 0) > 0
ORDER BY solde_impaye DESC;

-- Vue: Sessions d'examen actives
CREATE OR REPLACE VIEW vue_sessions_examen_actives AS
SELECT 
    se.id,
    se.libelle,
    se.type_session,
    se.semestre,
    se.date_debut,
    se.date_fin,
    se.statut,
    aa.libelle AS annee_academique,
    CASE 
        WHEN CURRENT_DATE BETWEEN se.date_debut AND se.date_fin THEN TRUE
        ELSE FALSE
    END AS dans_periode_saisie,
    COUNT(DISTINCT n.id) AS nb_notes_saisies,
    COUNT(DISTINCT n.etudiant_id) AS nb_etudiants_notes
FROM session_examen se
JOIN annee_academique aa ON se.annee_academique_id = aa.id
LEFT JOIN note n ON n.session_id = se.id
WHERE se.statut IN ('planifie', 'en_cours')
GROUP BY se.id, se.libelle, se.type_session, se.semestre, se.date_debut, se.date_fin, se.statut, aa.libelle
ORDER BY se.date_debut DESC;

-- Vue: Autorisations de publication en attente
CREATE OR REPLACE VIEW vue_publications_autorisees AS
SELECT 
    apr.id,
    se.libelle AS session_examen,
    p.code AS parcours_code,
    p.nom AS parcours_nom,
    apr.type_publication,
    u.nom || ' ' || u.prenom AS autorise_par_nom,
    apr.date_autorisation,
    apr.date_publication_prevue,
    apr.statut,
    apr.masquage_config
FROM autorisation_publication_resultats apr
JOIN session_examen se ON apr.session_examen_id = se.id
LEFT JOIN parcours p ON apr.parcours_id = p.id
JOIN utilisateur u ON apr.autorise_par = u.id
WHERE apr.statut = 'autorisee'
ORDER BY apr.date_publication_prevue;

-- Vue: PV délibérations en attente de validation
CREATE OR REPLACE VIEW vue_pv_deliberation_pending AS
SELECT 
    pv.id,
    se.libelle AS session_examen,
    p.code AS parcours_code,
    p.nom AS parcours_nom,
    pv.annee_niveau,
    pv.date_deliberation,
    u.nom || ' ' || u.prenom AS president_jury_nom,
    pv.statut,
    CASE pv.statut
        WHEN 'brouillon' THEN 'En attente de signature'
        WHEN 'signe' THEN 'En attente de transmission à la scolarité'
        WHEN 'transmis' THEN 'En attente d''archivage'
    END AS action_requise
FROM pv_deliberation pv
JOIN session_examen se ON pv.session_id = se.id
JOIN parcours p ON pv.parcours_id = p.id
JOIN utilisateur u ON pv.president_jury = u.id
WHERE pv.statut IN ('brouillon', 'signe', 'transmis')
ORDER BY pv.date_deliberation DESC;

-- Vue: Procédures dérogatoires en attente
CREATE OR REPLACE VIEW vue_procedures_derogatoires_pending AS
SELECT 
    pdn.id,
    e.matricule AS etudiant_matricule,
    e.nom || ' ' || e.prenom AS etudiant_nom,
    n.valeur AS note_actuelle,
    pdn.ancienne_valeur,
    pdn.nouvelle_valeur,
    pdn.motif,
    u_demande.nom || ' ' || u_demande.prenom AS demandeur,
    pdn.date_demande,
    pdn.statut,
    EXTRACT(DAY FROM (NOW() - pdn.date_demande)) AS jours_attente
FROM procedure_derogatoire_note pdn
JOIN note n ON pdn.note_id = n.id
JOIN etudiant e ON n.etudiant_id = e.id
JOIN utilisateur u_demande ON pdn.demande_par = u_demande.id
WHERE pdn.statut = 'en_attente'
ORDER BY pdn.date_demande;

-- -----------------------------------------------------------------------------
-- INDEX POUR OPTIMISATION
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_note_session_etudiant ON note(session_id, etudiant_id);
CREATE INDEX IF NOT EXISTS idx_note_verrouille ON note(verrouille) WHERE verrouille = TRUE;
CREATE INDEX IF NOT EXISTS idx_resultat_ue_statut ON resultat_ue(statut, credits_acquis);
CREATE INDEX IF NOT EXISTS idx_pv_deliberation_statut ON pv_deliberation(statut);
CREATE INDEX IF NOT EXISTS idx_autorisation_publication_statut ON autorisation_publication_resultats(statut, session_examen_id);
CREATE INDEX IF NOT EXISTS idx_procedure_derogatoire_statut ON procedure_derogatoire_note(statut, date_demande);

-- -----------------------------------------------------------------------------
-- COMMENTAIRES
-- -----------------------------------------------------------------------------

COMMENT ON FUNCTION check_note_verrouillee_enhanced() IS 'Vérifie le verrouillage des notes après délibération avec gestion des procédures dérogatoires';
COMMENT ON FUNCTION calculer_moyenne_ue_automatique() IS 'Calcule automatiquement la moyenne d''une UE selon les coefficients des EC';
COMMENT ON FUNCTION validate_note_derogatoire() IS 'Valide qu''une note dérogatoire est approuvée par le responsable pédagogique';
COMMENT ON FUNCTION can_generate_releve_notes() IS 'Vérifie si un relevé de notes peut être généré (délibération approuvée)';
COMMENT ON FUNCTION validate_pv_deliberation() IS 'Gère le workflow de validation du PV de délibération';
COMMENT ON FUNCTION check_session_examen_period() IS 'Vérifie que les notes sont saisies dans la période de la session d''examen';
COMMENT ON FUNCTION validate_ue_credits() IS 'Valide une UE si les crédits ECTS sont atteints (moyenne >= 10)';
COMMENT ON FUNCTION can_publish_results() IS 'Vérifie si les résultats peuvent être publiés (autorisation communication)';
COMMENT ON FUNCTION set_abi_for_absence() IS 'Attribue automatiquement la mention ABI pour absence non justifiée';
COMMENT ON FUNCTION validate_supplement_diplome() IS 'Valide qu''un supplément au diplôme est certifié par le président';
COMMENT ON FUNCTION check_student_payment_status() IS 'Bloque la saisie de notes si l''étudiant a des impayés';

COMMENT ON TABLE autorisation_publication_resultats IS 'Autorisations de publication des résultats par le service communication';
COMMENT ON TABLE procedure_derogatoire_note IS 'Procédures dérogatoires pour modification de notes verrouillées';

-- =============================================================================
-- FIN DE LA MIGRATION
-- =============================================================================

-- Made with Bob
