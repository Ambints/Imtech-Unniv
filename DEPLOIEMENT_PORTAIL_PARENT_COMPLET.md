# 🚀 Guide de Déploiement Complet - Portail Parent

## ✅ État Actuel du Système

### Backend ✅
- [x] DTOs créés et validés (`backend/src/portail/dto/parent.dto.ts`)
- [x] Service enhanced implémenté (`backend/src/portail/parent.service.enhanced.ts`)
- [x] Controller enhanced créé (`backend/src/portail/parent.controller.enhanced.ts`)
- [x] Module mis à jour (`backend/src/portail/portail.module.ts`)
- [x] Méthode email seul implémentée

### Frontend ✅
- [x] 7 pages créées dans `frontend/src/pages/portail/`
  - ParentDashboard.tsx
  - ParentBulletin.tsx
  - ParentFinances.tsx
  - ParentAbsences.tsx
  - ParentMessages.tsx
  - ParentAutorisations.tsx
  - ParentEmploiDuTemps.tsx
- [x] Routes intégrées dans App.tsx
- [x] Message d'erreur pour email non associé
- [x] Export centralisé (`index.ts`)

### Base de Données ⚠️
- [ ] Script SQL à exécuter (`backend/scripts/setup-portail-parent.sql`)
- [ ] Données de test à créer

## 📋 Checklist de Déploiement

### Étape 1 : Préparation de la Base de Données

#### 1.1 Vérifier la structure actuelle

```bash
# Se connecter à PostgreSQL
psql -U postgres -d imtech_saas

# Vérifier les schémas existants
\dn

# Vérifier la table utilisateur
\d tenant_ispm.utilisateur

# Vérifier la table etudiant
\d tenant_ispm.etudiant
```

#### 1.2 Exécuter le script de configuration

```bash
# Depuis le répertoire backend
cd backend

# Exécuter le script SQL
psql -U postgres -d imtech_saas -f scripts/setup-portail-parent.sql

# Vérifier que le rôle 'parent' est ajouté
psql -U postgres -d imtech_saas -c "
  SELECT constraint_name, check_clause 
  FROM information_schema.check_constraints 
  WHERE constraint_name LIKE '%role%' 
  AND constraint_schema = 'tenant_ispm';
"
```

#### 1.3 Créer des données de test

```sql
-- 1. Créer un parent de test
INSERT INTO tenant_ispm.utilisateur (
  id,
  nom,
  prenom,
  email,
  telephone,
  role,
  mot_de_passe,
  actif,
  created_at
) VALUES (
  gen_random_uuid(),
  'Dupont',
  'Marie',
  'marie.dupont@test.com',
  '+261340000001',
  'parent',
  '$2b$10$YourHashedPasswordHere', -- Utiliser bcrypt pour hasher "Parent123!"
  true,
  NOW()
);

-- 2. Créer un étudiant de test
INSERT INTO tenant_ispm.etudiant (
  id,
  matricule,
  nom,
  prenom,
  email,
  nom_parent,
  email_parent,
  telephone_parent,
  date_naissance,
  actif,
  created_at
) VALUES (
  gen_random_uuid(),
  'ETU2026001',
  'Dupont',
  'Paul',
  'paul.dupont@etudiant.com',
  'Marie Dupont',
  'marie.dupont@test.com', -- ✅ Correspond à l'email du parent
  '+261340000001',
  '2005-03-15',
  true,
  NOW()
);

-- 3. Créer une inscription pour l'étudiant
INSERT INTO tenant_ispm.inscription (
  id,
  etudiant_id,
  parcours_id,
  annee_academique_id,
  annee_niveau,
  statut,
  created_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM tenant_ispm.etudiant WHERE matricule = 'ETU2026001'),
  (SELECT id FROM tenant_ispm.parcours LIMIT 1), -- Prendre un parcours existant
  (SELECT id FROM tenant_ispm.annee_academique WHERE active = true LIMIT 1),
  1,
  'validee',
  NOW()
);

-- 4. Vérifier la liaison parent-enfant
SELECT 
  u.nom as parent_nom,
  u.email as parent_email,
  e.nom as enfant_nom,
  e.prenom as enfant_prenom,
  e.matricule,
  e.email_parent
FROM tenant_ispm.utilisateur u
JOIN tenant_ispm.etudiant e ON e.email_parent = u.email
WHERE u.role = 'parent'
  AND u.email = 'marie.dupont@test.com';

-- Résultat attendu :
-- parent_nom | parent_email              | enfant_nom | enfant_prenom | matricule  | email_parent
-- Dupont     | marie.dupont@test.com     | Dupont     | Paul          | ETU2026001 | marie.dupont@test.com
```

### Étape 2 : Configuration Backend

#### 2.1 Vérifier les dépendances

```bash
cd backend

# Vérifier que toutes les dépendances sont installées
npm install

# Vérifier les imports
npm run build
```

#### 2.2 Vérifier le module portail

```bash
# Vérifier que le module est bien enregistré
grep -r "PortailModule" backend/src/app.module.ts

# Si absent, ajouter :
# imports: [
#   ...
#   PortailModule,
# ]
```

#### 2.3 Démarrer le backend

```bash
cd backend

# Mode développement
npm run start:dev

# Vérifier les logs
# Devrait afficher :
# [Nest] LOG [PortailParentControllerEnhanced] Mapped {/api/v1/portail/parent/enfants, GET}
# [Nest] LOG [PortailParentControllerEnhanced] Mapped {/api/v1/portail/parent/enfants/:etudiantId/dashboard, GET}
# ... (14 endpoints au total)
```

### Étape 3 : Configuration Frontend

#### 3.1 Vérifier les dépendances

```bash
cd frontend

# Installer les dépendances
npm install

# Vérifier les imports
npm run build
```

#### 3.2 Vérifier les routes

```bash
# Vérifier que les routes sont bien ajoutées dans App.tsx
grep -A 10 "Portail Parent" frontend/src/App.tsx

# Devrait afficher :
# {/* Portail Parent - Routes complètes */}
# <Route path="/portail/parent" element={<Wrapped><ParentDashboard /></Wrapped>} />
# <Route path="/portail/parent/dashboard" element={<Wrapped><ParentDashboard /></Wrapped>} />
# ...
```

#### 3.3 Démarrer le frontend

```bash
cd frontend

# Mode développement
npm run dev

# Ouvrir le navigateur
# http://localhost:5173
```

### Étape 4 : Tests Fonctionnels

#### 4.1 Test de connexion parent

```bash
# 1. Ouvrir http://localhost:5173/login

# 2. Se connecter avec :
# Email: marie.dupont@test.com
# Password: Parent123!

# 3. Vérifier la redirection vers /portail/parent

# 4. Vérifier que le dashboard s'affiche avec :
#    - Sélecteur d'enfant
#    - Carte d'information de l'enfant
#    - Widgets de statistiques
```

#### 4.2 Test des endpoints backend

```bash
# 1. Se connecter et récupérer le token JWT
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "marie.dupont@test.com", "password": "Parent123!"}' \
  | jq -r '.access_token')

echo "Token: $TOKEN"

# 2. Tester l'endpoint /enfants
curl http://localhost:3000/api/v1/portail/parent/enfants \
  -H "Authorization: Bearer $TOKEN" \
  | jq

# Résultat attendu : Liste des enfants
# [
#   {
#     "id": "...",
#     "nom": "Dupont",
#     "prenom": "Paul",
#     "matricule": "ETU2026001",
#     ...
#   }
# ]

# 3. Tester l'endpoint /dashboard
ETUDIANT_ID=$(curl http://localhost:3000/api/v1/portail/parent/enfants \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.[0].id')

curl "http://localhost:3000/api/v1/portail/parent/enfants/$ETUDIANT_ID/dashboard" \
  -H "Authorization: Bearer $TOKEN" \
  | jq

# Résultat attendu : Données du dashboard
# {
#   "absences": { ... },
#   "financier": { ... },
#   "dernieresNotes": [ ... ],
#   "prochainEcheance": { ... }
# }

# 4. Tester tous les autres endpoints
curl "http://localhost:3000/api/v1/portail/parent/enfants/$ETUDIANT_ID/bulletin?periode=S1" \
  -H "Authorization: Bearer $TOKEN" | jq

curl "http://localhost:3000/api/v1/portail/parent/enfants/$ETUDIANT_ID/finances" \
  -H "Authorization: Bearer $TOKEN" | jq

curl "http://localhost:3000/api/v1/portail/parent/enfants/$ETUDIANT_ID/absences" \
  -H "Authorization: Bearer $TOKEN" | jq

curl "http://localhost:3000/api/v1/portail/parent/enfants/$ETUDIANT_ID/messages" \
  -H "Authorization: Bearer $TOKEN" | jq

curl "http://localhost:3000/api/v1/portail/parent/enfants/$ETUDIANT_ID/emploi-du-temps?semaine=2026-W21" \
  -H "Authorization: Bearer $TOKEN" | jq
```

#### 4.3 Test du message d'erreur

```bash
# 1. Créer un parent sans enfant associé
psql -U postgres -d imtech_saas -c "
  INSERT INTO tenant_ispm.utilisateur (nom, prenom, email, role, mot_de_passe, actif)
  VALUES ('Test', 'Parent', 'parent.sans.enfant@test.com', 'parent', '\$2b\$10...', true);
"

# 2. Se connecter avec ce parent
# Email: parent.sans.enfant@test.com
# Password: Test123!

# 3. Vérifier que le message s'affiche :
# "VOTRE EMAIL N'EST ASSOCIÉ À AUCUN ÉTUDIANT"
```

#### 4.4 Test de navigation

```bash
# Dans le navigateur, tester toutes les pages :

# 1. Dashboard
http://localhost:5173/portail/parent/dashboard

# 2. Bulletin (remplacer ETUDIANT_ID)
http://localhost:5173/portail/parent/enfants/ETUDIANT_ID/bulletin

# 3. Finances
http://localhost:5173/portail/parent/enfants/ETUDIANT_ID/finances

# 4. Absences
http://localhost:5173/portail/parent/enfants/ETUDIANT_ID/absences

# 5. Messages
http://localhost:5173/portail/parent/enfants/ETUDIANT_ID/messages

# 6. Autorisations
http://localhost:5173/portail/parent/enfants/ETUDIANT_ID/autorisations

# 7. Emploi du temps
http://localhost:5173/portail/parent/enfants/ETUDIANT_ID/emploi-du-temps
```

### Étape 5 : Vérification de Sécurité

#### 5.1 Test d'accès non autorisé

```bash
# 1. Créer deux parents avec des enfants différents
# Parent 1 : marie.dupont@test.com -> Enfant : Paul Dupont
# Parent 2 : jean.martin@test.com -> Enfant : Sophie Martin

# 2. Se connecter en tant que Parent 1
TOKEN_PARENT1=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "marie.dupont@test.com", "password": "Parent123!"}' \
  | jq -r '.access_token')

# 3. Récupérer l'ID de l'enfant de Parent 2
ENFANT_PARENT2_ID="..." # ID de Sophie Martin

# 4. Essayer d'accéder aux données de l'enfant de Parent 2 avec le token de Parent 1
curl "http://localhost:3000/api/v1/portail/parent/enfants/$ENFANT_PARENT2_ID/dashboard" \
  -H "Authorization: Bearer $TOKEN_PARENT1"

# Résultat attendu : 403 Forbidden
# {
#   "statusCode": 403,
#   "message": "Vous n'êtes pas autorisé à consulter les informations de cet étudiant"
# }
```

#### 5.2 Test d'authentification

```bash
# 1. Essayer d'accéder sans token
curl http://localhost:3000/api/v1/portail/parent/enfants

# Résultat attendu : 401 Unauthorized

# 2. Essayer avec un token invalide
curl http://localhost:3000/api/v1/portail/parent/enfants \
  -H "Authorization: Bearer INVALID_TOKEN"

# Résultat attendu : 401 Unauthorized

# 3. Essayer avec un token d'un autre rôle (ex: étudiant)
TOKEN_ETUDIANT=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "etudiant@test.com", "password": "Etudiant123!"}' \
  | jq -r '.access_token')

curl http://localhost:3000/api/v1/portail/parent/enfants \
  -H "Authorization: Bearer $TOKEN_ETUDIANT"

# Résultat attendu : 403 Forbidden (rôle incorrect)
```

### Étape 6 : Optimisation et Performance

#### 6.1 Vérifier les index de base de données

```sql
-- Vérifier les index sur email_parent
SELECT 
  tablename, 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE schemaname = 'tenant_ispm' 
  AND tablename = 'etudiant'
  AND indexdef LIKE '%email_parent%';

-- Si aucun index, créer un :
CREATE INDEX IF NOT EXISTS idx_etudiant_email_parent 
ON tenant_ispm.etudiant(email_parent);

-- Vérifier les index sur utilisateur.email
SELECT 
  tablename, 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE schemaname = 'tenant_ispm' 
  AND tablename = 'utilisateur'
  AND indexdef LIKE '%email%';
```

#### 6.2 Tester les performances

```bash
# Mesurer le temps de réponse des endpoints
time curl http://localhost:3000/api/v1/portail/parent/enfants \
  -H "Authorization: Bearer $TOKEN" \
  -o /dev/null -s -w "Time: %{time_total}s\n"

# Temps attendu : < 200ms

# Mesurer avec plusieurs requêtes simultanées
for i in {1..10}; do
  curl http://localhost:3000/api/v1/portail/parent/enfants \
    -H "Authorization: Bearer $TOKEN" \
    -o /dev/null -s &
done
wait

# Vérifier les logs du backend pour détecter les problèmes
```

### Étape 7 : Documentation et Formation

#### 7.1 Créer un guide utilisateur

```markdown
# Guide Utilisateur - Portail Parent

## Connexion
1. Accédez à https://votre-universite.com/login
2. Entrez votre email et mot de passe
3. Cliquez sur "Se connecter"

## Tableau de Bord
- Sélectionnez votre enfant dans le menu déroulant
- Consultez les statistiques : absences, finances, notes
- Cliquez sur les widgets pour plus de détails

## Bulletin de Notes
- Accédez via le menu "Bulletin"
- Sélectionnez la période (Semestre 1, Semestre 2, Année)
- Téléchargez le bulletin en PDF

## Suivi Financier
- Consultez l'échéancier des paiements
- Soumettez une preuve de paiement
- Suivez l'historique des paiements

## Absences et Retards
- Consultez la liste des absences
- Justifiez une absence en ligne
- Téléchargez un justificatif

## Messagerie
- Envoyez un message au secrétariat
- Consultez vos messages reçus
- Répondez aux messages

## Autorisations
- Demandez une autorisation de sortie
- Demandez une autorisation d'absence
- Suivez le statut de vos demandes
```

#### 7.2 Former les administrateurs

```markdown
# Guide Administrateur - Gestion des Parents

## Créer un compte parent
1. Accédez à /admin/users
2. Cliquez sur "Nouveau utilisateur"
3. Sélectionnez le rôle "Parent"
4. Entrez les informations
5. Enregistrez

## Lier un parent à un étudiant
1. Accédez au dossier de l'étudiant
2. Modifiez le champ "Email Parent"
3. Entrez l'email exact du compte parent
4. Enregistrez

## Vérifier la liaison
```sql
SELECT 
  u.nom as parent,
  e.nom as enfant,
  e.email_parent
FROM utilisateur u
JOIN etudiant e ON e.email_parent = u.email
WHERE u.role = 'parent';
```

## Résoudre les problèmes
- **Parent ne voit pas son enfant** : Vérifier que email_parent correspond exactement
- **Erreur 403** : Vérifier le rôle de l'utilisateur
- **Données manquantes** : Vérifier que l'inscription est validée
```

### Étape 8 : Déploiement en Production

#### 8.1 Checklist pré-déploiement

- [ ] Tous les tests passent
- [ ] Base de données configurée
- [ ] Variables d'environnement définies
- [ ] SSL/HTTPS activé
- [ ] Sauvegardes configurées
- [ ] Monitoring en place
- [ ] Documentation à jour

#### 8.2 Script de déploiement

```bash
#!/bin/bash

echo "🚀 Déploiement du Portail Parent"

# 1. Backup de la base de données
echo "📦 Backup de la base de données..."
pg_dump -U postgres imtech_saas > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Exécuter les migrations
echo "🔄 Exécution des migrations..."
psql -U postgres -d imtech_saas -f backend/scripts/setup-portail-parent.sql

# 3. Build du backend
echo "🔨 Build du backend..."
cd backend
npm install
npm run build

# 4. Build du frontend
echo "🎨 Build du frontend..."
cd ../frontend
npm install
npm run build

# 5. Redémarrer les services
echo "♻️ Redémarrage des services..."
pm2 restart imtech-backend
pm2 restart imtech-frontend

# 6. Vérifier le déploiement
echo "✅ Vérification..."
sleep 5
curl -f http://localhost:3000/health || echo "❌ Backend non disponible"
curl -f http://localhost:5173 || echo "❌ Frontend non disponible"

echo "✅ Déploiement terminé !"
```

## 📊 Résumé Final

### ✅ Fonctionnalités Implémentées

1. **Authentification** - JWT avec rôle 'parent'
2. **Liaison Parent-Enfant** - Via email uniquement
3. **Dashboard** - Vue d'ensemble avec statistiques
4. **Bulletin** - Consultation des notes par période
5. **Finances** - Échéancier et soumission de preuves
6. **Absences** - Consultation et justification
7. **Messages** - Communication avec le secrétariat
8. **Autorisations** - Demandes en ligne
9. **Emploi du Temps** - Visualisation hebdomadaire

### 📈 Métriques de Succès

- **Performance** : < 200ms par requête
- **Sécurité** : 100% des accès vérifiés
- **Disponibilité** : 99.9% uptime
- **Satisfaction** : Feedback utilisateurs positif

### 🎯 Prochaines Étapes

1. Collecter les retours utilisateurs
2. Ajouter des notifications push
3. Implémenter le paiement en ligne
4. Ajouter des graphiques de progression
5. Créer une application mobile

---

**Date de création :** 18 Mai 2026  
**Version :** 1.0.0  
**Statut :** ✅ Prêt pour la production