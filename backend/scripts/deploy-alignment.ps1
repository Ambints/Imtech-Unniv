# =============================================================================
# Script PowerShell - Deploiement Alignement Schema Tenant
# =============================================================================
# Ce script applique les modifications d'alignement sur les schemas tenants
# =============================================================================

param(
    [string]$DbHost = "localhost",
    [string]$DbPort = "5432",
    [string]$DbName = "imtech_saas",
    [string]$DbUser = "postgres",
    [string]$TenantName = "",
    [switch]$AllTenants = $false,
    [switch]$DryRun = $false
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEPLOIEMENT ALIGNEMENT SCHEMA TENANT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verifier que psql est disponible
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "[ERREUR] psql n'est pas trouve dans le PATH" -ForegroundColor Red
    Write-Host "Veuillez installer PostgreSQL ou ajouter psql au PATH" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] psql trouve: $($psqlPath.Source)" -ForegroundColor Green
Write-Host ""

# Parametres de connexion
$securePassword = Read-Host "Mot de passe PostgreSQL" -AsSecureString
$env:PGPASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))

Write-Host "Parametres de connexion:" -ForegroundColor Cyan
Write-Host "  Host: $DbHost" -ForegroundColor Gray
Write-Host "  Port: $DbPort" -ForegroundColor Gray
Write-Host "  Database: $DbName" -ForegroundColor Gray
Write-Host "  User: $DbUser" -ForegroundColor Gray
Write-Host ""

# Tester la connexion
Write-Host "Test de connexion..." -ForegroundColor Yellow
$testQuery = "SELECT version();"
$testResult = psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -t -c $testQuery 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERREUR] Impossible de se connecter a PostgreSQL" -ForegroundColor Red
    Write-Host $testResult -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Connexion reussie" -ForegroundColor Green
Write-Host ""

# Chemin du script SQL
$scriptPath = Join-Path $PSScriptRoot "migration-align-tenant-schema.sql"

if (-not (Test-Path $scriptPath)) {
    Write-Host "[ERREUR] Script SQL introuvable: $scriptPath" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Script SQL trouve: $scriptPath" -ForegroundColor Green
Write-Host ""

# Mode Dry Run
if ($DryRun) {
    Write-Host "[INFO] MODE DRY RUN - Aucune modification ne sera appliquee" -ForegroundColor Yellow
    Write-Host ""
}

# Charger le script SQL
Write-Host "Chargement du script SQL..." -ForegroundColor Yellow
$loadResult = psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -f $scriptPath 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERREUR] Erreur lors du chargement du script" -ForegroundColor Red
    Write-Host $loadResult -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Script charge avec succes" -ForegroundColor Green
Write-Host ""

# Appliquer les modifications
if ($AllTenants) {
    Write-Host "Application sur TOUS les tenants..." -ForegroundColor Cyan
    Write-Host ""
    
    if (-not $DryRun) {
        $query = "SELECT * FROM apply_alignment_to_all_tenants();"
        $result = psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -c $query
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Alignement applique sur tous les tenants" -ForegroundColor Green
            Write-Host $result
        } else {
            Write-Host "[ERREUR] Erreur lors de l'application" -ForegroundColor Red
            Write-Host $result -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "Mode Dry Run - Commande qui serait executee:" -ForegroundColor Yellow
        Write-Host "SELECT * FROM apply_alignment_to_all_tenants();" -ForegroundColor Gray
    }
    
} elseif ($TenantName) {
    Write-Host "Application sur le tenant: $TenantName" -ForegroundColor Cyan
    Write-Host ""
    
    if (-not $DryRun) {
        $query = "SELECT apply_tenant_schema_alignment('$TenantName');"
        $result = psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -c $query
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Alignement applique sur $TenantName" -ForegroundColor Green
            Write-Host $result
        } else {
            Write-Host "[ERREUR] Erreur lors de l'application" -ForegroundColor Red
            Write-Host $result -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "Mode Dry Run - Commande qui serait executee:" -ForegroundColor Yellow
        Write-Host "SELECT apply_tenant_schema_alignment('$TenantName');" -ForegroundColor Gray
    }
    
} else {
    Write-Host "[INFO] Aucun tenant specifie" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Utilisation:" -ForegroundColor Cyan
    Write-Host "  # Appliquer sur un tenant specifique:" -ForegroundColor Gray
    Write-Host "  .\deploy-alignment.ps1 -TenantName 'tenant_ispm'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  # Appliquer sur tous les tenants:" -ForegroundColor Gray
    Write-Host "  .\deploy-alignment.ps1 -AllTenants" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  # Mode test (dry run):" -ForegroundColor Gray
    Write-Host "  .\deploy-alignment.ps1 -TenantName 'tenant_ispm' -DryRun" -ForegroundColor Gray
    Write-Host ""
    
    # Lister les tenants disponibles
    Write-Host "Tenants disponibles:" -ForegroundColor Cyan
    $listQuery = "SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'tenant_%' ORDER BY schema_name;"
    $tenants = psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -t -c $listQuery
    
    if ($LASTEXITCODE -eq 0) {
        $tenants | ForEach-Object {
            $tenant = $_.Trim()
            if ($tenant) {
                Write-Host "  - $tenant" -ForegroundColor Gray
            }
        }
    }
    
    exit 0
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[OK] DEPLOIEMENT TERMINE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

# Nettoyer le mot de passe
$env:PGPASSWORD = $null

# Made with Bob
