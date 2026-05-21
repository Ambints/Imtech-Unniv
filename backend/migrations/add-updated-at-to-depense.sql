-- Migration: Add updated_at column to depense table
-- Date: 2026-05-19
-- Description: Add missing updated_at column to depense table for all tenant schemas

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
        -- Set search path to tenant schema
        EXECUTE format('SET search_path TO %I, public', tenant_schema);
        
        -- Add updated_at column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = tenant_schema
            AND table_name = 'depense'
            AND column_name = 'updated_at'
        ) THEN
            EXECUTE format('ALTER TABLE %I.depense ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW()', tenant_schema);
            RAISE NOTICE 'Added updated_at column to %.depense', tenant_schema;
        ELSE
            RAISE NOTICE 'Column updated_at already exists in %.depense', tenant_schema;
        END IF;
        
        -- Create or replace trigger for updated_at (matching tenant-schema.sql naming convention)
        EXECUTE format('
            DROP TRIGGER IF EXISTS trg_updated_at ON %I.depense;
            CREATE TRIGGER trg_updated_at
                BEFORE UPDATE ON %I.depense
                FOR EACH ROW
                EXECUTE FUNCTION trigger_set_updated_at();
        ', tenant_schema, tenant_schema);
        
        RAISE NOTICE 'Created/updated trigger for %.depense', tenant_schema;
    END LOOP;
    
    -- Reset search path
    SET search_path TO public;
    
    RAISE NOTICE 'Migration completed successfully';
END $$;

-- Made with Bob