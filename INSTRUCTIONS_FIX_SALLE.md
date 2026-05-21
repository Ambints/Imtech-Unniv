# Instructions pour Corriger l'Erreur 500 - Table Salle Manquante

## Problème
La table `salle` est définie dans `tenant-schema.sql` mais n'existe pas dans votre tenant `tenant_324746c0_67d0_4d87_b9d6_1af7d149599b`.

## Solution Rapide

### Option 1: Utiliser le Script Node.js (Recommandé)

Ouvrez un terminal et exécutez:

```bash
node backend/scripts/apply-salle-table-migration.js
```

### Option 2: Utiliser PostgreSQL Directement

```bash
psql -U postgres -d Imtech_SaaS -f backend/migrations/add-salle-table-to-tenant.sql
```

### Option 3: Utiliser pgAdmin ou un Client PostgreSQL

1. Ouvrez pgAdmin ou votre client PostgreSQL
2. Connectez-vous à la base de données `Imtech_SaaS`
3. Ouvrez le fichier `backend/migrations/add-salle-table-to-tenant.sql`
4. Exécutez le script SQL

## Que Fait le Script?

Le script va:
1. ✅ Créer la table `salle` dans votre tenant
2. ✅ Ajouter des index pour la performance
3. ✅ Insérer 4 salles d'exemple:
   - Salle A101 (30 places)
   - Salle A102 (30 places)
   - Amphithéâtre 1 (150 places)
   - Labo Informatique (25 places)

## Après l'Exécution

1. **Redémarrez le serveur backend** (si nécessaire)
2. **Testez l'endpoint**: 
   - Allez sur votre application
   - L'erreur 500 sur `/salles` devrait être résolue
   - Vous devriez voir les 4 salles créées

## Vérification

Pour vérifier que tout fonctionne:

```bash
node backend/scripts/check-salle-table.js
```

Vous devriez voir:
```
✅ Connected to database
📋 Salle table exists: YES
📊 Number of salles: 4
```

## En Cas de Problème

Si vous rencontrez des erreurs:
1. Vérifiez que PostgreSQL est démarré
2. Vérifiez les identifiants dans `.env`:
   - DB_USER=postgres
   - DB_PASSWORD=2007
   - DB_NAME=Imtech_SaaS
3. Vérifiez que le tenant existe dans la base de données

## Note Importante

Ce problème peut affecter d'autres tenants. Si vous avez plusieurs tenants, vous devrez peut-être appliquer cette migration à chacun d'eux.