-- Check all columns in depense table for tenant_test schema

SET search_path TO tenant_test, public;

\echo '========================================='
\echo 'DEPENSE TABLE COLUMNS'
\echo '========================================='

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'tenant_test'
AND table_name = 'depense'
ORDER BY ordinal_position;

\echo ''
\echo '========================================='
\echo 'CHECK FOR SPECIFIC COLUMNS'
\echo '========================================='

\echo 'created_at exists:'
SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'tenant_test'
    AND table_name = 'depense'
    AND column_name = 'created_at'
) as created_at_exists;

\echo 'updated_at exists:'
SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'tenant_test'
    AND table_name = 'depense'
    AND column_name = 'updated_at'
) as updated_at_exists;

-- Made with Bob