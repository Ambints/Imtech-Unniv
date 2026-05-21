-- ================================================================
-- FIX: Attestation type_attestation CHECK constraint
-- Date: 2026-05-18
-- Description: Ensure the CHECK constraint allows the correct values
-- ================================================================

-- Function to fix the constraint in a tenant schema
CREATE OR REPLACE FUNCTION fix_attestation_type_constraint(schema_name TEXT)
RETURNS VOID AS $$
BEGIN
  -- Drop existing constraint if it exists
  EXECUTE format('
    ALTER TABLE %I.attestation 
    DROP CONSTRAINT IF EXISTS attestation_type_check;
  ', schema_name);
  
  EXECUTE format('
    ALTER TABLE %I.attestation 
    DROP CONSTRAINT IF EXISTS chk_attestation_type;
  ', schema_name);
  
  -- Add the correct constraint
  EXECUTE format('
    ALTER TABLE %I.attestation
    ADD CONSTRAINT chk_attestation_type CHECK (type_attestation IN (
      ''inscription'', ''scolarite'', ''reussite''
    ));
  ', schema_name);
  
  RAISE NOTICE 'Constraint fixed for schema %', schema_name;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tenant schemas
DO $$
DECLARE
  tenant_record RECORD;
BEGIN
  FOR tenant_record IN 
    SELECT schema_name 
    FROM information_schema.schemata 
    WHERE schema_name LIKE 'tenant_%'
  LOOP
    PERFORM fix_attestation_type_constraint(tenant_record.schema_name);
  END LOOP;
  
  RAISE NOTICE 'All tenant schemas updated';
END $$;

-- Clean up
DROP FUNCTION IF EXISTS fix_attestation_type_constraint(TEXT);

-- Verify the constraint
SELECT 
  n.nspname AS schema_name,
  c.conname AS constraint_name,
  pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
JOIN pg_class cl ON cl.oid = c.conrelid
WHERE cl.relname = 'attestation'
  AND n.nspname LIKE 'tenant_%'
  AND c.contype = 'c'
ORDER BY n.nspname;

-- Made with Bob