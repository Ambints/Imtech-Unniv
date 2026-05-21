-- Simple migration to add updated_at column to depense table
-- Run this for your specific tenant schema

-- Replace 'tenant_324746c0_67d0_4d87_b9d6_1af7d149599b' with your actual tenant schema name
SET search_path TO tenant_324746c0_67d0_4d87_b9d6_1af7d149599b, public;

-- Check if column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'tenant_324746c0_67d0_4d87_b9d6_1af7d149599b'
        AND table_name = 'depense' 
        AND column_name = 'updated_at'
    ) THEN
        -- Add the column
        ALTER TABLE depense ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Column updated_at added successfully';
    ELSE
        RAISE NOTICE 'Column updated_at already exists';
    END IF;
END $$;

-- Create or replace the trigger
DROP TRIGGER IF EXISTS trg_updated_at ON depense;
CREATE TRIGGER trg_updated_at
    BEFORE UPDATE ON depense
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- Verify the changes
\d depense

-- Show triggers
SELECT tgname FROM pg_trigger WHERE tgrelid = 'depense'::regclass;

-- Made with Bob