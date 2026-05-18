-- =============================================================================
-- RÈGLES MÉTIER ENSEIGNANTS - Migration SQL
-- Architecture Multi-Tenant IMTECH University
-- =============================================================================
-- 
-- RÈGLES IMPLÉMENTÉES:
-- 1. Un enseignant n'ayant pas de contrat actif ne peut être affecté à une UE
-- 2. Une UE ne peut être affectée qu'à un seul enseignant (mais un enseignant peut avoir plusieurs UE)
-- 3. Identification des enseignants sans affectation
-- 
-- =============================================================================

-- -----------------------------------------------------------------------------
-- FONCTION 1: Vérifier qu'un enseignant a un contrat actif
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_enseignant_has_active_contract()
RETURNS TRIGGER AS $$
DECLARE
    v_utilisateur_id UUID;
    v_has_active_contract BOOLEAN;
BEGIN
    -- Récupérer l'utilisateur_id de l'enseignant
    SELECT utilisateur_id INTO v_utilisateur_id
    FROM enseignant
    WHERE id = NEW.enseignant_id;
    
    -- Vérifier si l'enseignant a un contrat actif
    SELECT EXISTS (
        SELECT 1
        FROM contrat_personnel cp
        WHERE cp.utilisateur_id = v_utilisateur_id
        AND cp.actif = TRUE
        AND cp.date_debut <= CURRENT_DATE
        AND (cp.date_fin IS NULL OR cp.date_fin >= CURRENT_DATE)
    ) INTO v_has_active_contract;
    
    -- Si pas de contrat actif, bloquer l'affectation
    IF NOT v_has_active_contract THEN
        RAISE EXCEPTION 'Impossible d''affecter cet enseignant : aucun contrat actif trouvé. L''enseignant doit avoir un contrat valide avant toute affectation.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- FONCTION 2: Vérifier l'unicité de l'affectation UE par enseignant
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_ue_unique_per_enseignant()
RETURNS TRIGGER AS $$
DECLARE
    v_existing_count INTEGER;
BEGIN
    -- Vérifier si l'UE est déjà affectée à un autre enseignant pour la même année académique
    IF NEW.ue_id IS NOT NULL THEN
        SELECT COUNT(*) INTO v_existing_count
        FROM affectation_cours ac
        WHERE ac.ue_id = NEW.ue_id
        AND ac.annee_academique_id = NEW.annee_academique_id
        AND ac.enseignant_id != NEW.enseignant_id
        AND ac.id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);
        
        IF v_existing_count > 0 THEN
            RAISE EXCEPTION 'Cette UE est déjà affectée à un autre enseignant pour cette année académique. Une UE ne peut être affectée qu''à un seul enseignant.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- VUE: Enseignants sans affectation
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vue_enseignants_sans_affectation AS
SELECT 
    e.id AS enseignant_id,
    e.matricule,
    e.nom,
    e.prenom,
    e.titre,
    e.grade,
    e.specialite,
    e.departement_id,
    d.nom AS departement_nom,
    e.email,
    e.telephone,
    e.actif,
    -- Vérifier si l'enseignant a un contrat actif
    EXISTS (
        SELECT 1
        FROM contrat_personnel cp
        WHERE cp.utilisateur_id = e.utilisateur_id
        AND cp.actif = TRUE
        AND cp.date_debut <= CURRENT_DATE
        AND (cp.date_fin IS NULL OR cp.date_fin >= CURRENT_DATE)
    ) AS a_contrat_actif,
    -- Compter le nombre d'affectations actives
    (
        SELECT COUNT(*)
        FROM affectation_cours ac
        JOIN annee_academique aa ON ac.annee_academique_id = aa.id
        WHERE ac.enseignant_id = e.id
        AND aa.active = TRUE
    ) AS nb_affectations_actives
FROM enseignant e
LEFT JOIN departement d ON e.departement_id = d.id
WHERE e.actif = TRUE
AND NOT EXISTS (
    SELECT 1
    FROM affectation_cours ac
    JOIN annee_academique aa ON ac.annee_academique_id = aa.id
    WHERE ac.enseignant_id = e.id
    AND aa.active = TRUE
)
ORDER BY e.nom, e.prenom;

-- -----------------------------------------------------------------------------
-- VUE: Statistiques d'affectation par enseignant
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vue_statistiques_affectation_enseignant AS
SELECT 
    e.id AS enseignant_id,
    e.matricule,
    e.nom || ' ' || e.prenom AS nom_complet,
    e.titre,
    e.grade,
    d.nom AS departement,
    -- Contrat actif
    EXISTS (
        SELECT 1
        FROM contrat_personnel cp
        WHERE cp.utilisateur_id = e.utilisateur_id
        AND cp.actif = TRUE
        AND cp.date_debut <= CURRENT_DATE
        AND (cp.date_fin IS NULL OR cp.date_fin >= CURRENT_DATE)
    ) AS a_contrat_actif,
    -- Nombre d'UE affectées
    COUNT(DISTINCT ac.ue_id) AS nb_ue_affectees,
    -- Nombre d'EC affectés
    COUNT(DISTINCT ac.ec_id) AS nb_ec_affectes,
    -- Volume horaire total prévu
    COALESCE(SUM(ac.volume_prevu), 0) AS volume_horaire_total,
    -- Volume horaire réalisé
    COALESCE(SUM(ac.volume_realise), 0) AS volume_horaire_realise,
    -- Taux de réalisation
    CASE 
        WHEN SUM(ac.volume_prevu) > 0 THEN
            ROUND((SUM(ac.volume_realise)::NUMERIC / SUM(ac.volume_prevu)::NUMERIC) * 100, 2)
        ELSE 0
    END AS taux_realisation_pct,
    -- Statut d'affectation
    CASE 
        WHEN COUNT(ac.id) = 0 THEN 'Non affecté'
        WHEN COUNT(ac.id) > 0 THEN 'Affecté'
    END AS statut_affectation
FROM enseignant e
LEFT JOIN departement d ON e.departement_id = d.id
LEFT JOIN affectation_cours ac ON e.id = ac.enseignant_id
LEFT JOIN annee_academique aa ON ac.annee_academique_id = aa.id AND aa.active = TRUE
WHERE e.actif = TRUE
GROUP BY e.id, e.matricule, e.nom, e.prenom, e.titre, e.grade, d.nom, e.utilisateur_id
ORDER BY statut_affectation, e.nom, e.prenom;

-- -----------------------------------------------------------------------------
-- VUE: Affectations UE avec détails enseignant
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vue_affectations_ue_details AS
SELECT 
    ac.id AS affectation_id,
    e.id AS enseignant_id,
    e.matricule AS enseignant_matricule,
    e.nom || ' ' || e.prenom AS enseignant_nom,
    e.titre,
    e.grade,
    ue.id AS ue_id,
    ue.code AS ue_code,
    ue.intitule AS ue_intitule,
    ue.credits_ects,
    p.code AS parcours_code,
    p.nom AS parcours_nom,
    aa.libelle AS annee_academique,
    ac.type_seance,
    ac.volume_prevu,
    ac.volume_realise,
    -- Vérifier si l'enseignant a un contrat actif
    EXISTS (
        SELECT 1
        FROM contrat_personnel cp
        WHERE cp.utilisateur_id = e.utilisateur_id
        AND cp.actif = TRUE
        AND cp.date_debut <= CURRENT_DATE
        AND (cp.date_fin IS NULL OR cp.date_fin >= CURRENT_DATE)
    ) AS enseignant_a_contrat_actif
FROM affectation_cours ac
JOIN enseignant e ON ac.enseignant_id = e.id
JOIN unite_enseignement ue ON ac.ue_id = ue.id
JOIN parcours p ON ue.parcours_id = p.id
JOIN annee_academique aa ON ac.annee_academique_id = aa.id
WHERE ac.ue_id IS NOT NULL
ORDER BY aa.libelle DESC, p.code, ue.code;

-- -----------------------------------------------------------------------------
-- TRIGGERS: Application des règles métier
-- -----------------------------------------------------------------------------

-- Trigger 1: Vérifier le contrat avant affectation (INSERT)
DROP TRIGGER IF EXISTS trigger_check_contract_before_affectation_insert ON affectation_cours;
CREATE TRIGGER trigger_check_contract_before_affectation_insert
    BEFORE INSERT ON affectation_cours
    FOR EACH ROW
    EXECUTE FUNCTION check_enseignant_has_active_contract();

-- Trigger 2: Vérifier le contrat avant affectation (UPDATE)
DROP TRIGGER IF EXISTS trigger_check_contract_before_affectation_update ON affectation_cours;
CREATE TRIGGER trigger_check_contract_before_affectation_update
    BEFORE UPDATE ON affectation_cours
    FOR EACH ROW
    WHEN (OLD.enseignant_id IS DISTINCT FROM NEW.enseignant_id)
    EXECUTE FUNCTION check_enseignant_has_active_contract();

-- Trigger 3: Vérifier l'unicité UE par enseignant (INSERT)
DROP TRIGGER IF EXISTS trigger_check_ue_unique_insert ON affectation_cours;
CREATE TRIGGER trigger_check_ue_unique_insert
    BEFORE INSERT ON affectation_cours
    FOR EACH ROW
    EXECUTE FUNCTION check_ue_unique_per_enseignant();

-- Trigger 4: Vérifier l'unicité UE par enseignant (UPDATE)
DROP TRIGGER IF EXISTS trigger_check_ue_unique_update ON affectation_cours;
CREATE TRIGGER trigger_check_ue_unique_update
    BEFORE UPDATE ON affectation_cours
    FOR EACH ROW
    WHEN (OLD.ue_id IS DISTINCT FROM NEW.ue_id OR OLD.enseignant_id IS DISTINCT FROM NEW.enseignant_id)
    EXECUTE FUNCTION check_ue_unique_per_enseignant();

-- -----------------------------------------------------------------------------
-- CONTRAINTE: Unicité de l'affectation UE par année académique
-- -----------------------------------------------------------------------------
-- Note: Cette contrainte garantit qu'une UE ne peut être affectée qu'une seule fois
-- par année académique (complément au trigger)
ALTER TABLE affectation_cours 
DROP CONSTRAINT IF EXISTS unique_ue_per_annee_academique;

ALTER TABLE affectation_cours 
ADD CONSTRAINT unique_ue_per_annee_academique 
UNIQUE (ue_id, annee_academique_id)
WHERE ue_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- COMMENTAIRES
-- -----------------------------------------------------------------------------
COMMENT ON FUNCTION check_enseignant_has_active_contract() IS 
'Vérifie qu''un enseignant possède un contrat actif avant de pouvoir être affecté à une UE/EC';

COMMENT ON FUNCTION check_ue_unique_per_enseignant() IS 
'Garantit qu''une UE ne peut être affectée qu''à un seul enseignant par année académique';

COMMENT ON VIEW vue_enseignants_sans_affectation IS 
'Liste des enseignants actifs sans aucune affectation pour l''année académique en cours';

COMMENT ON VIEW vue_statistiques_affectation_enseignant IS 
'Statistiques complètes des affectations par enseignant avec volume horaire et taux de réalisation';

COMMENT ON VIEW vue_affectations_ue_details IS 
'Vue détaillée de toutes les affectations UE avec informations enseignant et parcours';

-- =============================================================================
-- FIN DE LA MIGRATION
-- =============================================================================

-- Made with Bob
