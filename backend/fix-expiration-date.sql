-- Vérifier les données actuelles
SELECT id, nom, slug, date_debut_abonnement, date_fin_abonnement, 
       plan_abonnement, statut_abonnement 
FROM public.tenant 
WHERE slug = 'ispm' OR nom LIKE '%ISPM%';

-- Mettre à jour la date d'expiration (1 an à partir d'aujourd'hui)
UPDATE public.tenant 
SET date_debut_abonnement = CURRENT_DATE,
    date_fin_abonnement = CURRENT_DATE + INTERVAL '1 year',
    plan_abonnement = COALESCE(plan_abonnement, 'basic'),
    statut_abonnement = COALESCE(statut_abonnement, 'active')
WHERE slug = 'ispm' OR nom LIKE '%ISPM%';

-- Vérifier la mise à jour
SELECT id, nom, slug, 
       date_debut_abonnement, 
       date_fin_abonnement,
       date_fin_abonnement::date as date_expiration_formatee,
       plan_abonnement, 
       statut_abonnement 
FROM public.tenant 
WHERE slug = 'ispm' OR nom LIKE '%ISPM%';

-- Made with Bob
