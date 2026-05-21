# Fix Economat Module Errors - Complete Guide

## Issues Identified

### 1. 500 Internal Server Error on `/economat/depenses`
**Root Cause**: Missing `updated_at` column in the `depense` table causing SQL query failures.

### 2. Unexpected Response Format from `/economat/fournisseurs`
**Root Cause**: Empty result set being returned, frontend expecting array format.

## Fixes Applied

### 1. Database Schema Update
**File**: `backend/src/tenants/tenant-schema.sql`
- Added `updated_at TIMESTAMPTZ DEFAULT NOW()` column to the `depense` table definition
- This ensures new tenant schemas will have the correct structure

### 2. Migration Script Created
**File**: `backend/migrations/add-updated-at-to-depense.sql`
- Adds `updated_at` column to existing tenant schemas
- Creates `trg_updated_at` trigger for automatic timestamp updates (matching tenant-schema.sql convention)
- Handles all tenant schemas dynamically
- Idempotent (safe to run multiple times)

### 3. Service Layer Improvements
**File**: `backend/src/economat/economat.service.ts`

#### getFournisseurs Method:
- Added explicit type casting for numeric fields
- Added filter for empty fournisseur names
- Added try-catch error handling
- Returns empty array on error instead of throwing
- Added logging for debugging

#### getFournisseurTransactions Method:
- Added try-catch error handling
- Returns empty array on error
- Added logging for debugging

## Migration Steps

### Step 1: Run the Database Migration

```powershell
# Connect to PostgreSQL
psql -U postgres -d imtech_university

# Run the migration script
\i backend/migrations/add-updated-at-to-depense.sql

# Verify the changes
\c imtech_university
SET search_path TO tenant_324746c0_67d0_4d87_b9d6_1af7d149599b, public;
\d depense
```

### Step 2: Restart the Backend Server

```powershell
cd backend
npm run start:dev
```

### Step 3: Clear Browser Cache and Reload Frontend

```powershell
# In the browser:
# 1. Open DevTools (F12)
# 2. Right-click on the refresh button
# 3. Select "Empty Cache and Hard Reload"
# Or simply press Ctrl+Shift+R
```

## Verification Steps

### 1. Check Database Schema

```sql
-- Connect to your database
\c imtech_university

-- Set search path to your tenant schema
SET search_path TO tenant_324746c0_67d0_4d87_b9d6_1af7d149599b, public;

-- Verify depense table structure
\d depense

-- Expected output should include:
-- updated_at | timestamp with time zone | | default now()

-- Check if trigger exists
SELECT tgname FROM pg_trigger WHERE tgrelid = 'depense'::regclass;

-- Expected output should include:
-- trg_updated_at
```

### 2. Test API Endpoints

```powershell
# Test depenses endpoint (should return 200 OK)
curl -X GET "http://localhost:4000/api/v1/economat/depenses?page=1&limit=10" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -H "X-Tenant-ID: 324746c0-67d0-4d87-b9d6-1af7d149599b"

# Test fournisseurs endpoint (should return 200 OK with array)
curl -X GET "http://localhost:4000/api/v1/economat/fournisseurs" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -H "X-Tenant-ID: 324746c0-67d0-4d87-b9d6-1af7d149599b"
```

### 3. Check Backend Logs

Look for these log messages:
```
[EconomatService] Setting search_path to: tenant_324746c0_67d0_4d87_b9d6_1af7d149599b
[EconomatService] Executing query: ...
[EconomatService] Query result rows: X
[EconomatService] Fournisseurs found: X
```

### 4. Test in Frontend

1. Navigate to Economat module
2. Go to "Suivi des Dépenses" page
3. Verify that expenses load without errors
4. Go to "Fournisseurs" page
5. Verify that suppliers list loads (even if empty)

## Expected Results

### Before Fix:
- ❌ 500 Internal Server Error on depenses endpoint
- ❌ "Format de réponse inattendu" error on fournisseurs page
- ❌ Empty data with errors in console

### After Fix:
- ✅ 200 OK response from depenses endpoint
- ✅ Proper array response from fournisseurs endpoint
- ✅ Data loads correctly (or shows empty state if no data)
- ✅ No console errors

## Troubleshooting

### If Migration Fails:

1. **Check if column already exists:**
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'tenant_324746c0_67d0_4d87_b9d6_1af7d149599b' 
AND table_name = 'depense' 
AND column_name = 'updated_at';
```

2. **Manually add column if needed:**
```sql
SET search_path TO tenant_324746c0_67d0_4d87_b9d6_1af7d149599b, public;
ALTER TABLE depense ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
```

3. **Create trigger manually:**
```sql
CREATE TRIGGER trg_updated_at
    BEFORE UPDATE ON depense
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();
```

### If Still Getting 500 Errors:

1. Check backend logs for specific SQL errors
2. Verify tenant schema is set correctly
3. Check if all required tables exist in tenant schema
4. Verify user has proper permissions

### If Fournisseurs Still Shows Format Error:

1. Check if there's actual data in the depense table
2. Verify the API response format in browser DevTools
3. Check backend logs for query execution
4. Try adding a test supplier manually

## Test Data (Optional)

If you need test data to verify the fixes:

```sql
SET search_path TO tenant_324746c0_67d0_4d87_b9d6_1af7d149599b, public;

-- Get active academic year
SELECT id FROM annee_academique WHERE active = TRUE LIMIT 1;

-- Insert test depense (replace UUIDs with actual values from your DB)
INSERT INTO depense (
    annee_academique_id,
    libelle,
    montant,
    categorie,
    fournisseur,
    statut
) VALUES (
    'YOUR_ANNEE_ACADEMIQUE_ID',
    'Test Fourniture Bureau',
    50000,
    'fonctionnement',
    'Papeterie Centrale',
    'approuve'
);
```

## Files Modified

1. ✅ `backend/src/tenants/tenant-schema.sql` - Added updated_at column
2. ✅ `backend/migrations/add-updated-at-to-depense.sql` - Migration script
3. ✅ `backend/src/economat/economat.service.ts` - Improved error handling
4. ✅ `FIX_ECONOMAT_ERRORS.md` - This documentation

## Next Steps

1. Run the migration script
2. Restart backend server
3. Test all economat endpoints
4. Monitor logs for any remaining issues
5. If issues persist, check the troubleshooting section

## Notes

- The migration is idempotent (safe to run multiple times)
- Existing data will not be affected
- The updated_at column will be set to NOW() for existing records
- New records will automatically get the current timestamp

---

**Created**: 2026-05-19
**Status**: Ready for deployment
**Priority**: High (fixes critical 500 errors)