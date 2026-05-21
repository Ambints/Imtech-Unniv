# 🚀 EXÉCUTION IMMÉDIATE PHASE 1

## ⚡ SOLUTION RAPIDE - Contraintes Diplôme + Colonnes Manquantes

### Option 1 : Exécution Manuelle (RECOMMANDÉ)

#### Étape 1 : Ouvrir psql

```powershell
# Ouvrir PowerShell en tant qu'administrateur
# Puis se connecter à PostgreSQL
psql -U postgres -d Imtech_SaaS
```

#### Étape 2 : Exécuter pour tenant_ispm

```sql
-- Copier-coller ce bloc complet dans psql

-- ============================================================================
-- CORRECTION TENANT_ISPM
-- ============================================================================

-- 1. Harmoniser contrainte statut diplôme
ALTER TABLE tenant_ispm.diplome 
DROP CONSTRAINT IF EXISTS diplome_statut_check;

ALTER TABLE tenant_ispm.diplome 
ADD CONSTRAINT diplome_statut_check 
CHECK (statut IN (
    'en_attente', 'pret_signature', 'signe', 
    'delivre', 'retire', 'annule', 'remplace'
));

-- 2. Ajouter colonnes signature président
ALTER TABLE tenant_ispm.diplome
ADD COLUMN IF NOT EXISTS signe_president BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS date_signature_president TIMESTAMP,
ADD COLUMN IF NOT EXISTS signature_hash VARCHAR(128),
ADD COLUMN IF NOT EXISTS mention_speciale TEXT;

CREATE INDEX IF NOT EXISTS idx_diplome_signe_president 
ON tenant_ispm.diplome(signe_president) 
WHERE signe_president = FALSE;

-- 3. Ajouter colonnes contrat_personnel
ALTER TABLE tenant_ispm.contrat_personnel 
ADD COLUMN IF NOT EXISTS statut_validation VARCHAR(30) DEFAULT 'en_attente',
ADD COLUMN IF NOT EXISTS valide_par UUID REFERENCES tenant_ispm.utilisateur(id),
ADD COLUMN IF NOT EXISTS valide_le TIMESTAMP,
ADD COLUMN IF NOT EXISTS commentaire_president TEXT,
ADD COLUMN IF NOT EXISTS conditions_speciales TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'contrat_personnel_statut_validation_check'
        AND connamespace = 'tenant_ispm'::regnamespace
    ) THEN
        ALTER TABLE tenant_ispm.contrat_personnel 
        ADD CONSTRAINT contrat_personnel_statut_validation_check 
        CHECK (statut_validation IN ('en_attente', 'en_attente_president', 
                                     'valide_president', 'rejete_president'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_contrat_statut_validation 
ON tenant_ispm.contrat_personnel(statut_validation);

-- 4. Ajouter colonnes depense
ALTER TABLE tenant_ispm.depense
ADD COLUMN IF NOT EXISTS necessite_validation_president BOOLEAN 
    GENERATED ALWAYS AS (montant >= 1000000) STORED;

ALTER TABLE tenant_ispm.depense
ADD COLUMN IF NOT EXISTS commentaire_validation TEXT;

CREATE INDEX IF NOT EXISTS idx_depense_validation_president 
ON tenant_ispm.depense(necessite_validation_president) 
WHERE necessite_validation_president = TRUE;

-- 5. Ajouter colonnes calendrier_academique
ALTER TABLE tenant_ispm.calendrier_academique
ADD COLUMN IF NOT EXISTS statut VARCHAR(30) DEFAULT 'en_attente_validation',
ADD COLUMN IF NOT EXISTS valide_par UUID REFERENCES tenant_ispm.utilisateur(id),
ADD COLUMN IF NOT EXISTS date_validation TIMESTAMP,
ADD COLUMN IF NOT EXISTS commentaire_validation TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'calendrier_academique_statut_check'
        AND connamespace = 'tenant_ispm'::regnamespace
    ) THEN
        ALTER TABLE tenant_ispm.calendrier_academique 
        ADD CONSTRAINT calendrier_academique_statut_check 
        CHECK (statut IN ('en_attente_validation', 'valide', 'modifie', 'annule'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_calendrier_statut 
ON tenant_ispm.calendrier_academique(statut);

-- 6. Ajouter colonnes parcours
ALTER TABLE tenant_ispm.parcours
ADD COLUMN IF NOT EXISTS date_ouverture DATE,
ADD COLUMN IF NOT EXISTS date_fermeture DATE,
ADD COLUMN IF NOT EXISTS motif_fermeture TEXT,
ADD COLUMN IF NOT EXISTS ferme_par UUID REFERENCES tenant_ispm.utilisateur(id);

-- 7. Créer index prioritaires
CREATE INDEX IF NOT EXISTS idx_paiement_date_mode 
ON tenant_ispm.paiement(date_paiement DESC, mode_paiement) 
WHERE statut = 'valide';

CREATE INDEX IF NOT EXISTS idx_presence_date_statut 
ON tenant_ispm.presence(date_seance, statut) 
INCLUDE (etudiant_id);

CREATE INDEX IF NOT EXISTS idx_note_session_etudiant 
ON tenant_ispm.note(session_id, etudiant_id) 
INCLUDE (valeur, verrouille);

-- 8. Analyser les tables
ANALYZE tenant_ispm.diplome;
ANALYZE tenant_ispm.contrat_personnel;
ANALYZE tenant_ispm.depense;
ANALYZE tenant_ispm.calendrier_academique;
ANALYZE tenant_ispm.parcours;
ANALYZE tenant_ispm.paiement;
ANALYZE tenant_ispm.presence;
ANALYZE tenant_ispm.note;

-- Afficher résultat
SELECT '✓ TENANT_ISPM : Corrections appliquées avec succès' as resultat;
```

#### Étape 3 : Exécuter pour tenant_universite_d_antsiranana

```sql
-- Copier-coller ce bloc complet dans psql

-- ============================================================================
-- CORRECTION TENANT_UNIVERSITE_D_ANTSIRANANA
-- ============================================================================

-- 1. Harmoniser contrainte statut diplôme
ALTER TABLE tenant_universite_d_antsiranana.diplome 
DROP CONSTRAINT IF EXISTS diplome_statut_check;

ALTER TABLE tenant_universite_d_antsiranana.diplome 
ADD CONSTRAINT diplome_statut_check 
CHECK (statut IN (
    'en_attente', 'pret_signature', 'signe', 
    'delivre', 'retire', 'annule', 'remplace'
));

-- 2. Ajouter colonnes signature président
ALTER TABLE tenant_universite_d_antsiranana.diplome
ADD COLUMN IF NOT EXISTS signe_president BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS date_signature_president TIMESTAMP,
ADD COLUMN IF NOT EXISTS signature_hash VARCHAR(128),
ADD COLUMN IF NOT EXISTS mention_speciale TEXT;

CREATE INDEX IF NOT EXISTS idx_diplome_signe_president 
ON tenant_universite_d_antsiranana.diplome(signe_president) 
WHERE signe_president = FALSE;

-- 3. Ajouter colonnes contrat_personnel
ALTER TABLE tenant_universite_d_antsiranana.contrat_personnel 
ADD COLUMN IF NOT EXISTS statut_validation VARCHAR(30) DEFAULT 'en_attente',
ADD COLUMN IF NOT EXISTS valide_par UUID REFERENCES tenant_universite_d_antsiranana.utilisateur(id),
ADD COLUMN IF NOT EXISTS valide_le TIMESTAMP,
ADD COLUMN IF NOT EXISTS commentaire_president TEXT,
ADD COLUMN IF NOT EXISTS conditions_speciales TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'contrat_personnel_statut_validation_check'
        AND connamespace = 'tenant_universite_d_antsiranana'::regnamespace
    ) THEN
        ALTER TABLE tenant_universite_d_antsiranana.contrat_personnel 
        ADD CONSTRAINT contrat_personnel_statut_validation_check 
        CHECK (statut_validation IN ('en_attente', 'en_attente_president', 
                                     'valide_president', 'rejete_president'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_contrat_statut_validation 
ON tenant_universite_d_antsiranana.contrat_personnel(statut_validation);

-- 4. Ajouter colonnes depense
ALTER TABLE tenant_universite_d_antsiranana.depense
ADD COLUMN IF NOT EXISTS necessite_validation_president BOOLEAN 
    GENERATED ALWAYS AS (montant >= 1000000) STORED;

ALTER TABLE tenant_universite_d_antsiranana.depense
ADD COLUMN IF NOT EXISTS commentaire_validation TEXT;

CREATE INDEX IF NOT EXISTS idx_depense_validation_president 
ON tenant_universite_d_antsiranana.depense(necessite_validation_president) 
WHERE necessite_validation_president = TRUE;

-- 5. Ajouter colonnes calendrier_academique
ALTER TABLE tenant_universite_d_antsiranana.calendrier_academique
ADD COLUMN IF NOT EXISTS statut VARCHAR(30) DEFAULT 'en_attente_validation',
ADD COLUMN IF NOT EXISTS valide_par UUID REFERENCES tenant_universite_d_antsiranana.utilisateur(id),
ADD COLUMN IF NOT EXISTS date_validation TIMESTAMP,
ADD COLUMN IF NOT EXISTS commentaire_validation TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'calendrier_academique_statut_check'
        AND connamespace = 'tenant_universite_d_antsiranana'::regnamespace
    ) THEN
        ALTER TABLE tenant_universite_d_antsiranana.calendrier_academique 
        ADD CONSTRAINT calendrier_academique_statut_check 
        CHECK (statut IN ('en_attente_validation', 'valide', 'modifie', 'annule'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_calendrier_statut 
ON tenant_universite_d_antsiranana.calendrier_academique(statut);

-- 6. Ajouter colonnes parcours
ALTER TABLE tenant_universite_d_antsiranana.parcours
ADD COLUMN IF NOT EXISTS date_ouverture DATE,
ADD COLUMN IF NOT EXISTS date_fermeture DATE,
ADD COLUMN IF NOT EXISTS motif_fermeture TEXT,
ADD COLUMN IF NOT EXISTS ferme_par UUID REFERENCES tenant_universite_d_antsiranana.utilisateur(id);

-- 7. Créer index prioritaires
CREATE INDEX IF NOT EXISTS idx_paiement_date_mode 
ON tenant_universite_d_antsiranana.paiement(date_paiement DESC, mode_paiement) 
WHERE statut = 'valide';

CREATE INDEX IF NOT EXISTS idx_presence_date_statut 
ON tenant_universite_d_antsiranana.presence(date_seance, statut) 
INCLUDE (etudiant_id);

CREATE INDEX IF NOT EXISTS idx_note_session_etudiant 
ON tenant_universite_d_antsiranana.note(session_id, etudiant_id) 
INCLUDE (valeur, verrouille);

-- 8. Analyser les tables
ANALYZE tenant_universite_d_antsiranana.diplome;
ANALYZE tenant_universite_d_antsiranana.contrat_personnel;
ANALYZE tenant_universite_d_antsiranana.depense;
ANALYZE tenant_universite_d_antsiranana.calendrier_academique;
ANALYZE tenant_universite_d_antsiranana.parcours;
ANALYZE tenant_universite_d_antsiranana.paiement;
ANALYZE tenant_universite_d_antsiranana.presence;
ANALYZE tenant_universite_d_antsiranana.note;

-- Afficher résultat
SELECT '✓ TENANT_UNIVERSITE_D_ANTSIRANANA : Corrections appliquées avec succès' as resultat;
```

#### Étape 4 : Vérification

```sql
-- Vérifier que tout est OK
SELECT 
    'diplome' as table_name,
    COUNT(*) as nb_tenants_corriges
FROM information_schema.columns
WHERE table_schema LIKE 'tenant_%'
AND table_name = 'diplome'
AND column_name = 'signe_president'

UNION ALL

SELECT 
    'contrat_personnel' as table_name,
    COUNT(*) as nb_tenants_corriges
FROM information_schema.columns
WHERE table_schema LIKE 'tenant_%'
AND table_name = 'contrat_personnel'
AND column_name = 'statut_validation'

UNION ALL

SELECT 
    'depense' as table_name,
    COUNT(*) as nb_tenants_corriges
FROM information_schema.columns
WHERE table_schema LIKE 'tenant_%'
AND table_name = 'depense'
AND column_name = 'necessite_validation_president';

-- Résultat attendu : 2 pour chaque table (2 tenants)
```

### Option 2 : Script PowerShell

Créer un fichier `execute-phase1.ps1` :

```powershell
# Exécuter Phase 1 pour tous les tenants
$env:PGPASSWORD = "your_password"

Write-Host "=== PHASE 1 : Corrections Critiques ===" -ForegroundColor Cyan

# Tenant ISPM
Write-Host "`nTraitement tenant_ispm..." -ForegroundColor Yellow
Get-Content "phase1-fix-critical-issues.sql" | 
    ForEach-Object { $_ -replace '{schema}', 'tenant_ispm' } | 
    psql -U postgres -d Imtech_SaaS

# Tenant Université d'Antsiranana
Write-Host "`nTraitement tenant_universite_d_antsiranana..." -ForegroundColor Yellow
Get-Content "phase1-fix-critical-issues.sql" | 
    ForEach-Object { $_ -replace '{schema}', 'tenant_universite_d_antsiranana' } | 
    psql -U postgres -d Imtech_SaaS

Write-Host "`n✓ Phase 1 terminée" -ForegroundColor Green
```

Puis exécuter :

```powershell
cd backend/scripts
.\execute-phase1.ps1
```

## ✅ Résultat Attendu

Après exécution, vous devriez voir :
- ✓ Contrainte diplome_statut_check mise à jour (7 statuts)
- ✓ 4 colonnes ajoutées à diplome
- ✓ 5 colonnes ajoutées à contrat_personnel
- ✓ 2 colonnes ajoutées à depense
- ✓ 4 colonnes ajoutées à calendrier_academique
- ✓ 4 colonnes ajoutées à parcours
- ✓ 3 index prioritaires créés

## 🔄 Redémarrer l'Application

```powershell
# Si vous utilisez pm2
pm2 restart imtech-backend

# Ou redémarrer manuellement
```

## 🎯 Test Rapide

```sql
-- Tester que le module président fonctionne
SELECT 
    id, 
    numero_diplome, 
    statut, 
    signe_president 
FROM tenant_ispm.diplome 
LIMIT 5;

-- Doit afficher les nouvelles colonnes sans erreur
```

---

**Durée totale** : 5-10 minutes  
**Impact** : Résout les 2 problèmes critiques immédiatement