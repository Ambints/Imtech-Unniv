-- =============================================================================
-- DONNÉES DE TEST - tenant_test
-- =============================================================================
-- Ce script insère des données de test uniquement si elles n'existent pas déjà

-- =============================================================================
-- 1. UTILISATEURS
-- =============================================================================
INSERT INTO utilisateur (id, email, password_hash, nom, prenom, telephone, role, actif, email_verifie, created_at)
SELECT * FROM (VALUES
    ('a0000001-0000-0000-0000-000000000001', 'admin@test.mg', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MrqYjJqZqZqZqZqZqZqZqZqZqZq', 'Rakoto', 'Jean', '0320000001', 'admin', true, true, NOW()),
    ('a0000002-0000-0000-0000-000000000002', 'scolarite@test.mg', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MrqYjJqZqZqZqZqZqZqZqZqZqZq', 'Rasoa', 'Marie', '0320000002', 'scolarite', true, true, NOW()),
    ('a0000003-0000-0000-0000-000000000003', 'rp@test.mg', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MrqYjJqZqZqZqZqZqZqZqZqZqZq', 'Rabe', 'Pierre', '0320000003', 'resp_pedagogique', true, true, NOW()),
    ('a0000004-0000-0000-0000-000000000004', 'caissier@test.mg', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MrqYjJqZqZqZqZqZqZqZqZqZqZq', 'Ramiandrisoa', 'Hery', '0320000004', 'caissier', true, true, NOW()),
    ('a0000005-0000-0000-0000-000000000005', 'rh@test.mg', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MrqYjJqZqZqZqZqZqZqZqZqZqZq', 'Randria', 'Lalao', '0320000005', 'rh', true, true, NOW()),
    ('a0000006-0000-0000-0000-000000000006', 'president@test.mg', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MrqYjJqZqZqZqZqZqZqZqZqZqZq', 'Andrianasolo', 'Marc', '0320000006', 'president', true, true, NOW()),
    ('a0000007-0000-0000-0000-000000000007', 'ens1@test.mg', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MrqYjJqZqZqZqZqZqZqZqZqZqZq', 'Rakotobe', 'Fidy', '0320000007', 'enseignant', true, true, NOW()),
    ('a0000008-0000-0000-0000-000000000008', 'ens2@test.mg', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MrqYjJqZqZqZqZqZqZqZqZqZqZq', 'Rasolofo', 'Miora', '0320000008', 'enseignant', true, true, NOW()),
    ('a0000009-0000-0000-0000-000000000009', 'ens3@test.mg', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MrqYjJqZqZqZqZqZqZqZqZqZqZq', 'Andriamahefa', 'Hasina', '0320000009', 'enseignant', true, true, NOW()),
    ('a0000010-0000-0000-0000-000000000010', 'secretaire@test.mg', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MrqYjJqZqZqZqZqZqZqZqZqZqZq', 'Raharinivo', 'Voahangy', '0320000010', 'secretaire_parcours', true, true, NOW()),
    ('a0000011-0000-0000-0000-000000000011', 'surv@test.mg', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MrqYjJqZqZqZqZqZqZqZqZqZqZq', 'Rabemanantsoa', 'Lanto', '0320000011', 'surveillant_general', true, true, NOW()),
    ('a0000012-0000-0000-0000-000000000012', 'economat@test.mg', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MrqYjJqZqZqZqZqZqZqZqZqZqZq', 'Ratovoson', 'Nirina', '0320000012', 'economat', true, true, NOW()),
    ('b0000001-0000-0000-0000-000000000001', 'etud1@test.mg', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MrqYjJqZqZqZqZqZqZqZqZqZqZq', 'Andrianantenaina', 'Soa', '0340000001', 'etudiant', true, true, NOW()),
    ('b0000002-0000-0000-0000-000000000002', 'etud2@test.mg', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MrqYjJqZqZqZqZqZqZqZqZqZqZq', 'Rakotonirina', 'Tojo', '0340000002', 'etudiant', true, true, NOW()),
    ('b0000003-0000-0000-0000-000000000003', 'etud3@test.mg', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MrqYjJqZqZqZqZqZqZqZqZqZqZq', 'Rasoamampionona', 'Kanto', '0340000003', 'etudiant', true, true, NOW()),
    ('b0000004-0000-0000-0000-000000000004', 'etud4@test.mg', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MrqYjJqZqZqZqZqZqZqZqZqZqZq', 'Andriamahazo', 'Fy', '0340000004', 'etudiant', true, true, NOW()),
    ('b0000005-0000-0000-0000-000000000005', 'etud5@test.mg', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MrqYjJqZqZqZqZqZqZqZqZqZqZq', 'Rabemananjara', 'Sanda', '0340000005', 'etudiant', true, true, NOW()),
    ('b0000006-0000-0000-0000-000000000006', 'etud6@test.mg', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MrqYjJqZqZqZqZqZqZqZqZqZqZq', 'Randriamampionona', 'Vola', '0340000006', 'etudiant', true, true, NOW()),
    ('b0000007-0000-0000-0000-000000000007', 'etud7@test.mg', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MrqYjJqZqZqZqZqZqZqZqZqZqZq', 'Rakotondrabe', 'Mamy', '0340000007', 'etudiant', true, true, NOW()),
    ('b0000008-0000-0000-0000-000000000008', 'etud8@test.mg', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MrqYjJqZqZqZqZqZqZqZqZqZqZq', 'Andriantsimahavandy', 'Haja', '0340000008', 'etudiant', true, true, NOW()),
    ('c0000001-0000-0000-0000-000000000001', 'parent1@test.mg', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MrqYjJqZqZqZqZqZqZqZqZqZqZq', 'Andrianantenaina', 'Solo', '0330000001', 'parent', true, true, NOW()),
    ('c0000002-0000-0000-0000-000000000002', 'parent2@test.mg', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MrqYjJqZqZqZqZqZqZqZqZqZqZq', 'Rakotonirina', 'Nivo', '0330000002', 'parent', true, true, NOW())
) AS v(id, email, password_hash, nom, prenom, telephone, role, actif, email_verifie, created_at)
WHERE NOT EXISTS (SELECT 1 FROM utilisateur WHERE email = v.email);

-- =============================================================================
-- 2. ENSEIGNANTS (liés aux utilisateurs)
-- =============================================================================
INSERT INTO enseignant (id, utilisateur_id, matricule, nom, prenom, titre, grade, specialite, type_contrat, departement_id, email, actif, created_at)
SELECT * FROM (VALUES
    ('i0000001-0000-0000-0000-000000000001', 'a0000007-0000-0000-0000-000000000007', 'ENS-001', 'Rakotobe', 'Fidy', 'Dr.', 'Maître de Conférences', 'Algorithmique', 'permanent', 'd0000001-0000-0000-0000-000000000001', 'ens1@test.mg', true, NOW()),
    ('i0000002-0000-0000-0000-000000000002', 'a0000008-0000-0000-0000-000000000008', 'ENS-002', 'Rasolofo', 'Miora', 'Mme', 'Assistant', 'Bases de données', 'permanent', 'd0000001-0000-0000-0000-000000000001', 'ens2@test.mg', true, NOW()),
    ('i0000003-0000-0000-0000-000000000003', 'a0000009-0000-0000-0000-000000000009', 'ENS-003', 'Andriamahefa', 'Hasina', 'M.', 'Vacataire', 'Comptabilité', 'vacataire', 'd0000002-0000-0000-0000-000000000002', 'ens3@test.mg', true, NOW())
) AS v(id, utilisateur_id, matricule, nom, prenom, titre, grade, specialite, type_contrat, departement_id, email, actif, created_at)
WHERE NOT EXISTS (SELECT 1 FROM enseignant WHERE matricule = v.matricule);

-- =============================================================================
-- 3. ÉTUDIANTS (liés aux utilisateurs)
-- =============================================================================
INSERT INTO etudiant (id, utilisateur_id, matricule, nom, prenom, date_naissance, lieu_naissance, sexe, nationalite, telephone, email, nom_parent, telephone_parent, actif, created_at)
SELECT * FROM (VALUES
    ('j0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'ETU-2024-001', 'Andrianantenaina', 'Soa', '2002-03-15', 'Antananarivo', 'F', 'Malagasy', '0340000001', 'etud1@test.mg', 'Andrianantenaina Solo', '0330000001', true, NOW()),
    ('j0000002-0000-0000-0000-000000000002', 'b0000002-0000-0000-0000-000000000002', 'ETU-2024-002', 'Rakotonirina', 'Tojo', '2001-07-22', 'Fianarantsoa', 'M', 'Malagasy', '0340000002', 'etud2@test.mg', 'Rakotonirina Nivo', '0330000002', true, NOW()),
    ('j0000003-0000-0000-0000-000000000003', 'b0000003-0000-0000-0000-000000000003', 'ETU-2024-003', 'Rasoamampionona', 'Kanto', '2002-11-08', 'Toamasina', 'F', 'Malagasy', '0340000003', 'etud3@test.mg', 'Rasoamampionona Zo', '0330000003', true, NOW()),
    ('j0000004-0000-0000-0000-000000000004', 'b0000004-0000-0000-0000-000000000004', 'ETU-2024-004', 'Andriamahazo', 'Fy', '2001-05-30', 'Mahajanga', 'M', 'Malagasy', '0340000004', 'etud4@test.mg', 'Andriamahazo Lova', '0330000004', true, NOW()),
    ('j0000005-0000-0000-0000-000000000005', 'b0000005-0000-0000-0000-000000000005', 'ETU-2024-005', 'Rabemananjara', 'Sanda', '2003-01-12', 'Antsiranana', 'F', 'Malagasy', '0340000005', 'etud5@test.mg', 'Rabemananjara Jao', '0330000005', true, NOW()),
    ('j0000006-0000-0000-0000-000000000006', 'b0000006-0000-0000-0000-000000000006', 'ETU-2024-006', 'Randriamampionona', 'Vola', '2002-09-04', 'Antananarivo', 'F', 'Malagasy', '0340000006', 'etud6@test.mg', 'Randriamampionona Noro', '0330000006', true, NOW()),
    ('j0000007-0000-0000-0000-000000000007', 'b0000007-0000-0000-0000-000000000007', 'ETU-2023-001', 'Rakotondrabe', 'Mamy', '2000-06-18', 'Toliara', 'M', 'Malagasy', '0340000007', 'etud7@test.mg', 'Rakotondrabe Fara', '0330000007', true, NOW()),
    ('j0000008-0000-0000-0000-000000000008', 'b0000008-0000-0000-0000-000000000008', 'ETU-2023-002', 'Andriantsimahavandy', 'Haja', '2000-12-25', 'Antananarivo', 'M', 'Malagasy', '0340000008', 'etud8@test.mg', 'Andriantsimahavandy Vero', '0330000008', true, NOW())
) AS v(id, utilisateur_id, matricule, nom, prenom, date_naissance, lieu_naissance, sexe, nationalite, telephone, email, nom_parent, telephone_parent, actif, created_at)
WHERE NOT EXISTS (SELECT 1 FROM etudiant WHERE matricule = v.matricule);

-- =============================================================================
-- 4. UNITÉS D'ENSEIGNEMENT (complément si besoin)
-- =============================================================================
INSERT INTO unite_enseignement (id, parcours_id, code, intitule, credits_ects, coefficient, volume_cm, volume_td, volume_tp, semestre, annee_niveau, type_ue, actif, created_at)
SELECT * FROM (VALUES
    ('k0000001-0000-0000-0000-000000000001', 'f0000001-0000-0000-0000-000000000001', 'INFO-L1-S1-01', 'Algorithmique et Programmation', 6, 3.0, 30, 15, 15, 1, 1, 'obligatoire', true, NOW()),
    ('k0000002-0000-0000-0000-000000000002', 'f0000001-0000-0000-0000-000000000001', 'INFO-L1-S1-02', 'Bases de Données', 6, 3.0, 30, 15, 15, 1, 1, 'obligatoire', true, NOW()),
    ('k0000003-0000-0000-0000-000000000003', 'f0000001-0000-0000-0000-000000000001', 'INFO-L2-S1-01', 'Développement Web', 6, 3.0, 30, 15, 15, 3, 2, 'obligatoire', true, NOW())
) AS v(id, parcours_id, code, intitule, credits_ects, coefficient, volume_cm, volume_td, volume_tp, semestre, annee_niveau, type_ue, actif, created_at)
WHERE NOT EXISTS (SELECT 1 FROM unite_enseignement WHERE code = v.code);

-- =============================================================================
-- 5. ÉLÉMENTS CONSTITUTIFS (complément si besoin)
-- =============================================================================
INSERT INTO element_constitutif (id, ue_id, code, intitule, coefficient, actif, created_at)
SELECT * FROM (VALUES
    ('l0000001-0000-0000-0000-000000000001', 'k0000001-0000-0000-0000-000000000001', 'EC-ALG-01', 'Algorithmique', 2.0, true, NOW()),
    ('l0000002-0000-0000-0000-000000000002', 'k0000001-0000-0000-0000-000000000001', 'EC-ALG-02', 'Programmation Python', 1.0, true, NOW()),
    ('l0000003-0000-0000-0000-000000000003', 'k0000002-0000-0000-0000-000000000002', 'EC-BDD-01', 'SQL et Modélisation', 2.0, true, NOW())
) AS v(id, ue_id, code, intitule, coefficient, actif, created_at)
WHERE NOT EXISTS (SELECT 1 FROM element_constitutif WHERE code = v.code);

-- =============================================================================
-- 6. MISES À JOUR (UE avec enseignant responsable)
-- =============================================================================
UPDATE unite_enseignement SET enseignant_id = 'i0000001-0000-0000-0000-000000000001' WHERE code = 'INFO-L1-S1-01' AND enseignant_id IS NULL;
UPDATE unite_enseignement SET enseignant_id = 'i0000002-0000-0000-0000-000000000002' WHERE code = 'INFO-L1-S1-02' AND enseignant_id IS NULL;

-- =============================================================================
-- 7. INSCRIPTIONS
-- =============================================================================
INSERT INTO inscription (id, etudiant_id, parcours_id, annee_academique_id, annee_niveau, type_inscription, statut, date_inscription, created_at)
SELECT * FROM (VALUES
    ('n0000001-0000-0000-0000-000000000001', 'j0000001-0000-0000-0000-000000000001', 'f0000001-0000-0000-0000-000000000001', 'e0000003-0000-0000-0000-000000000003', 1, 'premiere', 'validee', '2024-10-05', NOW()),
    ('n0000002-0000-0000-0000-000000000002', 'j0000002-0000-0000-0000-000000000002', 'f0000001-0000-0000-0000-000000000001', 'e0000003-0000-0000-0000-000000000003', 1, 'premiere', 'validee', '2024-10-05', NOW()),
    ('n0000003-0000-0000-0000-000000000003', 'j0000003-0000-0000-0000-000000000003', 'f0000001-0000-0000-0000-000000000001', 'e0000003-0000-0000-0000-000000000003', 1, 'premiere', 'validee', '2024-10-06', NOW()),
    ('n0000004-0000-0000-0000-000000000004', 'j0000004-0000-0000-0000-000000000004', 'f0000003-0000-0000-0000-000000000003', 'e0000003-0000-0000-0000-000000000003', 1, 'premiere', 'validee', '2024-10-07', NOW())
) AS v(id, etudiant_id, parcours_id, annee_academique_id, annee_niveau, type_inscription, statut, date_inscription, created_at)
WHERE NOT EXISTS (SELECT 1 FROM inscription WHERE etudiant_id = v.etudiant_id AND parcours_id = v.parcours_id AND annee_academique_id = v.annee_academique_id);

-- =============================================================================
-- 8. GRILLE TARIFAIRE
-- =============================================================================
INSERT INTO grille_tarifaire (id, parcours_id, annee_academique_id, annee_niveau, montant_total, montant_inscription, montant_scolarite, nb_tranches, date_limite_paiement, actif, created_at)
SELECT * FROM (VALUES
    ('m0000001-0000-0000-0000-000000000001', 'f0000001-0000-0000-0000-000000000001', 'e0000003-0000-0000-0000-000000000003', 1, 1500000, 200000, 1300000, 3, '2024-12-31', true, NOW()),
    ('m0000002-0000-0000-0000-000000000002', 'f0000001-0000-0000-0000-000000000001', 'e0000003-0000-0000-0000-000000000003', 2, 1400000, 150000, 1250000, 3, '2024-12-31', true, NOW()),
    ('m0000003-0000-0000-0000-000000000003', 'f0000003-0000-0000-0000-000000000003', 'e0000003-0000-0000-0000-000000000003', 1, 1200000, 150000, 1050000, 2, '2024-12-31', true, NOW())
) AS v(id, parcours_id, annee_academique_id, annee_niveau, montant_total, montant_inscription, montant_scolarite, nb_tranches, date_limite_paiement, actif, created_at)
WHERE NOT EXISTS (SELECT 1 FROM grille_tarifaire WHERE parcours_id = v.parcours_id AND annee_academique_id = v.annee_academique_id AND annee_niveau = v.annee_niveau);

-- =============================================================================
-- 9. ÉCHEANCIERS
-- =============================================================================
INSERT INTO echeancier (id, inscription_id, num_tranche, montant_du, date_echeance, statut)
SELECT * FROM (VALUES
    ('o0000001-0000-0000-0000-000000000001', 'n0000001-0000-0000-0000-000000000001', 1, 500000, '2024-10-31', 'paye'),
    ('o0000002-0000-0000-0000-000000000002', 'n0000001-0000-0000-0000-000000000001', 2, 500000, '2025-01-31', 'paye'),
    ('o0000003-0000-0000-0000-000000000003', 'n0000001-0000-0000-0000-000000000001', 3, 500000, '2025-04-30', 'en_attente'),
    ('o0000004-0000-0000-0000-000000000004', 'n0000002-0000-0000-0000-000000000002', 1, 500000, '2024-10-31', 'paye'),
    ('o0000005-0000-0000-0000-000000000005', 'n0000002-0000-0000-0000-000000000002', 2, 500000, '2025-01-31', 'en_attente')
) AS v(id, inscription_id, num_tranche, montant_du, date_echeance, statut)
WHERE NOT EXISTS (SELECT 1 FROM echeancier WHERE inscription_id = v.inscription_id AND num_tranche = v.num_tranche);

-- =============================================================================
-- 10. PAIEMENTS
-- =============================================================================
INSERT INTO paiement (id, inscription_id, echeancier_id, montant, mode_paiement, date_paiement, reference, numero_recu, caissier_id, statut, created_at)
SELECT * FROM (VALUES
    ('p0000001-0000-0000-0000-000000000001', 'n0000001-0000-0000-0000-000000000001', 'o0000001-0000-0000-0000-000000000001', 500000, 'especes', '2024-10-28 09:30:00', 'REF-2024-001', 'RECU-20241028-000001', 'a0000004-0000-0000-0000-000000000004', 'valide', NOW()),
    ('p0000002-0000-0000-0000-000000000002', 'n0000001-0000-0000-0000-000000000001', 'o0000002-0000-0000-0000-000000000002', 500000, 'mobile_money', '2025-01-25 14:15:00', 'REF-2025-001', 'RECU-20250125-000001', 'a0000004-0000-0000-0000-000000000004', 'valide', NOW()),
    ('p0000003-0000-0000-0000-000000000003', 'n0000002-0000-0000-0000-000000000002', 'o0000004-0000-0000-0000-000000000004', 500000, 'virement', '2024-10-29 10:00:00', 'REF-2024-002', 'RECU-20241029-000001', 'a0000004-0000-0000-0000-000000000004', 'valide', NOW())
) AS v(id, inscription_id, echeancier_id, montant, mode_paiement, date_paiement, reference, numero_recu, caissier_id, statut, created_at)
WHERE NOT EXISTS (SELECT 1 FROM paiement WHERE reference = v.reference);

-- =============================================================================
-- 11. SESSIONS D'EXAMEN
-- =============================================================================
INSERT INTO session_examen (id, annee_academique_id, libelle, type_session, semestre, date_debut, date_fin, statut, created_at)
SELECT * FROM (VALUES
    ('q0000001-0000-0000-0000-000000000001', 'e0000003-0000-0000-0000-000000000003', 'Session Normale S1 2024-2025', 'normale', 1, '2025-01-15', '2025-01-31', 'cloturee', NOW()),
    ('q0000002-0000-0000-0000-000000000002', 'e0000003-0000-0000-0000-000000000003', 'Session Rattrapage S1 2024-2025', 'rattrapage', 1, '2025-02-15', '2025-02-20', 'planifie', NOW())
) AS v(id, annee_academique_id, libelle, type_session, semestre, date_debut, date_fin, statut, created_at)
WHERE NOT EXISTS (SELECT 1 FROM session_examen WHERE libelle = v.libelle);

-- =============================================================================
-- 12. AFFECTATIONS DE COURS
-- =============================================================================
INSERT INTO affectation_cours (id, enseignant_id, ue_id, annee_academique_id, type_seance, volume_prevu, created_at)
SELECT * FROM (VALUES
    ('r0000001-0000-0000-0000-000000000001', 'i0000001-0000-0000-0000-000000000001', 'k0000001-0000-0000-0000-000000000001', 'e0000003-0000-0000-0000-000000000003', 'CM', 30, NOW()),
    ('r0000002-0000-0000-0000-000000000002', 'i0000001-0000-0000-0000-000000000001', 'k0000001-0000-0000-0000-000000000001', 'e0000003-0000-0000-0000-000000000003', 'TD', 15, NOW()),
    ('r0000003-0000-0000-0000-000000000003', 'i0000002-0000-0000-0000-000000000002', 'k0000002-0000-0000-0000-000000000002', 'e0000003-0000-0000-0000-000000000003', 'CM', 30, NOW())
) AS v(id, enseignant_id, ue_id, annee_academique_id, type_seance, volume_prevu, created_at)
WHERE NOT EXISTS (SELECT 1 FROM affectation_cours WHERE enseignant_id = v.enseignant_id AND ue_id = v.ue_id AND annee_academique_id = v.annee_academique_id);

-- =============================================================================
-- 13. NOTES (quelques exemples)
-- =============================================================================
INSERT INTO note (id, etudiant_id, ec_id, session_id, valeur, type_evaluation, verrouille, saisi_par, date_saisie, created_at)
SELECT * FROM (VALUES
    ('s0000001-0000-0000-0000-000000000001', 'j0000001-0000-0000-0000-000000000001', 'l0000001-0000-0000-0000-000000000001', 'q0000001-0000-0000-0000-000000000001', 15.50, 'examen_final', true, 'a0000007-0000-0000-0000-000000000007', NOW(), NOW()),
    ('s0000002-0000-0000-0000-000000000002', 'j0000002-0000-0000-0000-000000000002', 'l0000001-0000-0000-0000-000000000001', 'q0000001-0000-0000-0000-000000000001', 17.00, 'examen_final', true, 'a0000007-0000-0000-0000-000000000007', NOW(), NOW()),
    ('s0000003-0000-0000-0000-000000000003', 'j0000003-0000-0000-0000-000000000003', 'l0000001-0000-0000-0000-000000000001', 'q0000001-0000-0000-0000-000000000001', 8.50, 'examen_final', true, 'a0000007-0000-0000-0000-000000000007', NOW(), NOW())
) AS v(id, etudiant_id, ec_id, session_id, valeur, type_evaluation, verrouille, saisi_par, date_saisie, created_at)
WHERE NOT EXISTS (SELECT 1 FROM note WHERE etudiant_id = v.etudiant_id AND ec_id = v.ec_id AND session_id = v.session_id);

-- =============================================================================
-- 14. RÉSULTATS DE DÉLIBÉRATION
-- =============================================================================
-- Vérifier si des résultats existent avant d'insérer
DO $$
DECLARE
    v_pv_id UUID;
BEGIN
    SELECT id INTO v_pv_id FROM pv_deliberation LIMIT 1;
    
    IF v_pv_id IS NOT NULL THEN
        INSERT INTO resultat_deliberation (id, pv_id, etudiant_id, decision, credits_valides, mention_annee, passage_annee_sup)
        SELECT * FROM (VALUES
            ('v0000001-0000-0000-0000-000000000001', v_pv_id, 'j0000007-0000-0000-0000-000000000007', 'admis', 60, 'Bien', true),
            ('v0000002-0000-0000-0000-000000000002', v_pv_id, 'j0000008-0000-0000-0000-000000000008', 'admis', 60, 'Assez Bien', true)
        ) AS v(id, pv_id, etudiant_id, decision, credits_valides, mention_annee, passage_annee_sup)
        WHERE NOT EXISTS (SELECT 1 FROM resultat_deliberation WHERE pv_id = v.pv_id AND etudiant_id = v.etudiant_id);
    END IF;
END $$;

-- =============================================================================
-- 15. NOTIFICATIONS DE TEST
-- =============================================================================
INSERT INTO notification (id, utilisateur_id, titre, message, type_notification, lue, created_at)
SELECT * FROM (VALUES
    ('g0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'Bienvenue', 'Bienvenue sur la plateforme de gestion universitaire', 'info', false, NOW()),
    ('g0000002-0000-0000-0000-000000000002', 'a0000004-0000-0000-0000-000000000004', 'Test notification', 'Ceci est une notification de test pour le caissier', 'info', false, NOW())
) AS v(id, utilisateur_id, titre, message, type_notification, lue, created_at)
WHERE NOT EXISTS (SELECT 1 FROM notification WHERE utilisateur_id = v.utilisateur_id AND titre = v.titre);

-- =============================================================================
-- 16. ANNONCES
-- =============================================================================
INSERT INTO annonce (id, titre, contenu, type_annonce, cible, publie, date_publication, auteur_id, created_at)
SELECT * FROM (VALUES
    ('z0000001-0000-0000-0000-000000000001', 'Bienvenue année académique 2024-2025', 'L''année académique 2024-2025 est officiellement ouverte. Bonne rentrée à tous !', 'information', 'tous', true, '2024-10-01 08:00:00', 'a0000001-0000-0000-0000-000000000001', NOW()),
    ('z0000002-0000-0000-0000-000000000002', 'Calendrier des examens', 'Les examens du premier semestre auront lieu du 15 au 31 janvier 2025.', 'information', 'etudiants', true, '2025-01-05 08:00:00', 'a0000002-0000-0000-0000-000000000002', NOW())
) AS v(id, titre, contenu, type_annonce, cible, publie, date_publication, auteur_id, created_at)
WHERE NOT EXISTS (SELECT 1 FROM annonce WHERE titre = v.titre);

-- =============================================================================
-- FIN - Données de test insérées avec succès
-- =============================================================================