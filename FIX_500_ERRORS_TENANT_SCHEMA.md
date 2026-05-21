# Fix: 500 Internal Server Errors - Missing Salle Table

## Problem Description

The application was experiencing 500 Internal Server Error responses on the following endpoints:
- `/api/v1/academic/{tenantId}/salles` - Failed to load salles (rooms)
- `/pedagogique/{tenantId}/affectations` - Failed to load teacher assignments  
- `/secretaire/{tenantId}/emploi-du-temps` - Failed to load schedules

## Root Causes Identified

### 1. Missing Tenant Schema Setup (FIXED)
The `getSalles()` method in `backend/src/academic/academic.service.ts` was missing the critical `await this.tenantConnection.setTenantSchema(tid)` call before querying the database.

### 2. Missing Salle Table in Tenant Schema (CRITICAL)
**Investigation revealed that the `salle` table does not exist in the tenant schema `tenant_324746c0_67d0_4d87_b9d6_1af7d149599b`.**

This is the actual cause of the 500 error - even with proper schema setup, the query fails because the table is missing.

## Solutions Applied

### Solution 1: Added Tenant Schema Setup ✅

Updated 4 methods in `backend/src/academic/academic.service.ts`:

```typescript
// Before (WRONG)
getSalles(tid: string) { return this.salleRepo.find(); }

// After (CORRECT)
async getSalles(tid: string) {
  await this.tenantConnection.setTenantSchema(tid);
  return this.salleRepo.find();
}
```

### Solution 2: Create Missing Salle Table ⚠️ REQUIRED

Created migration files to add the missing `salle` table:

**Files Created:**
1. `backend/migrations/add-salle-table-to-tenant.sql` - SQL migration script
2. `backend/scripts/apply-salle-table-migration.js` - Node.js script to apply migration

**To Apply the Fix:**

```bash
# Option 1: Run the Node.js script
node backend/scripts/apply-salle-table-migration.js

# Option 2: Run SQL directly in PostgreSQL
psql -U postgres -d Imtech_SaaS -f backend/migrations/add-salle-table-to-tenant.sql
```

## Table Structure

The `salle` table will be created with the following structure:

```sql
CREATE TABLE IF NOT EXISTS salle (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    batiment_id     UUID        REFERENCES batiment(id) ON DELETE SET NULL,
    nom             VARCHAR(100) NOT NULL,
    code            VARCHAR(20) UNIQUE,
    capacite        SMALLINT    NOT NULL,
    type_salle      VARCHAR(30) NOT NULL DEFAULT 'cours'
                    CHECK (type_salle IN ('cours', 'amphitheatre', 'laboratoire', 'salle_info', 'salle_reunion', 'bibliotheque')),
    equipements     JSONB       DEFAULT '{}',
    disponible      BOOLEAN     DEFAULT TRUE,
    etage           SMALLINT    DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

The migration also includes sample data:
- Salle A101 (30 places, cours)
- Salle A102 (30 places, cours)
- Amphithéâtre 1 (150 places, amphitheatre)
- Labo Informatique (25 places, laboratoire)

## Verification Steps

After applying the migration:

1. **Check table exists:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'tenant_324746c0_67d0_4d87_b9d6_1af7d149599b' 
AND table_name = 'salle';
```

2. **Verify data:**
```sql
SET search_path TO tenant_324746c0_67d0_4d87_b9d6_1af7d149599b;
SELECT * FROM salle;
```

3. **Test the API endpoint:**
```bash
curl http://localhost:4000/api/v1/academic/324746c0-67d0-4d87-b9d6-1af7d149599b/salles
```

## Impact

- **Fixed**: Tenant schema setup in academic service methods
- **Required**: Database migration to create missing `salle` table
- **No Breaking Changes**: All methods maintain the same signature and return types

## Related Files Modified

1. `backend/src/academic/academic.service.ts` - Added tenant schema setup
2. `backend/migrations/add-salle-table-to-tenant.sql` - Migration script
3. `backend/scripts/apply-salle-table-migration.js` - Migration runner
4. `backend/scripts/check-salle-table.js` - Diagnostic script

## Status

✅ **Code Fixed** - Tenant schema setup added to all methods
⚠️ **Migration Required** - Must run migration script to create `salle` table

## Next Steps

1. **CRITICAL**: Run the migration script to create the `salle` table
2. Restart the backend server
3. Test the `/salles` endpoint
4. Verify other endpoints work correctly

## Date

2026-05-20

---

**Note**: The same issue may exist for other tenants. Consider running a script to check all tenant schemas and apply the migration to all that are missing the `salle` table.