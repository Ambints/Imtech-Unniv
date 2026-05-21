-- Script pour corriger le nom du tenant ISPM
-- Exécutez ce script dans votre client PostgreSQL (pgAdmin, DBeaver, etc.)

-- 1. Vérifier les données actuelles
SELECT 
    id,
    schema_name,
    nom,
    adresse,
    telephone,
    email_contact
FROM public.tenant 
WHERE schema_name = 'tenant_ispm';

-- 2. Corriger le nom et les informations
UPDATE public.tenant 
SET 
    nom = 'ISPM',
    adresse = 'Antananarivo, Madagascar',  -- Modifiez selon vos besoins
    slogan = 'Institut Supérieur Polytechnique de Madagascar',  -- Modifiez selon vos besoins
    telephone = '+261 20 22 XXX XX',  -- Modifiez selon vos besoins
    email_contact = 'contact@ispm.mg'  -- Modifiez selon vos besoins
WHERE schema_name = 'tenant_ispm';

-- 3. Vérifier que la modification a été appliquée
SELECT 
    id,
    schema_name,
    nom,
    adresse,
    telephone,
    email_contact,
    slogan
FROM public.tenant 
WHERE schema_name = 'tenant_ispm';

-- Made with Bob
