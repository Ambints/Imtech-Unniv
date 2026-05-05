-- Fix token_reset column size in all tenant schemas
-- JWT tokens are longer than 255 characters, need TEXT type

-- First, get all tenant schemas
DO $$
DECLARE
    tenant_schema TEXT;
BEGIN
    FOR tenant_schema IN 
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name LIKE 'tenant_%' OR schema_name LIKE 'univ_%'
    LOOP
        -- Alter token_reset column to TEXT
        EXECUTE format('ALTER TABLE %I.utilisateur ALTER COLUMN token_reset TYPE TEXT', tenant_schema);
        RAISE NOTICE 'Updated token_reset column in schema: %', tenant_schema;
    END LOOP;
END $$;

-- Verify the changes
SELECT 
    table_schema,
    table_name,
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'utilisateur' 
  AND column_name = 'token_reset'
  AND (table_schema LIKE 'tenant_%' OR table_schema LIKE 'univ_%')
ORDER BY table_schema;

-- Made with Bob
