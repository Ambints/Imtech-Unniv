# Guide de Désactivation Automatique des Années Académiques

## Vue d'ensemble

Ce système désactive automatiquement les années académiques dont la date de fin est dépassée. Il existe deux méthodes d'implémentation :

1. **Automatique via l'API** - Vérifie à chaque chargement de la liste
2. **Script SQL périodique** - Exécution planifiée via cron/scheduler

---

## Méthode 1 : Désactivation Automatique via l'API

### Fonctionnement

La méthode `desactiverAnneesExpirees()` est appelée automatiquement dans `getAnneesAcademiques()` du service backend.

**Fichier:** `backend/src/academic/academic.service.ts`

```typescript
async desactiverAnneesExpirees(tid: string) {
  await this.tenantConnection.setTenantSchema(tid);
  const aujourdhui = new Date();
  
  // Désactiver toutes les années dont la date de fin est dépassée
  await this.anneeRepo
    .createQueryBuilder()
    .update()
    .set({ active: false })
    .where('date_fin < :aujourdhui', { aujourdhui })
    .andWhere('active = :active', { active: true })
    .execute();
}
```

### Avantages
- ✅ Automatique, pas de configuration supplémentaire
- ✅ Fonctionne à chaque accès à la page des années académiques
- ✅ Spécifique à chaque tenant

### Inconvénients
- ⚠️ Nécessite qu'un utilisateur accède à la page
- ⚠️ Peut avoir un léger délai si personne n'accède à la page

---

## Méthode 2 : Script SQL Périodique

### Fichier Script

**Fichier:** `backend/scripts/desactiver-annees-expirees.sql`

### Exécution Manuelle

```bash
# PostgreSQL
psql -U postgres -d imtech_saas -f backend/scripts/desactiver-annees-expirees.sql

# Avec mot de passe
PGPASSWORD=votre_mot_de_passe psql -U postgres -d imtech_saas -f backend/scripts/desactiver-annees-expirees.sql
```

### Automatisation avec Cron (Linux/Mac)

1. **Ouvrir l'éditeur cron:**
```bash
crontab -e
```

2. **Ajouter une tâche (exemple: tous les jours à 2h du matin):**
```bash
0 2 * * * PGPASSWORD=votre_mot_de_passe psql -U postgres -d imtech_saas -f /chemin/complet/backend/scripts/desactiver-annees-expirees.sql >> /var/log/annees-academiques.log 2>&1
```

3. **Autres exemples de planification:**
```bash
# Toutes les heures
0 * * * * [commande]

# Tous les jours à minuit
0 0 * * * [commande]

# Tous les lundis à 3h
0 3 * * 1 [commande]

# Le 1er de chaque mois à 4h
0 4 1 * * [commande]
```

### Automatisation avec Task Scheduler (Windows)

1. **Ouvrir le Planificateur de tâches**
   - Rechercher "Task Scheduler" dans le menu Démarrer

2. **Créer une nouvelle tâche**
   - Actions → Créer une tâche de base
   - Nom: "Désactivation Années Académiques"

3. **Configurer le déclencheur**
   - Quotidien à 2h00

4. **Configurer l'action**
   - Programme: `C:\Program Files\PostgreSQL\15\bin\psql.exe`
   - Arguments: `-U postgres -d imtech_saas -f "C:\chemin\backend\scripts\desactiver-annees-expirees.sql"`
   - Variables d'environnement: `PGPASSWORD=votre_mot_de_passe`

### Automatisation avec Node.js (Alternative)

Créer un fichier `backend/scripts/cron-desactivation-annees.js`:

```javascript
const cron = require('node-cron');
const { exec } = require('child_process');

// Exécuter tous les jours à 2h du matin
cron.schedule('0 2 * * *', () => {
  console.log('Désactivation des années académiques expirées...');
  
  exec(
    'psql -U postgres -d imtech_saas -f backend/scripts/desactiver-annees-expirees.sql',
    { env: { ...process.env, PGPASSWORD: 'votre_mot_de_passe' } },
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Erreur: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return;
      }
      console.log(`Résultat: ${stdout}`);
    }
  );
});

console.log('Cron job de désactivation des années académiques démarré');
```

Installer la dépendance:
```bash
npm install node-cron
```

Exécuter:
```bash
node backend/scripts/cron-desactivation-annees.js
```

---

## Rapport du Script

Le script SQL génère un rapport détaillé:

```
=============================================================================
Début de la désactivation des années académiques expirées...
Date actuelle: 2026-05-19

Traitement du tenant: IMTECH UNIVERSITY (schema: tenant_test)
  ✓ 1 année(s) académique(s) désactivée(s)

=============================================================================
Résumé: 1 année(s) académique(s) désactivée(s) au total
=============================================================================

=============================================================================
RAPPORT DES ANNÉES ACADÉMIQUES PAR TENANT
=============================================================================

Tenant: IMTECH UNIVERSITY
-----------------------------------------------------------------------------
  2026-2027 | 2026-09-07 à 2027-07-10 | Actif: false | Statut: Expirée
  2025-2026 | 2025-09-01 à 2026-07-31 | Actif: false | Statut: Expirée
  2024-2025 | 2024-09-01 à 2025-07-31 | Actif: true | Statut: En cours

=============================================================================
```

---

## Vérification Manuelle

### Via SQL
```sql
-- Voir toutes les années académiques d'un tenant
SELECT 
    libelle,
    date_debut,
    date_fin,
    active,
    CASE 
        WHEN date_fin < CURRENT_DATE THEN 'Expirée'
        WHEN date_debut > CURRENT_DATE THEN 'Future'
        ELSE 'En cours'
    END as statut
FROM tenant_test.annee_academique
ORDER BY date_debut DESC;
```

### Via l'interface Admin
1. Accéder à **Administration → Académique → Années Académiques**
2. Vérifier que les années expirées sont marquées comme inactives (bouton rouge)

---

## Recommandations

1. **Utiliser les deux méthodes** pour une couverture maximale
2. **Planifier le script SQL** pour s'exécuter quotidiennement
3. **Surveiller les logs** pour détecter les problèmes
4. **Tester régulièrement** le système de désactivation

---

## Dépannage

### Le script ne s'exécute pas
- Vérifier les permissions du fichier SQL
- Vérifier les credentials PostgreSQL
- Vérifier les logs cron: `grep CRON /var/log/syslog`

### Les années ne se désactivent pas
- Vérifier que `date_fin` est bien définie dans la BD
- Vérifier le fuseau horaire du serveur
- Exécuter manuellement le script pour voir les erreurs

### Erreur de connexion PostgreSQL
- Vérifier que PostgreSQL est démarré
- Vérifier les credentials dans `.env`
- Vérifier que le fichier `pg_hba.conf` autorise la connexion

---

## Support

Pour toute question ou problème, consulter:
- Documentation PostgreSQL: https://www.postgresql.org/docs/
- Documentation Cron: `man crontab`
- Logs système: `/var/log/syslog` (Linux) ou Event Viewer (Windows)