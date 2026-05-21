# ANALYSE DÉTAILLÉE - ALIGNEMENT TENANT SCHEMA

## 📋 Vue d'ensemble

**Date**: 2026-05-18  
**Objectif**: Aligner le script `tenant-schema.sql` avec la structure réelle des tenants en production (BD.sql)

---

## 📊 INVENTAIRE DES TABLES

### Tables dans tenant-schema.sql actuel (74 tables)
1. utilisateur
2. session_jwt
3. annee_academique
4. niveau_etude
5. departement
6. parcours
7. secretaire_parcours
8. unite_enseignement
9. element_constitutif
10. calendrier_academique
11. etudiant
12. inscription
13. enseignant
14. affectation_cours
15. batiment
16. salle
17. emploi_du_temps
18. presence
19. incident_disciplinaire
20. session_examen
21. note
22. pv_deliberation
23. resultat_deliberation
24. diplome
25. absence_enseignant
26. rattrapage
27. note_derogatoire
28. demande_etudiant
29. convocation
30. dossier_etudiant
31. grille_tarifaire
32. echeancier
33. paiement
34. budget
35. depense
36. contrat_personnel
37. conge_personnel
38. fiche_paie
39. heure_complementaire
40. evaluation_personnel
41. declaration_sociale
42. recrutement
43. candidature
44. ticket_maintenance
45. reservation_salle
46. stock
47. mouvement_stock
48. planning_entretien
49. rapport_entretien
50. annonce
51. notification
52. message
53. permissions_portail
54. referentiel_competences
55. sujet_examen
56. proces_verbal
57. pointage_qr
58. presence_surveillance
59. alerte_discipline
60. configuration_examen
61. suivi_moral
62. autorisation_sortie
63. rapport_conduite
64. conseil_discipline
65. frais_inscription
66. cloture_caisse
67. support_cours
68. stage
69. fiche_suivi_stage
70. soutenance
71. evaluation_soutenance
72. demande_ressource
73. message_enseignant
74. message_destinataire

### Tables dans BD.sql (tenant_ispm) - 77 tables identifiées
Toutes les tables ci-dessus PLUS:
- **archive_scolarite** ❌ MANQUANTE
- **attestation** ❌ MANQUANTE
- **deliberation** ❌ MANQUANTE
- **resultat_semestre** ❌ MANQUANTE
- **resultat_ue** ❌ MANQUANTE
- **verrouillage_notes** ❌ MANQUANTE
- **suplement_diplome** ❌ MANQUANTE
- **transfert_etudiant** ❌ MANQUANTE
- **paiement_inscription** ❌ MANQUANTE

---

## 🔴 TABLES MANQUANTES À AJOUTER

### 1. archive_scolarite
```sql
CREATE TABLE archive_scolarite (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    etudiant_id uuid NOT NULL,
    type_document varchar(50) NOT NULL,
    titre_document varchar(200) NOT NULL,
    annee_academique varchar(20) NOT NULL,
    semestre smallint,
    fichier_original_url varchar(500),
    fichier_pdf_url varchar(500),
    hash_integrite varchar(128),
    format varchar(20) DEFAULT 'PDF',
    taille_octets bigint,
    langue varchar(10) DEFAULT 'FR',
    acces_public boolean DEFAULT false,
    date_limite_acces date,
    archive_par uuid NOT NULL,
    date_archivage timestamptz DEFAULT now(),
    duree_conservation integer DEFAULT 10,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT archive_scolarite_type_document_check CHECK (type_document IN (
        'releve_notes', 'attestation_reussite', 'diplome', 
        'suplement_diplome', 'certificat_scolarite', 'transcript'
    ))
);
```

### 2. attestation
```sql
CREATE TABLE attestation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    inscription_id uuid,
    type_attestation varchar(50) NOT NULL,
    numero_attestation varchar(100) NOT NULL,
    annee_academique_id uuid,
    motif text,
    observations text,
    statut varchar(30) DEFAULT 'en_attente',
    genere_par uuid,
    date_generation timestamp DEFAULT now(),
    fichier_url varchar(500),
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now(),
    date_emission timestamp DEFAULT now(),
    CONSTRAINT attestation_statut_check CHECK (statut IN (
        'en_attente', 'validee', 'refusee', 'annulee'
    )),
    CONSTRAINT attestation_type_check CHECK (type_attestation IN (
        'scolarite', 'reussite', 'inscription', 'preinscription', 'stage', 'autre'
    ))
);
```

### 3. deliberation
```sql
CREATE TABLE deliberation (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    parcours_id uuid NOT NULL,
    annee_academique_id uuid NOT NULL,
    semestre smallint NOT NULL,
    date_deliberation date NOT NULL,
    type_deliberation varchar(50) DEFAULT 'ordinaire',
    statut varchar(30) DEFAULT 'planifiee',
    president_jury_id uuid,
    secretaire_id uuid,
    membres_jury jsonb,
    observations text,
    pv_genere boolean DEFAULT false,
    pv_url varchar(500),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT deliberation_type_check CHECK (type_deliberation IN (
        'ordinaire', 'rattrapage', 'exceptionnelle'
    )),
    CONSTRAINT deliberation_statut_check CHECK (statut IN (
        'planifiee', 'en_cours', 'terminee', 'annulee'
    ))
);
```

### 4. resultat_semestre
```sql
CREATE TABLE resultat_semestre (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    etudiant_id uuid NOT NULL,
    inscription_id uuid NOT NULL,
    semestre smallint NOT NULL,
    moyenne_generale numeric(5,2),
    credits_obtenus integer DEFAULT 0,
    credits_requis integer,
    decision varchar(50),
    mention varchar(50),
    rang integer,
    effectif_classe integer,
    deliberation_id uuid,
    observations text,
    valide boolean DEFAULT false,
    date_validation timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT resultat_semestre_decision_check CHECK (decision IN (
        'admis', 'ajourné', 'redouble', 'exclu', 'en_attente'
    )),
    CONSTRAINT resultat_semestre_mention_check CHECK (mention IN (
        'passable', 'assez_bien', 'bien', 'tres_bien', 'excellent', NULL
    ))
);
```

### 5. resultat_ue
```sql
CREATE TABLE resultat_ue (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    etudiant_id uuid NOT NULL,
    inscription_id uuid NOT NULL,
    ue_id uuid NOT NULL,
    semestre smallint NOT NULL,
    moyenne numeric(5,2),
    credits_obtenus integer DEFAULT 0,
    statut varchar(30),
    session varchar(20) DEFAULT 'normale',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT resultat_ue_statut_check CHECK (statut IN (
        'valide', 'non_valide', 'en_cours', 'dispense'
    )),
    CONSTRAINT resultat_ue_session_check CHECK (session IN (
        'normale', 'rattrapage'
    ))
);
```

### 6. verrouillage_notes
```sql
CREATE TABLE verrouillage_notes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    ue_id uuid NOT NULL,
    semestre smallint NOT NULL,
    annee_academique_id uuid NOT NULL,
    verrouille boolean DEFAULT false,
    verrouille_par uuid,
    date_verrouillage timestamptz,
    motif text,
    deverrouille_par uuid,
    date_deverrouillage timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
```

### 7. suplement_diplome
```sql
CREATE TABLE suplement_diplome (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    diplome_id uuid NOT NULL,
    etudiant_id uuid NOT NULL,
    parcours_suivi text,
    competences_acquises text,
    stages_effectues text,
    projets_realises text,
    activites_extra text,
    langues_maitrisees jsonb,
    certifications jsonb,
    mobilite_internationale text,
    systeme_notation text,
    echelle_ects text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
```

### 8. transfert_etudiant
```sql
CREATE TABLE transfert_etudiant (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    etudiant_id uuid NOT NULL,
    parcours_origine_id uuid NOT NULL,
    parcours_destination_id uuid,
    etablissement_destination varchar(200),
    type_transfert varchar(50) NOT NULL,
    motif text,
    date_demande date DEFAULT CURRENT_DATE,
    statut varchar(30) DEFAULT 'en_attente',
    traite_par uuid,
    date_traitement timestamptz,
    observations text,
    documents_fournis jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT transfert_type_check CHECK (type_transfert IN (
        'interne', 'externe', 'reorientation'
    )),
    CONSTRAINT transfert_statut_check CHECK (statut IN (
        'en_attente', 'approuve', 'refuse', 'annule'
    ))
);
```

### 9. paiement_inscription
```sql
CREATE TABLE paiement_inscription (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    inscription_id uuid NOT NULL,
    montant_total numeric(10,2) NOT NULL,
    montant_paye numeric(10,2) DEFAULT 0,
    montant_restant numeric(10,2),
    statut varchar(30) DEFAULT 'impaye',
    date_limite date,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT paiement_inscription_statut_check CHECK (statut IN (
        'impaye', 'partiel', 'complet', 'exonere'
    ))
);
```

---

## ⚠️ COLONNES MANQUANTES DANS TABLES EXISTANTES

### parcours
**Colonnes à ajouter:**
- `date_ouverture` DATE
- `motif_ouverture` TEXT
- `conditions_ouverture` TEXT
- `date_fermeture` DATE
- `motif_fermeture` TEXT
- `valide_par_president` UUID (FK vers utilisateur)

### contrat_personnel
**Colonnes à ajouter:**
- `valide_par` UUID
- `valide_le` TIMESTAMPTZ
- `commentaire_president` TEXT
- `conditions_speciales` TEXT

### depense
**Colonnes à ajouter:**
- `valide_par_president` UUID
- `valide_le` TIMESTAMPTZ
- `motif_decision` TEXT
- `conditions_speciales` TEXT

### calendrier_academique
**Colonnes à ajouter:**
- `valide_par_president` UUID
- `valide_le` TIMESTAMPTZ
- `commentaire_president` TEXT

### grille_tarifaire
**Colonnes à ajouter:**
- `montant_inscription` NUMERIC(10,2)
- `montant_scolarite` NUMERIC(10,2)
- `date_limite_paiement` DATE
- `modalites_paiement` TEXT

### utilisateur
**Colonnes à ajouter:**
- `tenant_id` VARCHAR(100)
- `parcours_assignes` JSONB

### paiement
**Colonnes à ajouter:**
- `type_paiement` VARCHAR(50)
- `cloture_caisse_id` UUID
- `details_paiement` JSONB

---

## 🔧 SÉQUENCES À CRÉER

```sql
CREATE SEQUENCE seq_recu START 1;
CREATE SEQUENCE convention_id_seq START 1;
CREATE SEQUENCE delegation_signature_id_seq START 1;
CREATE SEQUENCE evaluation_personnel_id_seq START 1;
```

---

## 🔨 FONCTIONS & TRIGGERS À CRÉER DANS LE SCHÉMA DYNAMIQUE

### Fonctions existantes à adapter:
1. `update_updated_at_column()` - ✅ Existe déjà
2. `trigger_set_updated_at()` - À créer
3. `trigger_alerte_stock()` - À créer
4. `trigger_note_verrouille()` - À créer
5. `trigger_numero_recu()` - À créer
6. `trigger_notification_paiement()` - À créer
7. `check_note_verrouillee()` - À créer
8. `calculer_credits_acquis()` - À créer
9. `calculer_moyenne_semestre()` - À créer
10. `update_paiement_inscription_updated_at()` - À créer

---

## 📑 INDEX MANQUANTS

### Index critiques à ajouter:
```sql
-- Secrétaire parcours
CREATE UNIQUE INDEX idx_secretaire_parcours_unique 
ON secretaire_parcours(utilisateur_id, parcours_id) 
WHERE actif = true;

-- Niveau étude
CREATE INDEX idx_niveau_etude_code ON niveau_etude(code);

-- Alertes discipline
CREATE INDEX idx_alerte_discipline_etudiant ON alerte_discipline(etudiant_id);
CREATE INDEX idx_alerte_discipline_date ON alerte_discipline(date_alerte);
CREATE INDEX idx_alerte_discipline_gravite ON alerte_discipline(gravite);

-- Pointage QR
CREATE INDEX idx_pointage_qr_code ON pointage_qr(qr_code);
CREATE INDEX idx_pointage_qr_etudiant ON pointage_qr(etudiant_id);

-- Présence surveillance
CREATE INDEX idx_presence_surveillance_etudiant ON presence_surveillance(etudiant_id);
CREATE INDEX idx_presence_surveillance_date ON presence_surveillance(date_presence);
CREATE INDEX idx_presence_surveillance_statut ON presence_surveillance(statut);

-- Clôture caisse
CREATE INDEX idx_cloture_caisse_date ON cloture_caisse(date_cloture);
CREATE INDEX idx_cloture_caisse_caissier ON cloture_caisse(caissier_id);

-- Frais inscription
CREATE INDEX idx_frais_inscription_parcours ON frais_inscription(parcours_id);
CREATE INDEX idx_frais_inscription_niveau ON frais_inscription(niveau_etude_id);
CREATE INDEX idx_frais_inscription_annee ON frais_inscription(annee_academique_id);
```

---

## ✅ CONTRAINTES CHECK À ALIGNER

### annonce.cible
**Actuel**: Accepte 'enseignants'  
**Production**: Accepte 'professeurs'  
**Action**: Ajouter 'professeurs' aux valeurs acceptées

---

## 📋 PLAN D'IMPLÉMENTATION

### Phase 1: Structure de base
1. ✅ Créer fonction PL/pgSQL `create_tenant_schema(p_schema_name text)`
2. ✅ Validation du nom de schéma (regex `^tenant_[a-z0-9_]+$`)
3. ✅ CREATE SCHEMA dynamique

### Phase 2: Fonctions & Triggers
4. Créer toutes les fonctions dans le schéma dynamique
5. Créer les séquences

### Phase 3: Tables
6. Créer tables dans l'ordre des dépendances FK
7. Ajouter les 9 tables manquantes
8. Ajouter colonnes manquantes aux tables existantes

### Phase 4: Contraintes & Index
9. Ajouter tous les index
10. Ajouter contraintes ALTER TABLE
11. Attacher triggers aux tables

### Phase 5: Vues & Données
12. Créer vues analytiques
13. INSERT données de référence (niveau_etude, permissions_portail)

---

## 🎯 PROCHAINES ÉTAPES

1. ✅ Analyse complète terminée
2. ⏳ Créer le script SQL complet avec fonction PL/pgSQL
3. ⏳ Tester sur environnement de développement
4. ⏳ Valider avec les tenants existants
5. ⏳ Déployer en production

---

**Document généré le**: 2026-05-18  
**Statut**: Analyse complète - Prêt pour implémentation