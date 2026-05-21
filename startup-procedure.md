# Procédure de Démarrage - IMTECH University

## 🚀 Démarrage Rapide

### Prérequis
- **Node.js**: v18+ recommandé
- **PostgreSQL**: v14+ avec base de données créée
- **Git**: Pour le versionnement

### 1. Configuration de l'Environnement

```bash
# Backend
cd backend
cp .env.example .env
# Configurer DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

# Frontend  
cd frontend
cp .env.example .env
# Configurer VITE_API_URL
```

### 2. Installation des Dépendances

```bash
# Backend
npm install

# Frontend
npm install
```

### 3. Initialisation de la Base de Données

```bash
# Créer la base de données
createdb imtech_university

# Exécuter les migrations
cd backend
npm run migration:run

# Insérer les données initiales
npm run seed:run
```

### 4. Démarrage des Services

```bash
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend
cd frontend  
npm run dev
```

## 📋 Procédure Complète

### Étape 1: Préparation de l'Environnement

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd imtech-university
   ```

2. **Configuration PostgreSQL**
   ```sql
   -- Créer l'utilisateur et la base
   CREATE USER imtech_user WITH PASSWORD 'votre_mot_de_passe';
   CREATE DATABASE imtech_university;
   GRANT ALL PRIVILEGES ON DATABASE imtech_university TO imtech_user;
   ```

3. **Configuration des variables d'environnement**
   ```bash
   # Backend/.env
   NODE_ENV=development
   PORT=4000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=imtech_user
   DB_PASSWORD=votre_mot_de_passe
   DB_NAME=imtech_university
   JWT_SECRET=votre_secret_jwt
   
   # Frontend/.env
   VITE_API_URL=http://localhost:4000/api/v1
   ```

### Étape 2: Installation et Build

1. **Installation des dépendances backend**
   ```bash
   cd backend
   npm install
   ```

2. **Build backend**
   ```bash
   npm run build
   ```

3. **Installation des dépendances frontend**
   ```bash
   cd frontend
   npm install
   ```

4. **Build frontend**
   ```bash
   npm run build
   ```

### Étape 3: Initialisation Base de Données

1. **Création des tables**
   ```bash
   cd backend
   npm run migration:run
   ```

2. **Insertion données initiales**
   ```bash
   npm run seed:run
   ```

### Étape 4: Démarrage des Applications

1. **Démarrer le backend**
   ```bash
   cd backend
   npm run start:prod
   ```

2. **Démarrer le frontend**
   ```bash
   cd frontend
   npm run preview
   ```

## 🔧 Scripts NPM Disponibles

### Backend
```json
{
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main",
    "build": "nest build",
    "migration:run": "typeorm migration:run",
    "migration:generate": "typeorm migration:generate",
    "migration:revert": "typeorm migration:revert",
    "seed:run": "ts-node src/database/seeds/run-seeds.ts"
  }
}
```

### Frontend
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

## 🌐 Accès à l'Application

### Développement
- **Backend**: http://localhost:4000
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:4000/api/docs

### Production
- **Backend**: http://localhost:4000
- **Frontend**: http://localhost:4173
- **API Docs**: http://localhost:4000/api/docs

## 🗄️ Gestion des Tenants (Multi-Universités)

### Créer une Nouvelle Université
```bash
# Via l'interface d'administration
curl -X POST http://localhost:4000/api/v1/tenants \
  -H "Authorization: Bearer <token_jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Université Test",
    "slug": "universite-test",
    "emailContact": "contact@universite-test.edu",
    "telephone": "+261123456789",
    "typeEtablissement": "universite_privee"
  }'
```

### Vérifier les Tenants Existant
```bash
curl -X GET http://localhost:4000/api/v1/tenants \
  -H "Authorization: Bearer <token_jwt>"
```

## 🔍 Vérification du Fonctionnement

### Tests de Santé
```bash
# Backend
curl http://localhost:4000/api/health

# Frontend
curl http://localhost:3000
```

### Logs et Monitoring
- **Logs backend**: `logs/backend.log`
- **Logs frontend**: Console navigateur
- **Monitoring**: `http://localhost:4000/api/metrics`

## 🚨 Dépannage Commun

### Problèmes Connexions
1. **Vérifier PostgreSQL**: `pg_isready`
2. **Vérifier ports**: `netstat -tulpn | grep :4000`
3. **Vérifier firewall**: Autoriser ports 4000 et 3000

### Problèmes Base de Données
1. **Permissions**: Vérifier utilisateur PostgreSQL
2. **Espace disque**: `df -h`
3. **Memory**: `free -h`

### Problèmes Multi-Tenant
1. **Schéma non créé**: Vérifier logs backend pour erreurs
2. **Permissions**: Vérifier que l'utilisateur a les droits nécessaires
3. **Configuration**: Vérifier `DEFAULT_TENANT_SCHEMA` n'est pas configuré

## 📚 Documentation Complémentaire

- **Guide Développeur**: `docs/developer-guide.md`
- **Guide Utilisateur**: `docs/user-manual.md`
- **Guide Admin**: `docs/admin-manual.md`
- **API Reference**: `http://localhost:4000/api/docs`

## 🔄 Mise à Jour

### Migrations
```bash
# Générer nouvelle migration
npm run migration:generate -- -n "NomMigration"

# Appliquer migration
npm run migration:run
```

### Sauvegarde
```bash
# Sauvegarde base complète
pg_dump imtech_university > backup_$(date +%Y%m%d_%H%M%S).sql

# Restauration
psql imtech_university < backup_file.sql
```

## 🔐 Sécurité

### En Production
1. **Variables d'environnement**: Utiliser `.env.production`
2. **HTTPS**: Configurer certificats SSL
3. **Firewall**: Restreindre l'accès aux IPs nécessaires
4. **Monitoring**: Configurer alertes et surveillance
5. **Backups**: Automatiser les sauvegardes quotidiennes

### En Développement
1. **Mots de passe**: Utiliser des mots de passe forts
2. **JWT**: Clés secrètes robustes
3. **CORS**: Configurer correctement pour le frontend
4. **Validation**: Activer toutes les validations

## 🎯 Support et Maintenance

### Support Technique
- **Logs**: Fournir les logs pertinents
- **Versions**: Node.js, PostgreSQL, NestJS, React
- **Environnement**: Développement/Production
- **Reproduction**: Étapes pour reproduire le problème

### Maintenance Planifiée
- **Notifications**: Prévenir les utilisateurs 24h à l'avance
- **Sauvegardes**: Effectuer avant maintenance
- **Mode Maintenance**: Activer la page de maintenance
- **Vérification**: Valider après maintenance
