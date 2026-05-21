-- Migration: Add updated_at column to depense table in all tenant schemas
-- This script adds the missing updated_at column and trigger to the depense table

DO $$
DECLARE
    tenant_schema TEXT;
BEGIN
    -- Loop through all tenant schemas
    FOR tenant_schema IN 
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name LIKE 'tenant_%'
    LOOP
        -- Add updated_at column if it doesn't exist
        EXECUTE format('
            ALTER TABLE %I.depense 
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()
        ', tenant_schema);
        
        -- Create or replace the trigger for updated_at
        EXECUTE format('
            DROP TRIGGER IF EXISTS trg_depense_updated_at ON %I.depense;
            CREATE TRIGGER trg_depense_updated_at 
            BEFORE UPDATE ON %I.depense
            FOR EACH ROW 
            EXECUTE FUNCTION %I.trigger_set_updated_at()
        ', tenant_schema, tenant_schema, tenant_schema);
        
        RAISE NOTICE 'Updated depense table in schema: %', tenant_schema;
    END LOOP;
END $$;

-- Made with Bob
