# 🔄 EXÉCUTION PHASE 3 - STANDARDISATION PROFESSEUR → ENSEIGNANT

## 📋 Objectif
Remplacer toutes les occurrences de "professeur" par "enseignant" dans la base de données pour uniformiser la terminologie.

## ⚠️ IMPORTANT - À LIRE AVANT EXÉCUTION

### Impact
- **Durée** : 15 minutes par tenant
- **Downtime** : 15 minutes (pendant la migration)
- **Tables affectées** : 6 tables principales
- **Données modifiées** : Rôles, contrats, messages, commentaires

### Prérequis
✅ Phase 1 doit être terminée (contraintes diplôme + colonnes manquantes)  
✅ Backup de la base de données effectué  
✅ Application arrêtée pendant l'exécution  
✅ Aucun utilisateur connecté

## 🚀 EXÉCUTION

### Étape 1 : Arrêter l'application

```powershell
# Si vous utilisez pm2
pm2 stop imtech-backend

# Ou arrêter manuellement le serveur Node.js
```

### Étape 2 : Backup de sécurité

```powershell
# Backup complet de la base
pg_dump -U postgres -d Imtech_SaaS -F c -f "backup_avant_phase3_$(Get-Date -Format 'yyyyMMdd_HHmmss').backup"
```

### Étape 3 : Connexion à PostgreSQL

```powershell
psql -U postgres -d Imtech_SaaS
```

### Étape 4 : Exécuter pour tenant_ispm

```sql
-- ============================================================================
-- MIGRATION TENANT_ISPM
-- ============================================================================

BEGIN;

-- Backup temporaire
CREATE TEMP TABLE backup_utilisateur_roles AS
SELECT id, role, nom, prenom 
FROM tenant_ispm.utilisateur 
WHERE role = 'professeur';

CREATE TEMP TABLE backup_contrat_personnel AS
SELECT id, type_contrat, personnel_id 
FROM tenant_ispm.contrat_personnel 
WHERE type_contrat = 'professeur';

-- Statistiques avant
DO $$
DECLARE
    nb_utilisateurs INTEGER;
    nb_contrats INTEGER;
BEGIN
    SELECT COUNT(*) INTO nb_utilisateurs FROM tenant_ispm.utilisateur WHERE role = 'professeur';
    SELECT COUNT(*) INTO nb_contrats FROM tenant_ispm.contrat_personnel WHERE type_contrat = 'professeur';
    
    RAISE NOTICE '=== TENANT_ISPM - AVANT MIGRATION ===';
    RAISE NOTICE 'Utilisateurs professeur : %', nb_utilisateurs;
    RAISE NOTICE 'Contrats professeur : %', nb_contrats;
END $$;

-- Mise à jour des contraintes
ALTER TABLE tenant_ispm.utilisateur 
DROP CONSTRAINT IF EXISTS utilisateur_role_check;

ALTER TABLE tenant_ispm.utilisateur 
ADD CONSTRAINT utilisateur_role_check 
CHECK (role IN (
    'super_admin', 'admin', 'president', 'vice_president',
    'directeur_general', 'directeur_academique', 'directeur_financier',
    'directeur_rh', 'responsable_scolarite', 'responsable_pedagogique',
    'secretaire', 'enseignant', 'etudiant', 'parent',
    'comptable', 'caissier', 'bibliothecaire', 'surveillant',
    'agent_entretien', 'agent_securite', 'infirmier'
));

ALTER TABLE tenant_ispm.contrat_personnel 
DROP CONSTRAINT IF EXISTS contrat_personnel_type_contrat_check;

ALTER TABLE tenant_ispm.contrat_personnel 
ADD CONSTRAINT contrat_personnel_type_contrat_check 
CHECK (type_contrat IN (
    'cdi', 'cdd', 'stage', 'vacation', 'enseignant', 
    'administratif', 'technique', 'service'
));

-- Migration des données
UPDATE tenant_ispm.utilisateur 
SET role = 'enseignant', updated_at = CURRENT_TIMESTAMP
WHERE role = 'professeur';

UPDATE tenant_ispm.contrat_personnel 
SET type_contrat = 'enseignant', updated_at = CURRENT_TIMESTAMP
WHERE type_contrat = 'professeur';

-- Mise à jour des textes
UPDATE tenant_ispm.contrat_personnel 
SET description = REPLACE(REPLACE(description, 'professeur', 'enseignant'), 'Professeur', 'Enseignant'),
    updated_at = CURRENT_TIMESTAMP
WHERE description ILIKE '%professeur%';

UPDATE tenant_ispm.absence_enseignant 
SET motif = REPLACE(REPLACE(motif, 'professeur', 'enseignant'), 'Professeur', 'Enseignant'),
    updated_at = CURRENT_TIMESTAMP
WHERE motif ILIKE '%professeur%';

UPDATE tenant_ispm.message_enseignant 
SET contenu = REPLACE(REPLACE(contenu, 'professeur', 'enseignant'), 'Professeur', 'Enseignant'),
    updated_at = CURRENT_TIMESTAMP
WHERE contenu ILIKE '%professeur%';

UPDATE tenant_ispm.note 
SET commentaire = REPLACE(REPLACE(commentaire, 'professeur', 'enseignant'), 'Professeur', 'Enseignant'),
    updated_at = CURRENT_TIMESTAMP
WHERE commentaire ILIKE '%professeur%';

UPDATE tenant_ispm.seance 
SET observations = REPLACE(REPLACE(observations, 'professeur', 'enseignant'), 'Professeur', 'Enseignant'),
    updated_at = CURRENT_TIMESTAMP
WHERE observations ILIKE '%professeur%';

-- Recréer les index
DROP INDEX IF EXISTS tenant_ispm.idx_utilisateur_role;
CREATE INDEX idx_utilisateur_role ON tenant_ispm.utilisateur(role) 
WHERE role IN ('enseignant', 'etudiant', 'admin');

DROP INDEX IF EXISTS tenant_ispm.idx_contrat_type;
CREATE INDEX idx_contrat_type ON tenant_ispm.contrat_personnel(type_contrat);

CREATE INDEX IF NOT EXISTS idx_utilisateur_enseignant_actif 
ON tenant_ispm.utilisateur(id, nom, prenom) 
WHERE role = 'enseignant' AND actif = TRUE;

-- Recréer les vues
DROP VIEW IF EXISTS tenant_ispm.liste_professeurs CASCADE;
DROP VIEW IF EXISTS tenant_ispm.liste_enseignants CASCADE;

CREATE OR REPLACE VIEW tenant_ispm.liste_enseignants AS
SELECT 
    u.id, u.nom, u.prenom, u.email, u.telephone, u.actif,
    COUNT(DISTINCT s.id) as nb_seances,
    COUNT(DISTINCT c.id) as nb_cours
FROM tenant_ispm.utilisateur u
LEFT JOIN tenant_ispm.seance s ON s.enseignant_id = u.id
LEFT JOIN tenant_ispm.cours c ON c.enseignant_id = u.id
WHERE u.role = 'enseignant'
GROUP BY u.id, u.nom, u.prenom, u.email, u.telephone, u.actif;

-- Analyser
ANALYZE tenant_ispm.utilisateur;
ANALYZE tenant_ispm.contrat_personnel;

-- Vérification finale
DO $$
DECLARE
    nb_professeurs INTEGER;
    nb_enseignants INTEGER;
BEGIN
    SELECT COUNT(*) INTO nb_professeurs FROM tenant_ispm.utilisateur WHERE role = 'professeur';
    SELECT COUNT(*) INTO nb_enseignants FROM tenant_ispm.utilisateur WHERE role = 'enseignant';
    
    RAISE NOTICE '=== TENANT_ISPM - APRÈS MIGRATION ===';
    RAISE NOTICE 'Utilisateurs professeur (doit être 0) : %', nb_professeurs;
    RAISE NOTICE 'Utilisateurs enseignant : %', nb_enseignants;
    
    IF nb_professeurs > 0 THEN
        RAISE EXCEPTION 'Migration incomplète pour tenant_ispm';
    END IF;
    
    RAISE NOTICE '✓ TENANT_ISPM : Migration réussie';
END $$;

COMMIT;
```

### Étape 5 : Exécuter pour tenant_universite_d_antsiranana

```sql
-- ============================================================================
-- MIGRATION TENANT_UNIVERSITE_D_ANTSIRANANA
-- ============================================================================

BEGIN;

-- Backup temporaire
CREATE TEMP TABLE backup_utilisateur_roles_uda AS
SELECT id, role, nom, prenom 
FROM tenant_universite_d_antsiranana.utilisateur 
WHERE role = 'professeur';

CREATE TEMP TABLE backup_contrat_personnel_uda AS
SELECT id, type_contrat, personnel_id 
FROM tenant_universite_d_antsiranana.contrat_personnel 
WHERE type_contrat = 'professeur';

-- Statistiques avant
DO $$
DECLARE
    nb_utilisateurs INTEGER;
    nb_contrats INTEGER;
BEGIN
    SELECT COUNT(*) INTO nb_utilisateurs FROM tenant_universite_d_antsiranana.utilisateur WHERE role = 'professeur';
    SELECT COUNT(*) INTO nb_contrats FROM tenant_universite_d_antsiranana.contrat_personnel WHERE type_contrat = 'professeur';
    
    RAISE NOTICE '=== TENANT_UNIVERSITE_D_ANTSIRANANA - AVANT MIGRATION ===';
    RAISE NOTICE 'Utilisateurs professeur : %', nb_utilisateurs;
    RAISE NOTICE 'Contrats professeur : %', nb_contrats;
END $$;

-- Mise à jour des contraintes
ALTER TABLE tenant_universite_d_antsiranana.utilisateur 
DROP CONSTRAINT IF EXISTS utilisateur_role_check;

ALTER TABLE tenant_universite_d_antsiranana.utilisateur 
ADD CONSTRAINT utilisateur_role_check 
CHECK (role IN (
    'super_admin', 'admin', 'president', 'vice_president',
    'directeur_general', 'directeur_academique', 'directeur_financier',
    'directeur_rh', 'responsable_scolarite', 'responsable_pedagogique',
    'secretaire', 'enseignant', 'etudiant', 'parent',
    'comptable', 'caissier', 'bibliothecaire', 'surveillant',
    'agent_entretien', 'agent_securite', 'infirmier'
));

ALTER TABLE tenant_universite_d_antsiranana.contrat_personnel 
DROP CONSTRAINT IF EXISTS contrat_personnel_type_contrat_check;

ALTER TABLE tenant_universite_d_antsiranana.contrat_personnel 
ADD CONSTRAINT contrat_personnel_type_contrat_check 
CHECK (type_contrat IN (
    'cdi', 'cdd', 'stage', 'vacation', 'enseignant', 
    'administratif', 'technique', 'service'
));

-- Migration des données
UPDATE tenant_universite_d_antsiranana.utilisateur 
SET role = 'enseignant', updated_at = CURRENT_TIMESTAMP
WHERE role = 'professeur';

UPDATE tenant_universite_d_antsiranana.contrat_personnel 
SET type_contrat = 'enseignant', updated_at = CURRENT_TIMESTAMP
WHERE type_contrat = 'professeur';

-- Mise à jour des textes
UPDATE tenant_universite_d_antsiranana.contrat_personnel 
SET description = REPLACE(REPLACE(description, 'professeur', 'enseignant'), 'Professeur', 'Enseignant'),
    updated_at = CURRENT_TIMESTAMP
WHERE description ILIKE '%professeur%';

UPDATE tenant_universite_d_antsiranana.absence_enseignant 
SET motif = REPLACE(REPLACE(motif, 'professeur', 'enseignant'), 'Professeur', 'Enseignant'),
    updated_at = CURRENT_TIMESTAMP
WHERE motif ILIKE '%professeur%';

UPDATE tenant_universite_d_antsiranana.message_enseignant 
SET contenu = REPLACE(REPLACE(contenu, 'professeur', 'enseignant'), 'Professeur', 'Enseignant'),
    updated_at = CURRENT_TIMESTAMP
WHERE contenu ILIKE '%professeur%';

UPDATE tenant_universite_d_antsiranana.note 
SET commentaire = REPLACE(REPLACE(commentaire, 'professeur', 'enseignant'), 'Professeur', 'Enseignant'),
    updated_at = CURRENT_TIMESTAMP
WHERE commentaire ILIKE '%professeur%';

UPDATE tenant_universite_d_antsiranana.seance 
SET observations = REPLACE(REPLACE(observations, 'professeur', 'enseignant'), 'Professeur', 'Enseignant'),
    updated_at = CURRENT_TIMESTAMP
WHERE observations ILIKE '%professeur%';

-- Recréer les index
DROP INDEX IF EXISTS tenant_universite_d_antsiranana.idx_utilisateur_role;
CREATE INDEX idx_utilisateur_role ON tenant_universite_d_antsiranana.utilisateur(role) 
WHERE role IN ('enseignant', 'etudiant', 'admin');

DROP INDEX IF EXISTS tenant_universite_d_antsiranana.idx_contrat_type;
CREATE INDEX idx_contrat_type ON tenant_universite_d_antsiranana.contrat_personnel(type_contrat);

CREATE INDEX IF NOT EXISTS idx_utilisateur_enseignant_actif 
ON tenant_universite_d_antsiranana.utilisateur(id, nom, prenom) 
WHERE role = 'enseignant' AND actif = TRUE;

-- Recréer les vues
DROP VIEW IF EXISTS tenant_universite_d_antsiranana.liste_professeurs CASCADE;
DROP VIEW IF EXISTS tenant_universite_d_antsiranana.liste_enseignants CASCADE;

CREATE OR REPLACE VIEW tenant_universite_d_antsiranana.liste_enseignants AS
SELECT 
    u.id, u.nom, u.prenom, u.email, u.telephone, u.actif,
    COUNT(DISTINCT s.id) as nb_seances,
    COUNT(DISTINCT c.id) as nb_cours
FROM tenant_universite_d_antsiranana.utilisateur u
LEFT JOIN tenant_universite_d_antsiranana.seance s ON s.enseignant_id = u.id
LEFT JOIN tenant_universite_d_antsiranana.cours c ON c.enseignant_id = u.id
WHERE u.role = 'enseignant'
GROUP BY u.id, u.nom, u.prenom, u.email, u.telephone, u.actif;

-- Analyser
ANALYZE tenant_universite_d_antsiranana.utilisateur;
ANALYZE tenant_universite_d_antsiranana.contrat_personnel;

-- Vérification finale
DO $$
DECLARE
    nb_professeurs INTEGER;
    nb_enseignants INTEGER;
BEGIN
    SELECT COUNT(*) INTO nb_professeurs FROM tenant_universite_d_antsiranana.utilisateur WHERE role = 'professeur';
    SELECT COUNT(*) INTO nb_enseignants FROM tenant_universite_d_antsiranana.utilisateur WHERE role = 'enseignant';
    
    RAISE NOTICE '=== TENANT_UNIVERSITE_D_ANTSIRANANA - APRÈS MIGRATION ===';
    RAISE NOTICE 'Utilisateurs professeur (doit être 0) : %', nb_professeurs;
    RAISE NOTICE 'Utilisateurs enseignant : %', nb_enseignants;
    
    IF nb_professeurs > 0 THEN
        RAISE EXCEPTION 'Migration incomplète pour tenant_universite_d_antsiranana';
    END IF;
    
    RAISE NOTICE '✓ TENANT_UNIVERSITE_D_ANTSIRANANA : Migration réussie';
END $$;

COMMIT;
```

### Étape 6 : Vérification globale

```sql
-- Vérifier qu'il ne reste aucun "professeur" dans toute la base
SELECT 
    schemaname,
    tablename,
    'role' as column_name,
    COUNT(*) as occurrences
FROM pg_tables pt
JOIN pg_namespace pn ON pt.schemaname = pn.nspname
CROSS JOIN LATERAL (
    SELECT COUNT(*) as cnt
    FROM information_schema.columns c
    WHERE c.table_schema = pt.schemaname
    AND c.table_name = pt.tablename
    AND c.column_name = 'role'
) col
WHERE pt.schemaname LIKE 'tenant_%'
AND col.cnt > 0
GROUP BY schemaname, tablename

UNION ALL

SELECT 
    schemaname,
    tablename,
    'type_contrat' as column_name,
    COUNT(*) as occurrences
FROM pg_tables pt
JOIN pg_namespace pn ON pt.schemaname = pn.nspname
CROSS JOIN LATERAL (
    SELECT COUNT(*) as cnt
    FROM information_schema.columns c
    WHERE c.table_schema = pt.schemaname
    AND c.table_name = pt.tablename
    AND c.column_name = 'type_contrat'
) col
WHERE pt.schemaname LIKE 'tenant_%'
AND col.cnt > 0
GROUP BY schemaname, tablename;

-- Afficher résumé final
SELECT '✓✓✓ PHASE 3 TERMINÉE AVEC SUCCÈS ✓✓✓' as resultat;
```

### Étape 7 : Redémarrer l'application

```powershell
# Quitter psql
\q

# Redémarrer l'application
pm2 restart imtech-backend

# Ou démarrer manuellement
```

## ✅ Résultat Attendu

Après exécution :
- ✓ Tous les rôles "professeur" → "enseignant"
- ✓ Tous les types de contrat "professeur" → "enseignant"
- ✓ Tous les textes contenant "professeur" mis à jour
- ✓ Contraintes CHECK mises à jour
- ✓ Index recréés et optimisés
- ✓ Vues recréées avec nouvelle terminologie
- ✓ 0 occurrence de "professeur" dans la base

## 🔄 En cas de problème

### Rollback
Si la migration échoue, restaurer le backup :

```powershell
pg_restore -U postgres -d Imtech_SaaS -c backup_avant_phase3_*.backup
```

### Vérifier les logs
```sql
SELECT * FROM public.audit_log 
WHERE action = 'MIGRATION' 
ORDER BY created_at DESC 
LIMIT 10;
```

## 📊 Statistiques

- **Tables modifiées** : 6 (utilisateur, contrat_personnel, absence_enseignant, message_enseignant, note, seance)
- **Contraintes mises à jour** : 2 (role, type_contrat)
- **Index recréés** : 3 par tenant
- **Vues recréées** : 1 par tenant
- **Durée totale** : ~15 minutes par tenant

---

**⚠️ IMPORTANT** : Ne pas exécuter cette phase tant que Phase 1 n'est pas terminée et validée.