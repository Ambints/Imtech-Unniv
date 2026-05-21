-- Vérifier les données du tenant ISPM
SELECT 
    id,
    schema_name,
    nom,
    adresse,
    telephone,
    email_contact,
    logo_url,
    slogan
FROM public.tenant 
WHERE schema_name = 'tenant_ispm';

-- Si le résultat montre "Université d'Antsiranana", exécutez cette correction:
-- UPDATE public.tenant 
-- SET nom = 'ISPM',
--     adresse = 'Votre adresse ISPM',
--     slogan = 'Votre slogan ISPM'
-- WHERE schema_name = 'tenant_ispm';

-- Made with Bob
