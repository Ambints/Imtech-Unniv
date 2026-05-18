-- ================================================================
-- SCRIPT DE CONFIGURATION DU PORTAIL PARENT
-- Création des comptes parents et liaison avec les étudiants
-- ================================================================

-- ================================================================
-- ÉTAPE 1: Ajouter le rôle 'parent' dans les contraintes
-- ================================================================

-- Pour tenant_ispm
ALTER TABLE tenant_ispm.utilisateur
DROP CONSTRAINT IF EXISTS utilisateur_role_check;

ALTER TABLE tenant_ispm.utilisateur
ADD CONSTRAINT utilisateur_role_check
CHECK (role IN (
  'admin', 'resp_pedagogique', 'secretaire_parcours', 'scolarite', 
  'caissier', 'economat', 'rh', 'logistique', 'entretien', 
  'communication', 'president', 'surveillant_general', 
  'etudiant', 'enseignant', 'parent' -- Ajout du rôle parent
));

-- Pour tenant_universite_d_antsiranana
ALTER TABLE tenant_universite_d_antsiranana.utilisateur
DROP CONSTRAINT IF EXISTS utilisateur_role_check;

ALTER TABLE tenant_universite_d_antsiranana.utilisateur
ADD CONSTRAINT utilisateur_role_check
CHECK (role IN (
  'admin', 'resp_pedagogique', 'secretaire_parcours', 'scolarite', 
  'caissier', 'economat', 'rh', 'logistique', 'entretien', 
  'communication', 'president', 'surveillant_general', 
  'etudiant', 'enseignant', 'parent'
));

-- ================================================================
-- ÉTAPE 2: Créer des comptes parents exemples
-- ================================================================

-- Parent 1: Marie Dupont (ISPM)
INSERT INTO tenant_ispm.utilisateur (
  nom, prenom, email, telephone, role, 
  mot_de_passe, actif, date_naissance, adresse
) VALUES (
  'Dupont', 
  'Marie', 
  'marie.dupont@email.com', 
  '+261340000001',
  'parent',
  -- Mot de passe: Parent123! (à hasher avec bcrypt)
  '$2b$10$YourHashedPasswordHere',
  true,
  '1980-05-15',
  'Lot II M 45 Bis Ambohipo, Antananarivo'
) ON CONFLICT (email) DO NOTHING;

-- Parent 2: Jean Rakoto (ISPM)
INSERT INTO tenant_ispm.utilisateur (
  nom, prenom, email, telephone, role, 
  mot_de_passe, actif, date_naissance, adresse
) VALUES (
  'Rakoto', 
  'Jean', 
  'jean.rakoto@email.com', 
  '+261340000002',
  'parent',
  '$2b$10$YourHashedPasswordHere',
  true,
  '1975-08-20',
  'Lot III K 12 Ankorondrano, Antananarivo'
) ON CONFLICT (email) DO NOTHING;

-- Parent 3: Sophie Rasoamanana (Université d'Antsiranana)
INSERT INTO tenant_universite_d_antsiranana.utilisateur (
  nom, prenom, email, telephone, role, 
  mot_de_passe, actif, date_naissance, adresse
) VALUES (
  'Rasoamanana', 
  'Sophie', 
  'sophie.rasoamanana@email.com', 
  '+261340000003',
  'parent',
  '$2b$10$YourHashedPasswordHere',
  true,
  '1982-03-10',
  'Rue Colbert, Antsiranana'
) ON CONFLICT (email) DO NOTHING;

-- ================================================================
-- ÉTAPE 3: Lier les parents aux étudiants existants
-- ================================================================

-- Exemple: Lier Marie Dupont à ses enfants dans ISPM
-- Remplacer les UUID par les vrais IDs de vos étudiants

-- Enfant 1 de Marie Dupont
UPDATE tenant_ispm.etudiant
SET 
  nom_parent = 'Marie Dupont',
  email_parent = 'marie.dupont@email.com',
  telephone_parent = '+261340000001'
WHERE matricule = 'ISPM2024001' -- Remplacer par le vrai matricule
  OR nom = 'Dupont' AND prenom LIKE 'Paul%'; -- Ou par nom/prénom

-- Enfant 2 de Marie Dupont
UPDATE tenant_ispm.etudiant
SET 
  nom_parent = 'Marie Dupont',
  email_parent = 'marie.dupont@email.com',
  telephone_parent = '+261340000001'
WHERE matricule = 'ISPM2024002' -- Remplacer par le vrai matricule
  OR nom = 'Dupont' AND prenom LIKE 'Sophie%';

-- Enfants de Jean Rakoto
UPDATE tenant_ispm.etudiant
SET 
  nom_parent = 'Jean Rakoto',
  email_parent = 'jean.rakoto@email.com',
  telephone_parent = '+261340000002'
WHERE matricule IN ('ISPM2024003', 'ISPM2024004') -- Remplacer par les vrais matricules
  OR nom = 'Rakoto' AND prenom IN ('Miora', 'Toky');

-- Enfants de Sophie Rasoamanana (Université d'Antsiranana)
UPDATE tenant_universite_d_antsiranana.etudiant
SET 
  nom_parent = 'Sophie Rasoamanana',
  email_parent = 'sophie.rasoamanana@email.com',
  telephone_parent = '+261340000003'
WHERE matricule = 'UDA2024001' -- Remplacer par le vrai matricule
  OR nom = 'Rasoamanana' AND prenom LIKE 'Lova%';

-- ================================================================
-- ÉTAPE 4: Vérifier les liaisons créées
-- ================================================================

-- Vérifier les parents créés dans ISPM
SELECT 
  id, nom, prenom, email, telephone, role, actif
FROM tenant_ispm.utilisateur
WHERE role = 'parent'
ORDER BY nom, prenom;

-- Vérifier les étudiants liés aux parents dans ISPM
SELECT 
  e.id,
  e.matricule,
  e.nom,
  e.prenom,
  e.nom_parent,
  e.email_parent,
  e.telephone_parent,
  p.nom as parcours,
  i.annee_niveau
FROM tenant_ispm.etudiant e
LEFT JOIN tenant_ispm.inscription i ON i.etudiant_id = e.id AND i.statut = 'validee'
LEFT JOIN tenant_ispm.parcours p ON p.id = i.parcours_id
WHERE e.email_parent IS NOT NULL
ORDER BY e.email_parent, e.nom, e.prenom;

-- Compter les enfants par parent
SELECT 
  email_parent,
  nom_parent,
  COUNT(*) as nombre_enfants
FROM tenant_ispm.etudiant
WHERE email_parent IS NOT NULL
GROUP BY email_parent, nom_parent
ORDER BY nombre_enfants DESC;

-- ================================================================
-- ÉTAPE 5: Créer des notifications de bienvenue pour les parents
-- ================================================================

-- Notification de bienvenue pour chaque parent
INSERT INTO tenant_ispm.notification (
  utilisateur_id,
  titre,
  message,
  type_notification,
  lien
)
SELECT 
  u.id,
  'Bienvenue sur le Portail Parent',
  'Bienvenue sur le portail parent de l''ISPM. Vous pouvez maintenant suivre la scolarité de vos enfants en temps réel.',
  'info',
  '/portail/parent/dashboard'
FROM tenant_ispm.utilisateur u
WHERE u.role = 'parent' AND u.actif = true
ON CONFLICT DO NOTHING;

-- ================================================================
-- ÉTAPE 6: Créer une annonce pour les parents
-- ================================================================

-- Annonce d'ouverture du portail parent
INSERT INTO tenant_ispm.annonce (
  titre,
  contenu,
  type_annonce,
  cible,
  publie,
  date_publication,
  auteur_id
)
SELECT 
  'Ouverture du Portail Parent',
  'Chers parents, nous sommes heureux de vous annoncer l''ouverture du portail parent. Vous pouvez désormais suivre en temps réel la scolarité de vos enfants : notes, absences, paiements, et bien plus encore. Connectez-vous avec vos identifiants pour découvrir toutes les fonctionnalités.',
  'information',
  'parents',
  true,
  CURRENT_TIMESTAMP,
  u.id
FROM tenant_ispm.utilisateur u
WHERE u.role = 'admin' AND u.actif = true
LIMIT 1
ON CONFLICT DO NOTHING;

-- ================================================================
-- ÉTAPE 7: Script de génération de mot de passe (à exécuter côté application)
-- ================================================================

-- Note: Les mots de passe doivent être hashés avec bcrypt
-- Exemple en Node.js:
-- const bcrypt = require('bcrypt');
-- const password = 'Parent123!';
-- const hash = await bcrypt.hash(password, 10);

-- ================================================================
-- ÉTAPE 8: Permissions et sécurité
-- ================================================================

-- Vérifier que la table permissions_portail existe et contient les bonnes permissions
SELECT * FROM tenant_ispm.permissions_portail
WHERE type_portail = 'parent'
LIMIT 5;

-- Si la table existe, ajouter les permissions pour les parents
INSERT INTO tenant_ispm.permissions_portail (
  type_portail,
  code_permission,
  libelle,
  description,
  actif
) VALUES
  ('parent', 'view_bulletin', 'Consulter le bulletin', 'Permet de consulter les notes et le bulletin de l''enfant', true),
  ('parent', 'view_absences', 'Consulter les absences', 'Permet de consulter les absences et retards', true),
  ('parent', 'justify_absence', 'Justifier une absence', 'Permet de justifier une absence en ligne', true),
  ('parent', 'view_finances', 'Consulter les finances', 'Permet de consulter la situation financière', true),
  ('parent', 'submit_payment', 'Soumettre un paiement', 'Permet de soumettre une preuve de paiement', true),
  ('parent', 'create_authorization', 'Créer une autorisation', 'Permet de créer une autorisation de sortie', true),
  ('parent', 'send_message', 'Envoyer un message', 'Permet d''envoyer des messages à l''établissement', true),
  ('parent', 'view_schedule', 'Consulter l''emploi du temps', 'Permet de consulter l''emploi du temps', true)
ON CONFLICT (type_portail, code_permission) DO NOTHING;

-- ================================================================
-- ÉTAPE 9: Index pour optimiser les performances
-- ================================================================

-- Index sur email_parent pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_etudiant_email_parent 
ON tenant_ispm.etudiant(email_parent) 
WHERE email_parent IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_etudiant_telephone_parent 
ON tenant_ispm.etudiant(telephone_parent) 
WHERE telephone_parent IS NOT NULL;

-- Même chose pour l'autre tenant
CREATE INDEX IF NOT EXISTS idx_etudiant_email_parent 
ON tenant_universite_d_antsiranana.etudiant(email_parent) 
WHERE email_parent IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_etudiant_telephone_parent 
ON tenant_universite_d_antsiranana.etudiant(telephone_parent) 
WHERE telephone_parent IS NOT NULL;

-- ================================================================
-- RÉSUMÉ DES COMPTES CRÉÉS
-- ================================================================

-- Afficher un résumé
SELECT 
  'ISPM' as etablissement,
  COUNT(DISTINCT u.id) as nombre_parents,
  COUNT(DISTINCT e.id) as nombre_enfants_lies
FROM tenant_ispm.utilisateur u
LEFT JOIN tenant_ispm.etudiant e ON e.email_parent = u.email
WHERE u.role = 'parent'

UNION ALL

SELECT 
  'Université d''Antsiranana' as etablissement,
  COUNT(DISTINCT u.id) as nombre_parents,
  COUNT(DISTINCT e.id) as nombre_enfants_lies
FROM tenant_universite_d_antsiranana.utilisateur u
LEFT JOIN tenant_universite_d_antsiranana.etudiant e ON e.email_parent = u.email
WHERE u.role = 'parent';

-- ================================================================
-- FIN DU SCRIPT
-- ================================================================

-- NOTES IMPORTANTES:
-- 1. Remplacer les UUID et matricules par les vraies valeurs de votre base
-- 2. Hasher les mots de passe avec bcrypt avant insertion
-- 3. Adapter les noms de schémas selon vos tenants
-- 4. Tester d'abord sur un environnement de développement
-- 5. Informer les parents de leurs identifiants par email sécurisé

COMMENT ON TABLE tenant_ispm.utilisateur IS 'Table des utilisateurs incluant les parents (role=parent)';

-- Made with Bob
