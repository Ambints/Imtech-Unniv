-- ======================================================================
-- MIGRATION: Ajout des statuts diplôme et index de performance
-- Date: 2026-05-17
-- Description: Ajoute les statuts 'pret_signature' et 'signe' à la table
--              diplome et crée des index de performance pour le module président
-- ======================================================================

-- Note: Ce script doit être exécuté pour chaque schéma tenant
-- Remplacer {schema} par le nom du schéma tenant (ex: tenant_ispm)

-- ======================================================================
-- 1. MODIFICATION DE LA CONTRAINTE diplome.statut
-- ======================================================================

-- Supprimer l'ancienne contrainte
ALTER TABLE {schema}.diplome 
DROP CONSTRAINT IF EXISTS diplome_statut_check;

-- Ajouter la nouvelle contrainte avec les statuts supplémentaires
ALTER TABLE {schema}.diplome 
ADD CONSTRAINT diplome_statut_check 
CHECK (statut IN (
    'en_attente',           -- Diplôme en attente de génération
    'pret_signature',       -- Diplôme généré, prêt pour signature président
    'signe',                -- Diplôme signé par le président
    'delivre',              -- Diplôme délivré à l'étudiant
    'retire',               -- Diplôme retiré par l'étudiant
    'annule',               -- Diplôme annulé
    'remplace'              -- Diplôme remplacé par un nouveau
));

COMMENT ON COLUMN {schema}.diplome.statut IS 'Statut du diplôme: en_attente, pret_signature, signe, delivre, retire, annule, remplace';

-- ======================================================================
-- 2. INDEX DE PERFORMANCE POUR LE MODULE PRÉSIDENT
-- ======================================================================

-- Index pour les contrats en attente de validation président
CREATE INDEX IF NOT EXISTS idx_contrat_validation_president 
ON {schema}.contrat_personnel(statut_validation, created_at) 
WHERE statut_validation = 'en_attente_president';

COMMENT ON INDEX {schema}.idx_contrat_validation_president IS 
'Index pour accélérer la récupération des recrutements en attente de validation présidentielle';

-- Index pour les dépenses nécessitant validation président
CREATE INDEX IF NOT EXISTS idx_depense_validation_president 
ON {schema}.depense(necessite_validation_president, statut, montant DESC) 
WHERE necessite_validation_president = TRUE AND statut = 'en_attente';

COMMENT ON INDEX {schema}.idx_depense_validation_president IS 
'Index pour accélérer la récupération des investissements en attente de validation présidentielle (>= 1M Ar)';

-- Index pour les diplômes à signer
CREATE INDEX IF NOT EXISTS idx_diplome_a_signer 
ON {schema}.diplome(statut, created_at) 
WHERE signe_president = FALSE AND statut = 'pret_signature';

COMMENT ON INDEX {schema}.idx_diplome_a_signer IS 
'Index pour accélérer la récupération des diplômes prêts à être signés par le président';

-- Index pour les conventions en attente de signature
CREATE INDEX IF NOT EXISTS idx_convention_a_signer 
ON {schema}.convention(statut, date_debut_effet) 
WHERE signe_president = FALSE AND statut = 'en_attente';

COMMENT ON INDEX {schema}.idx_convention_a_signer IS 
'Index pour accélérer la récupération des conventions en attente de signature présidentielle';

-- Index pour les conseils de discipline en attente d'arbitrage
CREATE INDEX IF NOT EXISTS idx_conseil_discipline_president 
ON {schema}.conseil_discipline(statut, date_conseil DESC) 
WHERE statut = 'en_attente_president';

COMMENT ON INDEX {schema}.idx_conseil_discipline_president IS 
'Index pour accélérer la récupération des conseils de discipline en attente d''arbitrage présidentiel';

-- Index pour les délégations actives
CREATE INDEX IF NOT EXISTS idx_delegation_active 
ON {schema}.delegation_signature(statut, delegataire_id, date_fin) 
WHERE statut = 'active';

COMMENT ON INDEX {schema}.idx_delegation_active IS 
'Index pour accélérer la vérification des délégations de signature actives';

-- Index pour le calendrier en attente de validation
CREATE INDEX IF NOT EXISTS idx_calendrier_validation 
ON {schema}.calendrier_academique(statut, date_debut) 
WHERE statut = 'en_attente_validation';

COMMENT ON INDEX {schema}.idx_calendrier_validation IS 
'Index pour accélérer la récupération des événements du calendrier en attente de validation';

-- Index pour les parcours actifs
CREATE INDEX IF NOT EXISTS idx_parcours_actif 
ON {schema}.parcours(actif, niveau) 
WHERE actif = TRUE;

COMMENT ON INDEX {schema}.idx_parcours_actif IS 
'Index pour accélérer la récupération des parcours actifs par niveau';

-- ======================================================================
-- 3. INDEX POUR LES KPI DU DASHBOARD
-- ======================================================================

-- Index pour compter les étudiants actifs
CREATE INDEX IF NOT EXISTS idx_etudiant_actif 
ON {schema}.etudiant(actif) 
WHERE actif = TRUE;

-- Index pour les incidents disciplinaires ouverts
CREATE INDEX IF NOT EXISTS idx_incident_ouvert 
ON {schema}.incident_disciplinaire(statut) 
WHERE statut IN ('ouvert', 'en_cours', 'arbitrage');

-- Index pour les paiements confirmés (recettes)
CREATE INDEX IF NOT EXISTS idx_paiement_confirme 
ON {schema}.paiement(statut, montant) 
WHERE statut = 'confirme';

-- Index pour les échéanciers en retard (impayés)
CREATE INDEX IF NOT EXISTS idx_echeancier_retard 
ON {schema}.echeancier(statut, montant_restant) 
WHERE statut = 'en_retard';

-- Index pour les congés en cours
CREATE INDEX IF NOT EXISTS idx_conge_en_cours 
ON {schema}.conge_personnel(statut, date_debut, date_fin) 
WHERE statut = 'approuve';

-- Index pour les inscriptions en cours
CREATE INDEX IF NOT EXISTS idx_inscription_en_cours 
ON {schema}.inscription(statut, annee_academique_id) 
WHERE statut IN ('en_attente', 'validee');

-- ======================================================================
-- 4. STATISTIQUES POUR L'OPTIMISEUR
-- ======================================================================

-- Analyser les tables pour mettre à jour les statistiques
ANALYZE {schema}.contrat_personnel;
ANALYZE {schema}.depense;
ANALYZE {schema}.diplome;
ANALYZE {schema}.convention;
ANALYZE {schema}.conseil_discipline;
ANALYZE {schema}.delegation_signature;
ANALYZE {schema}.calendrier_academique;
ANALYZE {schema}.parcours;
ANALYZE {schema}.etudiant;
ANALYZE {schema}.incident_disciplinaire;
ANALYZE {schema}.paiement;
ANALYZE {schema}.echeancier;
ANALYZE {schema}.conge_personnel;
ANALYZE {schema}.inscription;

-- ======================================================================
-- FIN DE LA MIGRATION
-- ======================================================================

-- Pour appliquer cette migration à un tenant spécifique:
-- 1. Remplacer {schema} par le nom du tenant (ex: tenant_ispm)
-- 2. Exécuter le script SQL
-- 
-- Exemple:
-- psql -d Imtech_SaaS -c "$(sed 's/{schema}/tenant_ispm/g' 002_add_diplome_statut_and_indexes.sql)"

-- Made with Bob
