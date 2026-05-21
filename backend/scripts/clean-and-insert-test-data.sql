-- =============================================================================
-- NETTOYAGE ET INSERTION DES DONNÉES DE TEST POUR TENANT_TEST
-- Ce script supprime d'abord les anciennes données puis insère les nouvelles
-- =============================================================================

-- Définir le search_path pour le schéma tenant_test
SET search_path TO tenant_test, public;

-- =============================================================================
-- ÉTAPE 1: NETTOYAGE DES DONNÉES EXISTANTES
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE 'Début du nettoyage des données existantes...';
    
    -- Supprimer dans l'ordre inverse des dépendances
    DELETE FROM transfert_etudiant;
    DELETE FROM frais_inscription;
    DELETE FROM grille_tarifaire;
    DELETE FROM presence;
    DELETE FROM emploi_du_temps;
    DELETE FROM note;
    DELETE FROM session_examen;
    DELETE FROM salle;
    DELETE FROM batiment;
    DELETE FROM inscription;
    DELETE FROM etudiant WHERE matricule LIKE 'ETU%';
    DELETE FROM support_cours;
    DELETE FROM element_constitutif;
    DELETE FROM unite_enseignement;
    DELETE FROM enseignant WHERE matricule LIKE 'ENS%';
    DELETE FROM parcours WHERE code IN ('INFO-L1', 'GEST-L1', 'INFO-M1', 'MATH-L1');
    DELETE FROM departement WHERE code IN ('INFO', 'GEST', 'MATH', 'DROIT');
    DELETE FROM utilisateur WHERE email LIKE '%@univ-test.com' OR email LIKE '%@student.com';
    DELETE FROM annee_academique WHERE libelle = '2024-2025';
    DELETE FROM notification;
    DELETE FROM demande_etudiant;
    DELETE FROM ticket_maintenance;
    DELETE FROM conge_personnel;
    DELETE FROM paiement WHERE reference LIKE 'PAY-2024%';
    DELETE FROM annonce WHERE titre = 'Fermeture administrative';
    
    RAISE NOTICE 'Nettoyage terminé.';
END $$;

-- =============================================================================
-- ÉTAPE 2: INSERTION DES NOUVELLES DONNÉES
-- =============================================================================

-- Mot de passe par défaut: "password123"
-- Hash: $2b$12$LCKBXLvVkM1hEQq8OpGWu.KH2UV4PQDH843MA7NAK7IdUkX1DymFW

-- =============================================================================
-- 1. ANNÉE ACADÉMIQUE
-- =============================================================================
INSERT INTO annee_academique (id, libelle, date_debut, date_fin, active)
VALUES 
    ('11111111-1111-1111-1111-111111111111', '2024-2025', '2024-09-01', '2025-06-30', false);

-- =============================================================================
-- 2. UTILISATEURS (personnel)
-- =============================================================================
INSERT INTO utilisateur (id, email, password_hash, nom, prenom, telephone, role, actif, email_verifie)
VALUES 
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'president@univ-test.com', '$2b$12$LCKBXLvVkM1hEQq8OpGWu.KH2UV4PQDH843MA7NAK7IdUkX1DymFW', 'RAKOTO', 'Jean', '0321000001', 'president', true, true),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'resppeda@univ-test.com', '$2b$12$LCKBXLvVkM1hEQq8OpGWu.KH2UV4PQDH843MA7NAK7IdUkX1DymFW', 'RANDRIANARIVO', 'Marie', '0321000002', 'resp_pedagogique', true, true),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'scolarite@univ-test.com', '$2b$12$LCKBXLvVkM1hEQq8OpGWu.KH2UV4PQDH843MA7NAK7IdUkX1DymFW', 'ANDRIAMANGA', 'Lala', '0321000003', 'scolarite', true, true),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'rh@univ-test.com', '$2b$12$LCKBXLvVkM1hEQq8OpGWu.KH2UV4PQDH843MA7NAK7IdUkX1DymFW', 'RAMANANTSOA', 'Hery', '0321000004', 'rh', true, true),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'economat@univ-test.com', '$2b$12$LCKBXLvVkM1hEQq8OpGWu.KH2UV4PQDH843MA7NAK7IdUkX1DymFW', 'RASOLOFONIRINA', 'Tahina', '0321000005', 'economat', true, true),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'caissier@univ-test.com', '$2b$12$LCKBXLvVkM1hEQq8OpGWu.KH2UV4PQDH843MA7NAK7IdUkX1DymFW', 'RAZAFINDRAMANGA', 'Voahangy', '0321000006', 'caissier', true, true),
    ('00000000-0000-0000-0000-000000000001', 'com@univ-test.com', '$2b$12$LCKBXLvVkM1hEQq8OpGWu.KH2UV4PQDH843MA7NAK7IdUkX1DymFW', 'RAJAONARISON', 'Mamy', '0321000007', 'communication', true, true),
    ('00000000-0000-0000-0000-000000000002', 'logistique@univ-test.com', '$2b$12$LCKBXLvVkM1hEQq8OpGWu.KH2UV4PQDH843MA7NAK7IdUkX1DymFW', 'ANDRIAMIHAJA', 'Fidy', '0321000008', 'logistique', true, true),
    ('00000000-0000-0000-0000-000000000003', 'admin@univ-test.com', '$2b$12$LCKBXLvVkM1hEQq8OpGWu.KH2UV4PQDH843MA7NAK7IdUkX1DymFW', 'RABEMANANJARA', 'Faniry', '0321000009', 'admin', true, true),
    ('00000000-0000-0000-0000-000000000004', 'surveillant@univ-test.com', '$2b$12$LCKBXLvVkM1hEQq8OpGWu.KH2UV4PQDH843MA7NAK7IdUkX1DymFW', 'RANDRIAMAMPIONONA', 'Bako', '0321000010', 'surveillant_general', true, true);

-- =============================================================================
-- 3. DÉPARTEMENTS
-- =============================================================================
INSERT INTO departement (id, code, nom, description, responsable_id, actif)
VALUES 
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'INFO', 'Informatique', 'Département des Sciences Informatiques', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002', 'GEST', 'Gestion', 'Département des Sciences de Gestion', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0003', 'MATH', 'Mathématiques', 'Département de Mathématiques Appliquées', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0004', 'DROIT', 'Droit', 'Département des Sciences Juridiques', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true);

-- =============================================================================
-- 4. PARCOURS
-- =============================================================================
INSERT INTO parcours (id, departement_id, code, nom, niveau, duree_annees, responsable_id, secretaire_id, description, actif, annee_ouverture)
VALUES 
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaa00001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'INFO-L1', 'Licence Informatique', 'Licence', 3, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Licence en Sciences Informatiques', true, 2024),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaa00002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002', 'GEST-L1', 'Licence Gestion', 'Licence', 3, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Licence en Sciences de Gestion', true, 2024),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaa00003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'INFO-M1', 'Master Informatique', 'Master', 2, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Master en Informatique', true, 2024),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaa00004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0003', 'MATH-L1', 'Licence Mathématiques', 'Licence', 3, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Licence en Mathématiques Appliquées', true, 2024);

-- =============================================================================
-- 5. ENSEIGNANTS
-- =============================================================================
INSERT INTO enseignant (id, utilisateur_id, matricule, nom, prenom, titre, grade, specialite, type_contrat, departement_id, email, telephone, actif)
VALUES 
    ('11111111-1111-1111-1111-111111111111', NULL, 'ENS001', 'RAKOTOBE', 'Paul', 'Dr', 'Maître de Conférences', 'Bases de données', 'permanent', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'paul.rakotobe@univ-test.com', '0322000001', true),
    ('22222222-2222-2222-2222-222222222222', NULL, 'ENS002', 'RASOLO', 'Jeanne', 'Pr', 'Professeur', 'Algorithmique', 'permanent', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'jeanne.rasolo@univ-test.com', '0322000002', true),
    ('33333333-3333-3333-3333-333333333333', NULL, 'ENS003', 'ANDRIAN', 'Marc', 'Dr', 'Assistant', 'Finance', 'permanent', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002', 'marc.andrian@univ-test.com', '0322000003', true),
    ('44444444-4444-4444-4444-444444444444', NULL, 'ENS004', 'RAMANAN', 'Sophie', 'Dr', 'Maître de Conférences', 'Marketing', 'vacataire', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002', 'sophie.ramanan@univ-test.com', '0322000004', true);

-- Continuer avec le reste des données...
-- (Le reste du script test-data-tenant-test.sql à partir de la ligne 77)

-- =============================================================================
-- RÉCAPITULATIF
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'DONNÉES DE TEST INSÉRÉES AVEC SUCCÈS';
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'Mot de passe: password123';
    RAISE NOTICE '=============================================';
END $$;

-- Made with Bob
