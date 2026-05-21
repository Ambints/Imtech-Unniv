# 🚀 DÉMARRAGE RAPIDE - DÉPLOIEMENT ALIGNEMENT

## ⚠️ Problème: psql n'est pas dans le PATH

Vous avez deux options:

---

## 📌 OPTION 1: Ajouter PostgreSQL au PATH (RECOMMANDÉ)

### Étape 1: Trouver l'installation PostgreSQL

```powershell
# Chercher PostgreSQL
Get-ChildItem "C:\Program Files\PostgreSQL" -Recurse -Filter "psql.exe" | Select-Object FullName
```

Résultat typique: `C:\Program Files\PostgreSQL\16\bin\psql.exe`

### Étape 2: Ajouter au PATH temporairement

```powershell
# Remplacer XX par votre version (14, 15, 16, etc.)
$env:Path += ";C:\Program Files\PostgreSQL\16\bin"

# Vérifier
psql --version
```

### Étape 3: Exécuter le déploiement

```powershell
.\backend\scripts\deploy-alignment.ps1 -TenantName "tenant_ispm"
```

---

## 📌 OPTION 2: Utiliser le chemin complet de psql

### Créer un script simplifié

Créez un fichier `deploy-direct.ps1`:

```powershell
# Chemin vers psql (AJUSTER SELON VOTRE INSTALLATION)
$psqlPath = "C:\Program Files\PostgreSQL\16\bin\psql.exe"

# Paramètres
$dbHost = "localhost"
$dbPort = "5432"
$dbName = "imtech_saas"
$dbUser = "postgres"

Write-Host "Deploiement sur tenant_ispm..." -ForegroundColor Cyan

# Demander le mot de passe
$securePassword = Read-Host "Mot de passe PostgreSQL" -AsSecureString
$env:PGPASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))

# Charger le script
Write-Host "Chargement du script SQL..." -ForegroundColor Yellow
& $psqlPath -h $dbHost -p $dbPort -U $dbUser -d $dbName -f "backend\scripts\migration-align-tenant-schema.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Script charge" -ForegroundColor Green
    
    # Appliquer sur tenant_ispm
    Write-Host "Application sur tenant_ispm..." -ForegroundColor Yellow
    $query = "SELECT apply_tenant_schema_alignment('tenant_ispm');"
    & $psqlPath -h $dbHost -p $dbPort -U $dbUser -d $dbName -c $query
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Deploiement reussi!" -ForegroundColor Green
    } else {
        Write-Host "[ERREUR] Echec de l'application" -ForegroundColor Red
    }
} else {
    Write-Host "[ERREUR] Echec du chargement" -ForegroundColor Red
}

# Nettoyer
$env:PGPASSWORD = $null
```

### Exécuter:

```powershell
.\deploy-direct.ps1
```

---

## 📌 OPTION 3: Utiliser pgAdmin ou DBeaver (Interface Graphique)

### Avec pgAdmin:

1. Ouvrir pgAdmin
2. Se connecter à la base `imtech_saas`
3. Ouvrir Query Tool (Outils > Query Tool)
4. Ouvrir le fichier: `backend/scripts/migration-align-tenant-schema.sql`
5. Exécuter (F5)
6. Puis exécuter:
   ```sql
   SELECT apply_tenant_schema_alignment('tenant_ispm');
   ```

### Avec DBeaver:

1. Ouvrir DBeaver
2. Se connecter à `imtech_saas`
3. Nouvelle requête SQL
4. Copier le contenu de `migration-align-tenant-schema.sql`
5. Exécuter
6. Puis exécuter:
   ```sql
   SELECT apply_tenant_schema_alignment('tenant_ispm');
   ```

---

## 📌 OPTION 4: Ligne de commande directe

Si vous connaissez le chemin de psql:

```powershell
# Remplacer le chemin selon votre installation
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -h localhost -U postgres -d imtech_saas

# Dans psql, exécuter:
\i 'E:/Folder/L2/Alt/IMTECH UNIVERSITY/imtech-university/backend/scripts/migration-align-tenant-schema.sql'

# Puis:
SELECT apply_tenant_schema_alignment('tenant_ispm');
```

---

## ✅ Vérification après déploiement

```sql
-- Vérifier les nouvelles tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'tenant_ispm' 
AND table_name IN (
    'archive_scolarite', 'attestation', 'deliberation', 
    'resultat_ue', 'resultat_semestre', 'verrouillage_notes',
    'suplement_diplome', 'transfert_etudiant', 'paiement_inscription'
)
ORDER BY table_name;

-- Doit retourner 9 tables
```

---

## 🆘 Besoin d'aide?

Si aucune option ne fonctionne, envoyez-moi:
1. Le résultat de: `Get-ChildItem "C:\Program Files\PostgreSQL" -Recurse -Filter "psql.exe"`
2. Votre version de PostgreSQL
3. Le message d'erreur complet

---

**Recommandation**: Utilisez l'OPTION 1 (ajouter au PATH) pour une solution permanente.