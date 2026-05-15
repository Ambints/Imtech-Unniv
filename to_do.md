Contexte :
Tu es un architecte full-stack spécialisé dans les systèmes de gestion d’université (ERP académique). Tu dois générer une application web modulaire (backend + frontend + base de données) pour une université catholique.

Objectif :
Créer ou lier les modules suivants à une base de données relationnelle (PostgreSQL ou MySQL). Si certains modules existent déjà et sont fonctionnels (Admin, Responsable RH), tu ne dois pas les recréer, mais seulement les lier aux nouveaux modules si nécessaire.

Modules à créer ou à lier :

1. Gouvernance et Haute Direction
   - Président de l’Université

2. Pôle Académique et Pédagogique
   - Responsables Pédagogiques (par parcours)
   - Secrétaires (par parcours)
   - Surveillants Généraux

3. Services Administratifs et Techniques
   - Service Scolarité et Notes
   - Personnel RH (si non existant)

4. Pôle Financier
   - Économat
   - Caissier

5. Communication et Relations Extérieures
   - Service Communication
   - Administrateur des comptes utilisateurs

6. Logistique et Maintenance
   - Responsable Logistique
   - Service Entretien / Ménage

Contraintes fonctionnelles :

Chaque module doit avoir :
- Son propre tableau de bord
- Une gestion des droits d’accès (RBAC)
- Une liaison avec la base de données via des relations claires (clés étrangères, index, contraintes)
- Une API REST (ou GraphQL) pour les opérations CRUD
- Une interface utilisateur simple mais fonctionnelle (admin LTE ou Tailwind + React/Vue)

Roles spécifiques avec actions précises (à implémenter) :

- Président : dashboards, validation des recrutements, signature numérique, arbitrage.
- Responsable Pédagogique : maquettes, affectation enseignants, validation examens, suivi réussite.
- Secrétaire de parcours : emplois du temps, inscriptions, gestion absences enseignants.
- Surveillant Général : appel numérique, incidents disciplinaires, organisation examens.
- Scolarité : relevés de notes, délibérations, diplômes, équivalences.
- RH : contrats, suivi heures, paie, évaluations.
- Économat : budget, achats, recouvrement, reporting.
- Caissier : encaissements, reçus, rapprochement bancaire, relances impayés.
- Communication : actualités, événements, résultats examens, alertes.
- Admin : configuration générale, gestion utilisateurs.
- Logistique : allocation salles, maintenance, inventaire, énergie.
- Ménage : planning nettoyage, stocks produits, hygiène.

Portails utilisateurs :
- Étudiant : emploi du temps, notes, paiements, attestations, justificatifs.
- Parent : suivi académique, financier, autorisations, notifications.
- Professeur : supports cours, notes, présences, demandes ressources.

Exigences techniques :
- Générer les schémas de base de données (SQL)
- Générer les modèles backend (Node.js/Express ou Django ou Laravel ou Spring Boot)
- Générer les contrôleurs, services, middlewares d’authentification
- Générer les pages frontend principales pour chaque module
- Ajouter une gestion de logs et d’audit

Si un module existe déjà (ex: RH, Admin), ne pas le recréer mais :
- Vérifier la compatibilité des schémas
- Ajouter des relations (ex: user_id vers responsable pédagogique)
- Étendre les droits existants si nécessaire

À la fin, fournir :
1. Un diagramme ERD (description textuelle ou Mermaid)
2. Les scripts SQL de création des tables
3. La structure des dossiers du projet
4. Le code généré pour au moins 3 modules complets
5. Une procédure de lancement (migration, seed, démarrage)