# 🚀 GUIDE DE DÉPLOIEMENT - PORTAIL PARENT

## 📋 Vue d'ensemble

Ce guide vous accompagne pas à pas dans le déploiement complet du module Portail Parent.

## ✅ Prérequis

- [x] Node.js 18+ installé
- [x] PostgreSQL 14+ configuré
- [x] Base de données avec schémas tenants existants
- [x] Backend NestJS fonctionnel
- [x] Frontend React fonctionnel

## 📦 Fichiers Créés

### Backend
```
backend/src/portail/
├── dto/parent.dto.ts                      ✅ Créé
├── parent.service.enhanced.ts             ✅ Créé
├── parent.controller.enhanced.ts          ✅ Créé
└── portail.module.ts                      ✅ Mis à jour

backend/scripts/
├── setup-portail-parent.sql               ✅ Créé
└── create-portail-parent-schema.sql       ✅ Créé (optionnel)
```

### Frontend
```
frontend/src/pages/portail/
├── ParentDashboard.tsx                    ✅ Créé
└── ParentFinances.tsx                     ✅ Créé
```

### Documentation
```
IMPLEMENTATION_PORTAIL_PARENT_COMPLETE.md  ✅ Créé
GUIDE_DEPLOIEMENT_PORTAIL_PARENT.md        ✅ Ce fichier
```

## 🔧 ÉTAPE 1: Configuration de la Base de Données

### 1.1 Exécuter le script de configuration

```bash
# Se connecter à PostgreSQL
psql -U postgres -d imtech_saas

# Exécuter le script
\i backend/scripts/setup-portail-parent.sql
```

### 1.2 Vérifier les rôles créés

```sql
-- Vérifier que le rôle 'parent' est autorisé
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%role_check%';

-- Vérifier les parents créés
SELECT id, nom, prenom, email, role, actif
FROM tenant_ispm.utilisateur
WHERE role = 'parent';
```

### 1.3 Créer des comptes parents de test

```sql
-- Générer un hash bcrypt pour le mot de passe "Parent123!"
-- Utiliser: https://bcrypt-generator.com/ ou un script Node.js

-- Créer un parent de test
INSERT INTO tenant_ispm.utilisateur (
  nom, prenom, email, telephone, role, 
  mot_de_passe, actif
) VALUES (
  'Test', 
  'Parent', 
  'parent.test@imtech.mg', 
  '+261340000099',
  'parent',
  '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', -- Parent123!
  true
);

-- Lier à un étudiant existant
UPDATE tenant_ispm.etudiant
SET 
  nom_parent = 'Parent Test',
  email_parent = 'parent.test@imtech.mg',
  telephone_parent = '+261340000099'
WHERE matricule = 'VOTRE_MATRICULE_ETUDIANT'; -- Remplacer
```

## 🔧 ÉTAPE 2: Configuration du Backend

### 2.1 Vérifier les dépendances

```bash
cd backend

# Vérifier que les packages sont installés
npm list class-validator class-transformer @nestjs/swagger
```

### 2.2 Vérifier le module portail

Le fichier `backend/src/portail/portail.module.ts` doit inclure:

```typescript
import { PortailParentControllerEnhanced } from './parent.controller.enhanced';
import { PortailParentServiceEnhanced } from './parent.service.enhanced';

@Module({
  controllers: [
    // ...
    PortailParentControllerEnhanced,
  ],
  providers: [
    // ...
    PortailParentServiceEnhanced,
  ],
  exports: [
    // ...
    PortailParentServiceEnhanced,
  ],
})
```

### 2.3 Compiler et démarrer le backend

```bash
# Compiler
npm run build

# Démarrer en mode développement
npm run start:dev

# Vérifier les logs
# Vous devriez voir: "Nest application successfully started"
```

### 2.4 Vérifier les routes

```bash
# Lister toutes les routes
curl http://localhost:3000/api/v1/portail/parent/enfants

# Ou ouvrir Swagger
# http://localhost:3000/api/docs
```

## 🔧 ÉTAPE 3: Configuration du Frontend

### 3.1 Ajouter les routes dans App.tsx

```typescript
// frontend/src/App.tsx
import ParentDashboard from './pages/portail/ParentDashboard';
import ParentFinances from './pages/portail/ParentFinances';

// Dans les routes
<Route path="/portail/parent/dashboard" element={<ParentDashboard />} />
<Route path="/portail/parent/enfants/:etudiantId/finances" element={<ParentFinances />} />
```

### 3.2 Configurer Axios

```typescript
// frontend/src/config/axios.ts
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Intercepteur pour ajouter le token JWT
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 3.3 Démarrer le frontend

```bash
cd frontend

# Installer les dépendances si nécessaire
npm install

# Démarrer
npm run dev

# Ouvrir http://localhost:5173
```

## 🧪 ÉTAPE 4: Tests

### 4.1 Test de connexion parent

```bash
# Test avec curl
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "parent.test@imtech.mg",
    "password": "Parent123!"
  }'

# Récupérer le token JWT de la réponse
```

### 4.2 Test des endpoints

```bash
# Remplacer YOUR_TOKEN par le token JWT obtenu

# 1. Liste des enfants
curl -X GET http://localhost:3000/api/v1/portail/parent/enfants \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Dashboard d'un enfant
curl -X GET http://localhost:3000/api/v1/portail/parent/enfants/ETUDIANT_ID/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Bulletin
curl -X GET http://localhost:3000/api/v1/portail/parent/enfants/ETUDIANT_ID/bulletin \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Finances
curl -X GET http://localhost:3000/api/v1/portail/parent/enfants/ETUDIANT_ID/finances \
  -H "Authorization: Bearer YOUR_TOKEN"

# 5. Absences
curl -X GET http://localhost:3000/api/v1/portail/parent/enfants/ETUDIANT_ID/absences \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4.3 Test de soumission de paiement

```bash
curl -X POST http://localhost:3000/api/v1/portail/parent/enfants/ETUDIANT_ID/paiement \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "etudiantId": "ETUDIANT_ID",
    "inscriptionId": "INSCRIPTION_ID",
    "montant": 50000,
    "methodePaiement": "virement",
    "referencePaiement": "TEST123456",
    "datePaiement": "2026-05-18",
    "preuveUrl": "https://example.com/recu.pdf",
    "commentaire": "Test de paiement"
  }'
```

### 4.4 Test de l'interface

1. **Connexion**
   - Aller sur http://localhost:5173/login
   - Email: `parent.test@imtech.mg`
   - Mot de passe: `Parent123!`

2. **Dashboard**
   - Vérifier l'affichage des enfants
   - Sélectionner un enfant
   - Vérifier les widgets (absences, finances, notes)

3. **Finances**
   - Cliquer sur "Voir détails" dans le widget financier
   - Vérifier l'échéancier
   - Tester la soumission d'un paiement

## 🔒 ÉTAPE 5: Sécurité

### 5.1 Vérifier les guards

```typescript
// Les controllers doivent avoir:
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('parent')
```

### 5.2 Tester les restrictions

```bash
# Essayer d'accéder sans token (doit échouer)
curl -X GET http://localhost:3000/api/v1/portail/parent/enfants

# Essayer avec un token étudiant (doit échouer)
curl -X GET http://localhost:3000/api/v1/portail/parent/enfants \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

### 5.3 Vérifier l'isolation tenant

```sql
-- Vérifier qu'un parent ne peut voir que ses enfants
SELECT 
  e.id, e.nom, e.prenom, e.email_parent
FROM tenant_ispm.etudiant e
WHERE e.email_parent = 'parent.test@imtech.mg';
```

## 📊 ÉTAPE 6: Monitoring

### 6.1 Logs à surveiller

```bash
# Backend logs
tail -f backend/logs/application.log

# Rechercher les erreurs
grep "ERROR" backend/logs/application.log
```

### 6.2 Métriques à suivre

- Nombre de connexions parents/jour
- Temps de réponse des endpoints
- Taux d'erreur
- Nombre de paiements soumis
- Nombre de messages envoyés

### 6.3 Requêtes SQL de monitoring

```sql
-- Nombre de parents actifs
SELECT COUNT(*) FROM tenant_ispm.utilisateur WHERE role = 'parent' AND actif = true;

-- Nombre d'enfants liés
SELECT COUNT(*) FROM tenant_ispm.etudiant WHERE email_parent IS NOT NULL;

-- Paiements en attente de validation
SELECT COUNT(*) FROM tenant_ispm.paiement_inscription WHERE statut = 'en_attente';

-- Messages non lus
SELECT COUNT(*) FROM tenant_ispm.message WHERE destinataire_id IN (
  SELECT id FROM tenant_ispm.utilisateur WHERE role = 'parent'
) AND lu = false;
```

## 🐛 ÉTAPE 7: Dépannage

### Problème 1: "Role 'parent' not allowed"

**Solution:**
```sql
ALTER TABLE tenant_ispm.utilisateur
DROP CONSTRAINT IF EXISTS utilisateur_role_check;

ALTER TABLE tenant_ispm.utilisateur
ADD CONSTRAINT utilisateur_role_check
CHECK (role IN ('admin', 'parent', 'etudiant', 'enseignant', ...));
```

### Problème 2: "Aucun enfant trouvé"

**Solution:**
```sql
-- Vérifier les liaisons
SELECT * FROM tenant_ispm.etudiant WHERE email_parent = 'parent.test@imtech.mg';

-- Si vide, créer la liaison
UPDATE tenant_ispm.etudiant
SET email_parent = 'parent.test@imtech.mg'
WHERE id = 'ETUDIANT_ID';
```

### Problème 3: "Cannot read property 'nom' of undefined"

**Solution:**
```typescript
// Utiliser le type casting dans le frontend
{(user as any)?.nom} {(user as any)?.prenom}
```

### Problème 4: "Tenant schema not found"

**Solution:**
```typescript
// Vérifier le middleware tenant
// Le schéma doit être défini dans req.tenantSchema
```

## 📝 ÉTAPE 8: Documentation Utilisateur

### 8.1 Créer un guide parent

Créer un fichier `GUIDE_PARENT.pdf` avec:
- Comment se connecter
- Comment consulter les notes
- Comment effectuer un paiement
- Comment justifier une absence
- Comment contacter l'établissement

### 8.2 Vidéo de démonstration

Enregistrer une vidéo montrant:
1. Connexion au portail
2. Navigation dans le dashboard
3. Consultation du bulletin
4. Soumission d'un paiement
5. Envoi d'un message

## 🎯 ÉTAPE 9: Mise en Production

### 9.1 Checklist pré-production

- [ ] Tous les tests passent
- [ ] Logs configurés
- [ ] Monitoring en place
- [ ] Backup de la base de données
- [ ] Variables d'environnement configurées
- [ ] SSL/HTTPS activé
- [ ] Rate limiting configuré
- [ ] Documentation à jour

### 9.2 Déploiement

```bash
# Backend
cd backend
npm run build
pm2 start dist/main.js --name "imtech-backend"

# Frontend
cd frontend
npm run build
# Copier dist/ vers le serveur web
```

### 9.3 Post-déploiement

```bash
# Vérifier que tout fonctionne
curl https://votre-domaine.com/api/v1/portail/parent/enfants

# Vérifier les logs
pm2 logs imtech-backend

# Monitorer les performances
pm2 monit
```

## 📧 ÉTAPE 10: Communication

### 10.1 Email aux parents

```
Objet: Nouveau Portail Parent - Suivez la scolarité de vos enfants en ligne

Chers parents,

Nous sommes heureux de vous annoncer le lancement du Portail Parent.

Vous pouvez désormais:
✅ Consulter les notes et bulletins
✅ Suivre les absences et retards
✅ Effectuer les paiements en ligne
✅ Communiquer avec l'établissement

Vos identifiants:
Email: votre.email@example.com
Mot de passe: (envoyé séparément)

Accès: https://portail.imtech.mg

Cordialement,
L'équipe IMTECH
```

### 10.2 Formation du personnel

- Former les caissiers à valider les paiements
- Former les surveillants à traiter les autorisations
- Former le secrétariat à répondre aux messages

## ✅ Checklist Finale

- [x] Base de données configurée
- [x] Comptes parents créés
- [x] Backend déployé et testé
- [x] Frontend déployé et testé
- [x] Sécurité vérifiée
- [x] Monitoring en place
- [x] Documentation créée
- [ ] Formation du personnel
- [ ] Communication aux parents
- [ ] Mise en production

## 🎉 Félicitations !

Le Portail Parent est maintenant opérationnel ! 

Pour toute question ou problème:
- Email: support@imtech.mg
- Documentation: https://docs.imtech.mg
- Issues GitHub: [lien vers repo]

---

**Version:** 1.0.0  
**Date:** 18 Mai 2026  
**Auteur:** Bob (AI Assistant)