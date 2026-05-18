-- ============================================================================
-- PHASE 3 : STANDARDISATION PROFESSEUR → ENSEIGNANT
-- ============================================================================
-- Objectif : Remplacer toutes les occurrences de 'professeur' par 'enseignant'
-- Impact : Tables, contraintes, données, index
-- Durée estimée : 15 minutes par tenant
-- Downtime : 15 minutes (pendant migration des données)
-- ============================================================================

-- IMPORTANT : Remplacer {schema} par le nom du tenant avant exécution
-- Exemples : tenant_ispm, tenant_universite_d_antsiranana

BEGIN;

-- ============================================================================
-- SECTION 1 : BACKUP DES DONNÉES CRITIQUES
-- ============================================================================

-- Créer table de backup temporaire
CREATE TEMP TABLE backup_utilisateur_roles AS
SELECT id, role, nom, prenom 
FROM {schema}.utilisateur 
WHERE role = 'professeur';

-- Créer table de backup pour contrats
CREATE TEMP TABLE backup_contrat_personnel AS
SELECT id, type_contrat, personnel_id 
FROM {schema}.contrat_personnel 
WHERE type_contrat = 'professeur';

-- Afficher statistiques avant migration
DO $$
DECLARE
    nb_utilisateurs INTEGER;
    nb_contrats INTEGER;
    nb_absences INTEGER;
    nb_messages INTEGER;
BEGIN
    SELECT COUNT(*) INTO nb_utilisateurs FROM {schema}.utilisateur WHERE role = 'professeur';
    SELECT COUNT(*) INTO nb_contrats FROM {schema}.contrat_personnel WHERE type_contrat = 'professeur';
    SELECT COUNT(*) INTO nb_absences FROM {schema}.absence_enseignant WHERE enseignant_id IN (
        SELECT id FROM {schema}.utilisateur WHERE role = 'professeur'
    );
    SELECT COUNT(*) INTO nb_messages FROM {schema}.message_enseignant WHERE enseignant_id IN (
        SELECT id FROM {schema}.utilisateur WHERE role = 'professeur'
    );
    
    RAISE NOTICE '=== STATISTIQUES AVANT MIGRATION ===';
    RAISE NOTICE 'Utilisateurs avec role professeur : %', nb_utilisateurs;
    RAISE NOTICE 'Contrats de type professeur : %', nb_contrats;
    RAISE NOTICE 'Absences liées : %', nb_absences;
    RAISE NOTICE 'Messages liés : %', nb_messages;
END $$;

-- ============================================================================
-- SECTION 2 : MISE À JOUR DES CONTRAINTES
-- ============================================================================

-- 2.1 Table utilisateur - Contrainte role
ALTER TABLE {schema}.utilisateur 
DROP CONSTRAINT IF EXISTS utilisateur_role_check;

ALTER TABLE {schema}.utilisateur 
ADD CONSTRAINT utilisateur_role_check 
CHECK (role IN (
    'super_admin', 'admin', 'president', 'vice_president',
    'directeur_general', 'directeur_academique', 'directeur_financier',
    'directeur_rh', 'responsable_scolarite', 'responsable_pedagogique',
    'secretaire', 'enseignant', 'etudiant', 'parent',
    'comptable', 'caissier', 'bibliothecaire', 'surveillant',
    'agent_entretien', 'agent_securite', 'infirmier'
));

-- 2.2 Table contrat_personnel - Contrainte type_contrat
ALTER TABLE {schema}.contrat_personnel 
DROP CONSTRAINT IF EXISTS contrat_personnel_type_contrat_check;

ALTER TABLE {schema}.contrat_personnel 
ADD CONSTRAINT contrat_personnel_type_contrat_check 
CHECK (type_contrat IN (
    'cdi', 'cdd', 'stage', 'vacation', 'enseignant', 
    'administratif', 'technique', 'service'
));

-- 2.3 Table absence_enseignant - Contrainte type_absence
ALTER TABLE {schema}.absence_enseignant 
DROP CONSTRAINT IF EXISTS absence_enseignant_type_absence_check;

ALTER TABLE {schema}.absence_enseignant 
ADD CONSTRAINT absence_enseignant_type_absence_check 
CHECK (type_absence IN (
    'maladie', 'conge', 'formation', 'mission', 
    'personnel', 'maternite', 'paternite', 'deces', 'autre'
));

-- 2.4 Table message_enseignant - Contrainte statut
ALTER TABLE {schema}.message_enseignant 
DROP CONSTRAINT IF EXISTS message_enseignant_statut_check;

ALTER TABLE {schema}.message_enseignant 
ADD CONSTRAINT message_enseignant_statut_check 
CHECK (statut IN ('envoye', 'lu', 'archive', 'supprime'));

-- ============================================================================
-- SECTION 3 : MIGRATION DES DONNÉES
-- ============================================================================

-- 3.1 Mettre à jour le rôle dans utilisateur
UPDATE {schema}.utilisateur 
SET role = 'enseignant',
    updated_at = CURRENT_TIMESTAMP
WHERE role = 'professeur';

-- 3.2 Mettre à jour le type de contrat
UPDATE {schema}.contrat_personnel 
SET type_contrat = 'enseignant',
    updated_at = CURRENT_TIMESTAMP
WHERE type_contrat = 'professeur';

-- 3.3 Mettre à jour les commentaires/descriptions contenant "professeur"
UPDATE {schema}.contrat_personnel 
SET description = REPLACE(description, 'professeur', 'enseignant'),
    description = REPLACE(description, 'Professeur', 'Enseignant'),
    updated_at = CURRENT_TIMESTAMP
WHERE description ILIKE '%professeur%';

UPDATE {schema}.absence_enseignant 
SET motif = REPLACE(motif, 'professeur', 'enseignant'),
    motif = REPLACE(motif, 'Professeur', 'Enseignant'),
    updated_at = CURRENT_TIMESTAMP
WHERE motif ILIKE '%professeur%';

UPDATE {schema}.message_enseignant 
SET contenu = REPLACE(contenu, 'professeur', 'enseignant'),
    contenu = REPLACE(contenu, 'Professeur', 'Enseignant'),
    updated_at = CURRENT_TIMESTAMP
WHERE contenu ILIKE '%professeur%';

-- 3.4 Mettre à jour les notes/commentaires dans d'autres tables
UPDATE {schema}.note 
SET commentaire = REPLACE(commentaire, 'professeur', 'enseignant'),
    commentaire = REPLACE(commentaire, 'Professeur', 'Enseignant'),
    updated_at = CURRENT_TIMESTAMP
WHERE commentaire ILIKE '%professeur%';

UPDATE {schema}.seance 
SET observations = REPLACE(observations, 'professeur', 'enseignant'),
    observations = REPLACE(observations, 'Professeur', 'Enseignant'),
    updated_at = CURRENT_TIMESTAMP
WHERE observations ILIKE '%professeur%';

-- ============================================================================
-- SECTION 4 : MISE À JOUR DES INDEX
-- ============================================================================

-- 4.1 Recréer index sur utilisateur.role
DROP INDEX IF EXISTS {schema}.idx_utilisateur_role;
CREATE INDEX idx_utilisateur_role ON {schema}.utilisateur(role) 
WHERE role IN ('enseignant', 'etudiant', 'admin');

-- 4.2 Recréer index sur contrat_personnel.type_contrat
DROP INDEX IF EXISTS {schema}.idx_contrat_type;
CREATE INDEX idx_contrat_type ON {schema}.contrat_personnel(type_contrat);

-- 4.3 Créer index optimisé pour les enseignants actifs
CREATE INDEX IF NOT EXISTS idx_utilisateur_enseignant_actif 
ON {schema}.utilisateur(id, nom, prenom) 
WHERE role = 'enseignant' AND actif = TRUE;

-- ============================================================================
-- SECTION 5 : MISE À JOUR DES VUES (SI EXISTANTES)
-- ============================================================================

-- 5.1 Vue liste_enseignants (si elle existe)
DROP VIEW IF EXISTS {schema}.liste_professeurs CASCADE;
DROP VIEW IF EXISTS {schema}.liste_enseignants CASCADE;

CREATE OR REPLACE VIEW {schema}.liste_enseignants AS
SELECT 
    u.id,
    u.nom,
    u.prenom,
    u.email,
    u.telephone,
    u.actif,
    COUNT(DISTINCT s.id) as nb_seances,
    COUNT(DISTINCT c.id) as nb_cours
FROM {schema}.utilisateur u
LEFT JOIN {schema}.seance s ON s.enseignant_id = u.id
LEFT JOIN {schema}.cours c ON c.enseignant_id = u.id
WHERE u.role = 'enseignant'
GROUP BY u.id, u.nom, u.prenom, u.email, u.telephone, u.actif;

-- 5.2 Vue statistiques_enseignants
DROP VIEW IF EXISTS {schema}.statistiques_professeurs CASCADE;
DROP VIEW IF EXISTS {schema}.statistiques_enseignants CASCADE;

CREATE OR REPLACE VIEW {schema}.statistiques_enseignants AS
SELECT 
    u.id as enseignant_id,
    u.nom,
    u.prenom,
    COUNT(DISTINCT s.id) as total_seances,
    COUNT(DISTINCT CASE WHEN s.statut = 'effectuee' THEN s.id END) as seances_effectuees,
    COUNT(DISTINCT ae.id) as total_absences,
    COUNT(DISTINCT n.id) as total_notes_saisies
FROM {schema}.utilisateur u
LEFT JOIN {schema}.seance s ON s.enseignant_id = u.id
LEFT JOIN {schema}.absence_enseignant ae ON ae.enseignant_id = u.id
LEFT JOIN {schema}.note n ON n.saisie_par = u.id
WHERE u.role = 'enseignant'
GROUP BY u.id, u.nom, u.prenom;

-- ============================================================================
-- SECTION 6 : MISE À JOUR DES TRIGGERS (SI EXISTANTS)
-- ============================================================================

-- 6.1 Trigger de validation des absences enseignants
DROP TRIGGER IF EXISTS validate_absence_professeur ON {schema}.absence_enseignant;
DROP TRIGGER IF EXISTS validate_absence_enseignant ON {schema}.absence_enseignant;

CREATE OR REPLACE FUNCTION {schema}.validate_absence_enseignant()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier que l'enseignant existe et a le bon rôle
    IF NOT EXISTS (
        SELECT 1 FROM {schema}.utilisateur 
        WHERE id = NEW.enseignant_id 
        AND role = 'enseignant'
    ) THEN
        RAISE EXCEPTION 'L''utilisateur doit avoir le rôle enseignant';
    END IF;
    
    -- Vérifier les dates
    IF NEW.date_fin < NEW.date_debut THEN
        RAISE EXCEPTION 'La date de fin doit être postérieure à la date de début';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_absence_enseignant
    BEFORE INSERT OR UPDATE ON {schema}.absence_enseignant
    FOR EACH ROW
    EXECUTE FUNCTION {schema}.validate_absence_enseignant();

-- ============================================================================
-- SECTION 7 : ANALYSE ET VÉRIFICATION
-- ============================================================================

-- 7.1 Analyser les tables modifiées
ANALYZE {schema}.utilisateur;
ANALYZE {schema}.contrat_personnel;
ANALYZE {schema}.absence_enseignant;
ANALYZE {schema}.message_enseignant;
ANALYZE {schema}.note;
ANALYZE {schema}.seance;

-- 7.2 Vérifier qu'il ne reste plus de 'professeur'
DO $$
DECLARE
    nb_utilisateurs INTEGER;
    nb_contrats INTEGER;
    nb_enseignants INTEGER;
BEGIN
    -- Vérifier utilisateur
    SELECT COUNT(*) INTO nb_utilisateurs 
    FROM {schema}.utilisateur 
    WHERE role = 'professeur';
    
    -- Vérifier contrats
    SELECT COUNT(*) INTO nb_contrats 
    FROM {schema}.contrat_personnel 
    WHERE type_contrat = 'professeur';
    
    -- Compter les enseignants
    SELECT COUNT(*) INTO nb_enseignants 
    FROM {schema}.utilisateur 
    WHERE role = 'enseignant';
    
    RAISE NOTICE '=== STATISTIQUES APRÈS MIGRATION ===';
    RAISE NOTICE 'Utilisateurs avec role professeur (doit être 0) : %', nb_utilisateurs;
    RAISE NOTICE 'Contrats de type professeur (doit être 0) : %', nb_contrats;
    RAISE NOTICE 'Utilisateurs avec role enseignant : %', nb_enseignants;
    
    IF nb_utilisateurs > 0 OR nb_contrats > 0 THEN
        RAISE EXCEPTION 'Migration incomplète : il reste des occurrences de "professeur"';
    END IF;
    
    RAISE NOTICE '✓ Migration réussie : tous les "professeur" ont été remplacés par "enseignant"';
END $$;

-- 7.3 Rapport détaillé
SELECT 
    'utilisateur' as table_name,
    role,
    COUNT(*) as nombre
FROM {schema}.utilisateur
WHERE role IN ('enseignant', 'professeur')
GROUP BY role

UNION ALL

SELECT 
    'contrat_personnel' as table_name,
    type_contrat as role,
    COUNT(*) as nombre
FROM {schema}.contrat_personnel
WHERE type_contrat IN ('enseignant', 'professeur')
GROUP BY type_contrat

ORDER BY table_name, role;

-- ============================================================================
-- SECTION 8 : AUDIT LOG
-- ============================================================================

-- Enregistrer la migration dans l'audit log
INSERT INTO public.audit_log (
    tenant_id,
    action,
    table_name,
    description,
    created_at
)
SELECT 
    t.id,
    'MIGRATION',
    'MULTIPLE',
    'Standardisation professeur → enseignant (Phase 3)',
    CURRENT_TIMESTAMP
FROM public.tenant t
WHERE t.schema_name = '{schema}';

COMMIT;

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================

-- Message de succès
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✓ PHASE 3 TERMINÉE AVEC SUCCÈS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Toutes les occurrences de "professeur" ont été remplacées par "enseignant"';
    RAISE NOTICE 'Contraintes, index, vues et triggers mis à jour';
    RAISE NOTICE 'Redémarrage de l''application recommandé';
END $$;

-- Made with Bob
