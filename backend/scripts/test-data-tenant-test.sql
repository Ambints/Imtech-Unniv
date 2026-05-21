-- =============================================================================
-- DONNÉES DE TEST POUR TENANT_TEST
-- Mot de passe par défaut: "password123"
-- Hash: $2b$12$LCKBXLvVkM1hEQq8OpGWu.KH2UV4PQDH843MA7NAK7IdUkX1DymFW
-- =============================================================================
-- IMPORTANT: Ce script doit être exécuté dans le contexte du schéma tenant_test
-- Commande: psql -U postgres -d imtech_university -c "SET search_path TO tenant_test, public;" -f backend/scripts/test-data-tenant-test.sql
-- =============================================================================

-- Définir le search_path pour le schéma tenant_test
SET search_path TO tenant_test, public;

-- =============================================================================
-- 1. ANNÉE ACADÉMIQUE
-- =============================================================================
INSERT INTO annee_academique (id, libelle, date_debut, date_fin, active)
VALUES 
    ('11111111-1111-1111-1111-111111111111', '2024-2025', '2024-09-01', '2025-06-30', false)
ON CONFLICT (libelle) DO UPDATE SET
    date_debut = EXCLUDED.date_debut,
    date_fin = EXCLUDED.date_fin,
    active = EXCLUDED.active;

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
    ('00000000-0000-0000-0000-000000000004', 'surveillant@univ-test.com', '$2b$12$LCKBXLvVkM1hEQq8OpGWu.KH2UV4PQDH843MA7NAK7IdUkX1DymFW', 'RANDRIAMAMPIONONA', 'Bako', '0321000010', 'surveillant_general', true, true)
ON CONFLICT (email) DO NOTHING;

-- =============================================================================
-- 3. DÉPARTEMENTS
-- =============================================================================
INSERT INTO departement (id, code, nom, description, responsable_id, actif)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'INFO', 'Informatique', 'Département des Sciences Informatiques', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002', 'GEST', 'Gestion', 'Département des Sciences de Gestion', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0003', 'MATH', 'Mathématiques', 'Département de Mathématiques Appliquées', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0004', 'DROIT', 'Droit', 'Département des Sciences Juridiques', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true)
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- 4. PARCOURS
-- =============================================================================
INSERT INTO parcours (id, departement_id, code, nom, niveau, duree_annees, responsable_id, secretaire_id, description, actif, annee_ouverture)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaa00001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'INFO-L1', 'Licence Informatique', 'Licence', 3, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Licence en Sciences Informatiques', true, 2024),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaa00002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002', 'GEST-L1', 'Licence Gestion', 'Licence', 3, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Licence en Sciences de Gestion', true, 2024),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaa00003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'INFO-M1', 'Master Informatique', 'Master', 2, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Master en Informatique', true, 2024),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaa00004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0003', 'MATH-L1', 'Licence Mathématiques', 'Licence', 3, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Licence en Mathématiques Appliquées', true, 2024)
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- 5. ENSEIGNANTS
-- =============================================================================
INSERT INTO enseignant (id, utilisateur_id, matricule, nom, prenom, titre, grade, specialite, type_contrat, departement_id, email, telephone, actif)
VALUES
    ('11111111-1111-1111-1111-111111111111', NULL, 'ENS001', 'RAKOTOBE', 'Paul', 'Dr', 'Maître de Conférences', 'Bases de données', 'permanent', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'paul.rakotobe@univ-test.com', '0322000001', true),
    ('22222222-2222-2222-2222-222222222222', NULL, 'ENS002', 'RASOLO', 'Jeanne', 'Pr', 'Professeur', 'Algorithmique', 'permanent', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'jeanne.rasolo@univ-test.com', '0322000002', true),
    ('33333333-3333-3333-3333-333333333333', NULL, 'ENS003', 'ANDRIAN', 'Marc', 'Dr', 'Assistant', 'Finance', 'permanent', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002', 'marc.andrian@univ-test.com', '0322000003', true),
    ('44444444-4444-4444-4444-444444444444', NULL, 'ENS004', 'RAMANAN', 'Sophie', 'Dr', 'Maître de Conférences', 'Marketing', 'vacataire', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002', 'sophie.ramanan@univ-test.com', '0322000004', true)
ON CONFLICT (matricule) DO NOTHING;

-- =============================================================================
-- 6. UNITÉS D'ENSEIGNEMENT
-- =============================================================================
INSERT INTO unite_enseignement (id, parcours_id, code, intitule, credits_ects, coefficient, volume_cm, volume_td, volume_tp, semestre, annee_niveau, type_ue, enseignant_id, actif)
VALUES
    ('uuuuuuuu-uuuu-uuuu-uuuu-uuuuuuuuu001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaa00001', 'INF101', 'Algorithmique et Programmation', 6, 3.0, 30, 30, 20, 1, 1, 'obligatoire', '11111111-1111-1111-1111-111111111111', true),
    ('uuuuuuuu-uuuu-uuuu-uuuu-uuuuuuuuu002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaa00001', 'INF102', 'Base de données', 6, 2.5, 24, 24, 12, 2, 1, 'obligatoire', '11111111-1111-1111-1111-111111111111', true),
    ('uuuuuuuu-uuuu-uuuu-uuuu-uuuuuuuuu003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaa00001', 'INF103', 'Développement Web', 4, 2.0, 20, 20, 20, 2, 1, 'obligatoire', '22222222-2222-2222-2222-222222222222', true),
    ('uuuuuuuu-uuuu-uuuu-uuuu-uuuuuuuuu004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaa00002', 'GES101', 'Comptabilité Générale', 6, 3.0, 30, 20, 0, 1, 1, 'obligatoire', '33333333-3333-3333-3333-333333333333', true),
    ('uuuuuuuu-uuuu-uuuu-uuuu-uuuuuuuuu005', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaa00002', 'GES102', 'Marketing Fondamental', 5, 2.0, 20, 15, 0, 2, 1, 'obligatoire', '44444444-4444-4444-4444-444444444444', true)
ON CONFLICT (parcours_id, code) DO NOTHING;

-- =============================================================================
-- 7. ÉLÉMENTS CONSTITUTIFS
-- =============================================================================
INSERT INTO element_constitutif (id, ue_id, code, intitule, coefficient, actif)
VALUES 
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0001', 'uuuuuuuu-uuuu-uuuu-uuuu-uuuuuuuuu001', 'INF101-EC1', 'Introduction à l''algorithmique', 0.4, true),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0002', 'uuuuuuuu-uuuu-uuuu-uuuu-uuuuuuuuu001', 'INF101-EC2', 'Structures de données', 0.3, true),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0003', 'uuuuuuuu-uuuu-uuuu-uuuu-uuuuuuuuu001', 'INF101-EC3', 'Projet de programmation', 0.3, true),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0004', 'uuuuuuuu-uuuu-uuuu-uuuu-uuuuuuuuu002', 'INF102-EC1', 'Modélisation relationnelle', 0.5, true),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0005', 'uuuuuuuu-uuuu-uuuu-uuuu-uuuuuuuuu002', 'INF102-EC2', 'SQL Avancé', 0.5, true)
ON CONFLICT (ue_id, code) DO NOTHING;

-- =============================================================================
-- 8. UTILISATEURS ÉTUDIANTS
-- =============================================================================
INSERT INTO utilisateur (id, email, password_hash, nom, prenom, telephone, role, actif, email_verifie)
VALUES 
    ('11111111-aaaa-1111-aaaa-111111111111', 'etudiant1@student.com', '$2b$12$LCKBXLvVkM1hEQq8OpGWu.KH2UV4PQDH843MA7NAK7IdUkX1DymFW', 'RANDRIANARIVO', 'Miora', '0341000001', 'etudiant', true, true),
    ('22222222-bbbb-2222-bbbb-222222222222', 'etudiant2@student.com', '$2b$12$LCKBXLvVkM1hEQq8OpGWu.KH2UV4PQDH843MA7NAK7IdUkX1DymFW', 'RAKOTOMAMONJY', 'Toky', '0341000002', 'etudiant', true, true),
    ('33333333-cccc-3333-cccc-333333333333', 'etudiant3@student.com', '$2b$12$LCKBXLvVkM1hEQq8OpGWu.KH2UV4PQDH843MA7NAK7IdUkX1DymFW', 'ANDRIANJAFY', 'Nantenaina', '0341000003', 'etudiant', true, true),
    ('44444444-dddd-4444-dddd-444444444444', 'etudiant4@student.com', '$2b$12$LCKBXLvVkM1hEQq8OpGWu.KH2UV4PQDH843MA7NAK7IdUkX1DymFW', 'RAZAFINDRAMANGA', 'Fenitra', '0341000004', 'etudiant', true, true),
    ('55555555-eeee-5555-eeee-555555555555', 'etudiant5@student.com', '$2b$12$LCKBXLvVkM1hEQq8OpGWu.KH2UV4PQDH843MA7NAK7IdUkX1DymFW', 'RAMAROSON', 'Haja', '0341000005', 'etudiant', true, true)
ON CONFLICT (email) DO NOTHING;

-- =============================================================================
-- 9. FICHES ÉTUDIANTS
-- =============================================================================
INSERT INTO etudiant (id, utilisateur_id, matricule, nom, prenom, date_naissance, lieu_naissance, sexe, nationalite, adresse, telephone, email, nom_parent, telephone_parent, religion, actif)
VALUES 
    ('eeeeeeee-1111-eeee-1111-eeeeeeee1111', '11111111-aaaa-1111-aaaa-111111111111', 'ETU001', 'RANDRIANARIVO', 'Miora', '2002-03-15', 'Antananarivo', 'F', 'Malagasy', 'Lot IAV 123 Bis', '0341000001', 'miora.randri@email.com', 'Jean Randrianarivo', '0342000001', 'Protestant', true),
    ('eeeeeeee-2222-eeee-2222-eeeeeeee2222', '22222222-bbbb-2222-bbbb-222222222222', 'ETU002', 'RAKOTOMAMONJY', 'Toky', '2001-07-22', 'Toamasina', 'M', 'Malagasy', 'Lot IIJ 45 Ter', '0341000002', 'toky.rakoto@email.com', 'Paul Rakotomamonjy', '0342000002', 'Catholique', true),
    ('eeeeeeee-3333-eeee-3333-eeeeeeee3333', '33333333-cccc-3333-cccc-333333333333', 'ETU003', 'ANDRIANJAFY', 'Nantenaina', '2003-01-10', 'Fianarantsoa', 'M', 'Malagasy', 'Lot VH 78', '0341000003', 'nantenaina.andri@email.com', 'Pierre Andrianjafy', '0342000003', 'Protestant', true),
    ('eeeeeeee-4444-eeee-4444-eeeeeeee4444', '44444444-dddd-4444-dddd-444444444444', 'ETU004', 'RAZAFINDRAMANGA', 'Fenitra', '2002-11-05', 'Mahajanga', 'F', 'Malagasy', 'Lot AM 234', '0341000004', 'fenitra.razaf@email.com', 'Marie Razafindramanga', '0342000004', 'Musulman', true),
    ('eeeeeeee-5555-eeee-5555-eeeeeeee5555', '55555555-eeee-5555-eeee-555555555555', 'ETU005', 'RAMAROSON', 'Haja', '2001-09-30', 'Antsiranana', 'M', 'Malagasy', 'Lot DN 567', '0341000005', 'haja.ramaroson@email.com', 'Luc Ramaroson', '0342000005', 'Catholique', true)
ON CONFLICT (matricule) DO NOTHING;

-- =============================================================================
-- 10. INSCRIPTIONS
-- =============================================================================
INSERT INTO inscription (id, etudiant_id, parcours_id, annee_academique_id, annee_niveau, type_inscription, statut, date_inscription, bourse)
VALUES
    ('iiiiiiii-iiii-iiii-iiii-iiiiiii1001', 'eeeeeeee-1111-eeee-1111-eeeeeeee1111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaa00001', '11111111-1111-1111-1111-111111111111', 1, 'premiere', 'validee', '2024-09-10', false),
    ('iiiiiiii-iiii-iiii-iiii-iiiiiii1002', 'eeeeeeee-2222-eeee-2222-eeeeeeee2222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaa00001', '11111111-1111-1111-1111-111111111111', 1, 'premiere', 'validee', '2024-09-11', true),
    ('iiiiiiii-iiii-iiii-iiii-iiiiiii1003', 'eeeeeeee-3333-eeee-3333-eeeeeeee3333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaa00002', '11111111-1111-1111-1111-111111111111', 1, 'premiere', 'validee', '2024-09-12', false),
    ('iiiiiiii-iiii-iiii-iiii-iiiiiii1004', 'eeeeeeee-4444-eeee-4444-eeeeeeee4444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaa00002', '11111111-1111-1111-1111-111111111111', 1, 'premiere', 'validee', '2024-09-13', false),
    ('iiiiiiii-iiii-iiii-iiii-iiiiiii1005', 'eeeeeeee-5555-eeee-5555-eeeeeeee5555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaa00001', '11111111-1111-1111-1111-111111111111', 1, 'premiere', 'en_attente', '2024-09-14', false)
ON CONFLICT (etudiant_id, parcours_id, annee_academique_id) DO NOTHING;

-- =============================================================================
-- 11. BATIMENTS ET SALLES
-- =============================================================================
INSERT INTO batiment (id, nom, code, adresse, actif)
VALUES 
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbb0001', 'Bâtiment Principal', 'BAT-A', 'Campus Universitaire Antananarivo', true),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbb0002', 'Bâtiment B', 'BAT-B', 'Campus Universitaire Antananarivo', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO salle (id, batiment_id, nom, code, capacite, type_salle, equipements, disponible, etage)
VALUES 
    ('ssssssss-ssss-ssss-ssss-ssssssss001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbb0001', 'Amphithéâtre A', 'SAL-A001', 150, 'amphitheatre', '{"projecteur": true, "tableau": true, "climatisation": true}', true, 0),
    ('ssssssss-ssss-ssss-ssss-ssssssss002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbb0001', 'Salle de cours 101', 'SAL-A101', 40, 'cours', '{"projecteur": true, "tableau": true, "ordinateur": true}', true, 1),
    ('ssssssss-ssss-ssss-ssss-ssssssss003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbb0001', 'Labo Info 1', 'SAL-A201', 30, 'salle_info', '{"ordinateurs": 30, "projecteur": true, "internet": true}', true, 2),
    ('ssssssss-ssss-ssss-ssss-ssssssss004', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbb0002', 'Salle de réunion', 'SAL-B001', 20, 'salle_reunion', '{"visio": true, "tableau": true}', true, 0)
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- 12. SESSION EXAMEN
-- =============================================================================
INSERT INTO session_examen (id, annee_academique_id, libelle, type_session, semestre, date_debut, date_fin, statut)
VALUES 
    ('sesssess-sess-sess-sess-sessssss001', '11111111-1111-1111-1111-111111111111', 'Session 1 - Semestre 1 2024', 'normale', 1, '2025-01-10', '2025-01-25', 'cloturee'),
    ('sesssess-sess-sess-sess-sessssss002', '11111111-1111-1111-1111-111111111111', 'Rattrapage S1 2024', 'rattrapage', 1, '2025-02-15', '2025-02-20', 'cloturee')
ON CONFLICT (annee_academique_id, libelle) DO NOTHING;

-- =============================================================================
-- 13. NOTES
-- =============================================================================
INSERT INTO note (id, etudiant_id, ec_id, session_id, valeur, type_evaluation, saisi_par, valide_par, verrouille)
VALUES 
    (gen_random_uuid(), 'eeeeeeee-1111-eeee-1111-eeeeeeee1111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0001', 'sesssess-sess-sess-sess-sessssss001', 14.5, 'examen_final', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'cccccccc-cccc-cccc-cccc-cccccccccccc', true),
    (gen_random_uuid(), 'eeeeeeee-1111-eeee-1111-eeeeeeee1111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0002', 'sesssess-sess-sess-sess-sessssss001', 12.0, 'examen_final', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'cccccccc-cccc-cccc-cccc-cccccccccccc', true),
    (gen_random_uuid(), 'eeeeeeee-1111-eeee-1111-eeeeeeee1111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0003', 'sesssess-sess-sess-sess-sessssss001', 15.5, 'examen_final', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'cccccccc-cccc-cccc-cccc-cccccccccccc', true),
    (gen_random_uuid(), 'eeeeeeee-2222-eeee-2222-eeeeeeee2222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0001', 'sesssess-sess-sess-sess-sessssss001', 16.0, 'examen_final', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'cccccccc-cccc-cccc-cccc-cccccccccccc', true),
    (gen_random_uuid(), 'eeeeeeee-2222-eeee-2222-eeeeeeee2222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0002', 'sesssess-sess-sess-sess-sessssss001', 13.5, 'examen_final', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'cccccccc-cccc-cccc-cccc-cccccccccccc', true),
    (gen_random_uuid(), 'eeeeeeee-2222-eeee-2222-eeeeeeee2222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0003', 'sesssess-sess-sess-sess-sessssss001', 17.0, 'examen_final', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'cccccccc-cccc-cccc-cccc-cccccccccccc', true),
    (gen_random_uuid(), 'eeeeeeee-3333-eeee-3333-eeeeeeee3333', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0004', 'sesssess-sess-sess-sess-sessssss001', 11.5, 'examen_final', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'cccccccc-cccc-cccc-cccc-cccccccccccc', true)
ON CONFLICT (etudiant_id, ec_id, session_id) DO NOTHING;

-- =============================================================================
-- 14. EMPLOI DU TEMPS
-- =============================================================================
INSERT INTO emploi_du_temps (id, annee_academique_id, salle_id, date_seance, heure_debut, heure_fin, type_seance, statut)
VALUES 
    ('edtedted-edt-edt-edt-edtedtedt001', '11111111-1111-1111-1111-111111111111', 'ssssssss-ssss-ssss-ssss-ssssssss002', '2024-10-15', '08:00', '10:00', 'CM', 'realise'),
    ('edtedted-edt-edt-edt-edtedtedt002', '11111111-1111-1111-1111-111111111111', 'ssssssss-ssss-ssss-ssss-ssssssss002', '2024-10-22', '08:00', '10:00', 'CM', 'realise')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 15. PRÉSENCES
-- =============================================================================
INSERT INTO presence (id, etudiant_id, seance_id, statut, justifie, mode_pointage, saisi_par)
VALUES 
    (gen_random_uuid(), 'eeeeeeee-1111-eeee-1111-eeeeeeee1111', 'edtedted-edt-edt-edt-edtedtedt001', 'present', false, 'manuel', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
    (gen_random_uuid(), 'eeeeeeee-2222-eeee-2222-eeeeeeee2222', 'edtedted-edt-edt-edt-edtedtedt001', 'present', false, 'manuel', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
    (gen_random_uuid(), 'eeeeeeee-3333-eeee-3333-eeeeeeee3333', 'edtedted-edt-edt-edt-edtedtedt001', 'absent', false, 'manuel', 'cccccccc-cccc-cccc-cccc-cccccccccccc')
ON CONFLICT (etudiant_id, seance_id) DO NOTHING;

-- =============================================================================
-- 16. GRILLES TARIFAIRES
-- =============================================================================
INSERT INTO grille_tarifaire (id, parcours_id, annee_academique_id, annee_niveau, montant_total, nb_tranches, description, actif)
VALUES
    ('gggggggg-gggg-gggg-gggg-gggggggg001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaa00001', '11111111-1111-1111-1111-111111111111', 1, 850000, 4, 'Frais annuels Licence Informatique L1', true),
    ('gggggggg-gggg-gggg-gggg-gggggggg002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaa00002', '11111111-1111-1111-1111-111111111111', 1, 750000, 4, 'Frais annuels Licence Gestion L1', true)
ON CONFLICT (parcours_id, annee_academique_id, annee_niveau) DO NOTHING;

-- =============================================================================
-- 17. PAIEMENTS
-- =============================================================================
INSERT INTO paiement (id, inscription_id, montant, mode_paiement, date_paiement, reference, numero_recu, caissier_id, statut)
VALUES 
    (gen_random_uuid(), 'iiiiiiii-iiii-iiii-iiii-iiiiiii1001', 212500, 'mobile_money', '2024-09-10 10:30:00', 'PAY-20240910-001', 'RECU-20240910-000001', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'valide'),
    (gen_random_uuid(), 'iiiiiiii-iiii-iiii-iiii-iiiiiii1001', 212500, 'virement', '2024-10-15 14:20:00', 'PAY-20241015-002', 'RECU-20241015-000002', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'valide'),
    (gen_random_uuid(), 'iiiiiiii-iiii-iiii-iiii-iiiiiii1002', 850000, 'especes', '2024-09-11 09:15:00', 'PAY-20240911-003', 'RECU-20240911-000003', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'valide')
ON CONFLICT (reference) DO NOTHING;

-- =============================================================================
-- 18. NOTIFICATIONS
-- =============================================================================
INSERT INTO notification (id, utilisateur_id, titre, message, type_notification, lue, created_at)
VALUES 
    (gen_random_uuid(), '11111111-aaaa-1111-aaaa-111111111111', 'Bienvenue à l''université', 'Votre inscription a été validée. Bienvenue !', 'info', false, NOW()),
    (gen_random_uuid(), '11111111-aaaa-1111-aaaa-111111111111', 'Note publiée', 'Vos notes du semestre 1 sont disponibles.', 'note', false, NOW());

-- =============================================================================
-- 19. DEMANDES ÉTUDIANTS
-- =============================================================================
INSERT INTO demande_etudiant (id, etudiant_id, type_demande, description, justification, date_soumission, statut)
VALUES 
    (gen_random_uuid(), 'eeeeeeee-1111-eeee-1111-eeeeeeee1111', 'certificat_scolarite', 'Demande de certificat de scolarité pour bourse', 'Justificatif de scolarité requis', '2024-10-20', 'en_traitement');

-- =============================================================================
-- 20. TICKETS MAINTENANCE
-- =============================================================================
INSERT INTO ticket_maintenance (id, batiment_id, salle_id, titre, description, type_maintenance, priorite, statut, signale_par, assigne_a)
VALUES 
    (gen_random_uuid(), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbb0001', 'ssssssss-ssss-ssss-ssss-ssssssss003', 'Ordinateur défectueux', 'Poste n°15 ne s''allume plus', 'curative', 'haute', 'en_cours', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003');

-- =============================================================================
-- 21. CONGÉS PERSONNEL
-- =============================================================================
INSERT INTO conge_personnel (id, utilisateur_id, type_conge, date_debut, date_fin, motif, statut, approuve_par)
VALUES 
    (gen_random_uuid(), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'annuel', '2025-01-05', '2025-01-15', 'Vacances', 'approuve', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- =============================================================================
-- 22. SUPPORTS DE COURS
-- =============================================================================
INSERT INTO support_cours (id, titre, description, type_fichier, fichier_url, ec_id, auteur_id, date_depot, actif)
VALUES 
    (gen_random_uuid(), 'Introduction à la programmation', 'Supports du cours d''algorithmique', 'pdf', '/uploads/cours/algoprogram.pdf', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-09-15 10:00:00', true);

-- =============================================================================
-- 23. ANNONCES
-- =============================================================================
INSERT INTO annonce (id, titre, contenu, type_annonce, cible, publie, date_publication, auteur_id)
VALUES 
    (gen_random_uuid(), 'Fermeture administrative', 'L''université sera fermée le 1er novembre', 'fermeture', 'tous', true, NOW(), '00000000-0000-0000-0000-000000000001');

-- =============================================================================
-- 24. FRAIS INSCRIPTION
-- =============================================================================
INSERT INTO frais_inscription (id, parcours_id, annee_academique_id, montant_inscription, montant_scolarite, montant_total, description, actif, date_limite_paiement)
VALUES
    (gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaa00001', '11111111-1111-1111-1111-111111111111', 150000, 700000, 850000, 'Frais L1 Informatique', true, '2024-12-31'),
    (gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaa00002', '11111111-1111-1111-1111-111111111111', 150000, 600000, 750000, 'Frais L1 Gestion', true, '2024-12-31')
ON CONFLICT (parcours_id, annee_academique_id) DO NOTHING;

-- =============================================================================
-- 25. TRANSFERTS ÉTUDIANTS
-- =============================================================================
INSERT INTO transfert_etudiant (id, etudiant_id, parcours_origine_id, parcours_destination_id, type_transfert, motif, statut, date_demande)
VALUES
    (gen_random_uuid(), 'eeeeeeee-5555-eeee-5555-eeeeeeee5555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaa00001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaa00003', 'interne', 'Souhaite passer en Master directement', 'en_attente', '2024-10-01');

-- =============================================================================
-- RÉCAPITULATIF
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'DONNÉES DE TEST INSÉRÉES AVEC SUCCÈS';
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'Années académiques   : 1';
    RAISE NOTICE 'Utilisateurs admin   : 10';
    RAISE NOTICE 'Utilisateurs étudiants: 5';
    RAISE NOTICE 'Départements         : 4';
    RAISE NOTICE 'Parcours             : 4';
    RAISE NOTICE 'Enseignants          : 4';
    RAISE NOTICE 'UE                   : 5';
    RAISE NOTICE 'EC                   : 5';
    RAISE NOTICE 'Étudiants            : 5';
    RAISE NOTICE 'Inscriptions         : 5';
    RAISE NOTICE 'Sessions examen      : 2';
    RAISE NOTICE 'Notes                : 7';
    RAISE NOTICE 'Présences            : 3';
    RAISE NOTICE 'Paiements            : 3';
    RAISE NOTICE 'Batiments            : 2';
    RAISE NOTICE 'Salles               : 4';
    RAISE NOTICE 'Grilles tarifaires   : 2';
    RAISE NOTICE 'Frais inscription    : 2';
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'Mot de passe par défaut: password123';
    RAISE NOTICE '=============================================';
END $$;

-- Made with Bob
