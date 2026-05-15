# Structure du Projet IMTECH University

## Architecture Générale

```
imtech-university/
├── backend/                    # API NestJS
│   ├── src/
│   │   ├── app.module.ts      # Module principal avec configuration multi-tenant
│   │   ├── auth/              # Authentification et gestion des rôles
│   │   ├── tenants/           # Gestion multi-tenant
│   │   ├── users/             # Gestion des utilisateurs
│   │   ├── gouvernance/       # Module Gouvernance (NOUVEAU)
│   │   ├── surveillance/       # Module Surveillance (NOUVEAU)
│   │   ├── entretien/         # Module Entretien/Ménage (NOUVEAU)
│   │   ├── admin/             # Module Administration
│   │   ├── rh/               # Module Ressources Humaines
│   │   ├── finance/           # Module Financier
│   │   ├── economat/          # Module Économat
│   │   ├── caissier/          # Module Caissier
│   │   ├── academic/          # Module Académique
│   │   ├── scolarite/        # Module Scolarité
│   │   ├── communication/     # Module Communication
│   │   ├── logistics/         # Module Logistique
│   │   ├── discipline/         # Module Discipline
│   │   ├── examens/           # Module Examens
│   │   ├── documents/         # Module Documents
│   │   ├── pedagogique/       # Module Pédagogique
│   │   ├── portail/           # Module Portail
│   │   ├── dashboard/          # Module Tableaux de bord
│   │   └── common/            # Utilitaires communs
│   ├── test/                # Tests unitaires et d'intégration
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                 # Variables d'environnement
│
├── frontend/                   # Application React
│   ├── public/
│   ├── src/
│   │   ├── components/       # Composants réutilisables
│   │   ├── pages/            # Pages principales
│   │   │   ├── super-admin/   # Administration système
│   │   │   ├── admin/          # Administration tenant
│   │   │   ├── president/      # Espace président
│   │   │   ├── surveillant/    # Espace surveillant
│   │   │   ├── etudiant/      # Portail étudiant
│   │   │   ├── parent/         # Portail parent
│   │   │   └── professeur/    # Portail professeur
│   │   ├── hooks/            # Hooks React
│   │   ├── services/         # Services API
│   │   ├── store/            # État global (Zustand)
│   │   ├── utils/            # Utilitaires
│   │   └── styles/           # Styles globaux
│   ├── package.json
│   └── .env                 # Variables d'environnement frontend
│
└── database/                    # Scripts et migrations SQL
    ├── migrations/            # Migrations PostgreSQL
    ├── seeds/                # Données initiales
    └── schema.sql             # Schéma de base
```

## Modules Backend Détaillés

### 🏛️ **Gouvernance** (NOUVEAU)
- **Entités**: President, DecisionPresidentielle, ValidationRecrutement, Arbitrage, ConseilUniversitaire
- **Fonctionnalités**: Dashboard président, décisions, validations, arbitrages, conseils
- **Rôles**: president, super_admin

### 👥 **Surveillance** (NOUVEAU)  
- **Entités**: SurveillantGeneral, AppelNumerique, IncidentDisciplinaire, OrganisationExamen, RapportSurveillance
- **Fonctionnalités**: Appels numériques, incidents, organisation examens, rapports
- **Rôles**: surveillant_general, super_admin

### 🔧 **Entretien/Ménage** (NOUVEAU)
- **Entités**: ResponsableLogistique, ServiceEntretien, PlanningNettoyage, StockProduitsMenage, MaintenancePreventive, RapportEntretien
- **Fonctionnalités**: Gestion services, plannings, stocks, maintenances, rapports
- **Rôles**: responsable_logistique, super_admin

### 📊 **Modules Existant**
- **Admin**: Administration système complète
- **RH**: Gestion personnel avec contrats et paie
- **Finance**: Gestion financière complète
- **Caissier**: Encaissements et reçus
- **Academic**: Module académique
- **Scolarité**: Inscriptions et notes
- **Communication**: Annonces et notifications
- **Logistics**: Gestion logistique
- **Discipline**: Incidents et sanctions
- **Examens**: Gestion examens
- **Documents**: Attestations et diplômes
- **Economat**: Achats et budget
- **Pedagogique**: Module pédagogique
- **Portail**: Portails utilisateurs

## Architecture Multi-Tenant

### 🏗️ **Structure Base de Données**
```
public/                    # Schéma public
├── tenant                 # Table des universités
├── super_admins           # Administrateurs système
├── plans                  # Plans d'abonnement
└── [autres tables système]

tenant_[slug]/              # Schéma par université
├── utilisateurs            # Tables utilisateur
├── parcours               # Parcours académiques
├── inscriptions           # Inscriptions
├── notes                  # Notes et évaluations
├── paiements              # Paiements
├── budget                 # Budget
├── depenses               # Dépenses
├── annonces               # Annonces
├── notifications          # Notifications
├── incidents              # Incidents
├── maintenances           # Maintenances
├── stocks                 # Stocks
└── [autres tables spécifiques]
```

## Configuration Technique

### 🔧 **Backend (NestJS)**
- **Framework**: NestJS avec TypeScript
- **Base de données**: PostgreSQL multi-tenant
- **Authentification**: JWT avec rôles
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Tests**: Jest

### ⚛️ **Frontend (React)**
- **Framework**: React 18 avec TypeScript
- **Routing**: React Router v6
- **État**: Zustand
- **UI**: TailwindCSS + HeadlessUI
- **HTTP Client**: Axios
- **Tests**: React Testing Library

### 🗄️ **Base de Données**
- **SGBD**: PostgreSQL
- **Migration**: TypeORM
- **Multi-tenant**: Schémas séparés par université
- **Connexions**: 2 (public + tenant)

## Déploiement

### 🚀 **Environnement de Développement**
```bash
# Backend
cd backend
npm install
npm run start:dev

# Frontend  
cd frontend
npm install
npm run dev
```

### 🌍 **Environnement de Production**
```bash
# Build
npm run build

# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend  
npm run build
npm run preview
```

## Scripts de Base de Données

### 📊 **Migrations**
- **Location**: `database/migrations/`
- **Format**: SQL avec numérotation
- **Exemple**: `001_create_base_tables.sql`

### 🌱 **Seeds**
- **Location**: `database/seeds/`
- **Contenu**: Données initiales par défaut
- **Exemples**: `super_admins.sql`, `default_settings.sql`

## Sécurité

### 🔐 **Gestion des Rôles**
- **super_admin**: Accès système complet
- **admin**: Administration tenant complète
- **president**: Gouvernance université
- **responsable_logistique**: Gestion services logistiques
- **surveillant_general**: Surveillance et discipline
- **enseignant**: Gestion pédagogique
- **etudiant**: Portail étudiant
- **parent**: Portail parent
- **professeur**: Portail professeur

### 🛡️ **Authentification**
- **Tokens**: JWT avec expiration
- **Refresh**: Tokens de rafraîchissement
- **Permissions**: Vérification par rôle et tenant
- **Audit**: Logs des actions sensibles

## API REST

### 📡 **Structure des Endpoints**
```
/api/v1/
├── auth/                 # Authentification
├── tenants/              # Gestion multi-tenant  
├── gouvernance/         # Module Gouvernance (NOUVEAU)
├── surveillance/          # Module Surveillance (NOUVEAU)
├── entretien/            # Module Entretien (NOUVEAU)
├── admin/                # Administration
├── rh/                   # Ressources Humaines
├── finance/              # Financier
├── economat/             # Économat
├── caissier/             # Caissier
├── academic/             # Académique
├── scolarite/           # Scolarité
├── communication/        # Communication
├── logistics/           # Logistique
├── discipline/           # Discipline
├── examens/              # Examens
├── documents/            # Documents
├── pedagogique/         # Pédagogique
├── portail/              # Portails
└── dashboard/           # Tableaux de bord
```

### 📋 **Format des Réponses**
```json
{
  "success": true,
  "data": [...],
  "message": "Opération réussie",
  "statusCode": 200
}
```

## Monitoring et Logs

### 📊 **Types de Logs**
- **Application**: Logs métier et erreurs
- **Sécurité**: Tentatives d'accès et actions sensibles
- **Performance**: Temps de réponse et requêtes lentes
- **Audit**: Modifications de données importantes

### 📈 **Métriques**
- **Disponibilité**: Uptime et monitoring de service
- **Performance**: Temps de réponse par endpoint
- **Erreurs**: Taux d'erreur par module
- **Utilisation**: Nombre d'utilisateurs actifs par tenant

## Documentation

### 📚 **Documentation Technique**
- **API**: Swagger/OpenAPI disponible sur `/api/docs`
- **Architecture**: Diagrammes et spécifications
- **Déploiement**: Guides d'installation et configuration
- **Développement**: Standards de codage et conventions

### 🎓 **Formation**
- **Guides**: Documentation pour les nouveaux développeurs
- **Exemples**: Cas d'usage et bonnes pratiques
- **Support**: Procédures de dépannage et FAQ
