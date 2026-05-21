-- ============================================================
-- BASE DE DONNÉES : Imtech_SaaS
-- Script SQL lisible extrait du dump PostgreSQL 18
-- Schémas : public | tenant_ispm | tenant_universite_d_antsiranana
-- ============================================================

SET client_encoding = 'UTF8';
SET standard_conforming_strings = 'on';
SELECT pg_catalog.set_config('search_path', '', false);

-- ============================================================
-- SCHÉMAS
-- ============================================================

CREATE SCHEMA tenant_ispm;
CREATE SCHEMA tenant_universite_d_antsiranana;

-- ============================================================
-- EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

-- ============================================================
-- FONCTIONS & TRIGGERS (public)
-- ============================================================

CREATE FUNCTION public.add_evaluation_personnel_table(p_schema_name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
  result_message TEXT := '';
BEGIN
  -- Vérifier que le schéma existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = p_schema_name) THEN
    RETURN 'ERREUR: Le schéma ' || p_schema_name || ' n''existe pas';
  END IF;
  -- Définir le search_path
  EXECUTE format('SET search_path TO %I, public', p_schema_name);
  -- Vérifier si la table existe déjà
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = p_schema_name
    AND table_name = 'evaluation_personnel'
  ) THEN
    result_message := 'INFO: La table evaluation_personnel existe déjà dans ' || p_schema_name;
    RETURN result_message;
  END IF;
  -- Créer la table evaluation_personnel
  EXECUTE format('
    CREATE TABLE %I.evaluation_personnel (
      id SERIAL PRIMARY KEY,
      utilisateur_id INTEGER NOT NULL,
      evaluateur_id INTEGER NOT NULL,
      date_evaluation DATE NOT NULL,
      periode VARCHAR(50) NOT NULL,
      annee_evaluation INTEGER,
      -- Notes sur 5
      note_globale DECIMAL(3,2) CHECK (note_globale >= 0 AND note_globale <= 5),
      competences_techniques DECIMAL(3,2) CHECK (competences_techniques >= 0 AND competences_techniques <= 5),
      competences_relationnelles DECIMAL(3,2) CHECK (competences_relationnelles >= 0 AND competences_relationnelles <= 5),
      assiduite DECIMAL(3,2) CHECK (assiduite >= 0 AND assiduite <= 5),
      initiative DECIMAL(3,2) CHECK (initiative >= 0 AND initiative <= 5),
      -- Commentaires et évaluations
      commentaires TEXT,
      objectifs_atteints TEXT,
      axes_amelioration TEXT,
      auto_evaluation TEXT,
      date_auto_evaluation TIMESTAMP,
      -- Statut du processus
      statut VARCHAR(50) DEFAULT ''planifiee'' CHECK (statut IN (''planifiee'', ''en_cours'', ''auto_evalue'', ''terminee'')),
      -- Audit
      cree_par INTEGER,
      cree_le TIMESTAMP DEFAULT NOW(),
      modifie_le TIMESTAMP DEFAULT NOW()
    )
  ', p_schema_name);
  -- Créer les index
  EXECUTE format('CREATE INDEX idx_eval_utilisateur ON %I.evaluation_personnel(utilisateur_id)', p_schema_name);
  EXECUTE format('CREATE INDEX idx_eval_evaluateur ON %I.evaluation_personnel(evaluateur_id)', p_schema_name);
  EXECUTE format('CREATE INDEX idx_eval_statut ON %I.evaluation_personnel(statut)', p_schema_name);
  EXECUTE format('CREATE INDEX idx_eval_annee ON %I.evaluation_personnel(annee_evaluation)', p_schema_name);
  EXECUTE format('CREATE INDEX idx_eval_date ON %I.evaluation_personnel(date_evaluation)', p_schema_name);
  -- Note: Les contraintes FK sont omises volontairement pour éviter les problèmes
  -- de compatibilité entre les différents schémas tenants
  -- Ajouter un commentaire sur la table
  EXECUTE format('
    COMMENT ON TABLE %I.evaluation_personnel IS
    ''Évaluations annuelles du personnel - Gestion des performances et compétences''
  ', p_schema_name);
  result_message := 'SUCCÈS: Table evaluation_personnel créée dans ' || p_schema_name;
  RETURN result_message;
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'ERREUR dans ' || p_schema_name || ': ' || SQLERRM;
END;
$$;


-- ============================================================
-- TABLES : schéma [public]
-- ============================================================

CREATE TABLE public.abonnement (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid NOT NULL,
    plan_id uuid NOT NULL,
    date_debut date DEFAULT CURRENT_DATE NOT NULL,
    date_fin date,
    statut character varying(20) DEFAULT 'actif'::character varying NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT abonnement_statut_check CHECK (((statut)::text = ANY ((ARRAY['actif'::character varying, 'suspendu'::character varying, 'expire'::character varying, 'essai'::character varying])::text[])))
);

CREATE TABLE public.domaine (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid NOT NULL,
    domaine character varying(253) NOT NULL,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.plan_abonnement (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    nom character varying(100) NOT NULL,
    description text,
    prix_mensuel numeric(10,2) NOT NULL,
    max_etudiants integer,
    max_utilisateurs integer,
    fonctionnalites jsonb DEFAULT '{}'::jsonb,
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.super_admin (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(254) NOT NULL,
    password_hash character varying(255) NOT NULL,
    nom character varying(100) NOT NULL,
    prenom character varying(100) NOT NULL,
    actif boolean DEFAULT true,
    derniere_connexion timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    password_reset_required boolean DEFAULT false,
    last_password_reset timestamp with time zone
);

CREATE TABLE public.tenant (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    schema_name character varying(63) NOT NULL,
    nom character varying(200) NOT NULL,
    slug character varying(100) NOT NULL,
    slogan character varying(255),
    logo_url text,
    couleur_principale character varying(7) DEFAULT '#1a7a4a'::character varying,
    couleur_secondaire character varying(7) DEFAULT '#1565c0'::character varying,
    couleur_accent character varying(7) DEFAULT '#e65100'::character varying,
    couleur_texte character varying(7) DEFAULT '#ffffff'::character varying,
    entete_document text,
    adresse text,
    pays character varying(100) DEFAULT 'Madagascar'::character varying,
    telephone character varying(30),
    email_contact character varying(200),
    site_web character varying(300),
    type_etablissement character varying(50) DEFAULT 'catholique'::character varying,
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    plan_abonnement character varying(20) DEFAULT 'basic'::character varying,
    statut_abonnement character varying(20) DEFAULT 'active'::character varying,
    date_debut_abonnement date,
    date_fin_abonnement date,
    prix_mensuel numeric(10,2) DEFAULT 50000,
    max_utilisateurs integer DEFAULT 100
);

CREATE TABLE public.utilisateur (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nom character varying(100) NOT NULL,
    prenom character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    telephone character varying(20),
    role character varying(50) NOT NULL,
    mot_de_passe character varying(255),
    actif boolean DEFAULT true,
    photo_url character varying(500),
    date_naissance date,
    adresse text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    tenant_id uuid
);


-- ============================================================
-- TABLES : schéma [tenant_ispm]
-- ============================================================

CREATE TABLE tenant_ispm.absence_enseignant (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    enseignant_id uuid NOT NULL,
    seance_id uuid,
    date_absence date NOT NULL,
    heure_debut time without time zone,
    heure_fin time without time zone,
    motif character varying(100) NOT NULL,
    justification text,
    justificatif_url character varying(500),
    est_justifiee boolean DEFAULT false,
    statut character varying(20) DEFAULT 'declaree'::character varying,
    declaree_par uuid NOT NULL,
    validee_par uuid,
    date_validation timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE tenant_ispm.affectation_cours (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    enseignant_id uuid NOT NULL,
    ue_id uuid,
    ec_id uuid,
    annee_academique_id uuid NOT NULL,
    type_seance character varying(10) DEFAULT 'CM'::character varying NOT NULL,
    volume_prevu smallint DEFAULT 0 NOT NULL,
    volume_realise smallint DEFAULT 0,
    valide_par uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT affectation_cours_check CHECK (((ue_id IS NOT NULL) OR (ec_id IS NOT NULL))),
    CONSTRAINT affectation_cours_type_seance_check CHECK (((type_seance)::text = ANY ((ARRAY['CM'::character varying, 'TD'::character varying, 'TP'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.alerte_discipline (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    type character varying(100) NOT NULL,
    message text NOT NULL,
    statut character varying(50) DEFAULT 'non_lue'::character varying,
    generee_par uuid NOT NULL,
    destinataire_role character varying(100) DEFAULT 'secretariat'::character varying,
    date_lecture timestamp without time zone,
    traitee_par uuid,
    date_traitement timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

CREATE TABLE tenant_ispm.annee_academique (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    libelle character varying(20) NOT NULL,
    date_debut date NOT NULL,
    date_fin date NOT NULL,
    active boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE tenant_ispm.annonce (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    titre character varying(300) NOT NULL,
    contenu text NOT NULL,
    type_annonce character varying(30) DEFAULT 'information'::character varying,
    cible character varying(20) DEFAULT 'tous'::character varying,
    parcours_id uuid,
    publie boolean DEFAULT false,
    date_publication timestamp with time zone,
    date_expiration timestamp with time zone,
    auteur_id uuid NOT NULL,
    photo_url character varying(500),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT annonce_cible_check CHECK (((cible)::text = ANY ((ARRAY['tous'::character varying, 'etudiants'::character varying, 'parents'::character varying, 'professeurs'::character varying, 'personnel'::character varying, 'parcours'::character varying])::text[]))),
    CONSTRAINT annonce_type_annonce_check CHECK (((type_annonce)::text = ANY ((ARRAY['information'::character varying, 'urgent'::character varying, 'evenement'::character varying, 'resultat'::character varying, 'pastoral'::character varying, 'fermeture'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.archive_scolarite (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    etudiant_id uuid NOT NULL,
    type_document character varying(50) NOT NULL,
    titre_document character varying(200) NOT NULL,
    annee_academique character varying(20) NOT NULL,
    semestre smallint,
    fichier_original_url character varying(500),
    fichier_pdf_url character varying(500),
    hash_integrite character varying(128),
    format character varying(20) DEFAULT 'PDF'::character varying,
    taille_octets bigint,
    langue character varying(10) DEFAULT 'FR'::character varying,
    acces_public boolean DEFAULT false,
    date_limite_acces date,
    archive_par uuid NOT NULL,
    date_archivage timestamp with time zone DEFAULT now(),
    duree_conservation integer DEFAULT 10,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT archive_scolarite_type_document_check CHECK (((type_document)::text = ANY ((ARRAY['releve_notes'::character varying, 'attestation_reussite'::character varying, 'diplome'::character varying, 'suplement_diplome'::character varying, 'certificat_scolarite'::character varying, 'transcript'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.attestation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    inscription_id uuid,
    type_attestation character varying(50) NOT NULL,
    numero_attestation character varying(100) NOT NULL,
    annee_academique_id uuid,
    motif text,
    observations text,
    statut character varying(30) DEFAULT 'en_attente'::character varying,
    genere_par uuid,
    date_generation timestamp without time zone DEFAULT now(),
    fichier_url character varying(500),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    date_emission timestamp without time zone DEFAULT now(),
    CONSTRAINT attestation_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'validee'::character varying, 'refusee'::character varying, 'annulee'::character varying])::text[]))),
    CONSTRAINT attestation_type_check CHECK (((type_attestation)::text = ANY ((ARRAY['scolarite'::character varying, 'reussite'::character varying, 'inscription'::character varying, 'preinscription'::character varying, 'stage'::character varying, 'autre'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.batiment (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nom character varying(100) NOT NULL,
    code character varying(20),
    adresse text,
    actif boolean DEFAULT true
);

CREATE TABLE tenant_ispm.budget (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    annee_academique_id uuid NOT NULL,
    departement_id uuid,
    categorie character varying(100) NOT NULL,
    montant_prevu numeric(15,2) NOT NULL,
    montant_realise numeric(15,2) DEFAULT 0,
    description text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE tenant_ispm.calendrier_academique (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    annee_academique_id uuid NOT NULL,
    evenement character varying(200) NOT NULL,
    type_evenement character varying(50) NOT NULL,
    date_debut date NOT NULL,
    date_fin date NOT NULL,
    parcours_id uuid,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    valide_par_president integer,
    valide_le timestamp without time zone,
    commentaire_president text,
    CONSTRAINT calendrier_academique_type_evenement_check CHECK (((type_evenement)::text = ANY ((ARRAY['rentree'::character varying, 'cours'::character varying, 'vacances'::character varying, 'examens'::character varying, 'deliberation'::character varying, 'ceremonie'::character varying, 'pastoral'::character varying, 'autre'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.candidature (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recrutement_id uuid NOT NULL,
    nom character varying(100) NOT NULL,
    prenom character varying(100) NOT NULL,
    email character varying(254) NOT NULL,
    telephone character varying(30),
    cv_url character varying(500),
    lettre_motivation_url character varying(500),
    statut character varying(20) DEFAULT 'recue'::character varying,
    notes_evaluation text,
    date_entretien timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT candidature_statut_check CHECK (((statut)::text = ANY ((ARRAY['recue'::character varying, 'preselectionne'::character varying, 'entretien'::character varying, 'retenu'::character varying, 'refuse'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.configuration_examen (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_examen_id uuid NOT NULL,
    salle_id uuid NOT NULL,
    places_total integer DEFAULT 0,
    places_attribuees integer DEFAULT 0,
    plan_places jsonb DEFAULT '[]'::jsonb,
    surveillant_id uuid NOT NULL,
    statut character varying(50) DEFAULT 'preparation'::character varying,
    rapport_incident text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

CREATE TABLE tenant_ispm.conge_personnel (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    utilisateur_id uuid NOT NULL,
    type_conge character varying(50) NOT NULL,
    date_debut date NOT NULL,
    date_fin date NOT NULL,
    nb_jours smallint GENERATED ALWAYS AS (((date_fin - date_debut) + 1)) STORED,
    motif text,
    statut character varying(20) DEFAULT 'demande'::character varying,
    approuve_par uuid,
    date_approbation timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT conge_personnel_statut_check CHECK (((statut)::text = ANY ((ARRAY['demande'::character varying, 'approuve'::character varying, 'refuse'::character varying, 'annule'::character varying])::text[]))),
    CONSTRAINT conge_personnel_type_conge_check CHECK (((type_conge)::text = ANY ((ARRAY['annuel'::character varying, 'maladie'::character varying, 'maternite'::character varying, 'paternite'::character varying, 'sans_solde'::character varying, 'autre'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.contrat_personnel (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    utilisateur_id uuid NOT NULL,
    type_contrat character varying(30) NOT NULL,
    poste character varying(200) NOT NULL,
    departement_id uuid,
    date_debut date NOT NULL,
    date_fin date,
    salaire_brut numeric(12,2),
    salaire_net numeric(12,2),
    volume_horaire_hebdo smallint,
    actif boolean DEFAULT true,
    fichier_contrat_url character varying(500),
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    valide_par integer,
    valide_le timestamp without time zone,
    commentaire_president text,
    conditions_speciales text,
    CONSTRAINT contrat_personnel_type_contrat_check CHECK (((type_contrat)::text = ANY ((ARRAY['CDI'::character varying, 'CDD'::character varying, 'vacataire'::character varying, 'stagiaire'::character varying, 'benevolat'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.convention (
    id integer NOT NULL,
    intitule character varying(255) NOT NULL,
    partenaire character varying(255) NOT NULL,
    type_partenaire character varying(50) NOT NULL,
    objet_convention text NOT NULL,
    date_proposee date NOT NULL,
    document_url text,
    statut character varying(50) DEFAULT 'en_attente_signature'::character varying NOT NULL,
    signe_president boolean DEFAULT false,
    date_signature timestamp without time zone,
    signature_hash character varying(255),
    representant_partenaire character varying(255),
    date_effet date,
    remarques_president text,
    cree_par integer,
    cree_le timestamp without time zone DEFAULT now(),
    modifie_le timestamp without time zone DEFAULT now(),
    CONSTRAINT convention_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente_signature'::character varying, 'signee'::character varying, 'rejetee'::character varying, 'expiree'::character varying])::text[]))),
    CONSTRAINT convention_type_partenaire_check CHECK (((type_partenaire)::text = ANY ((ARRAY['eglise'::character varying, 'diocese'::character varying, 'etat'::character varying, 'entreprise'::character varying, 'universite'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.convocation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid,
    session_examen_id uuid,
    soutenance_id uuid,
    type character varying(50) NOT NULL,
    libelle character varying(200) NOT NULL,
    message text,
    date_convocation date NOT NULL,
    heure_convocation time without time zone,
    lieu character varying(200),
    salle_id uuid,
    statut character varying(20) DEFAULT 'brouillon'::character varying,
    date_envoi timestamp with time zone,
    date_lecture timestamp with time zone,
    date_confirmation timestamp with time zone,
    genere_par uuid NOT NULL,
    fichier_url character varying(500),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT convocation_statut_check CHECK (((statut)::text = ANY ((ARRAY['brouillon'::character varying, 'envoyee'::character varying, 'lue'::character varying, 'confirme'::character varying, 'annule'::character varying])::text[]))),
    CONSTRAINT convocation_type_check CHECK (((type)::text = ANY ((ARRAY['examen'::character varying, 'rattrapage'::character varying, 'soutenance'::character varying, 'reunion'::character varying, 'conseil_discipline'::character varying, 'autre'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.declaration_sociale (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type_declaration character varying(50) NOT NULL,
    periode_debut date NOT NULL,
    periode_fin date NOT NULL,
    organisme character varying(200) NOT NULL,
    montant_total_cotisations numeric(12,2) DEFAULT 0 NOT NULL,
    nb_salaries smallint DEFAULT 0 NOT NULL,
    statut character varying(20) DEFAULT 'preparation'::character varying,
    date_transmission timestamp with time zone,
    date_paiement timestamp with time zone,
    fichier_export_url character varying(500),
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT declaration_sociale_statut_check CHECK (((statut)::text = ANY ((ARRAY['preparation'::character varying, 'validee'::character varying, 'transmise'::character varying, 'payee'::character varying])::text[]))),
    CONSTRAINT declaration_sociale_type_declaration_check CHECK (((type_declaration)::text = ANY ((ARRAY['URSSAF'::character varying, 'MSA'::character varying, 'retraite'::character varying, 'prevoyance'::character varying, 'mutuelle'::character varying, 'autre'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.delegation_signature (
    id integer NOT NULL,
    delegataire_id integer NOT NULL,
    types_actes text[] NOT NULL,
    date_debut date NOT NULL,
    date_fin date NOT NULL,
    conditions text,
    revoquee boolean DEFAULT false,
    revoquee_le timestamp without time zone,
    revoquee_par integer,
    cree_par integer NOT NULL,
    cree_le timestamp without time zone DEFAULT now(),
    CONSTRAINT check_dates CHECK ((date_fin > date_debut))
);

CREATE TABLE tenant_ispm.deliberation (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    session_examen_id uuid NOT NULL,
    parcours_id uuid NOT NULL,
    semestre smallint NOT NULL,
    annee_niveau smallint NOT NULL,
    date_deliberation date NOT NULL,
    president_jury_id uuid NOT NULL,
    membres_jury uuid[] DEFAULT '{}'::uuid[],
    statut character varying(20) DEFAULT 'planifiee'::character varying NOT NULL,
    observations_generales text,
    rapport_deliberation text,
    validee_par uuid,
    date_validation timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT deliberation_statut_check CHECK (((statut)::text = ANY ((ARRAY['planifiee'::character varying, 'en_cours'::character varying, 'terminee'::character varying, 'annulee'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.demande_etudiant (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    type_demande character varying(50) NOT NULL,
    description text NOT NULL,
    justification text,
    piece_jointe_url character varying(500),
    date_soumission date DEFAULT CURRENT_DATE NOT NULL,
    statut character varying(20) DEFAULT 'soumise'::character varying,
    reponse text,
    traite_par uuid,
    date_traitement timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE tenant_ispm.demande_ressource (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type_ressource character varying(50) NOT NULL,
    date_souhaitee date NOT NULL,
    heure_debut time without time zone,
    heure_fin time without time zone,
    motif text NOT NULL,
    nb_participants smallint,
    materiel_requis text,
    demandeur_id uuid NOT NULL,
    statut character varying(30) DEFAULT 'soumise'::character varying,
    traite_par uuid,
    date_traitement timestamp with time zone,
    commentaire_rejet text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT demande_ressource_statut_check CHECK (((statut)::text = ANY ((ARRAY['soumise'::character varying, 'en_cours'::character varying, 'approuvee'::character varying, 'rejetee'::character varying, 'livree'::character varying])::text[]))),
    CONSTRAINT demande_ressource_type_ressource_check CHECK (((type_ressource)::text = ANY ((ARRAY['salle'::character varying, 'materiel'::character varying, 'laboratoire'::character varying, 'equipement'::character varying, 'autre'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.departement (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(20) NOT NULL,
    nom character varying(200) NOT NULL,
    description text,
    responsable_id uuid,
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE tenant_ispm.depense (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    budget_id uuid,
    annee_academique_id uuid NOT NULL,
    libelle character varying(300) NOT NULL,
    montant numeric(12,2) NOT NULL,
    categorie character varying(100),
    date_depense date DEFAULT CURRENT_DATE NOT NULL,
    fournisseur character varying(200),
    numero_facture character varying(100),
    facture_url character varying(500),
    statut character varying(20) DEFAULT 'en_attente'::character varying,
    demande_par uuid,
    approuve_par uuid,
    date_approbation timestamp with time zone,
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    valide_par_president integer,
    valide_le timestamp without time zone,
    motif_decision text,
    conditions_speciales text,
    CONSTRAINT depense_montant_check CHECK ((montant > (0)::numeric)),
    CONSTRAINT depense_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'approuve'::character varying, 'paye'::character varying, 'rejete'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.diplome (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    etudiant_id uuid NOT NULL,
    inscription_id uuid NOT NULL,
    parcours_id uuid NOT NULL,
    type_diplome character varying(50) NOT NULL,
    mention_generale character varying(30),
    moyenne_finale numeric(5,2),
    total_credits_ects smallint,
    date_obtention date,
    lieu_obtention character varying(200),
    numero_diplome character varying(50),
    hash_integrite character varying(128),
    qr_code_url character varying(500),
    statut character varying(20) DEFAULT 'en_attente'::character varying NOT NULL,
    delivre_par uuid NOT NULL,
    date_delivrance date,
    date_retrait date,
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    signe_president boolean DEFAULT false,
    date_signature timestamp without time zone,
    signature_hash character varying(255),
    mention_speciale text,
    CONSTRAINT diplome_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'delivre'::character varying, 'retire'::character varying, 'annule'::character varying, 'remplace'::character varying])::text[]))),
    CONSTRAINT diplome_type_diplome_check CHECK (((type_diplome)::text = ANY ((ARRAY['licence'::character varying, 'master'::character varying, 'doctorat'::character varying, 'bts'::character varying, 'dut'::character varying, 'certificat'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.dossier_etudiant (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    type_document character varying(50) NOT NULL,
    libelle character varying(200) NOT NULL,
    fichier_url character varying(500) NOT NULL,
    reference character varying(100),
    date_demande date,
    date_delivrance date,
    statut character varying(20) DEFAULT 'en_attente'::character varying,
    motif_refus text,
    demande_par uuid,
    traite_par uuid,
    est_archive boolean DEFAULT false,
    date_archivage date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT dossier_etudiant_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'en_preparation'::character varying, 'delivre'::character varying, 'refuse'::character varying, 'archive'::character varying])::text[]))),
    CONSTRAINT dossier_etudiant_type_document_check CHECK (((type_document)::text = ANY ((ARRAY['certificat_scolarite'::character varying, 'attestation_inscription'::character varying, 'releve_notes'::character varying, 'copie_diplome'::character varying, 'carte_etudiant'::character varying, 'certificat_medical'::character varying, 'piece_identite'::character varying, 'photo'::character varying, 'autre'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.echeancier (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    inscription_id uuid NOT NULL,
    num_tranche smallint NOT NULL,
    montant_du numeric(12,2) NOT NULL,
    date_echeance date NOT NULL,
    statut character varying(20) DEFAULT 'en_attente'::character varying,
    CONSTRAINT echeancier_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'paye'::character varying, 'en_retard'::character varying, 'annule'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.element_constitutif (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ue_id uuid NOT NULL,
    code character varying(30) NOT NULL,
    intitule character varying(200) NOT NULL,
    coefficient numeric(4,2) DEFAULT 1.0 NOT NULL,
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE tenant_ispm.emploi_du_temps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    annee_academique_id uuid NOT NULL,
    affectation_id uuid NOT NULL,
    salle_id uuid,
    date_seance date NOT NULL,
    heure_debut time without time zone NOT NULL,
    heure_fin time without time zone NOT NULL,
    type_seance character varying(10) DEFAULT 'CM'::character varying NOT NULL,
    statut character varying(20) DEFAULT 'planifie'::character varying,
    motif_annulation text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by_id uuid,
    CONSTRAINT emploi_du_temps_check CHECK ((heure_fin > heure_debut)),
    CONSTRAINT emploi_du_temps_statut_check CHECK (((statut)::text = ANY ((ARRAY['planifie'::character varying, 'realise'::character varying, 'annule'::character varying, 'reporte'::character varying])::text[]))),
    CONSTRAINT emploi_du_temps_type_seance_check CHECK (((type_seance)::text = ANY ((ARRAY['CM'::character varying, 'TD'::character varying, 'TP'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.enseignant (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    utilisateur_id uuid,
    matricule character varying(30) NOT NULL,
    nom character varying(100) NOT NULL,
    prenom character varying(100) NOT NULL,
    titre character varying(50),
    grade character varying(50),
    specialite character varying(200),
    type_contrat character varying(20) DEFAULT 'permanent'::character varying NOT NULL,
    departement_id uuid,
    email character varying(254),
    telephone character varying(30),
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT enseignant_type_contrat_check CHECK (((type_contrat)::text = ANY ((ARRAY['permanent'::character varying, 'vacataire'::character varying, 'hdr'::character varying, 'invite'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.etudiant (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    utilisateur_id uuid,
    matricule character varying(30) NOT NULL,
    nom character varying(100) NOT NULL,
    prenom character varying(100) NOT NULL,
    date_naissance date NOT NULL,
    lieu_naissance character varying(100),
    sexe character(1),
    nationalite character varying(100) DEFAULT 'Malagasy'::character varying,
    adresse text,
    telephone character varying(30),
    email character varying(254),
    nom_parent character varying(200),
    telephone_parent character varying(30),
    email_parent character varying(254),
    religion character varying(50),
    situation_familiale character varying(30),
    photo_url character varying(500),
    dossier_medical_url character varying(500),
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT etudiant_sexe_check CHECK ((sexe = ANY (ARRAY['M'::bpchar, 'F'::bpchar])))
);

CREATE TABLE tenant_ispm.evaluation_personnel (
    id integer NOT NULL,
    utilisateur_id uuid NOT NULL,
    evaluateur_id uuid NOT NULL,
    date_evaluation date NOT NULL,
    periode character varying(50) NOT NULL,
    annee_evaluation integer,
    note_globale numeric(3,2),
    competences_techniques numeric(3,2),
    competences_relationnelles numeric(3,2),
    assiduite numeric(3,2),
    initiative numeric(3,2),
    commentaires text,
    objectifs_atteints text,
    axes_amelioration text,
    auto_evaluation text,
    date_auto_evaluation timestamp without time zone,
    statut character varying(50) DEFAULT 'planifiee'::character varying,
    cree_par integer,
    cree_le timestamp without time zone DEFAULT now(),
    modifie_le timestamp without time zone DEFAULT now(),
    CONSTRAINT evaluation_personnel_assiduite_check CHECK (((assiduite >= (0)::numeric) AND (assiduite <= (5)::numeric))),
    CONSTRAINT evaluation_personnel_competences_relationnelles_check CHECK (((competences_relationnelles >= (0)::numeric) AND (competences_relationnelles <= (5)::numeric))),
    CONSTRAINT evaluation_personnel_competences_techniques_check CHECK (((competences_techniques >= (0)::numeric) AND (competences_techniques <= (5)::numeric))),
    CONSTRAINT evaluation_personnel_initiative_check CHECK (((initiative >= (0)::numeric) AND (initiative <= (5)::numeric))),
    CONSTRAINT evaluation_personnel_note_globale_check CHECK (((note_globale >= (0)::numeric) AND (note_globale <= (5)::numeric))),
    CONSTRAINT evaluation_personnel_statut_check CHECK (((statut)::text = ANY ((ARRAY['planifiee'::character varying, 'en_cours'::character varying, 'auto_evalue'::character varying, 'terminee'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.evaluation_soutenance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    soutenance_id uuid NOT NULL,
    evaluateur_id uuid NOT NULL,
    note numeric(5,2) NOT NULL,
    appreciation text,
    date_evaluation timestamp with time zone DEFAULT now(),
    CONSTRAINT evaluation_soutenance_note_check CHECK (((note >= (0)::numeric) AND (note <= (20)::numeric)))
);

CREATE TABLE tenant_ispm.fiche_paie (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contrat_id uuid NOT NULL,
    annee smallint NOT NULL,
    mois smallint NOT NULL,
    salaire_brut numeric(12,2) NOT NULL,
    cotisations numeric(12,2) DEFAULT 0,
    primes numeric(12,2) DEFAULT 0,
    retenues numeric(12,2) DEFAULT 0,
    net_a_payer numeric(12,2) NOT NULL,
    heures_supp numeric(6,2) DEFAULT 0,
    montant_heures_supp numeric(12,2) DEFAULT 0,
    statut character varying(20) DEFAULT 'brouillon'::character varying,
    fichier_url character varying(500),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT fiche_paie_mois_check CHECK (((mois >= 1) AND (mois <= 12))),
    CONSTRAINT fiche_paie_statut_check CHECK (((statut)::text = ANY ((ARRAY['brouillon'::character varying, 'valide'::character varying, 'paye'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.fiche_suivi_stage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    stage_id uuid NOT NULL,
    date_rencontre date NOT NULL,
    travail_effectue text NOT NULL,
    observations text,
    note_avancement numeric(5,2),
    auteur_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT fiche_suivi_stage_note_avancement_check CHECK (((note_avancement >= (0)::numeric) AND (note_avancement <= (20)::numeric)))
);

CREATE TABLE tenant_ispm.grille_tarifaire (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parcours_id uuid NOT NULL,
    annee_academique_id uuid NOT NULL,
    annee_niveau smallint,
    montant_total numeric(12,2) NOT NULL,
    nb_tranches smallint DEFAULT 1,
    description text,
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    montant_inscription numeric(12,2) DEFAULT 0,
    montant_scolarite numeric(12,2) DEFAULT 0,
    date_limite_paiement date,
    modalites_paiement jsonb
);

CREATE TABLE tenant_ispm.heure_complementaire (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    enseignant_id uuid NOT NULL,
    date_travail date NOT NULL,
    nb_heures numeric(5,2) NOT NULL,
    taux_horaire numeric(10,2) NOT NULL,
    motif text,
    statut character varying(20) DEFAULT 'saisie'::character varying,
    valide_par uuid,
    date_validation timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT heure_complementaire_nb_heures_check CHECK ((nb_heures > (0)::numeric)),
    CONSTRAINT heure_complementaire_statut_check CHECK (((statut)::text = ANY ((ARRAY['saisie'::character varying, 'valide'::character varying, 'refuse'::character varying, 'paye'::character varying])::text[]))),
    CONSTRAINT heure_complementaire_taux_horaire_check CHECK ((taux_horaire > (0)::numeric))
);

CREATE TABLE tenant_ispm.incident_disciplinaire (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    date_incident date DEFAULT CURRENT_DATE NOT NULL,
    type_incident character varying(50) NOT NULL,
    description text NOT NULL,
    sanction character varying(100),
    duree_sanction integer,
    statut character varying(20) DEFAULT 'ouvert'::character varying,
    rapporte_par uuid NOT NULL,
    arbitre_par uuid,
    date_cloture date,
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT incident_disciplinaire_statut_check CHECK (((statut)::text = ANY ((ARRAY['ouvert'::character varying, 'en_cours'::character varying, 'clos'::character varying, 'arbitrage'::character varying])::text[]))),
    CONSTRAINT incident_disciplinaire_type_incident_check CHECK (((type_incident)::text = ANY ((ARRAY['retard'::character varying, 'absenteisme'::character varying, 'incivilite'::character varying, 'triche'::character varying, 'violence'::character varying, 'autre'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.inscription (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    parcours_id uuid NOT NULL,
    annee_academique_id uuid NOT NULL,
    annee_niveau smallint NOT NULL,
    type_inscription character varying(20) DEFAULT 'premiere'::character varying NOT NULL,
    statut character varying(20) DEFAULT 'en_attente'::character varying NOT NULL,
    numero_carte character varying(30),
    date_inscription date DEFAULT CURRENT_DATE,
    bourse boolean DEFAULT false,
    type_bourse character varying(100),
    montant_bourse numeric(10,2),
    observations text,
    validee_par uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT inscription_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'validee'::character varying, 'annulee'::character varying, 'abandonnee'::character varying])::text[]))),
    CONSTRAINT inscription_type_inscription_check CHECK (((type_inscription)::text = ANY ((ARRAY['premiere'::character varying, 'reinscription'::character varying, 'transfert'::character varying, 'equivalence'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.message (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    expediteur_id uuid NOT NULL,
    destinataire_id uuid NOT NULL,
    sujet character varying(300),
    contenu text NOT NULL,
    lu boolean DEFAULT false,
    lu_at timestamp with time zone,
    parent_id uuid,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE tenant_ispm.message_destinataire (
    id uuid DEFAULT gen_random_uuid() CONSTRAINT message_destinataire_id_not_null1 NOT NULL,
    message_id uuid NOT NULL,
    etudiant_id uuid NOT NULL,
    lu boolean DEFAULT false,
    date_lecture timestamp without time zone
);

CREATE TABLE tenant_ispm.message_enseignant (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    enseignant_id uuid NOT NULL,
    sujet character varying(255) NOT NULL,
    contenu text NOT NULL,
    type_message character varying(50) NOT NULL,
    etudiant_id uuid,
    classe_id uuid,
    parcours_id uuid,
    niveau_id uuid,
    nombre_destinataires integer DEFAULT 0,
    date_envoi timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    statut character varying(50) DEFAULT 'envoye'::character varying,
    CONSTRAINT message_enseignant_statut_check CHECK (((statut)::text = ANY ((ARRAY['envoye'::character varying, 'lu'::character varying, 'archive'::character varying])::text[]))),
    CONSTRAINT message_enseignant_type_message_check CHECK (((type_message)::text = ANY ((ARRAY['direct'::character varying, 'classe'::character varying, 'parcours'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.mouvement_stock (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    stock_id uuid NOT NULL,
    type_mouvement character varying(20) NOT NULL,
    quantite numeric(10,2) NOT NULL,
    motif character varying(200),
    reference_doc character varying(100),
    utilisateur_id uuid,
    date_mouvement timestamp with time zone DEFAULT now(),
    CONSTRAINT mouvement_stock_type_mouvement_check CHECK (((type_mouvement)::text = ANY ((ARRAY['entree'::character varying, 'sortie'::character varying, 'ajustement'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.niveau_etude (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(20) NOT NULL,
    libelle character varying(255) NOT NULL,
    description text,
    ordre integer NOT NULL,
    type_diplome character varying(50),
    actif boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tenant_ispm.note (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    ec_id uuid,
    ue_id uuid,
    session_id uuid NOT NULL,
    valeur numeric(5,2) NOT NULL,
    type_evaluation character varying(30) DEFAULT 'examen_final'::character varying,
    absence_justifiee boolean DEFAULT false,
    mention character varying(20) GENERATED ALWAYS AS (
CASE
    WHEN (valeur >= (16)::numeric) THEN 'Très Bien'::text
    WHEN (valeur >= (14)::numeric) THEN 'Bien'::text
    WHEN (valeur >= (12)::numeric) THEN 'Assez Bien'::text
    WHEN (valeur >= (10)::numeric) THEN 'Passable'::text
    ELSE 'Insuffisant'::text
END) STORED,
    verrouille boolean DEFAULT false,
    hash_integrite character varying(128),
    saisi_par uuid NOT NULL,
    valide_par uuid,
    date_saisie timestamp with time zone DEFAULT now(),
    date_verrouillage timestamp with time zone,
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT note_check CHECK (((ec_id IS NOT NULL) OR (ue_id IS NOT NULL))),
    CONSTRAINT note_type_evaluation_check CHECK (((type_evaluation)::text = ANY ((ARRAY['examen_final'::character varying, 'controle_continu'::character varying, 'tp'::character varying, 'soutenance'::character varying, 'stage'::character varying])::text[]))),
    CONSTRAINT note_valeur_check CHECK (((valeur >= (0)::numeric) AND (valeur <= (20)::numeric)))
);

CREATE TABLE tenant_ispm.note_derogatoire (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    ec_id uuid,
    ue_id uuid,
    session_examen_id uuid,
    valeur numeric(5,2) NOT NULL,
    motif_derogation text NOT NULL,
    type_derogation character varying(50) DEFAULT 'cas_particulier'::character varying,
    est_derogatoire boolean DEFAULT true,
    soumis_a_scolarite boolean DEFAULT false,
    valide_par_scolarite uuid,
    date_validation_scolarite timestamp with time zone,
    statut character varying(20) DEFAULT 'proposee'::character varying,
    saisie_par uuid NOT NULL,
    valide_par uuid,
    date_saisie timestamp with time zone DEFAULT now(),
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE tenant_ispm.notification (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    utilisateur_id uuid NOT NULL,
    titre character varying(200) NOT NULL,
    message text NOT NULL,
    type_notification character varying(30) DEFAULT 'info'::character varying,
    lue boolean DEFAULT false,
    lue_at timestamp with time zone,
    lien character varying(500),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT notification_type_notification_check CHECK (((type_notification)::text = ANY ((ARRAY['info'::character varying, 'alerte'::character varying, 'paiement'::character varying, 'note'::character varying, 'absence'::character varying, 'discipline'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.paiement (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    inscription_id uuid NOT NULL,
    echeancier_id uuid,
    montant numeric(12,2) NOT NULL,
    mode_paiement character varying(20) NOT NULL,
    date_paiement timestamp with time zone DEFAULT now(),
    reference character varying(100),
    numero_recu character varying(50) NOT NULL,
    recu_url character varying(500),
    caissier_id uuid NOT NULL,
    statut character varying(20) DEFAULT 'valide'::character varying,
    motif_annulation text,
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT paiement_mode_paiement_check CHECK (((mode_paiement)::text = ANY ((ARRAY['especes'::character varying, 'cheque'::character varying, 'virement'::character varying, 'carte_bancaire'::character varying, 'mobile_money'::character varying])::text[]))),
    CONSTRAINT paiement_montant_check CHECK ((montant > (0)::numeric)),
    CONSTRAINT paiement_statut_check CHECK (((statut)::text = ANY ((ARRAY['valide'::character varying, 'annule'::character varying, 'rembourse'::character varying, 'en_attente'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.paiement_inscription (
    id uuid DEFAULT gen_random_uuid() CONSTRAINT paiement_inscription_id_not_null1 NOT NULL,
    inscription_id uuid NOT NULL,
    etudiant_id uuid NOT NULL,
    montant numeric(10,2) NOT NULL,
    methode_paiement character varying(50) NOT NULL,
    reference_paiement character varying(255) NOT NULL,
    date_paiement timestamp without time zone NOT NULL,
    preuve_url text,
    statut character varying(50) DEFAULT 'en_attente'::character varying,
    valide_par uuid,
    date_validation timestamp without time zone,
    note_validation text,
    motif_rejet text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_validation CHECK (((((statut)::text = 'valide'::text) AND (valide_par IS NOT NULL) AND (date_validation IS NOT NULL)) OR (((statut)::text = 'rejete'::text) AND (valide_par IS NOT NULL) AND (date_validation IS NOT NULL) AND (motif_rejet IS NOT NULL)) OR (((statut)::text = 'en_attente'::text) AND (valide_par IS NULL) AND (date_validation IS NULL)))),
    CONSTRAINT paiement_inscription_methode_paiement_check CHECK (((methode_paiement)::text = ANY ((ARRAY['virement'::character varying, 'mobile_money'::character varying, 'especes'::character varying, 'cheque'::character varying, 'carte_bancaire'::character varying])::text[]))),
    CONSTRAINT paiement_inscription_montant_check CHECK ((montant > (0)::numeric)),
    CONSTRAINT paiement_inscription_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'valide'::character varying, 'rejete'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.parcours (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    departement_id uuid NOT NULL,
    code character varying(30) NOT NULL,
    nom character varying(200) NOT NULL,
    niveau character varying(20) NOT NULL,
    duree_annees smallint DEFAULT 3 NOT NULL,
    responsable_id uuid,
    description text,
    actif boolean DEFAULT true,
    annee_ouverture integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    secretaire_id uuid,
    date_ouverture date,
    motif_ouverture text,
    conditions_ouverture text,
    date_fermeture date,
    motif_fermeture text,
    valide_par_president integer,
    CONSTRAINT parcours_niveau_check CHECK (((niveau)::text = ANY ((ARRAY['Licence'::character varying, 'Master'::character varying, 'Doctorat'::character varying, 'BTS'::character varying, 'DUT'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.permissions_portail (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type_portail character varying(20) NOT NULL,
    permission_key character varying(100) NOT NULL,
    permission_label character varying(200) NOT NULL,
    actif boolean DEFAULT true,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT permissions_portail_type_portail_check CHECK (((type_portail)::text = ANY ((ARRAY['etudiant'::character varying, 'parent'::character varying, 'enseignant'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.planning_entretien (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salle_id uuid,
    batiment_id uuid,
    zone character varying(200),
    type_nettoyage character varying(50) NOT NULL,
    responsable_id uuid,
    jour_semaine smallint,
    heure_debut time without time zone,
    duree_minutes smallint,
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT planning_entretien_jour_semaine_check CHECK (((jour_semaine >= 1) AND (jour_semaine <= 7))),
    CONSTRAINT planning_entretien_type_nettoyage_check CHECK (((type_nettoyage)::text = ANY ((ARRAY['quotidien'::character varying, 'hebdomadaire'::character varying, 'mensuel'::character varying, 'apres_evenement'::character varying, 'desinfection'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.pointage_qr (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    seance_id uuid NOT NULL,
    etudiant_id uuid NOT NULL,
    code_qr character varying(255) NOT NULL,
    date_generation timestamp without time zone DEFAULT now(),
    date_scan timestamp without time zone,
    scanne_par uuid,
    statut character varying(50) DEFAULT 'scanne'::character varying,
    localisation_scan character varying(255),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

CREATE TABLE tenant_ispm.presence (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    seance_id uuid NOT NULL,
    statut character varying(20) DEFAULT 'absent'::character varying NOT NULL,
    heure_arrivee time without time zone,
    justifie boolean DEFAULT false,
    justificatif_url character varying(500),
    motif text,
    mode_pointage character varying(20) DEFAULT 'manuel'::character varying,
    saisi_par uuid,
    valide_par uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT presence_mode_pointage_check CHECK (((mode_pointage)::text = ANY ((ARRAY['manuel'::character varying, 'qr_code'::character varying, 'badge'::character varying, 'empreinte'::character varying])::text[]))),
    CONSTRAINT presence_statut_check CHECK (((statut)::text = ANY ((ARRAY['present'::character varying, 'absent'::character varying, 'retard'::character varying, 'excuse'::character varying, 'sorti_tot'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.presence_surveillance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    seance_id uuid NOT NULL,
    date_pointage date DEFAULT CURRENT_DATE,
    heure_arrivee time without time zone,
    heure_depart time without time zone,
    statut character varying(50) DEFAULT 'present'::character varying,
    justificatif_url text,
    est_justifie boolean DEFAULT false,
    justifie_par uuid,
    date_justification timestamp without time zone,
    mode_pointage character varying(50) DEFAULT 'manuel'::character varying,
    pointe_par uuid NOT NULL,
    observations text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

CREATE TABLE tenant_ispm.proces_verbal (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_examen_id uuid NOT NULL,
    parcours_id uuid NOT NULL,
    annee_academique_id uuid NOT NULL,
    numero character varying(50) NOT NULL,
    date_deliberation date NOT NULL,
    membres_jury jsonb DEFAULT '[]'::jsonb,
    resultats jsonb DEFAULT '[]'::jsonb,
    nb_admis integer DEFAULT 0,
    nb_ajournes integer DEFAULT 0,
    nb_absents integer DEFAULT 0,
    taux_reussite numeric(5,2) DEFAULT 0,
    observations text,
    fichier_url character varying(500),
    statut character varying(20) DEFAULT 'brouillon'::character varying,
    redige_par uuid NOT NULL,
    valide_par uuid,
    date_validation timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    transmis_a_scolarite boolean DEFAULT false,
    date_transmission_scolarite timestamp without time zone,
    transmis_par character varying(255),
    CONSTRAINT proces_verbal_statut_check CHECK (((statut)::text = ANY ((ARRAY['brouillon'::character varying, 'valide'::character varying, 'archive'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.pv_deliberation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    parcours_id uuid NOT NULL,
    annee_niveau smallint NOT NULL,
    date_deliberation date DEFAULT CURRENT_DATE NOT NULL,
    president_jury uuid NOT NULL,
    membres_jury jsonb DEFAULT '[]'::jsonb,
    statut character varying(20) DEFAULT 'brouillon'::character varying,
    fichier_pv_url character varying(500),
    hash_pv character varying(128),
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT pv_deliberation_statut_check CHECK (((statut)::text = ANY ((ARRAY['brouillon'::character varying, 'signe'::character varying, 'transmis'::character varying, 'archive'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.rapport_entretien (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    planning_id uuid,
    realise_par uuid NOT NULL,
    date_realisation date DEFAULT CURRENT_DATE NOT NULL,
    heure_debut time without time zone,
    heure_fin time without time zone,
    statut character varying(20) DEFAULT 'realise'::character varying,
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT rapport_entretien_statut_check CHECK (((statut)::text = ANY ((ARRAY['realise'::character varying, 'partiel'::character varying, 'non_realise'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.rattrapage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    absence_id uuid NOT NULL,
    salle_id uuid,
    date_rattrapage date NOT NULL,
    heure_debut time without time zone NOT NULL,
    heure_fin time without time zone NOT NULL,
    observations text,
    statut character varying(20) DEFAULT 'planifie'::character varying,
    remplaceur_id uuid,
    planifie_par uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE tenant_ispm.recrutement (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    poste character varying(200) NOT NULL,
    type_contrat character varying(30) NOT NULL,
    departement_id uuid,
    description text,
    competences_requises text,
    nb_postes smallint DEFAULT 1 NOT NULL,
    date_ouverture date DEFAULT CURRENT_DATE,
    date_cloture date,
    salaire_min numeric(12,2),
    salaire_max numeric(12,2),
    statut character varying(20) DEFAULT 'ouvert'::character varying,
    responsable_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT recrutement_nb_postes_check CHECK ((nb_postes > 0)),
    CONSTRAINT recrutement_statut_check CHECK (((statut)::text = ANY ((ARRAY['ouvert'::character varying, 'en_cours'::character varying, 'cloture'::character varying, 'pourvu'::character varying, 'annule'::character varying])::text[]))),
    CONSTRAINT recrutement_type_contrat_check CHECK (((type_contrat)::text = ANY ((ARRAY['CDI'::character varying, 'CDD'::character varying, 'vacataire'::character varying, 'stagiaire'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.referentiel_competences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parcours_id uuid NOT NULL,
    code character varying(30) NOT NULL,
    intitule character varying(200) NOT NULL,
    description text,
    niveau character varying(20),
    competences jsonb DEFAULT '[]'::jsonb,
    valide_par uuid,
    date_validation timestamp with time zone,
    statut character varying(20) DEFAULT 'brouillon'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT referentiel_competences_niveau_check CHECK (((niveau)::text = ANY ((ARRAY['Licence'::character varying, 'Master'::character varying, 'Doctorat'::character varying, 'BTS'::character varying, 'DUT'::character varying])::text[]))),
    CONSTRAINT referentiel_competences_statut_check CHECK (((statut)::text = ANY ((ARRAY['brouillon'::character varying, 'valide'::character varying, 'archive'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.reservation_salle (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salle_id uuid NOT NULL,
    titre character varying(200) NOT NULL,
    description text,
    date_reservation date NOT NULL,
    heure_debut time without time zone NOT NULL,
    heure_fin time without time zone NOT NULL,
    demande_par uuid NOT NULL,
    approuve_par uuid,
    statut character varying(20) DEFAULT 'en_attente'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT reservation_salle_check CHECK ((heure_fin > heure_debut)),
    CONSTRAINT reservation_salle_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'approuvee'::character varying, 'refusee'::character varying, 'annulee'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.resultat_deliberation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pv_id uuid NOT NULL,
    etudiant_id uuid NOT NULL,
    decision character varying(30) NOT NULL,
    credits_valides smallint DEFAULT 0,
    mention_annee character varying(20),
    passage_annee_sup boolean DEFAULT false,
    observations text,
    CONSTRAINT resultat_deliberation_decision_check CHECK (((decision)::text = ANY ((ARRAY['admis'::character varying, 'ajourne'::character varying, 'ajourné_rattrap'::character varying, 'exclus'::character varying, 'abandon'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.resultat_semestre (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    etudiant_id uuid NOT NULL,
    inscription_id uuid NOT NULL,
    semestre smallint NOT NULL,
    annee_niveau smallint NOT NULL,
    moyenne_generale numeric(5,2),
    total_credits_ects smallint,
    credits_acquis smallint DEFAULT 0,
    credits_manquants smallint DEFAULT 0,
    nombre_ues smallint DEFAULT 0,
    nombre_ues_validees smallint DEFAULT 0,
    statut character varying(20) DEFAULT 'en_cours'::character varying NOT NULL,
    mention character varying(30),
    deliberation_id uuid,
    classement smallint,
    effectif_promotion smallint,
    date_validation timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT resultat_semestre_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_cours'::character varying, 'valide'::character varying, 'ajourne'::character varying, 'redoublement'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.resultat_ue (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    etudiant_id uuid NOT NULL,
    ue_id uuid NOT NULL,
    resultat_semestre_id uuid NOT NULL,
    moyenne_ue numeric(5,2),
    credits_ects smallint,
    credits_acquis boolean DEFAULT false,
    statut character varying(20) DEFAULT 'en_cours'::character varying NOT NULL,
    compensation_ue_id uuid,
    date_validation timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT resultat_ue_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_cours'::character varying, 'valide'::character varying, 'ajourne'::character varying, 'compense'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.salle (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    batiment_id uuid,
    nom character varying(100) NOT NULL,
    code character varying(20),
    capacite smallint NOT NULL,
    type_salle character varying(30) DEFAULT 'cours'::character varying NOT NULL,
    equipements jsonb DEFAULT '{}'::jsonb,
    disponible boolean DEFAULT true,
    etage smallint DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT salle_type_salle_check CHECK (((type_salle)::text = ANY ((ARRAY['cours'::character varying, 'amphitheatre'::character varying, 'laboratoire'::character varying, 'salle_info'::character varying, 'salle_reunion'::character varying, 'bibliotheque'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.secretaire_parcours (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    secretaire_id uuid NOT NULL,
    parcours_id uuid NOT NULL,
    assigned_at timestamp with time zone DEFAULT now(),
    assigned_by uuid,
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE tenant_ispm.session_examen (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    annee_academique_id uuid NOT NULL,
    libelle character varying(100) NOT NULL,
    type_session character varying(20) DEFAULT 'normale'::character varying NOT NULL,
    semestre smallint NOT NULL,
    date_debut date,
    date_fin date,
    statut character varying(20) DEFAULT 'planifie'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT session_examen_statut_check CHECK (((statut)::text = ANY ((ARRAY['planifie'::character varying, 'en_cours'::character varying, 'cloturee'::character varying, 'deliberee'::character varying])::text[]))),
    CONSTRAINT session_examen_type_session_check CHECK (((type_session)::text = ANY ((ARRAY['normale'::character varying, 'rattrapage'::character varying, 'deuxieme_chance'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.session_jwt (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    utilisateur_id uuid NOT NULL,
    refresh_token text NOT NULL,
    ip_address inet,
    user_agent text,
    expires_at timestamp with time zone NOT NULL,
    revoque boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE tenant_ispm.soutenance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    stage_id uuid NOT NULL,
    date_soutenance timestamp with time zone NOT NULL,
    salle_id uuid,
    president_jury_id uuid,
    membres_jury jsonb DEFAULT '[]'::jsonb,
    duree_minutes smallint DEFAULT 60,
    statut character varying(30) DEFAULT 'planifie'::character varying,
    note_finale numeric(5,2),
    mention character varying(30),
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT soutenance_mention_check CHECK (((mention)::text = ANY ((ARRAY['passable'::character varying, 'assez_bien'::character varying, 'bien'::character varying, 'tres_bien'::character varying, 'excellent'::character varying])::text[]))),
    CONSTRAINT soutenance_statut_check CHECK (((statut)::text = ANY ((ARRAY['planifie'::character varying, 'realise'::character varying, 'annule'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.stage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    parcours_id uuid NOT NULL,
    annee_academique_id uuid NOT NULL,
    type_stage character varying(30) NOT NULL,
    titre character varying(500) NOT NULL,
    entreprise character varying(300),
    lieu character varying(300),
    encadrant_id uuid,
    rapporteur_id uuid,
    date_debut date NOT NULL,
    date_fin date NOT NULL,
    duree_mois smallint,
    statut character varying(30) DEFAULT 'en_cours'::character varying,
    note_finale numeric(5,2),
    appreciation text,
    fichier_rapport_url character varying(500),
    date_soutenance timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT stage_check CHECK ((date_fin > date_debut)),
    CONSTRAINT stage_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_cours'::character varying, 'termine'::character varying, 'abandonne'::character varying, 'valide'::character varying])::text[]))),
    CONSTRAINT stage_type_stage_check CHECK (((type_stage)::text = ANY ((ARRAY['stage'::character varying, 'memoire'::character varying, 'projet_fin_etude'::character varying, 'these'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.stock (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reference character varying(50) NOT NULL,
    libelle character varying(200) NOT NULL,
    categorie character varying(50) NOT NULL,
    unite character varying(20) NOT NULL,
    quantite_stock numeric(10,2) DEFAULT 0 NOT NULL,
    seuil_alerte numeric(10,2) DEFAULT 0 NOT NULL,
    prix_unitaire numeric(10,2),
    fournisseur character varying(200),
    emplacement character varying(100),
    derniere_mise_a_jour timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT stock_categorie_check CHECK (((categorie)::text = ANY ((ARRAY['bureau'::character varying, 'nettoyage'::character varying, 'informatique'::character varying, 'pedagogique'::character varying, 'energie'::character varying, 'autre'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.sujet_examen (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_examen_id uuid NOT NULL,
    ue_id uuid,
    ec_id uuid,
    enseignant_id uuid NOT NULL,
    titre character varying(300) NOT NULL,
    description text,
    fichier_url character varying(500),
    duree_minutes smallint DEFAULT 120,
    bareme_total numeric(5,2) DEFAULT 20.0,
    statut character varying(20) DEFAULT 'soumis'::character varying,
    soumis_par uuid NOT NULL,
    date_soumission timestamp with time zone DEFAULT now(),
    relu_par uuid,
    date_relecture timestamp with time zone,
    valide_par uuid,
    date_validation timestamp with time zone,
    commentaires text,
    motif_rejet text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    fichier_correction_url character varying(500),
    date_depot_correction timestamp with time zone,
    CONSTRAINT sujet_examen_statut_check CHECK (((statut)::text = ANY ((ARRAY['soumis'::character varying, 'en_relecture'::character varying, 'valide'::character varying, 'rejete'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.suplement_diplome (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    diplome_id uuid NOT NULL,
    langue character varying(10) DEFAULT 'FR'::character varying,
    identite_titulaire jsonb,
    nom_diplome character varying(200) NOT NULL,
    domaine_etudes character varying(200),
    objectifs text,
    niveau_qualification character varying(100),
    duree_etudes character varying(50),
    nom_etablissement character varying(200) NOT NULL,
    statut_etablissement character varying(100),
    langue_enseignement character varying(50),
    details_programme jsonb,
    resultats_detailles jsonb,
    competences jsonb,
    systeme_educatif jsonb,
    stage jsonb,
    projet jsonb,
    certifie_par uuid,
    date_certification timestamp with time zone DEFAULT now(),
    hash_integrite character varying(128),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE tenant_ispm.support_cours (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    titre character varying(300) NOT NULL,
    description text,
    type_fichier character varying(50) NOT NULL,
    fichier_url character varying(500) NOT NULL,
    taille_fichier bigint,
    ec_id uuid,
    auteur_id uuid NOT NULL,
    date_depot timestamp with time zone DEFAULT now(),
    partage_parcours_ids uuid[] DEFAULT '{}'::uuid[],
    date_partage timestamp with time zone,
    nb_telechargements integer DEFAULT 0,
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT support_cours_type_fichier_check CHECK (((type_fichier)::text = ANY ((ARRAY['pdf'::character varying, 'docx'::character varying, 'pptx'::character varying, 'xlsx'::character varying, 'zip'::character varying, 'video'::character varying, 'autre'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.ticket_maintenance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    batiment_id uuid,
    salle_id uuid,
    titre character varying(200) NOT NULL,
    description text NOT NULL,
    type_maintenance character varying(30) DEFAULT 'curative'::character varying NOT NULL,
    priorite character varying(20) DEFAULT 'normale'::character varying,
    statut character varying(20) DEFAULT 'ouvert'::character varying,
    signale_par uuid NOT NULL,
    assigne_a uuid,
    date_signalement timestamp with time zone DEFAULT now(),
    date_resolution timestamp with time zone,
    photos_url jsonb DEFAULT '[]'::jsonb,
    cout_reparation numeric(10,2),
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT ticket_maintenance_priorite_check CHECK (((priorite)::text = ANY ((ARRAY['basse'::character varying, 'normale'::character varying, 'haute'::character varying, 'urgente'::character varying])::text[]))),
    CONSTRAINT ticket_maintenance_statut_check CHECK (((statut)::text = ANY ((ARRAY['ouvert'::character varying, 'en_cours'::character varying, 'resolu'::character varying, 'ferme'::character varying, 'annule'::character varying])::text[]))),
    CONSTRAINT ticket_maintenance_type_maintenance_check CHECK (((type_maintenance)::text = ANY ((ARRAY['preventive'::character varying, 'curative'::character varying, 'urgence'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.transfert_etudiant (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    etudiant_id uuid NOT NULL,
    etablissement_origine character varying(200) NOT NULL,
    pays_origine character varying(100),
    diplome_origine character varying(200),
    annee_obtention_origine integer,
    parcours_destination_id uuid NOT NULL,
    niveau_destination smallint NOT NULL,
    releves_notes_origine text[],
    attestations_origine text[],
    programme_origine text,
    decision_equivalence character varying(20) DEFAULT 'en_attente'::character varying NOT NULL,
    credits_reconnus smallint DEFAULT 0,
    ues_validees uuid[],
    conditions_complementaires text,
    valide_par uuid,
    date_validation timestamp with time zone,
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT transfert_etudiant_decision_equivalence_check CHECK (((decision_equivalence)::text = ANY ((ARRAY['en_attente'::character varying, 'acceptee'::character varying, 'refusee'::character varying, 'complementaire'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.unite_enseignement (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parcours_id uuid NOT NULL,
    code character varying(30) NOT NULL,
    intitule character varying(200) NOT NULL,
    credits_ects smallint DEFAULT 3 NOT NULL,
    coefficient numeric(4,2) DEFAULT 1.0 NOT NULL,
    volume_cm smallint DEFAULT 0,
    volume_td smallint DEFAULT 0,
    volume_tp smallint DEFAULT 0,
    semestre smallint NOT NULL,
    annee_niveau smallint NOT NULL,
    type_ue character varying(20) DEFAULT 'obligatoire'::character varying,
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    enseignant_id uuid,
    CONSTRAINT unite_enseignement_annee_niveau_check CHECK (((annee_niveau >= 1) AND (annee_niveau <= 8))),
    CONSTRAINT unite_enseignement_semestre_check CHECK (((semestre >= 1) AND (semestre <= 12))),
    CONSTRAINT unite_enseignement_type_ue_check CHECK (((type_ue)::text = ANY ((ARRAY['obligatoire'::character varying, 'optionnel'::character varying, 'libre'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.utilisateur (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(254) NOT NULL,
    password_hash character varying(255) NOT NULL,
    nom character varying(100) NOT NULL,
    prenom character varying(100) NOT NULL,
    telephone character varying(30),
    photo_url character varying(500),
    role character varying(50) NOT NULL,
    actif boolean DEFAULT true,
    email_verifie boolean DEFAULT false,
    derniere_connexion timestamp with time zone,
    token_reset text,
    token_reset_expiry timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    tenant_id uuid,
    parcours_assignes jsonb DEFAULT '[]'::jsonb,
    password_reset_required boolean DEFAULT false,
    last_password_reset timestamp with time zone,
    CONSTRAINT utilisateur_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'resp_pedagogique'::character varying, 'secretaire_parcours'::character varying, 'scolarite'::character varying, 'caissier'::character varying, 'economat'::character varying, 'rh'::character varying, 'logistique'::character varying, 'entretien'::character varying, 'communication'::character varying, 'president'::character varying, 'surveillant_general'::character varying, 'etudiant'::character varying, 'parent'::character varying, 'enseignant'::character varying])::text[])))
);

CREATE TABLE tenant_ispm.verrouillage_notes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    deliberation_id uuid NOT NULL,
    etudiant_id uuid NOT NULL,
    session_examen_id uuid NOT NULL,
    statut character varying(20) DEFAULT 'deverrouille'::character varying NOT NULL,
    date_verrouillage timestamp with time zone,
    verrouille_par uuid,
    autorisation_modif boolean DEFAULT false,
    motif_autorisation text,
    autorise_par uuid,
    date_autorisation timestamp with time zone,
    date_fin_autorisation date,
    historique_modifs jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT verrouillage_notes_statut_check CHECK (((statut)::text = ANY ((ARRAY['deverrouille'::character varying, 'verrouille'::character varying, 'modification_autorisee'::character varying])::text[])))
);


-- ============================================================
-- TABLES : schéma [tenant_universite_d_antsiranana]
-- ============================================================

CREATE TABLE tenant_universite_d_antsiranana.absence_enseignant (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    enseignant_id uuid NOT NULL,
    seance_id uuid,
    date_absence date NOT NULL,
    heure_debut time without time zone,
    heure_fin time without time zone,
    motif character varying(100) NOT NULL,
    justification text,
    justificatif_url character varying(500),
    est_justifiee boolean DEFAULT false,
    statut character varying(20) DEFAULT 'declaree'::character varying,
    declaree_par uuid NOT NULL,
    validee_par uuid,
    date_validation timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT absence_enseignant_motif_check CHECK (((motif)::text = ANY ((ARRAY['maladie'::character varying, 'formation'::character varying, 'congres'::character varying, 'personnel'::character varying, 'autre'::character varying])::text[]))),
    CONSTRAINT absence_enseignant_statut_check CHECK (((statut)::text = ANY ((ARRAY['declaree'::character varying, 'validee'::character varying, 'refusee'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.affectation_cours (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    enseignant_id uuid NOT NULL,
    ue_id uuid,
    ec_id uuid,
    annee_academique_id uuid NOT NULL,
    type_seance character varying(10) DEFAULT 'CM'::character varying NOT NULL,
    volume_prevu smallint DEFAULT 0 NOT NULL,
    volume_realise smallint DEFAULT 0,
    valide_par uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT affectation_cours_check CHECK (((ue_id IS NOT NULL) OR (ec_id IS NOT NULL))),
    CONSTRAINT affectation_cours_type_seance_check CHECK (((type_seance)::text = ANY ((ARRAY['CM'::character varying, 'TD'::character varying, 'TP'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.alerte_discipline (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    type character varying(100) NOT NULL,
    message text NOT NULL,
    statut character varying(50) DEFAULT 'non_lue'::character varying,
    generee_par uuid NOT NULL,
    destinataire_role character varying(100) DEFAULT 'secretariat'::character varying,
    date_lecture timestamp without time zone,
    traitee_par uuid,
    date_traitement timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT alerte_discipline_statut_check CHECK (((statut)::text = ANY ((ARRAY['non_lue'::character varying, 'lue'::character varying, 'traitee'::character varying])::text[]))),
    CONSTRAINT alerte_discipline_type_check CHECK (((type)::text = ANY ((ARRAY['absence_repetee'::character varying, 'retard_cumule'::character varying, 'sanction_grave'::character varying, 'incident_critique'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.annee_academique (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    libelle character varying(20) NOT NULL,
    date_debut date NOT NULL,
    date_fin date NOT NULL,
    active boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE tenant_universite_d_antsiranana.annonce (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    titre character varying(300) NOT NULL,
    contenu text NOT NULL,
    type_annonce character varying(30) DEFAULT 'information'::character varying,
    cible character varying(20) DEFAULT 'tous'::character varying,
    parcours_id uuid,
    publie boolean DEFAULT false,
    date_publication timestamp with time zone,
    date_expiration timestamp with time zone,
    auteur_id uuid NOT NULL,
    photo_url character varying(500),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT annonce_cible_check CHECK (((cible)::text = ANY ((ARRAY['tous'::character varying, 'etudiants'::character varying, 'parents'::character varying, 'professeurs'::character varying, 'personnel'::character varying, 'parcours'::character varying])::text[]))),
    CONSTRAINT annonce_type_annonce_check CHECK (((type_annonce)::text = ANY ((ARRAY['information'::character varying, 'urgent'::character varying, 'evenement'::character varying, 'resultat'::character varying, 'pastoral'::character varying, 'fermeture'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.attestation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    type_attestation character varying(50) NOT NULL,
    statut character varying(20) DEFAULT 'en_attente'::character varying NOT NULL,
    numero_document character varying(50),
    annee_academique character varying(20),
    parcours_id uuid,
    fichier_pdf_url character varying(500),
    date_demande date DEFAULT CURRENT_DATE,
    date_delivrance date,
    demande_par uuid NOT NULL,
    traite_par uuid,
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT chk_attestation_statut CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'en_preparation'::character varying, 'delivre'::character varying, 'refuse'::character varying, 'archive'::character varying])::text[]))),
    CONSTRAINT chk_attestation_type CHECK (((type_attestation)::text = ANY ((ARRAY['inscription'::character varying, 'scolarite'::character varying, 'reussite'::character varying, 'presence'::character varying, 'stage'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.autorisation_sortie (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    type character varying(100) NOT NULL,
    date_debut timestamp without time zone NOT NULL,
    date_fin timestamp without time zone NOT NULL,
    motif text NOT NULL,
    demande_par uuid NOT NULL,
    est_mineur boolean DEFAULT false,
    autorisation_parentale_url text,
    statut character varying(50) DEFAULT 'en_attente'::character varying,
    validee_par uuid,
    date_validation timestamp without time zone,
    motif_refus text,
    observations text,
    sortie_effective boolean DEFAULT false,
    heure_sortie time without time zone,
    heure_retour time without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT autorisation_sortie_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'approuvee'::character varying, 'refusee'::character varying, 'annulee'::character varying])::text[]))),
    CONSTRAINT autorisation_sortie_type_check CHECK (((type)::text = ANY ((ARRAY['sortie_anticipee'::character varying, 'absence_prevue'::character varying, 'sortie_exceptionnelle'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.batiment (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nom character varying(100) NOT NULL,
    code character varying(20),
    adresse text,
    actif boolean DEFAULT true
);

CREATE TABLE tenant_universite_d_antsiranana.budget (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    annee_academique_id uuid NOT NULL,
    departement_id uuid,
    categorie character varying(100) NOT NULL,
    montant_prevu numeric(15,2) NOT NULL,
    montant_realise numeric(15,2) DEFAULT 0,
    description text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE tenant_universite_d_antsiranana.calendrier_academique (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    annee_academique_id uuid NOT NULL,
    evenement character varying(200) NOT NULL,
    type_evenement character varying(50) NOT NULL,
    date_debut date NOT NULL,
    date_fin date NOT NULL,
    parcours_id uuid,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    valide_par_president integer,
    valide_le timestamp without time zone,
    commentaire_president text,
    CONSTRAINT calendrier_academique_type_evenement_check CHECK (((type_evenement)::text = ANY ((ARRAY['rentree'::character varying, 'cours'::character varying, 'vacances'::character varying, 'examens'::character varying, 'deliberation'::character varying, 'ceremonie'::character varying, 'pastoral'::character varying, 'autre'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.candidature (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recrutement_id uuid NOT NULL,
    nom character varying(100) NOT NULL,
    prenom character varying(100) NOT NULL,
    email character varying(254) NOT NULL,
    telephone character varying(30),
    cv_url character varying(500),
    lettre_motivation_url character varying(500),
    statut character varying(20) DEFAULT 'recue'::character varying,
    notes_evaluation text,
    date_entretien timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT candidature_statut_check CHECK (((statut)::text = ANY ((ARRAY['recue'::character varying, 'preselectionne'::character varying, 'entretien'::character varying, 'retenu'::character varying, 'refuse'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.cloture_caisse (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    date_cloture date NOT NULL,
    caissier_id uuid NOT NULL,
    total_especes numeric(12,2) DEFAULT 0,
    total_cheques numeric(12,2) DEFAULT 0,
    total_virements numeric(12,2) DEFAULT 0,
    total_carte_bancaire numeric(12,2) DEFAULT 0,
    total_mobile_money numeric(12,2) DEFAULT 0,
    total_general numeric(12,2) DEFAULT 0,
    nombre_paiements integer DEFAULT 0,
    details_paiements jsonb DEFAULT '{"autres": {"nombre": 0, "montant": 0}, "scolarite": {"nombre": 0, "montant": 0}, "inscription": {"nombre": 0, "montant": 0}}'::jsonb,
    solde_banque_theorique numeric(12,2),
    solde_banque_reel numeric(12,2),
    ecart numeric(12,2),
    motif_ecart text,
    valide boolean DEFAULT false,
    valide_par uuid,
    date_validation timestamp with time zone,
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE tenant_universite_d_antsiranana.configuration_examen (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_examen_id uuid NOT NULL,
    salle_id uuid NOT NULL,
    places_total integer DEFAULT 0,
    places_attribuees integer DEFAULT 0,
    plan_places jsonb DEFAULT '[]'::jsonb,
    surveillant_id uuid NOT NULL,
    statut character varying(50) DEFAULT 'preparation'::character varying,
    rapport_incident text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT configuration_examen_statut_check CHECK (((statut)::text = ANY ((ARRAY['preparation'::character varying, 'en_cours'::character varying, 'termine'::character varying, 'incident'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.conge_personnel (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    utilisateur_id uuid NOT NULL,
    type_conge character varying(50) NOT NULL,
    date_debut date NOT NULL,
    date_fin date NOT NULL,
    nb_jours smallint GENERATED ALWAYS AS (((date_fin - date_debut) + 1)) STORED,
    motif text,
    statut character varying(20) DEFAULT 'demande'::character varying,
    approuve_par uuid,
    date_approbation timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT conge_personnel_statut_check CHECK (((statut)::text = ANY ((ARRAY['demande'::character varying, 'approuve'::character varying, 'refuse'::character varying, 'annule'::character varying])::text[]))),
    CONSTRAINT conge_personnel_type_conge_check CHECK (((type_conge)::text = ANY ((ARRAY['annuel'::character varying, 'maladie'::character varying, 'maternite'::character varying, 'paternite'::character varying, 'sans_solde'::character varying, 'autre'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.conseil_discipline (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    date_conseil timestamp without time zone NOT NULL,
    motif_convocation text NOT NULL,
    incidents_lies jsonb DEFAULT '[]'::jsonb,
    membres_presents jsonb DEFAULT '[]'::jsonb,
    deliberation text,
    decision character varying(100),
    justification_decision text,
    droit_appel boolean DEFAULT true,
    delai_appel_jours integer DEFAULT 15,
    statut character varying(50) DEFAULT 'convoque'::character varying,
    proces_verbal_url text,
    parent_present boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    decision_president character varying(50),
    motivation text,
    duree_suspension integer,
    mesures_accompagnement text,
    statue_le timestamp without time zone,
    statue_par integer,
    CONSTRAINT conseil_discipline_decision_check CHECK (((decision)::text = ANY ((ARRAY['aucune_sanction'::character varying, 'avertissement'::character varying, 'blame'::character varying, 'exclusion_temporaire'::character varying, 'exclusion_definitive'::character varying, 'renvoi'::character varying])::text[]))),
    CONSTRAINT conseil_discipline_statut_check CHECK (((statut)::text = ANY ((ARRAY['convoque'::character varying, 'tenu'::character varying, 'reporte'::character varying, 'annule'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.contrat_personnel (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    utilisateur_id uuid NOT NULL,
    type_contrat character varying(30) NOT NULL,
    poste character varying(200) NOT NULL,
    departement_id uuid,
    date_debut date NOT NULL,
    date_fin date,
    salaire_brut numeric(12,2),
    salaire_net numeric(12,2),
    volume_horaire_hebdo smallint,
    actif boolean DEFAULT true,
    fichier_contrat_url character varying(500),
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    valide_par integer,
    valide_le timestamp without time zone,
    commentaire_president text,
    conditions_speciales text,
    CONSTRAINT contrat_personnel_type_contrat_check CHECK (((type_contrat)::text = ANY ((ARRAY['CDI'::character varying, 'CDD'::character varying, 'vacataire'::character varying, 'stagiaire'::character varying, 'benevolat'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.convention (
    id integer NOT NULL,
    intitule character varying(255) NOT NULL,
    partenaire character varying(255) NOT NULL,
    type_partenaire character varying(50) NOT NULL,
    objet_convention text NOT NULL,
    date_proposee date NOT NULL,
    document_url text,
    statut character varying(50) DEFAULT 'en_attente_signature'::character varying NOT NULL,
    signe_president boolean DEFAULT false,
    date_signature timestamp without time zone,
    signature_hash character varying(255),
    representant_partenaire character varying(255),
    date_effet date,
    remarques_president text,
    cree_par integer,
    cree_le timestamp without time zone DEFAULT now(),
    modifie_le timestamp without time zone DEFAULT now(),
    CONSTRAINT convention_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente_signature'::character varying, 'signee'::character varying, 'rejetee'::character varying, 'expiree'::character varying])::text[]))),
    CONSTRAINT convention_type_partenaire_check CHECK (((type_partenaire)::text = ANY ((ARRAY['eglise'::character varying, 'diocese'::character varying, 'etat'::character varying, 'entreprise'::character varying, 'universite'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.convocation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid,
    session_examen_id uuid,
    soutenance_id uuid,
    type character varying(50) NOT NULL,
    libelle character varying(200) NOT NULL,
    message text,
    date_convocation date NOT NULL,
    heure_convocation time without time zone,
    lieu character varying(200),
    salle_id uuid,
    statut character varying(20) DEFAULT 'brouillon'::character varying,
    date_envoi timestamp with time zone,
    date_lecture timestamp with time zone,
    date_confirmation timestamp with time zone,
    genere_par uuid NOT NULL,
    fichier_url character varying(500),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT convocation_statut_check CHECK (((statut)::text = ANY ((ARRAY['brouillon'::character varying, 'envoyee'::character varying, 'lue'::character varying, 'confirme'::character varying, 'annule'::character varying])::text[]))),
    CONSTRAINT convocation_type_check CHECK (((type)::text = ANY ((ARRAY['examen'::character varying, 'rattrapage'::character varying, 'soutenance'::character varying, 'reunion'::character varying, 'conseil_discipline'::character varying, 'autre'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.declaration_sociale (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type_declaration character varying(50) NOT NULL,
    periode_debut date NOT NULL,
    periode_fin date NOT NULL,
    organisme character varying(200) NOT NULL,
    montant_total_cotisations numeric(12,2) DEFAULT 0 NOT NULL,
    nb_salaries smallint DEFAULT 0 NOT NULL,
    statut character varying(20) DEFAULT 'preparation'::character varying,
    date_transmission timestamp with time zone,
    date_paiement timestamp with time zone,
    fichier_export_url character varying(500),
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT declaration_sociale_statut_check CHECK (((statut)::text = ANY ((ARRAY['preparation'::character varying, 'validee'::character varying, 'transmise'::character varying, 'payee'::character varying])::text[]))),
    CONSTRAINT declaration_sociale_type_declaration_check CHECK (((type_declaration)::text = ANY ((ARRAY['URSSAF'::character varying, 'MSA'::character varying, 'retraite'::character varying, 'prevoyance'::character varying, 'mutuelle'::character varying, 'autre'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.delegation_signature (
    id integer NOT NULL,
    delegataire_id integer NOT NULL,
    types_actes text[] NOT NULL,
    date_debut date NOT NULL,
    date_fin date NOT NULL,
    conditions text,
    revoquee boolean DEFAULT false,
    revoquee_le timestamp without time zone,
    revoquee_par integer,
    cree_par integer NOT NULL,
    cree_le timestamp without time zone DEFAULT now(),
    CONSTRAINT check_dates CHECK ((date_fin > date_debut))
);

CREATE TABLE tenant_universite_d_antsiranana.demande_etudiant (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    type_demande character varying(50) NOT NULL,
    description text NOT NULL,
    justification text,
    piece_jointe_url character varying(500),
    date_soumission date DEFAULT CURRENT_DATE NOT NULL,
    statut character varying(20) DEFAULT 'soumise'::character varying,
    reponse text,
    traite_par uuid,
    date_traitement timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT demande_etudiant_statut_check CHECK (((statut)::text = ANY ((ARRAY['soumise'::character varying, 'en_traitement'::character varying, 'acceptee'::character varying, 'refusee'::character varying, 'completee'::character varying])::text[]))),
    CONSTRAINT demande_etudiant_type_demande_check CHECK (((type_demande)::text = ANY ((ARRAY['certificat_scolarite'::character varying, 'attestation'::character varying, 'report_examen'::character varying, 'dispense'::character varying, 'changement_parcours'::character varying, 'autre'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.demande_ressource (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type_ressource character varying(50) NOT NULL,
    date_souhaitee date NOT NULL,
    heure_debut time without time zone,
    heure_fin time without time zone,
    motif text NOT NULL,
    nb_participants smallint,
    materiel_requis text,
    demandeur_id uuid NOT NULL,
    statut character varying(30) DEFAULT 'soumise'::character varying,
    traite_par uuid,
    date_traitement timestamp with time zone,
    commentaire_rejet text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT demande_ressource_statut_check CHECK (((statut)::text = ANY ((ARRAY['soumise'::character varying, 'en_cours'::character varying, 'approuvee'::character varying, 'rejetee'::character varying, 'livree'::character varying])::text[]))),
    CONSTRAINT demande_ressource_type_ressource_check CHECK (((type_ressource)::text = ANY ((ARRAY['salle'::character varying, 'materiel'::character varying, 'laboratoire'::character varying, 'equipement'::character varying, 'autre'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.departement (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(20) NOT NULL,
    nom character varying(200) NOT NULL,
    description text,
    responsable_id uuid,
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE tenant_universite_d_antsiranana.depense (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    budget_id uuid,
    annee_academique_id uuid NOT NULL,
    libelle character varying(300) NOT NULL,
    montant numeric(12,2) NOT NULL,
    categorie character varying(100),
    date_depense date DEFAULT CURRENT_DATE NOT NULL,
    fournisseur character varying(200),
    numero_facture character varying(100),
    facture_url character varying(500),
    statut character varying(20) DEFAULT 'en_attente'::character varying,
    demande_par uuid,
    approuve_par uuid,
    date_approbation timestamp with time zone,
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    valide_par_president integer,
    valide_le timestamp without time zone,
    motif_decision text,
    conditions_speciales text,
    CONSTRAINT depense_montant_check CHECK ((montant > (0)::numeric)),
    CONSTRAINT depense_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'approuve'::character varying, 'paye'::character varying, 'rejete'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.diplome (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    parcours_id uuid NOT NULL,
    annee_academique_id uuid NOT NULL,
    numero_diplome character varying(50) NOT NULL,
    type_diplome character varying(50) NOT NULL,
    mention character varying(20),
    date_obtention date NOT NULL,
    moyenne_generale numeric(5,2),
    credits_obtenus smallint,
    fichier_url character varying(500),
    hash_document character varying(128) NOT NULL,
    signe_par uuid NOT NULL,
    signature_url character varying(500),
    date_signature timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    signe_president boolean DEFAULT false,
    signature_hash character varying(255),
    mention_speciale text,
    CONSTRAINT diplome_type_diplome_check CHECK (((type_diplome)::text = ANY ((ARRAY['Licence'::character varying, 'Master'::character varying, 'Doctorat'::character varying, 'BTS'::character varying, 'DUT'::character varying, 'Certificat'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.dossier_etudiant (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    type_document character varying(50) NOT NULL,
    libelle character varying(200) NOT NULL,
    fichier_url character varying(500) NOT NULL,
    reference character varying(100),
    date_demande date,
    date_delivrance date,
    statut character varying(20) DEFAULT 'en_attente'::character varying,
    motif_refus text,
    demande_par uuid,
    traite_par uuid,
    est_archive boolean DEFAULT false,
    date_archivage date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT dossier_etudiant_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'en_preparation'::character varying, 'delivre'::character varying, 'refuse'::character varying, 'archive'::character varying])::text[]))),
    CONSTRAINT dossier_etudiant_type_document_check CHECK (((type_document)::text = ANY ((ARRAY['certificat_scolarite'::character varying, 'attestation_inscription'::character varying, 'releve_notes'::character varying, 'copie_diplome'::character varying, 'carte_etudiant'::character varying, 'certificat_medical'::character varying, 'piece_identite'::character varying, 'photo'::character varying, 'autre'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.echeancier (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    inscription_id uuid NOT NULL,
    num_tranche smallint NOT NULL,
    montant_du numeric(12,2) NOT NULL,
    date_echeance date NOT NULL,
    statut character varying(20) DEFAULT 'en_attente'::character varying,
    CONSTRAINT echeancier_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'paye'::character varying, 'en_retard'::character varying, 'annule'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.element_constitutif (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ue_id uuid NOT NULL,
    code character varying(30) NOT NULL,
    intitule character varying(200) NOT NULL,
    coefficient numeric(4,2) DEFAULT 1.0 NOT NULL,
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE tenant_universite_d_antsiranana.emploi_du_temps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    annee_academique_id uuid NOT NULL,
    affectation_id uuid NOT NULL,
    salle_id uuid,
    date_seance date NOT NULL,
    heure_debut time without time zone NOT NULL,
    heure_fin time without time zone NOT NULL,
    type_seance character varying(10) DEFAULT 'CM'::character varying NOT NULL,
    statut character varying(20) DEFAULT 'planifie'::character varying,
    motif_annulation text,
    created_by_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT emploi_du_temps_check CHECK ((heure_fin > heure_debut)),
    CONSTRAINT emploi_du_temps_statut_check CHECK (((statut)::text = ANY ((ARRAY['planifie'::character varying, 'realise'::character varying, 'annule'::character varying, 'reporte'::character varying])::text[]))),
    CONSTRAINT emploi_du_temps_type_seance_check CHECK (((type_seance)::text = ANY ((ARRAY['CM'::character varying, 'TD'::character varying, 'TP'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.enseignant (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    utilisateur_id uuid,
    matricule character varying(30) NOT NULL,
    nom character varying(100) NOT NULL,
    prenom character varying(100) NOT NULL,
    titre character varying(50),
    grade character varying(50),
    specialite character varying(200),
    type_contrat character varying(20) DEFAULT 'permanent'::character varying NOT NULL,
    departement_id uuid,
    email character varying(254),
    telephone character varying(30),
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT enseignant_type_contrat_check CHECK (((type_contrat)::text = ANY ((ARRAY['permanent'::character varying, 'vacataire'::character varying, 'hdr'::character varying, 'invite'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.etudiant (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    utilisateur_id uuid,
    matricule character varying(30) NOT NULL,
    nom character varying(100) NOT NULL,
    prenom character varying(100) NOT NULL,
    date_naissance date NOT NULL,
    lieu_naissance character varying(100),
    sexe character(1),
    nationalite character varying(100) DEFAULT 'Malagasy'::character varying,
    adresse text,
    telephone character varying(30),
    email character varying(254),
    nom_parent character varying(200),
    telephone_parent character varying(30),
    email_parent character varying(254),
    religion character varying(50),
    situation_familiale character varying(30),
    photo_url character varying(500),
    dossier_medical_url character varying(500),
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT etudiant_sexe_check CHECK ((sexe = ANY (ARRAY['M'::bpchar, 'F'::bpchar])))
);

CREATE TABLE tenant_universite_d_antsiranana.evaluation_personnel (
    id integer NOT NULL,
    utilisateur_id uuid NOT NULL,
    evaluateur_id uuid NOT NULL,
    date_evaluation date NOT NULL,
    periode character varying(50) NOT NULL,
    annee_evaluation integer,
    note_globale numeric(3,2),
    competences_techniques numeric(3,2),
    competences_relationnelles numeric(3,2),
    assiduite numeric(3,2),
    initiative numeric(3,2),
    commentaires text,
    objectifs_atteints text,
    axes_amelioration text,
    auto_evaluation text,
    date_auto_evaluation timestamp without time zone,
    statut character varying(50) DEFAULT 'planifiee'::character varying,
    cree_par integer,
    cree_le timestamp without time zone DEFAULT now(),
    modifie_le timestamp without time zone DEFAULT now(),
    CONSTRAINT evaluation_personnel_assiduite_check CHECK (((assiduite >= (0)::numeric) AND (assiduite <= (5)::numeric))),
    CONSTRAINT evaluation_personnel_competences_relationnelles_check CHECK (((competences_relationnelles >= (0)::numeric) AND (competences_relationnelles <= (5)::numeric))),
    CONSTRAINT evaluation_personnel_competences_techniques_check CHECK (((competences_techniques >= (0)::numeric) AND (competences_techniques <= (5)::numeric))),
    CONSTRAINT evaluation_personnel_initiative_check CHECK (((initiative >= (0)::numeric) AND (initiative <= (5)::numeric))),
    CONSTRAINT evaluation_personnel_note_globale_check CHECK (((note_globale >= (0)::numeric) AND (note_globale <= (5)::numeric))),
    CONSTRAINT evaluation_personnel_statut_check CHECK (((statut)::text = ANY ((ARRAY['planifiee'::character varying, 'en_cours'::character varying, 'auto_evalue'::character varying, 'terminee'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.evaluation_soutenance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    soutenance_id uuid NOT NULL,
    evaluateur_id uuid NOT NULL,
    note numeric(5,2) NOT NULL,
    appreciation text,
    date_evaluation timestamp with time zone DEFAULT now(),
    CONSTRAINT evaluation_soutenance_note_check CHECK (((note >= (0)::numeric) AND (note <= (20)::numeric)))
);

CREATE TABLE tenant_universite_d_antsiranana.fiche_paie (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contrat_id uuid NOT NULL,
    annee smallint NOT NULL,
    mois smallint NOT NULL,
    salaire_brut numeric(12,2) NOT NULL,
    cotisations numeric(12,2) DEFAULT 0,
    primes numeric(12,2) DEFAULT 0,
    retenues numeric(12,2) DEFAULT 0,
    net_a_payer numeric(12,2) NOT NULL,
    heures_supp numeric(6,2) DEFAULT 0,
    montant_heures_supp numeric(12,2) DEFAULT 0,
    statut character varying(20) DEFAULT 'brouillon'::character varying,
    fichier_url character varying(500),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT fiche_paie_mois_check CHECK (((mois >= 1) AND (mois <= 12))),
    CONSTRAINT fiche_paie_statut_check CHECK (((statut)::text = ANY ((ARRAY['brouillon'::character varying, 'valide'::character varying, 'paye'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.fiche_suivi_stage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    stage_id uuid NOT NULL,
    date_rencontre date NOT NULL,
    travail_effectue text NOT NULL,
    observations text,
    note_avancement numeric(5,2),
    auteur_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT fiche_suivi_stage_note_avancement_check CHECK (((note_avancement >= (0)::numeric) AND (note_avancement <= (20)::numeric)))
);

CREATE TABLE tenant_universite_d_antsiranana.frais_inscription (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parcours_id uuid NOT NULL,
    annee_academique_id uuid NOT NULL,
    montant_inscription numeric(10,2) DEFAULT 0 NOT NULL,
    montant_scolarite numeric(10,2) DEFAULT 0,
    montant_total numeric(10,2) NOT NULL,
    description text,
    actif boolean DEFAULT true,
    date_limite_paiement date,
    modalites_paiement jsonb DEFAULT '{"cheque": true, "especes": true, "virement": true, "echelonnement": false, "carte_bancaire": true}'::jsonb,
    cree_par uuid,
    modifie_par uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE tenant_universite_d_antsiranana.grille_tarifaire (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parcours_id uuid NOT NULL,
    annee_academique_id uuid NOT NULL,
    annee_niveau smallint,
    montant_total numeric(12,2) NOT NULL,
    nb_tranches smallint DEFAULT 1,
    description text,
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    montant_inscription numeric(12,2) DEFAULT 0,
    montant_scolarite numeric(12,2) DEFAULT 0,
    date_limite_paiement date,
    modalites_paiement jsonb
);

CREATE TABLE tenant_universite_d_antsiranana.heure_complementaire (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    enseignant_id uuid NOT NULL,
    date_travail date NOT NULL,
    nb_heures numeric(5,2) NOT NULL,
    taux_horaire numeric(10,2) NOT NULL,
    motif text,
    statut character varying(20) DEFAULT 'saisie'::character varying,
    valide_par uuid,
    date_validation timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT heure_complementaire_nb_heures_check CHECK ((nb_heures > (0)::numeric)),
    CONSTRAINT heure_complementaire_statut_check CHECK (((statut)::text = ANY ((ARRAY['saisie'::character varying, 'valide'::character varying, 'refuse'::character varying, 'paye'::character varying])::text[]))),
    CONSTRAINT heure_complementaire_taux_horaire_check CHECK ((taux_horaire > (0)::numeric))
);

CREATE TABLE tenant_universite_d_antsiranana.incident_disciplinaire (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    date_incident date DEFAULT CURRENT_DATE NOT NULL,
    type_incident character varying(50) NOT NULL,
    description text NOT NULL,
    sanction character varying(100),
    duree_sanction integer,
    statut character varying(20) DEFAULT 'ouvert'::character varying,
    rapporte_par uuid NOT NULL,
    arbitre_par uuid,
    date_cloture date,
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT incident_disciplinaire_statut_check CHECK (((statut)::text = ANY ((ARRAY['ouvert'::character varying, 'en_cours'::character varying, 'clos'::character varying, 'arbitrage'::character varying])::text[]))),
    CONSTRAINT incident_disciplinaire_type_incident_check CHECK (((type_incident)::text = ANY ((ARRAY['retard'::character varying, 'absenteisme'::character varying, 'incivilite'::character varying, 'triche'::character varying, 'violence'::character varying, 'autre'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.inscription (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    parcours_id uuid NOT NULL,
    annee_academique_id uuid NOT NULL,
    annee_niveau smallint NOT NULL,
    type_inscription character varying(20) DEFAULT 'premiere'::character varying NOT NULL,
    statut character varying(20) DEFAULT 'en_attente'::character varying NOT NULL,
    numero_carte character varying(30),
    date_inscription date DEFAULT CURRENT_DATE,
    bourse boolean DEFAULT false,
    type_bourse character varying(100),
    montant_bourse numeric(10,2),
    observations text,
    validee_par uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT inscription_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'validee'::character varying, 'annulee'::character varying, 'abandonnee'::character varying])::text[]))),
    CONSTRAINT inscription_type_inscription_check CHECK (((type_inscription)::text = ANY ((ARRAY['premiere'::character varying, 'reinscription'::character varying, 'transfert'::character varying, 'equivalence'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.message (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    expediteur_id uuid NOT NULL,
    destinataire_id uuid NOT NULL,
    sujet character varying(300),
    contenu text NOT NULL,
    lu boolean DEFAULT false,
    lu_at timestamp with time zone,
    parent_id uuid,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE tenant_universite_d_antsiranana.mouvement_stock (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    stock_id uuid NOT NULL,
    type_mouvement character varying(20) NOT NULL,
    quantite numeric(10,2) NOT NULL,
    motif character varying(200),
    reference_doc character varying(100),
    utilisateur_id uuid,
    date_mouvement timestamp with time zone DEFAULT now(),
    CONSTRAINT mouvement_stock_type_mouvement_check CHECK (((type_mouvement)::text = ANY ((ARRAY['entree'::character varying, 'sortie'::character varying, 'ajustement'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.note (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    ec_id uuid,
    ue_id uuid,
    session_id uuid NOT NULL,
    valeur numeric(5,2) NOT NULL,
    type_evaluation character varying(30) DEFAULT 'examen_final'::character varying,
    absence_justifiee boolean DEFAULT false,
    mention character varying(20) GENERATED ALWAYS AS (
CASE
    WHEN (valeur >= (16)::numeric) THEN 'Très Bien'::text
    WHEN (valeur >= (14)::numeric) THEN 'Bien'::text
    WHEN (valeur >= (12)::numeric) THEN 'Assez Bien'::text
    WHEN (valeur >= (10)::numeric) THEN 'Passable'::text
    ELSE 'Insuffisant'::text
END) STORED,
    verrouille boolean DEFAULT false,
    hash_integrite character varying(128),
    saisi_par uuid NOT NULL,
    valide_par uuid,
    date_saisie timestamp with time zone DEFAULT now(),
    date_verrouillage timestamp with time zone,
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT note_check CHECK (((ec_id IS NOT NULL) OR (ue_id IS NOT NULL))),
    CONSTRAINT note_type_evaluation_check CHECK (((type_evaluation)::text = ANY ((ARRAY['examen_final'::character varying, 'controle_continu'::character varying, 'tp'::character varying, 'soutenance'::character varying, 'stage'::character varying])::text[]))),
    CONSTRAINT note_valeur_check CHECK (((valeur >= (0)::numeric) AND (valeur <= (20)::numeric)))
);

CREATE TABLE tenant_universite_d_antsiranana.note_derogatoire (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    ec_id uuid,
    ue_id uuid,
    session_examen_id uuid,
    valeur numeric(5,2) NOT NULL,
    motif_derogation text NOT NULL,
    type_derogation character varying(50) DEFAULT 'cas_particulier'::character varying,
    est_derogatoire boolean DEFAULT true,
    soumis_a_scolarite boolean DEFAULT false,
    valide_par_scolarite uuid,
    date_validation_scolarite timestamp with time zone,
    statut character varying(20) DEFAULT 'proposee'::character varying,
    saisie_par uuid NOT NULL,
    valide_par uuid,
    date_saisie timestamp with time zone DEFAULT now(),
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT note_derogatoire_statut_check CHECK (((statut)::text = ANY ((ARRAY['proposee'::character varying, 'soumise'::character varying, 'validee'::character varying, 'refusee'::character varying])::text[]))),
    CONSTRAINT note_derogatoire_type_derogation_check CHECK (((type_derogation)::text = ANY ((ARRAY['cas_particulier'::character varying, 'erreur_saisie'::character varying, 'rattrapage_administratif'::character varying, 'autre'::character varying])::text[]))),
    CONSTRAINT note_derogatoire_valeur_check CHECK (((valeur >= (0)::numeric) AND (valeur <= (20)::numeric)))
);

CREATE TABLE tenant_universite_d_antsiranana.notification (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    utilisateur_id uuid NOT NULL,
    titre character varying(200) NOT NULL,
    message text NOT NULL,
    type_notification character varying(30) DEFAULT 'info'::character varying,
    lue boolean DEFAULT false,
    lue_at timestamp with time zone,
    lien character varying(500),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT notification_type_notification_check CHECK (((type_notification)::text = ANY ((ARRAY['info'::character varying, 'alerte'::character varying, 'paiement'::character varying, 'note'::character varying, 'absence'::character varying, 'discipline'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.paiement (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    inscription_id uuid NOT NULL,
    echeancier_id uuid,
    montant numeric(12,2) NOT NULL,
    mode_paiement character varying(20) NOT NULL,
    date_paiement timestamp with time zone DEFAULT now(),
    reference character varying(100),
    numero_recu character varying(50) NOT NULL,
    recu_url character varying(500),
    caissier_id uuid NOT NULL,
    statut character varying(20) DEFAULT 'valide'::character varying,
    motif_annulation text,
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    type_paiement character varying(20) DEFAULT 'scolarite'::character varying,
    cloture_caisse_id uuid,
    details_paiement jsonb,
    CONSTRAINT paiement_mode_paiement_check CHECK (((mode_paiement)::text = ANY ((ARRAY['especes'::character varying, 'cheque'::character varying, 'virement'::character varying, 'carte_bancaire'::character varying, 'mobile_money'::character varying])::text[]))),
    CONSTRAINT paiement_montant_check CHECK ((montant > (0)::numeric)),
    CONSTRAINT paiement_statut_check CHECK (((statut)::text = ANY ((ARRAY['valide'::character varying, 'annule'::character varying, 'rembourse'::character varying, 'en_attente'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.parcours (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    departement_id uuid NOT NULL,
    code character varying(30) NOT NULL,
    nom character varying(200) NOT NULL,
    niveau character varying(20) NOT NULL,
    duree_annees smallint DEFAULT 3 NOT NULL,
    responsable_id uuid,
    secretaire_id uuid,
    description text,
    actif boolean DEFAULT true,
    annee_ouverture integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    date_ouverture date,
    motif_ouverture text,
    conditions_ouverture text,
    date_fermeture date,
    motif_fermeture text,
    valide_par_president integer,
    CONSTRAINT parcours_niveau_check CHECK (((niveau)::text = ANY ((ARRAY['Licence'::character varying, 'Master'::character varying, 'Doctorat'::character varying, 'BTS'::character varying, 'DUT'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.permissions_portail (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type_portail character varying(20) NOT NULL,
    permission_key character varying(100) NOT NULL,
    permission_label character varying(200) NOT NULL,
    actif boolean DEFAULT true,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT permissions_portail_type_portail_check CHECK (((type_portail)::text = ANY ((ARRAY['etudiant'::character varying, 'parent'::character varying, 'enseignant'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.planning_entretien (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salle_id uuid,
    batiment_id uuid,
    zone character varying(200),
    type_nettoyage character varying(50) NOT NULL,
    responsable_id uuid,
    jour_semaine smallint,
    heure_debut time without time zone,
    duree_minutes smallint,
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT planning_entretien_jour_semaine_check CHECK (((jour_semaine >= 1) AND (jour_semaine <= 7))),
    CONSTRAINT planning_entretien_type_nettoyage_check CHECK (((type_nettoyage)::text = ANY ((ARRAY['quotidien'::character varying, 'hebdomadaire'::character varying, 'mensuel'::character varying, 'apres_evenement'::character varying, 'desinfection'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.pointage_qr (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    seance_id uuid NOT NULL,
    etudiant_id uuid NOT NULL,
    code_qr character varying(255) NOT NULL,
    date_generation timestamp without time zone DEFAULT now(),
    date_scan timestamp without time zone,
    scanne_par uuid,
    statut character varying(50) DEFAULT 'scanne'::character varying,
    localisation_scan character varying(255),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT pointage_qr_statut_check CHECK (((statut)::text = ANY ((ARRAY['scanne'::character varying, 'manuel'::character varying, 'absent'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.presence (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    seance_id uuid NOT NULL,
    statut character varying(20) DEFAULT 'absent'::character varying NOT NULL,
    heure_arrivee time without time zone,
    justifie boolean DEFAULT false,
    justificatif_url character varying(500),
    motif text,
    mode_pointage character varying(20) DEFAULT 'manuel'::character varying,
    saisi_par uuid,
    valide_par uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT presence_mode_pointage_check CHECK (((mode_pointage)::text = ANY ((ARRAY['manuel'::character varying, 'qr_code'::character varying, 'badge'::character varying, 'empreinte'::character varying])::text[]))),
    CONSTRAINT presence_statut_check CHECK (((statut)::text = ANY ((ARRAY['present'::character varying, 'absent'::character varying, 'retard'::character varying, 'excuse'::character varying, 'sorti_tot'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.presence_surveillance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    seance_id uuid NOT NULL,
    date_pointage date DEFAULT CURRENT_DATE,
    heure_arrivee time without time zone,
    heure_depart time without time zone,
    statut character varying(50) DEFAULT 'present'::character varying,
    justificatif_url text,
    est_justifie boolean DEFAULT false,
    justifie_par uuid,
    date_justification timestamp without time zone,
    mode_pointage character varying(50) DEFAULT 'manuel'::character varying,
    pointe_par uuid NOT NULL,
    observations text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT presence_surveillance_mode_pointage_check CHECK (((mode_pointage)::text = ANY ((ARRAY['qr'::character varying, 'manuel'::character varying, 'badge'::character varying])::text[]))),
    CONSTRAINT presence_surveillance_statut_check CHECK (((statut)::text = ANY ((ARRAY['present'::character varying, 'absent'::character varying, 'retard'::character varying, 'sortie_anticipee'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.proces_verbal (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_examen_id uuid NOT NULL,
    parcours_id uuid NOT NULL,
    annee_academique_id uuid NOT NULL,
    numero character varying(50) NOT NULL,
    date_deliberation date NOT NULL,
    membres_jury jsonb DEFAULT '[]'::jsonb,
    resultats jsonb DEFAULT '[]'::jsonb,
    nb_admis integer DEFAULT 0,
    nb_ajournes integer DEFAULT 0,
    nb_absents integer DEFAULT 0,
    taux_reussite numeric(5,2) DEFAULT 0,
    observations text,
    fichier_url character varying(500),
    statut character varying(20) DEFAULT 'brouillon'::character varying,
    redige_par uuid NOT NULL,
    valide_par uuid,
    date_validation timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT proces_verbal_statut_check CHECK (((statut)::text = ANY ((ARRAY['brouillon'::character varying, 'valide'::character varying, 'archive'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.pv_deliberation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    parcours_id uuid NOT NULL,
    annee_niveau smallint NOT NULL,
    date_deliberation date DEFAULT CURRENT_DATE NOT NULL,
    president_jury uuid NOT NULL,
    membres_jury jsonb DEFAULT '[]'::jsonb,
    statut character varying(20) DEFAULT 'brouillon'::character varying,
    fichier_pv_url character varying(500),
    hash_pv character varying(128),
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT pv_deliberation_statut_check CHECK (((statut)::text = ANY ((ARRAY['brouillon'::character varying, 'signe'::character varying, 'transmis'::character varying, 'archive'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.rapport_conduite (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    periode_debut date NOT NULL,
    periode_fin date NOT NULL,
    note_comportement numeric(3,1) NOT NULL,
    note_assiduite numeric(3,1) NOT NULL,
    note_discipline numeric(3,1) NOT NULL,
    nombre_absences integer DEFAULT 0,
    nombre_retards integer DEFAULT 0,
    nombre_sanctions integer DEFAULT 0,
    appreciation_generale text NOT NULL,
    points_forts text,
    points_amelioration text,
    recommandations text,
    redige_par uuid NOT NULL,
    valide_par uuid,
    statut character varying(50) DEFAULT 'brouillon'::character varying,
    date_transmission timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT rapport_conduite_statut_check CHECK (((statut)::text = ANY ((ARRAY['brouillon'::character varying, 'valide'::character varying, 'transmis_parents'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.rapport_entretien (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    planning_id uuid,
    realise_par uuid NOT NULL,
    date_realisation date DEFAULT CURRENT_DATE NOT NULL,
    heure_debut time without time zone,
    heure_fin time without time zone,
    statut character varying(20) DEFAULT 'realise'::character varying,
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT rapport_entretien_statut_check CHECK (((statut)::text = ANY ((ARRAY['realise'::character varying, 'partiel'::character varying, 'non_realise'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.rattrapage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    absence_id uuid NOT NULL,
    salle_id uuid,
    date_rattrapage date NOT NULL,
    heure_debut time without time zone NOT NULL,
    heure_fin time without time zone NOT NULL,
    observations text,
    statut character varying(20) DEFAULT 'planifie'::character varying,
    remplaceur_id uuid,
    planifie_par uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT rattrapage_statut_check CHECK (((statut)::text = ANY ((ARRAY['planifie'::character varying, 'effectue'::character varying, 'annule'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.recrutement (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    poste character varying(200) NOT NULL,
    type_contrat character varying(30) NOT NULL,
    departement_id uuid,
    description text,
    competences_requises text,
    nb_postes smallint DEFAULT 1 NOT NULL,
    date_ouverture date DEFAULT CURRENT_DATE,
    date_cloture date,
    salaire_min numeric(12,2),
    salaire_max numeric(12,2),
    statut character varying(20) DEFAULT 'ouvert'::character varying,
    responsable_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT recrutement_nb_postes_check CHECK ((nb_postes > 0)),
    CONSTRAINT recrutement_statut_check CHECK (((statut)::text = ANY ((ARRAY['ouvert'::character varying, 'en_cours'::character varying, 'cloture'::character varying, 'pourvu'::character varying, 'annule'::character varying])::text[]))),
    CONSTRAINT recrutement_type_contrat_check CHECK (((type_contrat)::text = ANY ((ARRAY['CDI'::character varying, 'CDD'::character varying, 'vacataire'::character varying, 'stagiaire'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.referentiel_competences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parcours_id uuid NOT NULL,
    code character varying(30) NOT NULL,
    intitule character varying(200) NOT NULL,
    description text,
    niveau character varying(20),
    competences jsonb DEFAULT '[]'::jsonb,
    valide_par uuid,
    date_validation timestamp with time zone,
    statut character varying(20) DEFAULT 'brouillon'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT referentiel_competences_niveau_check CHECK (((niveau)::text = ANY ((ARRAY['Licence'::character varying, 'Master'::character varying, 'Doctorat'::character varying, 'BTS'::character varying, 'DUT'::character varying])::text[]))),
    CONSTRAINT referentiel_competences_statut_check CHECK (((statut)::text = ANY ((ARRAY['brouillon'::character varying, 'valide'::character varying, 'archive'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.reservation_salle (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salle_id uuid NOT NULL,
    titre character varying(200) NOT NULL,
    description text,
    date_reservation date NOT NULL,
    heure_debut time without time zone NOT NULL,
    heure_fin time without time zone NOT NULL,
    demande_par uuid NOT NULL,
    approuve_par uuid,
    statut character varying(20) DEFAULT 'en_attente'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT reservation_salle_check CHECK ((heure_fin > heure_debut)),
    CONSTRAINT reservation_salle_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'approuvee'::character varying, 'refusee'::character varying, 'annulee'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.resultat_deliberation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pv_id uuid NOT NULL,
    etudiant_id uuid NOT NULL,
    decision character varying(30) NOT NULL,
    credits_valides smallint DEFAULT 0,
    mention_annee character varying(20),
    passage_annee_sup boolean DEFAULT false,
    observations text,
    CONSTRAINT resultat_deliberation_decision_check CHECK (((decision)::text = ANY ((ARRAY['admis'::character varying, 'ajourne'::character varying, 'ajourné_rattrap'::character varying, 'exclus'::character varying, 'abandon'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.salle (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    batiment_id uuid,
    nom character varying(100) NOT NULL,
    code character varying(20),
    capacite smallint NOT NULL,
    type_salle character varying(30) DEFAULT 'cours'::character varying NOT NULL,
    equipements jsonb DEFAULT '{}'::jsonb,
    disponible boolean DEFAULT true,
    etage smallint DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT salle_type_salle_check CHECK (((type_salle)::text = ANY ((ARRAY['cours'::character varying, 'amphitheatre'::character varying, 'laboratoire'::character varying, 'salle_info'::character varying, 'salle_reunion'::character varying, 'bibliotheque'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.secretaire_parcours (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    secretaire_id uuid NOT NULL,
    parcours_id uuid NOT NULL,
    assigned_at timestamp with time zone DEFAULT now(),
    assigned_by uuid,
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE tenant_universite_d_antsiranana.session_examen (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    annee_academique_id uuid NOT NULL,
    libelle character varying(100) NOT NULL,
    type_session character varying(20) DEFAULT 'normale'::character varying NOT NULL,
    semestre smallint NOT NULL,
    date_debut date,
    date_fin date,
    statut character varying(20) DEFAULT 'planifie'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT session_examen_statut_check CHECK (((statut)::text = ANY ((ARRAY['planifie'::character varying, 'en_cours'::character varying, 'cloturee'::character varying, 'deliberee'::character varying])::text[]))),
    CONSTRAINT session_examen_type_session_check CHECK (((type_session)::text = ANY ((ARRAY['normale'::character varying, 'rattrapage'::character varying, 'deuxieme_chance'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.session_jwt (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    utilisateur_id uuid NOT NULL,
    refresh_token text NOT NULL,
    ip_address inet,
    user_agent text,
    expires_at timestamp with time zone NOT NULL,
    revoque boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE tenant_universite_d_antsiranana.soutenance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    stage_id uuid NOT NULL,
    date_soutenance timestamp with time zone NOT NULL,
    salle_id uuid,
    president_jury_id uuid,
    membres_jury jsonb DEFAULT '[]'::jsonb,
    duree_minutes smallint DEFAULT 60,
    statut character varying(30) DEFAULT 'planifie'::character varying,
    note_finale numeric(5,2),
    mention character varying(30),
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT soutenance_mention_check CHECK (((mention)::text = ANY ((ARRAY['passable'::character varying, 'assez_bien'::character varying, 'bien'::character varying, 'tres_bien'::character varying, 'excellent'::character varying])::text[]))),
    CONSTRAINT soutenance_statut_check CHECK (((statut)::text = ANY ((ARRAY['planifie'::character varying, 'realise'::character varying, 'annule'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.stage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    parcours_id uuid NOT NULL,
    annee_academique_id uuid NOT NULL,
    type_stage character varying(30) NOT NULL,
    titre character varying(500) NOT NULL,
    entreprise character varying(300),
    lieu character varying(300),
    encadrant_id uuid,
    rapporteur_id uuid,
    date_debut date NOT NULL,
    date_fin date NOT NULL,
    duree_mois smallint,
    statut character varying(30) DEFAULT 'en_cours'::character varying,
    note_finale numeric(5,2),
    appreciation text,
    fichier_rapport_url character varying(500),
    date_soutenance timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT stage_check CHECK ((date_fin > date_debut)),
    CONSTRAINT stage_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_cours'::character varying, 'termine'::character varying, 'abandonne'::character varying, 'valide'::character varying])::text[]))),
    CONSTRAINT stage_type_stage_check CHECK (((type_stage)::text = ANY ((ARRAY['stage'::character varying, 'memoire'::character varying, 'projet_fin_etude'::character varying, 'these'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.stock (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reference character varying(50) NOT NULL,
    libelle character varying(200) NOT NULL,
    categorie character varying(50) NOT NULL,
    unite character varying(20) NOT NULL,
    quantite_stock numeric(10,2) DEFAULT 0 NOT NULL,
    seuil_alerte numeric(10,2) DEFAULT 0 NOT NULL,
    prix_unitaire numeric(10,2),
    fournisseur character varying(200),
    emplacement character varying(100),
    derniere_mise_a_jour timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT stock_categorie_check CHECK (((categorie)::text = ANY ((ARRAY['bureau'::character varying, 'nettoyage'::character varying, 'informatique'::character varying, 'pedagogique'::character varying, 'energie'::character varying, 'autre'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.suivi_moral (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    date_entretien date NOT NULL,
    sujet character varying(255) NOT NULL,
    observations text NOT NULL,
    recommandations text,
    suivi_par uuid NOT NULL,
    parent_informe boolean DEFAULT false,
    date_information_parent timestamp without time zone,
    statut character varying(50) DEFAULT 'en_cours'::character varying,
    prochain_rdv date,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT suivi_moral_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_cours'::character varying, 'cloture'::character varying, 'suivi_requis'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.sujet_examen (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_examen_id uuid NOT NULL,
    ue_id uuid,
    ec_id uuid,
    enseignant_id uuid NOT NULL,
    titre character varying(300) NOT NULL,
    description text,
    fichier_url character varying(500),
    duree_minutes smallint DEFAULT 120,
    bareme_total numeric(5,2) DEFAULT 20.0,
    statut character varying(20) DEFAULT 'soumis'::character varying,
    soumis_par uuid NOT NULL,
    date_soumission timestamp with time zone DEFAULT now(),
    relu_par uuid,
    date_relecture timestamp with time zone,
    valide_par uuid,
    date_validation timestamp with time zone,
    commentaires text,
    motif_rejet text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    fichier_correction_url character varying(500),
    date_depot_correction timestamp with time zone,
    CONSTRAINT sujet_examen_statut_check CHECK (((statut)::text = ANY ((ARRAY['soumis'::character varying, 'en_relecture'::character varying, 'valide'::character varying, 'rejete'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.support_cours (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    titre character varying(300) NOT NULL,
    description text,
    type_fichier character varying(50) NOT NULL,
    fichier_url character varying(500) NOT NULL,
    taille_fichier bigint,
    ec_id uuid,
    auteur_id uuid NOT NULL,
    date_depot timestamp with time zone DEFAULT now(),
    partage_parcours_ids uuid[] DEFAULT '{}'::uuid[],
    date_partage timestamp with time zone,
    nb_telechargements integer DEFAULT 0,
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT support_cours_type_fichier_check CHECK (((type_fichier)::text = ANY ((ARRAY['pdf'::character varying, 'docx'::character varying, 'pptx'::character varying, 'xlsx'::character varying, 'zip'::character varying, 'video'::character varying, 'autre'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.ticket_maintenance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    batiment_id uuid,
    salle_id uuid,
    titre character varying(200) NOT NULL,
    description text NOT NULL,
    type_maintenance character varying(30) DEFAULT 'curative'::character varying NOT NULL,
    priorite character varying(20) DEFAULT 'normale'::character varying,
    statut character varying(20) DEFAULT 'ouvert'::character varying,
    signale_par uuid NOT NULL,
    assigne_a uuid,
    date_signalement timestamp with time zone DEFAULT now(),
    date_resolution timestamp with time zone,
    photos_url jsonb DEFAULT '[]'::jsonb,
    cout_reparation numeric(10,2),
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT ticket_maintenance_priorite_check CHECK (((priorite)::text = ANY ((ARRAY['basse'::character varying, 'normale'::character varying, 'haute'::character varying, 'urgente'::character varying])::text[]))),
    CONSTRAINT ticket_maintenance_statut_check CHECK (((statut)::text = ANY ((ARRAY['ouvert'::character varying, 'en_cours'::character varying, 'resolu'::character varying, 'ferme'::character varying, 'annule'::character varying])::text[]))),
    CONSTRAINT ticket_maintenance_type_maintenance_check CHECK (((type_maintenance)::text = ANY ((ARRAY['preventive'::character varying, 'curative'::character varying, 'urgence'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.unite_enseignement (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parcours_id uuid NOT NULL,
    code character varying(30) NOT NULL,
    intitule character varying(200) NOT NULL,
    credits_ects smallint DEFAULT 3 NOT NULL,
    coefficient numeric(4,2) DEFAULT 1.0 NOT NULL,
    volume_cm smallint DEFAULT 0,
    volume_td smallint DEFAULT 0,
    volume_tp smallint DEFAULT 0,
    semestre smallint NOT NULL,
    annee_niveau smallint NOT NULL,
    type_ue character varying(20) DEFAULT 'obligatoire'::character varying,
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    enseignant_id uuid,
    CONSTRAINT unite_enseignement_annee_niveau_check CHECK (((annee_niveau >= 1) AND (annee_niveau <= 8))),
    CONSTRAINT unite_enseignement_semestre_check CHECK (((semestre >= 1) AND (semestre <= 12))),
    CONSTRAINT unite_enseignement_type_ue_check CHECK (((type_ue)::text = ANY ((ARRAY['obligatoire'::character varying, 'optionnel'::character varying, 'libre'::character varying])::text[])))
);

CREATE TABLE tenant_universite_d_antsiranana.utilisateur (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(254) NOT NULL,
    password_hash character varying(255) NOT NULL,
    nom character varying(100) NOT NULL,
    prenom character varying(100) NOT NULL,
    telephone character varying(30),
    photo_url character varying(500),
    role character varying(50) NOT NULL,
    actif boolean DEFAULT true,
    email_verifie boolean DEFAULT false,
    derniere_connexion timestamp with time zone,
    token_reset text,
    token_reset_expiry timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    password_reset_required boolean DEFAULT false,
    last_password_reset timestamp with time zone,
    CONSTRAINT utilisateur_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'resp_pedagogique'::character varying, 'secretaire_parcours'::character varying, 'scolarite'::character varying, 'caissier'::character varying, 'economat'::character varying, 'rh'::character varying, 'logistique'::character varying, 'entretien'::character varying, 'communication'::character varying, 'president'::character varying, 'surveillant_general'::character varying, 'etudiant'::character varying, 'parent'::character varying, 'enseignant'::character varying])::text[])))
);


-- ============================================================
-- SÉQUENCES
-- ============================================================

CREATE SEQUENCE tenant_ispm.convention_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE tenant_ispm.delegation_signature_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE tenant_ispm.evaluation_personnel_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE tenant_ispm.seq_recu START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE tenant_universite_d_antsiranana.convention_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE tenant_universite_d_antsiranana.delegation_signature_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE tenant_universite_d_antsiranana.evaluation_personnel_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE tenant_universite_d_antsiranana.seq_recu START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

-- ============================================================
-- INDEX
-- ============================================================

CREATE INDEX idx_eval_utilisateur ON %I.evaluation_personnel(utilisateur_id)', p_schema_name);
CREATE INDEX idx_eval_evaluateur ON %I.evaluation_personnel(evaluateur_id)', p_schema_name);
CREATE INDEX idx_eval_statut ON %I.evaluation_personnel(statut)', p_schema_name);
CREATE INDEX idx_eval_annee ON %I.evaluation_personnel(annee_evaluation)', p_schema_name);
CREATE INDEX idx_eval_date ON %I.evaluation_personnel(date_evaluation)', p_schema_name);
CREATE INDEX idx_utilisateur_actif ON public.utilisateur USING btree (actif);
CREATE INDEX idx_utilisateur_email ON public.utilisateur USING btree (email);
CREATE INDEX idx_utilisateur_role ON public.utilisateur USING btree (role);
CREATE INDEX idx_absence_date ON tenant_ispm.absence_enseignant USING btree (date_absence);
CREATE INDEX idx_absence_enseignant ON tenant_ispm.absence_enseignant USING btree (enseignant_id);
CREATE INDEX idx_absence_statut ON tenant_ispm.absence_enseignant USING btree (statut);
CREATE INDEX idx_alerte_discipline_etudiant ON tenant_ispm.alerte_discipline USING btree (etudiant_id);
CREATE INDEX idx_alerte_discipline_statut ON tenant_ispm.alerte_discipline USING btree (statut);
CREATE INDEX idx_annonce_publie ON tenant_ispm.annonce USING btree (publie, date_publication);
CREATE INDEX idx_archive_annee ON tenant_ispm.archive_scolarite USING btree (annee_academique);
CREATE INDEX idx_archive_etudiant ON tenant_ispm.archive_scolarite USING btree (etudiant_id);
CREATE INDEX idx_archive_type ON tenant_ispm.archive_scolarite USING btree (type_document);
CREATE INDEX idx_attestation_etudiant ON tenant_ispm.attestation USING btree (etudiant_id);
CREATE INDEX idx_attestation_statut ON tenant_ispm.attestation USING btree (statut);
CREATE INDEX idx_candidature_email ON tenant_ispm.candidature USING btree (email);
CREATE INDEX idx_candidature_recrutement ON tenant_ispm.candidature USING btree (recrutement_id);
CREATE INDEX idx_candidature_statut ON tenant_ispm.candidature USING btree (statut);
CREATE INDEX idx_configuration_examen_salle ON tenant_ispm.configuration_examen USING btree (salle_id);
CREATE INDEX idx_configuration_examen_session ON tenant_ispm.configuration_examen USING btree (session_examen_id);
CREATE INDEX idx_convention_date_proposee ON tenant_ispm.convention USING btree (date_proposee);
CREATE INDEX idx_convention_statut ON tenant_ispm.convention USING btree (statut);
CREATE INDEX idx_convention_type_partenaire ON tenant_ispm.convention USING btree (type_partenaire);
CREATE INDEX idx_convocation_date ON tenant_ispm.convocation USING btree (date_convocation);
CREATE INDEX idx_convocation_etudiant ON tenant_ispm.convocation USING btree (etudiant_id);
CREATE INDEX idx_convocation_genere ON tenant_ispm.convocation USING btree (genere_par);
CREATE INDEX idx_convocation_session ON tenant_ispm.convocation USING btree (session_examen_id);
CREATE INDEX idx_convocation_statut ON tenant_ispm.convocation USING btree (statut);
CREATE INDEX idx_decl_sociale_periode ON tenant_ispm.declaration_sociale USING btree (periode_debut, periode_fin);
CREATE INDEX idx_decl_sociale_statut ON tenant_ispm.declaration_sociale USING btree (statut);
CREATE INDEX idx_decl_sociale_type ON tenant_ispm.declaration_sociale USING btree (type_declaration);
CREATE INDEX idx_delegation_dates ON tenant_ispm.delegation_signature USING btree (date_debut, date_fin);
CREATE INDEX idx_delegation_delegataire ON tenant_ispm.delegation_signature USING btree (delegataire_id);
CREATE INDEX idx_delegation_revoquee ON tenant_ispm.delegation_signature USING btree (revoquee);
CREATE INDEX idx_deliberation_parcours ON tenant_ispm.deliberation USING btree (parcours_id);
CREATE INDEX idx_deliberation_session ON tenant_ispm.deliberation USING btree (session_examen_id);
CREATE INDEX idx_deliberation_statut ON tenant_ispm.deliberation USING btree (statut);
CREATE INDEX idx_demande_etudiant ON tenant_ispm.demande_etudiant USING btree (etudiant_id);
CREATE INDEX idx_demande_ressource_date ON tenant_ispm.demande_ressource USING btree (date_souhaitee);
CREATE INDEX idx_demande_ressource_demandeur ON tenant_ispm.demande_ressource USING btree (demandeur_id);
CREATE INDEX idx_demande_ressource_statut ON tenant_ispm.demande_ressource USING btree (statut);
CREATE INDEX idx_demande_statut ON tenant_ispm.demande_etudiant USING btree (statut);
CREATE INDEX idx_destinataire_etudiant ON tenant_ispm.message_destinataire USING btree (etudiant_id);
CREATE INDEX idx_destinataire_lu ON tenant_ispm.message_destinataire USING btree (lu);
CREATE INDEX idx_destinataire_message ON tenant_ispm.message_destinataire USING btree (message_id);
CREATE INDEX idx_diplome_etudiant ON tenant_ispm.diplome USING btree (etudiant_id);
CREATE INDEX idx_diplome_numero ON tenant_ispm.diplome USING btree (numero_diplome);
CREATE INDEX idx_diplome_parcours ON tenant_ispm.diplome USING btree (parcours_id);
CREATE INDEX idx_diplome_statut ON tenant_ispm.diplome USING btree (statut);
CREATE INDEX idx_dossier_archive ON tenant_ispm.dossier_etudiant USING btree (est_archive);
CREATE INDEX idx_dossier_etudiant_id ON tenant_ispm.dossier_etudiant USING btree (etudiant_id);
CREATE INDEX idx_dossier_statut ON tenant_ispm.dossier_etudiant USING btree (statut);
CREATE INDEX idx_dossier_type ON tenant_ispm.dossier_etudiant USING btree (type_document);
CREATE INDEX idx_echeancier_statut ON tenant_ispm.echeancier USING btree (statut);
CREATE INDEX idx_edt_affectation ON tenant_ispm.emploi_du_temps USING btree (affectation_id);
CREATE INDEX idx_edt_date ON tenant_ispm.emploi_du_temps USING btree (date_seance);
CREATE INDEX idx_edt_salle ON tenant_ispm.emploi_du_temps USING btree (salle_id);
CREATE INDEX idx_etudiant_matricule ON tenant_ispm.etudiant USING btree (matricule);
CREATE INDEX idx_etudiant_nom ON tenant_ispm.etudiant USING btree (nom, prenom);
CREATE INDEX idx_eval_annee ON tenant_ispm.evaluation_personnel USING btree (annee_evaluation);
CREATE INDEX idx_eval_date ON tenant_ispm.evaluation_personnel USING btree (date_evaluation);
CREATE INDEX idx_eval_evaluateur ON tenant_ispm.evaluation_personnel USING btree (evaluateur_id);
CREATE INDEX idx_eval_statut ON tenant_ispm.evaluation_personnel USING btree (statut);
CREATE INDEX idx_eval_utilisateur ON tenant_ispm.evaluation_personnel USING btree (utilisateur_id);
CREATE INDEX idx_evaluation_evaluateur ON tenant_ispm.evaluation_soutenance USING btree (evaluateur_id);
CREATE INDEX idx_evaluation_soutenance ON tenant_ispm.evaluation_soutenance USING btree (soutenance_id);
CREATE INDEX idx_fiche_suivi_date ON tenant_ispm.fiche_suivi_stage USING btree (date_rencontre);
CREATE INDEX idx_fiche_suivi_stage ON tenant_ispm.fiche_suivi_stage USING btree (stage_id);
CREATE INDEX idx_heure_comp_date ON tenant_ispm.heure_complementaire USING btree (date_travail);
CREATE INDEX idx_heure_comp_enseignant ON tenant_ispm.heure_complementaire USING btree (enseignant_id);
CREATE INDEX idx_heure_comp_statut ON tenant_ispm.heure_complementaire USING btree (statut);
CREATE INDEX idx_inscription_etudiant ON tenant_ispm.inscription USING btree (etudiant_id);
CREATE INDEX idx_inscription_parcours_annee ON tenant_ispm.inscription USING btree (parcours_id, annee_academique_id);
CREATE INDEX idx_message_date ON tenant_ispm.message_enseignant USING btree (date_envoi);
CREATE INDEX idx_message_enseignant_id ON tenant_ispm.message_enseignant USING btree (enseignant_id);
CREATE INDEX idx_message_type ON tenant_ispm.message_enseignant USING btree (type_message);
CREATE INDEX idx_niveau_etude_code ON tenant_ispm.niveau_etude USING btree (code);
CREATE INDEX idx_note_derog_etudiant ON tenant_ispm.note_derogatoire USING btree (etudiant_id);
CREATE INDEX idx_note_derog_statut ON tenant_ispm.note_derogatoire USING btree (statut);
CREATE INDEX idx_note_ec ON tenant_ispm.note USING btree (ec_id);
CREATE INDEX idx_note_etudiant ON tenant_ispm.note USING btree (etudiant_id);
CREATE INDEX idx_note_session ON tenant_ispm.note USING btree (session_id);
CREATE INDEX idx_note_ue ON tenant_ispm.note USING btree (ue_id);
CREATE INDEX idx_note_verrouille ON tenant_ispm.note USING btree (verrouille);
CREATE INDEX idx_notification_user ON tenant_ispm.notification USING btree (utilisateur_id, lue);
CREATE INDEX idx_paiement_date ON tenant_ispm.paiement USING btree (date_paiement);
CREATE INDEX idx_paiement_inscription ON tenant_ispm.paiement USING btree (inscription_id);
CREATE INDEX idx_paiement_inscription_date ON tenant_ispm.paiement_inscription USING btree (date_paiement);
CREATE INDEX idx_paiement_inscription_etudiant ON tenant_ispm.paiement_inscription USING btree (etudiant_id);
CREATE INDEX idx_paiement_inscription_inscription ON tenant_ispm.paiement_inscription USING btree (inscription_id);
CREATE INDEX idx_paiement_inscription_reference ON tenant_ispm.paiement_inscription USING btree (reference_paiement);
CREATE INDEX idx_paiement_inscription_statut ON tenant_ispm.paiement_inscription USING btree (statut);
CREATE INDEX idx_paiement_statut ON tenant_ispm.paiement USING btree (statut);
CREATE INDEX idx_parcours_secretaire ON tenant_ispm.parcours USING btree (secretaire_id);
CREATE INDEX idx_pointage_qr_etudiant ON tenant_ispm.pointage_qr USING btree (etudiant_id);
CREATE INDEX idx_pointage_qr_seance ON tenant_ispm.pointage_qr USING btree (seance_id);
CREATE INDEX idx_presence_etudiant ON tenant_ispm.presence USING btree (etudiant_id);
CREATE INDEX idx_presence_seance ON tenant_ispm.presence USING btree (seance_id);
CREATE INDEX idx_presence_statut ON tenant_ispm.presence USING btree (statut);
CREATE INDEX idx_presence_surveillance_date ON tenant_ispm.presence_surveillance USING btree (date_pointage);
CREATE INDEX idx_presence_surveillance_etudiant ON tenant_ispm.presence_surveillance USING btree (etudiant_id);
CREATE INDEX idx_presence_surveillance_seance ON tenant_ispm.presence_surveillance USING btree (seance_id);
CREATE INDEX idx_pv_annee ON tenant_ispm.proces_verbal USING btree (annee_academique_id);
CREATE INDEX idx_pv_date ON tenant_ispm.proces_verbal USING btree (date_deliberation);
CREATE INDEX idx_pv_parcours ON tenant_ispm.proces_verbal USING btree (parcours_id);
CREATE INDEX idx_pv_session ON tenant_ispm.proces_verbal USING btree (session_examen_id);
CREATE INDEX idx_pv_statut ON tenant_ispm.proces_verbal USING btree (statut);
CREATE INDEX idx_rattrapage_absence ON tenant_ispm.rattrapage USING btree (absence_id);
CREATE INDEX idx_rattrapage_date ON tenant_ispm.rattrapage USING btree (date_rattrapage);
CREATE INDEX idx_recrutement_date_cloture ON tenant_ispm.recrutement USING btree (date_cloture);
CREATE INDEX idx_recrutement_departement ON tenant_ispm.recrutement USING btree (departement_id);
CREATE INDEX idx_recrutement_statut ON tenant_ispm.recrutement USING btree (statut);
CREATE INDEX idx_referentiel_created ON tenant_ispm.referentiel_competences USING btree (created_at);
CREATE INDEX idx_referentiel_parcours ON tenant_ispm.referentiel_competences USING btree (parcours_id);
CREATE INDEX idx_referentiel_statut ON tenant_ispm.referentiel_competences USING btree (statut);
CREATE INDEX idx_resultat_semestre_deliberation ON tenant_ispm.resultat_semestre USING btree (deliberation_id);
CREATE INDEX idx_resultat_semestre_etudiant ON tenant_ispm.resultat_semestre USING btree (etudiant_id);
CREATE INDEX idx_resultat_semestre_inscription ON tenant_ispm.resultat_semestre USING btree (inscription_id);
CREATE INDEX idx_resultat_semestre_statut ON tenant_ispm.resultat_semestre USING btree (statut);
CREATE INDEX idx_resultat_ue_etudiant ON tenant_ispm.resultat_ue USING btree (etudiant_id);
CREATE INDEX idx_resultat_ue_statut ON tenant_ispm.resultat_ue USING btree (statut);
CREATE INDEX idx_resultat_ue_ue ON tenant_ispm.resultat_ue USING btree (ue_id);
CREATE INDEX idx_secretaire_parcours_parcours ON tenant_ispm.secretaire_parcours USING btree (parcours_id) WHERE (actif = true);
CREATE INDEX idx_secretaire_parcours_secretaire ON tenant_ispm.secretaire_parcours USING btree (secretaire_id) WHERE (actif = true);
CREATE UNIQUE INDEX idx_secretaire_parcours_unique ON tenant_ispm.secretaire_parcours USING btree (secretaire_id, parcours_id) WHERE (actif = true);
CREATE INDEX idx_session_jwt_token ON tenant_ispm.session_jwt USING btree (refresh_token);
CREATE INDEX idx_session_jwt_user ON tenant_ispm.session_jwt USING btree (utilisateur_id);
CREATE INDEX idx_soutenance_date ON tenant_ispm.soutenance USING btree (date_soutenance);
CREATE INDEX idx_soutenance_stage ON tenant_ispm.soutenance USING btree (stage_id);
CREATE INDEX idx_soutenance_statut ON tenant_ispm.soutenance USING btree (statut);
CREATE INDEX idx_stage_encadrant ON tenant_ispm.stage USING btree (encadrant_id);
CREATE INDEX idx_stage_etudiant ON tenant_ispm.stage USING btree (etudiant_id);
CREATE INDEX idx_stage_rapporteur ON tenant_ispm.stage USING btree (rapporteur_id);
CREATE INDEX idx_stage_statut ON tenant_ispm.stage USING btree (statut);
CREATE INDEX idx_stock_seuil ON tenant_ispm.stock USING btree (quantite_stock, seuil_alerte);
CREATE INDEX idx_sujet_date ON tenant_ispm.sujet_examen USING btree (date_soumission);
CREATE INDEX idx_sujet_enseignant ON tenant_ispm.sujet_examen USING btree (enseignant_id);
CREATE INDEX idx_sujet_session ON tenant_ispm.sujet_examen USING btree (session_examen_id);
CREATE INDEX idx_sujet_statut ON tenant_ispm.sujet_examen USING btree (statut);
CREATE INDEX idx_support_cours_auteur ON tenant_ispm.support_cours USING btree (auteur_id);
CREATE INDEX idx_support_cours_date ON tenant_ispm.support_cours USING btree (date_depot);
CREATE INDEX idx_support_cours_ec ON tenant_ispm.support_cours USING btree (ec_id);
CREATE INDEX idx_tenant_ispm_utilisateur_actif ON tenant_ispm.utilisateur USING btree (actif);
CREATE INDEX idx_tenant_ispm_utilisateur_email ON tenant_ispm.utilisateur USING btree (email);
CREATE INDEX idx_tenant_ispm_utilisateur_role ON tenant_ispm.utilisateur USING btree (role);
CREATE INDEX idx_tenant_ispm_utilisateur_tenant_id ON tenant_ispm.utilisateur USING btree (tenant_id);
CREATE INDEX idx_ticket_statut ON tenant_ispm.ticket_maintenance USING btree (statut, priorite);
CREATE INDEX idx_transfert_decision ON tenant_ispm.transfert_etudiant USING btree (decision_equivalence);
CREATE INDEX idx_transfert_etudiant ON tenant_ispm.transfert_etudiant USING btree (etudiant_id);
CREATE INDEX idx_ue_enseignant ON tenant_ispm.unite_enseignement USING btree (enseignant_id);
CREATE INDEX idx_utilisateur_email ON tenant_ispm.utilisateur USING btree (email);
CREATE INDEX idx_utilisateur_role ON tenant_ispm.utilisateur USING btree (role);
CREATE INDEX idx_verrouillage_etudiant ON tenant_ispm.verrouillage_notes USING btree (etudiant_id);
CREATE INDEX idx_verrouillage_session ON tenant_ispm.verrouillage_notes USING btree (session_examen_id);
CREATE INDEX idx_verrouillage_statut ON tenant_ispm.verrouillage_notes USING btree (statut);
CREATE INDEX idx_absence_date ON tenant_universite_d_antsiranana.absence_enseignant USING btree (date_absence);
CREATE INDEX idx_absence_enseignant ON tenant_universite_d_antsiranana.absence_enseignant USING btree (enseignant_id);
CREATE INDEX idx_absence_statut ON tenant_universite_d_antsiranana.absence_enseignant USING btree (statut);
CREATE INDEX idx_alerte_destinataire ON tenant_universite_d_antsiranana.alerte_discipline USING btree (destinataire_role);
CREATE INDEX idx_alerte_etudiant ON tenant_universite_d_antsiranana.alerte_discipline USING btree (etudiant_id);
CREATE INDEX idx_alerte_statut ON tenant_universite_d_antsiranana.alerte_discipline USING btree (statut);
CREATE INDEX idx_alerte_type ON tenant_universite_d_antsiranana.alerte_discipline USING btree (type);
CREATE INDEX idx_annonce_publie ON tenant_universite_d_antsiranana.annonce USING btree (publie, date_publication);
CREATE INDEX idx_autorisation_dates ON tenant_universite_d_antsiranana.autorisation_sortie USING btree (date_debut, date_fin);
CREATE INDEX idx_autorisation_etudiant ON tenant_universite_d_antsiranana.autorisation_sortie USING btree (etudiant_id);
CREATE INDEX idx_autorisation_statut ON tenant_universite_d_antsiranana.autorisation_sortie USING btree (statut);
CREATE INDEX idx_candidature_email ON tenant_universite_d_antsiranana.candidature USING btree (email);
CREATE INDEX idx_candidature_recrutement ON tenant_universite_d_antsiranana.candidature USING btree (recrutement_id);
CREATE INDEX idx_candidature_statut ON tenant_universite_d_antsiranana.candidature USING btree (statut);
CREATE INDEX idx_cloture_caisse_caissier ON tenant_universite_d_antsiranana.cloture_caisse USING btree (caissier_id);
CREATE INDEX idx_cloture_caisse_date ON tenant_universite_d_antsiranana.cloture_caisse USING btree (date_cloture);
CREATE INDEX idx_cloture_caisse_valide ON tenant_universite_d_antsiranana.cloture_caisse USING btree (valide);
CREATE INDEX idx_config_examen_salle ON tenant_universite_d_antsiranana.configuration_examen USING btree (salle_id);
CREATE INDEX idx_config_examen_session ON tenant_universite_d_antsiranana.configuration_examen USING btree (session_examen_id);
CREATE INDEX idx_config_examen_surveillant ON tenant_universite_d_antsiranana.configuration_examen USING btree (surveillant_id);
CREATE INDEX idx_conseil_discipline_date ON tenant_universite_d_antsiranana.conseil_discipline USING btree (date_conseil);
CREATE INDEX idx_conseil_discipline_etudiant ON tenant_universite_d_antsiranana.conseil_discipline USING btree (etudiant_id);
CREATE INDEX idx_conseil_discipline_statut ON tenant_universite_d_antsiranana.conseil_discipline USING btree (statut);
CREATE INDEX idx_convention_date_proposee ON tenant_universite_d_antsiranana.convention USING btree (date_proposee);
CREATE INDEX idx_convention_statut ON tenant_universite_d_antsiranana.convention USING btree (statut);
CREATE INDEX idx_convention_type_partenaire ON tenant_universite_d_antsiranana.convention USING btree (type_partenaire);
CREATE INDEX idx_convocation_date ON tenant_universite_d_antsiranana.convocation USING btree (date_convocation);
CREATE INDEX idx_convocation_etudiant ON tenant_universite_d_antsiranana.convocation USING btree (etudiant_id);
CREATE INDEX idx_convocation_genere ON tenant_universite_d_antsiranana.convocation USING btree (genere_par);
CREATE INDEX idx_convocation_session ON tenant_universite_d_antsiranana.convocation USING btree (session_examen_id);
CREATE INDEX idx_convocation_statut ON tenant_universite_d_antsiranana.convocation USING btree (statut);
CREATE INDEX idx_decl_sociale_periode ON tenant_universite_d_antsiranana.declaration_sociale USING btree (periode_debut, periode_fin);
CREATE INDEX idx_decl_sociale_statut ON tenant_universite_d_antsiranana.declaration_sociale USING btree (statut);
CREATE INDEX idx_decl_sociale_type ON tenant_universite_d_antsiranana.declaration_sociale USING btree (type_declaration);
CREATE INDEX idx_delegation_dates ON tenant_universite_d_antsiranana.delegation_signature USING btree (date_debut, date_fin);
CREATE INDEX idx_delegation_delegataire ON tenant_universite_d_antsiranana.delegation_signature USING btree (delegataire_id);
CREATE INDEX idx_delegation_revoquee ON tenant_universite_d_antsiranana.delegation_signature USING btree (revoquee);
CREATE INDEX idx_demande_etudiant ON tenant_universite_d_antsiranana.demande_etudiant USING btree (etudiant_id);
CREATE INDEX idx_demande_ressource_date ON tenant_universite_d_antsiranana.demande_ressource USING btree (date_souhaitee);
CREATE INDEX idx_demande_ressource_demandeur ON tenant_universite_d_antsiranana.demande_ressource USING btree (demandeur_id);
CREATE INDEX idx_demande_ressource_statut ON tenant_universite_d_antsiranana.demande_ressource USING btree (statut);
CREATE INDEX idx_demande_statut ON tenant_universite_d_antsiranana.demande_etudiant USING btree (statut);
CREATE INDEX idx_diplome_etudiant ON tenant_universite_d_antsiranana.diplome USING btree (etudiant_id);
CREATE INDEX idx_diplome_numero ON tenant_universite_d_antsiranana.diplome USING btree (numero_diplome);
CREATE INDEX idx_diplome_parcours ON tenant_universite_d_antsiranana.diplome USING btree (parcours_id);
CREATE INDEX idx_dossier_archive ON tenant_universite_d_antsiranana.dossier_etudiant USING btree (est_archive);
CREATE INDEX idx_dossier_etudiant_id ON tenant_universite_d_antsiranana.dossier_etudiant USING btree (etudiant_id);
CREATE INDEX idx_dossier_statut ON tenant_universite_d_antsiranana.dossier_etudiant USING btree (statut);
CREATE INDEX idx_dossier_type ON tenant_universite_d_antsiranana.dossier_etudiant USING btree (type_document);
CREATE INDEX idx_echeancier_statut ON tenant_universite_d_antsiranana.echeancier USING btree (statut);
CREATE INDEX idx_edt_affectation ON tenant_universite_d_antsiranana.emploi_du_temps USING btree (affectation_id);
CREATE INDEX idx_edt_date ON tenant_universite_d_antsiranana.emploi_du_temps USING btree (date_seance);
CREATE INDEX idx_edt_salle ON tenant_universite_d_antsiranana.emploi_du_temps USING btree (salle_id);
CREATE INDEX idx_etudiant_matricule ON tenant_universite_d_antsiranana.etudiant USING btree (matricule);
CREATE INDEX idx_etudiant_nom ON tenant_universite_d_antsiranana.etudiant USING btree (nom, prenom);
CREATE INDEX idx_eval_annee ON tenant_universite_d_antsiranana.evaluation_personnel USING btree (annee_evaluation);
CREATE INDEX idx_eval_date ON tenant_universite_d_antsiranana.evaluation_personnel USING btree (date_evaluation);
CREATE INDEX idx_eval_evaluateur ON tenant_universite_d_antsiranana.evaluation_personnel USING btree (evaluateur_id);
CREATE INDEX idx_eval_statut ON tenant_universite_d_antsiranana.evaluation_personnel USING btree (statut);
CREATE INDEX idx_eval_utilisateur ON tenant_universite_d_antsiranana.evaluation_personnel USING btree (utilisateur_id);
CREATE INDEX idx_evaluation_evaluateur ON tenant_universite_d_antsiranana.evaluation_soutenance USING btree (evaluateur_id);
CREATE INDEX idx_evaluation_soutenance ON tenant_universite_d_antsiranana.evaluation_soutenance USING btree (soutenance_id);
CREATE INDEX idx_fiche_suivi_date ON tenant_universite_d_antsiranana.fiche_suivi_stage USING btree (date_rencontre);
CREATE INDEX idx_fiche_suivi_stage ON tenant_universite_d_antsiranana.fiche_suivi_stage USING btree (stage_id);
CREATE INDEX idx_frais_inscription_actif ON tenant_universite_d_antsiranana.frais_inscription USING btree (actif);
CREATE INDEX idx_frais_inscription_annee_academique ON tenant_universite_d_antsiranana.frais_inscription USING btree (annee_academique_id);
CREATE INDEX idx_frais_inscription_date_limite ON tenant_universite_d_antsiranana.frais_inscription USING btree (date_limite_paiement);
CREATE INDEX idx_frais_inscription_parcours ON tenant_universite_d_antsiranana.frais_inscription USING btree (parcours_id);
CREATE INDEX idx_heure_comp_date ON tenant_universite_d_antsiranana.heure_complementaire USING btree (date_travail);
CREATE INDEX idx_heure_comp_enseignant ON tenant_universite_d_antsiranana.heure_complementaire USING btree (enseignant_id);
CREATE INDEX idx_heure_comp_statut ON tenant_universite_d_antsiranana.heure_complementaire USING btree (statut);
CREATE INDEX idx_inscription_etudiant ON tenant_universite_d_antsiranana.inscription USING btree (etudiant_id);
CREATE INDEX idx_inscription_parcours_annee ON tenant_universite_d_antsiranana.inscription USING btree (parcours_id, annee_academique_id);
CREATE INDEX idx_note_derog_etudiant ON tenant_universite_d_antsiranana.note_derogatoire USING btree (etudiant_id);
CREATE INDEX idx_note_derog_statut ON tenant_universite_d_antsiranana.note_derogatoire USING btree (statut);
CREATE INDEX idx_note_ec ON tenant_universite_d_antsiranana.note USING btree (ec_id);
CREATE INDEX idx_note_etudiant ON tenant_universite_d_antsiranana.note USING btree (etudiant_id);
CREATE INDEX idx_note_session ON tenant_universite_d_antsiranana.note USING btree (session_id);
CREATE INDEX idx_note_ue ON tenant_universite_d_antsiranana.note USING btree (ue_id);
CREATE INDEX idx_note_verrouille ON tenant_universite_d_antsiranana.note USING btree (verrouille);
CREATE INDEX idx_notification_user ON tenant_universite_d_antsiranana.notification USING btree (utilisateur_id, lue);
CREATE INDEX idx_paiement_cloture ON tenant_universite_d_antsiranana.paiement USING btree (cloture_caisse_id);
CREATE INDEX idx_paiement_date ON tenant_universite_d_antsiranana.paiement USING btree (date_paiement);
CREATE INDEX idx_paiement_inscription ON tenant_universite_d_antsiranana.paiement USING btree (inscription_id);
CREATE INDEX idx_paiement_statut ON tenant_universite_d_antsiranana.paiement USING btree (statut);
CREATE INDEX idx_paiement_type ON tenant_universite_d_antsiranana.paiement USING btree (type_paiement);
CREATE INDEX idx_parcours_secretaire ON tenant_universite_d_antsiranana.parcours USING btree (secretaire_id);
CREATE INDEX idx_pointage_qr_code ON tenant_universite_d_antsiranana.pointage_qr USING btree (code_qr);
CREATE INDEX idx_pointage_qr_etudiant ON tenant_universite_d_antsiranana.pointage_qr USING btree (etudiant_id);
CREATE INDEX idx_pointage_qr_seance ON tenant_universite_d_antsiranana.pointage_qr USING btree (seance_id);
CREATE INDEX idx_presence_date ON tenant_universite_d_antsiranana.presence_surveillance USING btree (date_pointage);
CREATE INDEX idx_presence_etudiant ON tenant_universite_d_antsiranana.presence USING btree (etudiant_id);
CREATE INDEX idx_presence_seance ON tenant_universite_d_antsiranana.presence USING btree (seance_id);
CREATE INDEX idx_presence_statut ON tenant_universite_d_antsiranana.presence USING btree (statut);
CREATE INDEX idx_pv_annee ON tenant_universite_d_antsiranana.proces_verbal USING btree (annee_academique_id);
CREATE INDEX idx_pv_date ON tenant_universite_d_antsiranana.proces_verbal USING btree (date_deliberation);
CREATE INDEX idx_pv_parcours ON tenant_universite_d_antsiranana.proces_verbal USING btree (parcours_id);
CREATE INDEX idx_pv_session ON tenant_universite_d_antsiranana.proces_verbal USING btree (session_examen_id);
CREATE INDEX idx_pv_statut ON tenant_universite_d_antsiranana.proces_verbal USING btree (statut);
CREATE INDEX idx_rapport_conduite_etudiant ON tenant_universite_d_antsiranana.rapport_conduite USING btree (etudiant_id);
CREATE INDEX idx_rapport_conduite_periode ON tenant_universite_d_antsiranana.rapport_conduite USING btree (periode_debut, periode_fin);
CREATE INDEX idx_rapport_conduite_statut ON tenant_universite_d_antsiranana.rapport_conduite USING btree (statut);
CREATE INDEX idx_rattrapage_absence ON tenant_universite_d_antsiranana.rattrapage USING btree (absence_id);
CREATE INDEX idx_rattrapage_date ON tenant_universite_d_antsiranana.rattrapage USING btree (date_rattrapage);
CREATE INDEX idx_recrutement_date_cloture ON tenant_universite_d_antsiranana.recrutement USING btree (date_cloture);
CREATE INDEX idx_recrutement_departement ON tenant_universite_d_antsiranana.recrutement USING btree (departement_id);
CREATE INDEX idx_recrutement_statut ON tenant_universite_d_antsiranana.recrutement USING btree (statut);
CREATE INDEX idx_referentiel_created ON tenant_universite_d_antsiranana.referentiel_competences USING btree (created_at);
CREATE INDEX idx_referentiel_parcours ON tenant_universite_d_antsiranana.referentiel_competences USING btree (parcours_id);
CREATE INDEX idx_referentiel_statut ON tenant_universite_d_antsiranana.referentiel_competences USING btree (statut);
CREATE INDEX idx_secretaire_parcours_parcours ON tenant_universite_d_antsiranana.secretaire_parcours USING btree (parcours_id) WHERE (actif = true);
CREATE INDEX idx_secretaire_parcours_secretaire ON tenant_universite_d_antsiranana.secretaire_parcours USING btree (secretaire_id) WHERE (actif = true);
CREATE INDEX idx_session_jwt_token ON tenant_universite_d_antsiranana.session_jwt USING btree (refresh_token);
CREATE INDEX idx_session_jwt_user ON tenant_universite_d_antsiranana.session_jwt USING btree (utilisateur_id);
CREATE INDEX idx_soutenance_date ON tenant_universite_d_antsiranana.soutenance USING btree (date_soutenance);
CREATE INDEX idx_soutenance_stage ON tenant_universite_d_antsiranana.soutenance USING btree (stage_id);
CREATE INDEX idx_soutenance_statut ON tenant_universite_d_antsiranana.soutenance USING btree (statut);
CREATE INDEX idx_stage_encadrant ON tenant_universite_d_antsiranana.stage USING btree (encadrant_id);
CREATE INDEX idx_stage_etudiant ON tenant_universite_d_antsiranana.stage USING btree (etudiant_id);
CREATE INDEX idx_stage_rapporteur ON tenant_universite_d_antsiranana.stage USING btree (rapporteur_id);
CREATE INDEX idx_stage_statut ON tenant_universite_d_antsiranana.stage USING btree (statut);
CREATE INDEX idx_stock_seuil ON tenant_universite_d_antsiranana.stock USING btree (quantite_stock, seuil_alerte);
CREATE INDEX idx_suivi_moral_date ON tenant_universite_d_antsiranana.suivi_moral USING btree (date_entretien);
CREATE INDEX idx_suivi_moral_etudiant ON tenant_universite_d_antsiranana.suivi_moral USING btree (etudiant_id);
CREATE INDEX idx_suivi_moral_statut ON tenant_universite_d_antsiranana.suivi_moral USING btree (statut);
CREATE INDEX idx_sujet_date ON tenant_universite_d_antsiranana.sujet_examen USING btree (date_soumission);
CREATE INDEX idx_sujet_enseignant ON tenant_universite_d_antsiranana.sujet_examen USING btree (enseignant_id);
CREATE INDEX idx_sujet_session ON tenant_universite_d_antsiranana.sujet_examen USING btree (session_examen_id);
CREATE INDEX idx_sujet_statut ON tenant_universite_d_antsiranana.sujet_examen USING btree (statut);
CREATE INDEX idx_support_cours_auteur ON tenant_universite_d_antsiranana.support_cours USING btree (auteur_id);
CREATE INDEX idx_support_cours_date ON tenant_universite_d_antsiranana.support_cours USING btree (date_depot);
CREATE INDEX idx_support_cours_ec ON tenant_universite_d_antsiranana.support_cours USING btree (ec_id);
CREATE INDEX idx_tenant_universite_d_antsiranana_utilisateur_actif ON tenant_universite_d_antsiranana.utilisateur USING btree (actif);
CREATE INDEX idx_tenant_universite_d_antsiranana_utilisateur_email ON tenant_universite_d_antsiranana.utilisateur USING btree (email);
CREATE INDEX idx_tenant_universite_d_antsiranana_utilisateur_role ON tenant_universite_d_antsiranana.utilisateur USING btree (role);
CREATE INDEX idx_ticket_statut ON tenant_universite_d_antsiranana.ticket_maintenance USING btree (statut, priorite);
CREATE INDEX idx_ue_enseignant ON tenant_universite_d_antsiranana.unite_enseignement USING btree (enseignant_id);
CREATE INDEX idx_utilisateur_email ON tenant_universite_d_antsiranana.utilisateur USING btree (email);
CREATE INDEX idx_utilisateur_role ON tenant_universite_d_antsiranana.utilisateur USING btree (role);

-- ============================================================
-- CONTRAINTES (PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK)
-- ============================================================

ALTER TABLE ONLY tenant_ispm.convention ALTER COLUMN id SET DEFAULT nextval('tenant_ispm.convention_id_seq'::regclass);
ALTER TABLE ONLY tenant_ispm.delegation_signature ALTER COLUMN id SET DEFAULT nextval('tenant_ispm.delegation_signature_id_seq'::regclass);
ALTER TABLE ONLY tenant_ispm.evaluation_personnel ALTER COLUMN id SET DEFAULT nextval('tenant_ispm.evaluation_personnel_id_seq'::regclass);
ALTER TABLE ONLY tenant_universite_d_antsiranana.convention ALTER COLUMN id SET DEFAULT nextval('tenant_universite_d_antsiranana.convention_id_seq'::regclass);
ALTER TABLE ONLY tenant_universite_d_antsiranana.delegation_signature ALTER COLUMN id SET DEFAULT nextval('tenant_universite_d_antsiranana.delegation_signature_id_seq'::regclass);
ALTER TABLE ONLY tenant_universite_d_antsiranana.evaluation_personnel ALTER COLUMN id SET DEFAULT nextval('tenant_universite_d_antsiranana.evaluation_personnel_id_seq'::regclass);
ALTER TABLE ONLY public.abonnement ADD CONSTRAINT abonnement_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.abonnement DROP CONSTRAINT abonnement_pkey;
ALTER TABLE ONLY public.domaine ADD CONSTRAINT domaine_domaine_key UNIQUE (domaine);
ALTER TABLE ONLY public.domaine DROP CONSTRAINT domaine_domaine_key;
ALTER TABLE ONLY public.domaine ADD CONSTRAINT domaine_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.domaine DROP CONSTRAINT domaine_pkey;
ALTER TABLE ONLY public.plan_abonnement ADD CONSTRAINT plan_abonnement_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.plan_abonnement DROP CONSTRAINT plan_abonnement_pkey;
ALTER TABLE ONLY public.super_admin ADD CONSTRAINT super_admin_email_key UNIQUE (email);
ALTER TABLE ONLY public.super_admin DROP CONSTRAINT super_admin_email_key;
ALTER TABLE ONLY public.super_admin ADD CONSTRAINT super_admin_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.super_admin DROP CONSTRAINT super_admin_pkey;
ALTER TABLE ONLY public.tenant ADD CONSTRAINT tenant_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.tenant DROP CONSTRAINT tenant_pkey;
ALTER TABLE ONLY public.tenant ADD CONSTRAINT tenant_schema_name_key UNIQUE (schema_name);
ALTER TABLE ONLY public.tenant DROP CONSTRAINT tenant_schema_name_key;
ALTER TABLE ONLY public.tenant ADD CONSTRAINT tenant_slug_key UNIQUE (slug);
ALTER TABLE ONLY public.tenant DROP CONSTRAINT tenant_slug_key;
ALTER TABLE ONLY public.utilisateur ADD CONSTRAINT utilisateur_email_key UNIQUE (email);
ALTER TABLE ONLY public.utilisateur DROP CONSTRAINT utilisateur_email_key;
ALTER TABLE ONLY public.utilisateur ADD CONSTRAINT utilisateur_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.utilisateur DROP CONSTRAINT utilisateur_pkey;
ALTER TABLE ONLY tenant_ispm.absence_enseignant ADD CONSTRAINT absence_enseignant_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.absence_enseignant DROP CONSTRAINT absence_enseignant_pkey;
ALTER TABLE ONLY tenant_ispm.affectation_cours ADD CONSTRAINT affectation_cours_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.affectation_cours DROP CONSTRAINT affectation_cours_pkey;
ALTER TABLE ONLY tenant_ispm.alerte_discipline ADD CONSTRAINT alerte_discipline_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.alerte_discipline DROP CONSTRAINT alerte_discipline_pkey;
ALTER TABLE ONLY tenant_ispm.annee_academique ADD CONSTRAINT annee_academique_libelle_key UNIQUE (libelle);
ALTER TABLE ONLY tenant_ispm.annee_academique DROP CONSTRAINT annee_academique_libelle_key;
ALTER TABLE ONLY tenant_ispm.annee_academique ADD CONSTRAINT annee_academique_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.annee_academique DROP CONSTRAINT annee_academique_pkey;
ALTER TABLE ONLY tenant_ispm.annonce ADD CONSTRAINT annonce_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.annonce DROP CONSTRAINT annonce_pkey;
ALTER TABLE ONLY tenant_ispm.archive_scolarite ADD CONSTRAINT archive_scolarite_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.archive_scolarite DROP CONSTRAINT archive_scolarite_pkey;
ALTER TABLE ONLY tenant_ispm.attestation ADD CONSTRAINT attestation_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.attestation DROP CONSTRAINT attestation_pkey;
ALTER TABLE ONLY tenant_ispm.batiment ADD CONSTRAINT batiment_code_key UNIQUE (code);
ALTER TABLE ONLY tenant_ispm.batiment DROP CONSTRAINT batiment_code_key;
ALTER TABLE ONLY tenant_ispm.batiment ADD CONSTRAINT batiment_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.batiment DROP CONSTRAINT batiment_pkey;
ALTER TABLE ONLY tenant_ispm.budget ADD CONSTRAINT budget_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.budget DROP CONSTRAINT budget_pkey;
ALTER TABLE ONLY tenant_ispm.calendrier_academique ADD CONSTRAINT calendrier_academique_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.calendrier_academique DROP CONSTRAINT calendrier_academique_pkey;
ALTER TABLE ONLY tenant_ispm.candidature ADD CONSTRAINT candidature_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.candidature DROP CONSTRAINT candidature_pkey;
ALTER TABLE ONLY tenant_ispm.configuration_examen ADD CONSTRAINT configuration_examen_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.configuration_examen DROP CONSTRAINT configuration_examen_pkey;
ALTER TABLE ONLY tenant_ispm.conge_personnel ADD CONSTRAINT conge_personnel_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.conge_personnel DROP CONSTRAINT conge_personnel_pkey;
ALTER TABLE ONLY tenant_ispm.contrat_personnel ADD CONSTRAINT contrat_personnel_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.contrat_personnel DROP CONSTRAINT contrat_personnel_pkey;
ALTER TABLE ONLY tenant_ispm.convention ADD CONSTRAINT convention_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.convention DROP CONSTRAINT convention_pkey;
ALTER TABLE ONLY tenant_ispm.convocation ADD CONSTRAINT convocation_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.convocation DROP CONSTRAINT convocation_pkey;
ALTER TABLE ONLY tenant_ispm.declaration_sociale ADD CONSTRAINT declaration_sociale_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.declaration_sociale DROP CONSTRAINT declaration_sociale_pkey;
ALTER TABLE ONLY tenant_ispm.delegation_signature ADD CONSTRAINT delegation_signature_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.delegation_signature DROP CONSTRAINT delegation_signature_pkey;
ALTER TABLE ONLY tenant_ispm.deliberation ADD CONSTRAINT deliberation_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.deliberation DROP CONSTRAINT deliberation_pkey;
ALTER TABLE ONLY tenant_ispm.deliberation ADD CONSTRAINT deliberation_session_examen_id_parcours_id_semestre_annee_n_key UNIQUE (session_examen_id, parcours_id, semestre, annee_niveau);
ALTER TABLE ONLY tenant_ispm.deliberation DROP CONSTRAINT deliberation_session_examen_id_parcours_id_semestre_annee_n_key;
ALTER TABLE ONLY tenant_ispm.demande_etudiant ADD CONSTRAINT demande_etudiant_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.demande_etudiant DROP CONSTRAINT demande_etudiant_pkey;
ALTER TABLE ONLY tenant_ispm.demande_ressource ADD CONSTRAINT demande_ressource_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.demande_ressource DROP CONSTRAINT demande_ressource_pkey;
ALTER TABLE ONLY tenant_ispm.departement ADD CONSTRAINT departement_code_key UNIQUE (code);
ALTER TABLE ONLY tenant_ispm.departement DROP CONSTRAINT departement_code_key;
ALTER TABLE ONLY tenant_ispm.departement ADD CONSTRAINT departement_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.departement DROP CONSTRAINT departement_pkey;
ALTER TABLE ONLY tenant_ispm.depense ADD CONSTRAINT depense_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.depense DROP CONSTRAINT depense_pkey;
ALTER TABLE ONLY tenant_ispm.diplome ADD CONSTRAINT diplome_numero_diplome_key UNIQUE (numero_diplome);
ALTER TABLE ONLY tenant_ispm.diplome DROP CONSTRAINT diplome_numero_diplome_key;
ALTER TABLE ONLY tenant_ispm.diplome ADD CONSTRAINT diplome_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.diplome DROP CONSTRAINT diplome_pkey;
ALTER TABLE ONLY tenant_ispm.dossier_etudiant ADD CONSTRAINT dossier_etudiant_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.dossier_etudiant DROP CONSTRAINT dossier_etudiant_pkey;
ALTER TABLE ONLY tenant_ispm.echeancier ADD CONSTRAINT echeancier_inscription_id_num_tranche_key UNIQUE (inscription_id, num_tranche);
ALTER TABLE ONLY tenant_ispm.echeancier DROP CONSTRAINT echeancier_inscription_id_num_tranche_key;
ALTER TABLE ONLY tenant_ispm.echeancier ADD CONSTRAINT echeancier_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.echeancier DROP CONSTRAINT echeancier_pkey;
ALTER TABLE ONLY tenant_ispm.element_constitutif ADD CONSTRAINT element_constitutif_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.element_constitutif DROP CONSTRAINT element_constitutif_pkey;
ALTER TABLE ONLY tenant_ispm.element_constitutif ADD CONSTRAINT element_constitutif_ue_id_code_key UNIQUE (ue_id, code);
ALTER TABLE ONLY tenant_ispm.element_constitutif DROP CONSTRAINT element_constitutif_ue_id_code_key;
ALTER TABLE ONLY tenant_ispm.emploi_du_temps ADD CONSTRAINT emploi_du_temps_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.emploi_du_temps DROP CONSTRAINT emploi_du_temps_pkey;
ALTER TABLE ONLY tenant_ispm.enseignant ADD CONSTRAINT enseignant_matricule_key UNIQUE (matricule);
ALTER TABLE ONLY tenant_ispm.enseignant DROP CONSTRAINT enseignant_matricule_key;
ALTER TABLE ONLY tenant_ispm.enseignant ADD CONSTRAINT enseignant_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.enseignant DROP CONSTRAINT enseignant_pkey;
ALTER TABLE ONLY tenant_ispm.enseignant ADD CONSTRAINT enseignant_utilisateur_id_key UNIQUE (utilisateur_id);
ALTER TABLE ONLY tenant_ispm.enseignant DROP CONSTRAINT enseignant_utilisateur_id_key;
ALTER TABLE ONLY tenant_ispm.etudiant ADD CONSTRAINT etudiant_matricule_key UNIQUE (matricule);
ALTER TABLE ONLY tenant_ispm.etudiant DROP CONSTRAINT etudiant_matricule_key;
ALTER TABLE ONLY tenant_ispm.etudiant ADD CONSTRAINT etudiant_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.etudiant DROP CONSTRAINT etudiant_pkey;
ALTER TABLE ONLY tenant_ispm.etudiant ADD CONSTRAINT etudiant_utilisateur_id_key UNIQUE (utilisateur_id);
ALTER TABLE ONLY tenant_ispm.etudiant DROP CONSTRAINT etudiant_utilisateur_id_key;
ALTER TABLE ONLY tenant_ispm.evaluation_personnel ADD CONSTRAINT evaluation_personnel_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.evaluation_personnel DROP CONSTRAINT evaluation_personnel_pkey;
ALTER TABLE ONLY tenant_ispm.evaluation_soutenance ADD CONSTRAINT evaluation_soutenance_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.evaluation_soutenance DROP CONSTRAINT evaluation_soutenance_pkey;
ALTER TABLE ONLY tenant_ispm.evaluation_soutenance ADD CONSTRAINT evaluation_soutenance_soutenance_id_evaluateur_id_key UNIQUE (soutenance_id, evaluateur_id);
ALTER TABLE ONLY tenant_ispm.evaluation_soutenance DROP CONSTRAINT evaluation_soutenance_soutenance_id_evaluateur_id_key;
ALTER TABLE ONLY tenant_ispm.fiche_paie ADD CONSTRAINT fiche_paie_contrat_id_annee_mois_key UNIQUE (contrat_id, annee, mois);
ALTER TABLE ONLY tenant_ispm.fiche_paie DROP CONSTRAINT fiche_paie_contrat_id_annee_mois_key;
ALTER TABLE ONLY tenant_ispm.fiche_paie ADD CONSTRAINT fiche_paie_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.fiche_paie DROP CONSTRAINT fiche_paie_pkey;
ALTER TABLE ONLY tenant_ispm.fiche_suivi_stage ADD CONSTRAINT fiche_suivi_stage_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.fiche_suivi_stage DROP CONSTRAINT fiche_suivi_stage_pkey;
ALTER TABLE ONLY tenant_ispm.grille_tarifaire ADD CONSTRAINT grille_tarifaire_parcours_id_annee_academique_id_annee_nive_key UNIQUE (parcours_id, annee_academique_id, annee_niveau);
ALTER TABLE ONLY tenant_ispm.grille_tarifaire DROP CONSTRAINT grille_tarifaire_parcours_id_annee_academique_id_annee_nive_key;
ALTER TABLE ONLY tenant_ispm.grille_tarifaire ADD CONSTRAINT grille_tarifaire_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.grille_tarifaire DROP CONSTRAINT grille_tarifaire_pkey;
ALTER TABLE ONLY tenant_ispm.heure_complementaire ADD CONSTRAINT heure_complementaire_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.heure_complementaire DROP CONSTRAINT heure_complementaire_pkey;
ALTER TABLE ONLY tenant_ispm.incident_disciplinaire ADD CONSTRAINT incident_disciplinaire_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.incident_disciplinaire DROP CONSTRAINT incident_disciplinaire_pkey;
ALTER TABLE ONLY tenant_ispm.inscription ADD CONSTRAINT inscription_etudiant_id_parcours_id_annee_academique_id_key UNIQUE (etudiant_id, parcours_id, annee_academique_id);
ALTER TABLE ONLY tenant_ispm.inscription DROP CONSTRAINT inscription_etudiant_id_parcours_id_annee_academique_id_key;
ALTER TABLE ONLY tenant_ispm.inscription ADD CONSTRAINT inscription_numero_carte_key UNIQUE (numero_carte);
ALTER TABLE ONLY tenant_ispm.inscription DROP CONSTRAINT inscription_numero_carte_key;
ALTER TABLE ONLY tenant_ispm.inscription ADD CONSTRAINT inscription_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.inscription DROP CONSTRAINT inscription_pkey;
ALTER TABLE ONLY tenant_ispm.message_destinataire ADD CONSTRAINT message_destinataire_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.message_destinataire DROP CONSTRAINT message_destinataire_pkey;
ALTER TABLE ONLY tenant_ispm.message_enseignant ADD CONSTRAINT message_enseignant_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.message_enseignant DROP CONSTRAINT message_enseignant_pkey;
ALTER TABLE ONLY tenant_ispm.message ADD CONSTRAINT message_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.message DROP CONSTRAINT message_pkey;
ALTER TABLE ONLY tenant_ispm.mouvement_stock ADD CONSTRAINT mouvement_stock_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.mouvement_stock DROP CONSTRAINT mouvement_stock_pkey;
ALTER TABLE ONLY tenant_ispm.niveau_etude ADD CONSTRAINT niveau_etude_code_key UNIQUE (code);
ALTER TABLE ONLY tenant_ispm.niveau_etude DROP CONSTRAINT niveau_etude_code_key;
ALTER TABLE ONLY tenant_ispm.niveau_etude ADD CONSTRAINT niveau_etude_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.niveau_etude DROP CONSTRAINT niveau_etude_pkey;
ALTER TABLE ONLY tenant_ispm.note_derogatoire ADD CONSTRAINT note_derogatoire_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.note_derogatoire DROP CONSTRAINT note_derogatoire_pkey;
ALTER TABLE ONLY tenant_ispm.note ADD CONSTRAINT note_etudiant_id_ec_id_session_id_key UNIQUE (etudiant_id, ec_id, session_id);
ALTER TABLE ONLY tenant_ispm.note DROP CONSTRAINT note_etudiant_id_ec_id_session_id_key;
ALTER TABLE ONLY tenant_ispm.note ADD CONSTRAINT note_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.note DROP CONSTRAINT note_pkey;
ALTER TABLE ONLY tenant_ispm.notification ADD CONSTRAINT notification_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.notification DROP CONSTRAINT notification_pkey;
ALTER TABLE ONLY tenant_ispm.paiement_inscription ADD CONSTRAINT paiement_inscription_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.paiement_inscription DROP CONSTRAINT paiement_inscription_pkey;
ALTER TABLE ONLY tenant_ispm.paiement ADD CONSTRAINT paiement_numero_recu_key UNIQUE (numero_recu);
ALTER TABLE ONLY tenant_ispm.paiement DROP CONSTRAINT paiement_numero_recu_key;
ALTER TABLE ONLY tenant_ispm.paiement ADD CONSTRAINT paiement_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.paiement DROP CONSTRAINT paiement_pkey;
ALTER TABLE ONLY tenant_ispm.paiement ADD CONSTRAINT paiement_reference_key UNIQUE (reference);
ALTER TABLE ONLY tenant_ispm.paiement DROP CONSTRAINT paiement_reference_key;
ALTER TABLE ONLY tenant_ispm.parcours ADD CONSTRAINT parcours_code_key UNIQUE (code);
ALTER TABLE ONLY tenant_ispm.parcours DROP CONSTRAINT parcours_code_key;
ALTER TABLE ONLY tenant_ispm.parcours ADD CONSTRAINT parcours_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.parcours DROP CONSTRAINT parcours_pkey;
ALTER TABLE ONLY tenant_ispm.permissions_portail ADD CONSTRAINT permissions_portail_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.permissions_portail DROP CONSTRAINT permissions_portail_pkey;
ALTER TABLE ONLY tenant_ispm.permissions_portail ADD CONSTRAINT permissions_portail_type_portail_permission_key_key UNIQUE (type_portail, permission_key);
ALTER TABLE ONLY tenant_ispm.permissions_portail DROP CONSTRAINT permissions_portail_type_portail_permission_key_key;
ALTER TABLE ONLY tenant_ispm.planning_entretien ADD CONSTRAINT planning_entretien_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.planning_entretien DROP CONSTRAINT planning_entretien_pkey;
ALTER TABLE ONLY tenant_ispm.pointage_qr ADD CONSTRAINT pointage_qr_code_qr_key UNIQUE (code_qr);
ALTER TABLE ONLY tenant_ispm.pointage_qr DROP CONSTRAINT pointage_qr_code_qr_key;
ALTER TABLE ONLY tenant_ispm.pointage_qr ADD CONSTRAINT pointage_qr_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.pointage_qr DROP CONSTRAINT pointage_qr_pkey;
ALTER TABLE ONLY tenant_ispm.presence ADD CONSTRAINT presence_etudiant_id_seance_id_key UNIQUE (etudiant_id, seance_id);
ALTER TABLE ONLY tenant_ispm.presence DROP CONSTRAINT presence_etudiant_id_seance_id_key;
ALTER TABLE ONLY tenant_ispm.presence ADD CONSTRAINT presence_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.presence DROP CONSTRAINT presence_pkey;
ALTER TABLE ONLY tenant_ispm.presence_surveillance ADD CONSTRAINT presence_surveillance_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.presence_surveillance DROP CONSTRAINT presence_surveillance_pkey;
ALTER TABLE ONLY tenant_ispm.proces_verbal ADD CONSTRAINT proces_verbal_numero_key UNIQUE (numero);
ALTER TABLE ONLY tenant_ispm.proces_verbal DROP CONSTRAINT proces_verbal_numero_key;
ALTER TABLE ONLY tenant_ispm.proces_verbal ADD CONSTRAINT proces_verbal_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.proces_verbal DROP CONSTRAINT proces_verbal_pkey;
ALTER TABLE ONLY tenant_ispm.pv_deliberation ADD CONSTRAINT pv_deliberation_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.pv_deliberation DROP CONSTRAINT pv_deliberation_pkey;
ALTER TABLE ONLY tenant_ispm.rapport_entretien ADD CONSTRAINT rapport_entretien_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.rapport_entretien DROP CONSTRAINT rapport_entretien_pkey;
ALTER TABLE ONLY tenant_ispm.rattrapage ADD CONSTRAINT rattrapage_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.rattrapage DROP CONSTRAINT rattrapage_pkey;
ALTER TABLE ONLY tenant_ispm.recrutement ADD CONSTRAINT recrutement_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.recrutement DROP CONSTRAINT recrutement_pkey;
ALTER TABLE ONLY tenant_ispm.referentiel_competences ADD CONSTRAINT referentiel_competences_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.referentiel_competences DROP CONSTRAINT referentiel_competences_pkey;
ALTER TABLE ONLY tenant_ispm.reservation_salle ADD CONSTRAINT reservation_salle_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.reservation_salle DROP CONSTRAINT reservation_salle_pkey;
ALTER TABLE ONLY tenant_ispm.resultat_deliberation ADD CONSTRAINT resultat_deliberation_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.resultat_deliberation DROP CONSTRAINT resultat_deliberation_pkey;
ALTER TABLE ONLY tenant_ispm.resultat_deliberation ADD CONSTRAINT resultat_deliberation_pv_id_etudiant_id_key UNIQUE (pv_id, etudiant_id);
ALTER TABLE ONLY tenant_ispm.resultat_deliberation DROP CONSTRAINT resultat_deliberation_pv_id_etudiant_id_key;
ALTER TABLE ONLY tenant_ispm.resultat_semestre ADD CONSTRAINT resultat_semestre_etudiant_id_inscription_id_semestre_annee_key UNIQUE (etudiant_id, inscription_id, semestre, annee_niveau);
ALTER TABLE ONLY tenant_ispm.resultat_semestre DROP CONSTRAINT resultat_semestre_etudiant_id_inscription_id_semestre_annee_key;
ALTER TABLE ONLY tenant_ispm.resultat_semestre ADD CONSTRAINT resultat_semestre_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.resultat_semestre DROP CONSTRAINT resultat_semestre_pkey;
ALTER TABLE ONLY tenant_ispm.resultat_ue ADD CONSTRAINT resultat_ue_etudiant_id_ue_id_resultat_semestre_id_key UNIQUE (etudiant_id, ue_id, resultat_semestre_id);
ALTER TABLE ONLY tenant_ispm.resultat_ue DROP CONSTRAINT resultat_ue_etudiant_id_ue_id_resultat_semestre_id_key;
ALTER TABLE ONLY tenant_ispm.resultat_ue ADD CONSTRAINT resultat_ue_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.resultat_ue DROP CONSTRAINT resultat_ue_pkey;
ALTER TABLE ONLY tenant_ispm.salle ADD CONSTRAINT salle_code_key UNIQUE (code);
ALTER TABLE ONLY tenant_ispm.salle DROP CONSTRAINT salle_code_key;
ALTER TABLE ONLY tenant_ispm.salle ADD CONSTRAINT salle_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.salle DROP CONSTRAINT salle_pkey;
ALTER TABLE ONLY tenant_ispm.secretaire_parcours ADD CONSTRAINT secretaire_parcours_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.secretaire_parcours DROP CONSTRAINT secretaire_parcours_pkey;
ALTER TABLE ONLY tenant_ispm.session_examen ADD CONSTRAINT session_examen_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.session_examen DROP CONSTRAINT session_examen_pkey;
ALTER TABLE ONLY tenant_ispm.session_jwt ADD CONSTRAINT session_jwt_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.session_jwt DROP CONSTRAINT session_jwt_pkey;
ALTER TABLE ONLY tenant_ispm.session_jwt ADD CONSTRAINT session_jwt_refresh_token_key UNIQUE (refresh_token);
ALTER TABLE ONLY tenant_ispm.session_jwt DROP CONSTRAINT session_jwt_refresh_token_key;
ALTER TABLE ONLY tenant_ispm.soutenance ADD CONSTRAINT soutenance_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.soutenance DROP CONSTRAINT soutenance_pkey;
ALTER TABLE ONLY tenant_ispm.soutenance ADD CONSTRAINT soutenance_stage_id_key UNIQUE (stage_id);
ALTER TABLE ONLY tenant_ispm.soutenance DROP CONSTRAINT soutenance_stage_id_key;
ALTER TABLE ONLY tenant_ispm.stage ADD CONSTRAINT stage_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.stage DROP CONSTRAINT stage_pkey;
ALTER TABLE ONLY tenant_ispm.stock ADD CONSTRAINT stock_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.stock DROP CONSTRAINT stock_pkey;
ALTER TABLE ONLY tenant_ispm.stock ADD CONSTRAINT stock_reference_key UNIQUE (reference);
ALTER TABLE ONLY tenant_ispm.stock DROP CONSTRAINT stock_reference_key;
ALTER TABLE ONLY tenant_ispm.sujet_examen ADD CONSTRAINT sujet_examen_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.sujet_examen DROP CONSTRAINT sujet_examen_pkey;
ALTER TABLE ONLY tenant_ispm.suplement_diplome ADD CONSTRAINT suplement_diplome_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.suplement_diplome DROP CONSTRAINT suplement_diplome_pkey;
ALTER TABLE ONLY tenant_ispm.support_cours ADD CONSTRAINT support_cours_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.support_cours DROP CONSTRAINT support_cours_pkey;
ALTER TABLE ONLY tenant_ispm.ticket_maintenance ADD CONSTRAINT ticket_maintenance_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.ticket_maintenance DROP CONSTRAINT ticket_maintenance_pkey;
ALTER TABLE ONLY tenant_ispm.transfert_etudiant ADD CONSTRAINT transfert_etudiant_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.transfert_etudiant DROP CONSTRAINT transfert_etudiant_pkey;
ALTER TABLE ONLY tenant_ispm.message_destinataire ADD CONSTRAINT unique_message_etudiant UNIQUE (message_id, etudiant_id);
ALTER TABLE ONLY tenant_ispm.message_destinataire DROP CONSTRAINT unique_message_etudiant;
ALTER TABLE ONLY tenant_ispm.paiement_inscription ADD CONSTRAINT unique_reference_paiement UNIQUE (reference_paiement);
ALTER TABLE ONLY tenant_ispm.paiement_inscription DROP CONSTRAINT unique_reference_paiement;
ALTER TABLE ONLY tenant_ispm.unite_enseignement ADD CONSTRAINT unite_enseignement_parcours_id_code_key UNIQUE (parcours_id, code);
ALTER TABLE ONLY tenant_ispm.unite_enseignement DROP CONSTRAINT unite_enseignement_parcours_id_code_key;
ALTER TABLE ONLY tenant_ispm.unite_enseignement ADD CONSTRAINT unite_enseignement_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.unite_enseignement DROP CONSTRAINT unite_enseignement_pkey;
ALTER TABLE ONLY tenant_ispm.utilisateur ADD CONSTRAINT utilisateur_email_key UNIQUE (email);
ALTER TABLE ONLY tenant_ispm.utilisateur DROP CONSTRAINT utilisateur_email_key;
ALTER TABLE ONLY tenant_ispm.utilisateur ADD CONSTRAINT utilisateur_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.utilisateur DROP CONSTRAINT utilisateur_pkey;
ALTER TABLE ONLY tenant_ispm.verrouillage_notes ADD CONSTRAINT verrouillage_notes_deliberation_id_etudiant_id_session_exam_key UNIQUE (deliberation_id, etudiant_id, session_examen_id);
ALTER TABLE ONLY tenant_ispm.verrouillage_notes DROP CONSTRAINT verrouillage_notes_deliberation_id_etudiant_id_session_exam_key;
ALTER TABLE ONLY tenant_ispm.verrouillage_notes ADD CONSTRAINT verrouillage_notes_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_ispm.verrouillage_notes DROP CONSTRAINT verrouillage_notes_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.absence_enseignant ADD CONSTRAINT absence_enseignant_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.absence_enseignant DROP CONSTRAINT absence_enseignant_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.affectation_cours ADD CONSTRAINT affectation_cours_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.affectation_cours DROP CONSTRAINT affectation_cours_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.alerte_discipline ADD CONSTRAINT alerte_discipline_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.alerte_discipline DROP CONSTRAINT alerte_discipline_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.annee_academique ADD CONSTRAINT annee_academique_libelle_key UNIQUE (libelle);
ALTER TABLE ONLY tenant_universite_d_antsiranana.annee_academique DROP CONSTRAINT annee_academique_libelle_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.annee_academique ADD CONSTRAINT annee_academique_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.annee_academique DROP CONSTRAINT annee_academique_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.annonce ADD CONSTRAINT annonce_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.annonce DROP CONSTRAINT annonce_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.autorisation_sortie ADD CONSTRAINT autorisation_sortie_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.autorisation_sortie DROP CONSTRAINT autorisation_sortie_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.batiment ADD CONSTRAINT batiment_code_key UNIQUE (code);
ALTER TABLE ONLY tenant_universite_d_antsiranana.batiment DROP CONSTRAINT batiment_code_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.batiment ADD CONSTRAINT batiment_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.batiment DROP CONSTRAINT batiment_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.budget ADD CONSTRAINT budget_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.budget DROP CONSTRAINT budget_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.calendrier_academique ADD CONSTRAINT calendrier_academique_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.calendrier_academique DROP CONSTRAINT calendrier_academique_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.candidature ADD CONSTRAINT candidature_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.candidature DROP CONSTRAINT candidature_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.cloture_caisse ADD CONSTRAINT cloture_caisse_date_cloture_caissier_id_key UNIQUE (date_cloture, caissier_id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.cloture_caisse DROP CONSTRAINT cloture_caisse_date_cloture_caissier_id_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.cloture_caisse ADD CONSTRAINT cloture_caisse_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.cloture_caisse DROP CONSTRAINT cloture_caisse_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.configuration_examen ADD CONSTRAINT configuration_examen_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.configuration_examen DROP CONSTRAINT configuration_examen_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.conge_personnel ADD CONSTRAINT conge_personnel_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.conge_personnel DROP CONSTRAINT conge_personnel_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.conseil_discipline ADD CONSTRAINT conseil_discipline_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.conseil_discipline DROP CONSTRAINT conseil_discipline_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.contrat_personnel ADD CONSTRAINT contrat_personnel_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.contrat_personnel DROP CONSTRAINT contrat_personnel_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.convention ADD CONSTRAINT convention_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.convention DROP CONSTRAINT convention_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.convocation ADD CONSTRAINT convocation_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.convocation DROP CONSTRAINT convocation_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.declaration_sociale ADD CONSTRAINT declaration_sociale_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.declaration_sociale DROP CONSTRAINT declaration_sociale_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.delegation_signature ADD CONSTRAINT delegation_signature_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.delegation_signature DROP CONSTRAINT delegation_signature_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.demande_etudiant ADD CONSTRAINT demande_etudiant_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.demande_etudiant DROP CONSTRAINT demande_etudiant_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.demande_ressource ADD CONSTRAINT demande_ressource_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.demande_ressource DROP CONSTRAINT demande_ressource_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.departement ADD CONSTRAINT departement_code_key UNIQUE (code);
ALTER TABLE ONLY tenant_universite_d_antsiranana.departement DROP CONSTRAINT departement_code_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.departement ADD CONSTRAINT departement_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.departement DROP CONSTRAINT departement_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.depense ADD CONSTRAINT depense_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.depense DROP CONSTRAINT depense_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.diplome ADD CONSTRAINT diplome_etudiant_id_type_diplome_parcours_id_key UNIQUE (etudiant_id, type_diplome, parcours_id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.diplome DROP CONSTRAINT diplome_etudiant_id_type_diplome_parcours_id_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.diplome ADD CONSTRAINT diplome_numero_diplome_key UNIQUE (numero_diplome);
ALTER TABLE ONLY tenant_universite_d_antsiranana.diplome DROP CONSTRAINT diplome_numero_diplome_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.diplome ADD CONSTRAINT diplome_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.diplome DROP CONSTRAINT diplome_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.dossier_etudiant ADD CONSTRAINT dossier_etudiant_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.dossier_etudiant DROP CONSTRAINT dossier_etudiant_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.echeancier ADD CONSTRAINT echeancier_inscription_id_num_tranche_key UNIQUE (inscription_id, num_tranche);
ALTER TABLE ONLY tenant_universite_d_antsiranana.echeancier DROP CONSTRAINT echeancier_inscription_id_num_tranche_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.echeancier ADD CONSTRAINT echeancier_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.echeancier DROP CONSTRAINT echeancier_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.element_constitutif ADD CONSTRAINT element_constitutif_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.element_constitutif DROP CONSTRAINT element_constitutif_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.element_constitutif ADD CONSTRAINT element_constitutif_ue_id_code_key UNIQUE (ue_id, code);
ALTER TABLE ONLY tenant_universite_d_antsiranana.element_constitutif DROP CONSTRAINT element_constitutif_ue_id_code_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.emploi_du_temps ADD CONSTRAINT emploi_du_temps_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.emploi_du_temps DROP CONSTRAINT emploi_du_temps_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.enseignant ADD CONSTRAINT enseignant_matricule_key UNIQUE (matricule);
ALTER TABLE ONLY tenant_universite_d_antsiranana.enseignant DROP CONSTRAINT enseignant_matricule_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.enseignant ADD CONSTRAINT enseignant_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.enseignant DROP CONSTRAINT enseignant_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.enseignant ADD CONSTRAINT enseignant_utilisateur_id_key UNIQUE (utilisateur_id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.enseignant DROP CONSTRAINT enseignant_utilisateur_id_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.etudiant ADD CONSTRAINT etudiant_matricule_key UNIQUE (matricule);
ALTER TABLE ONLY tenant_universite_d_antsiranana.etudiant DROP CONSTRAINT etudiant_matricule_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.etudiant ADD CONSTRAINT etudiant_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.etudiant DROP CONSTRAINT etudiant_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.etudiant ADD CONSTRAINT etudiant_utilisateur_id_key UNIQUE (utilisateur_id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.etudiant DROP CONSTRAINT etudiant_utilisateur_id_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.evaluation_personnel ADD CONSTRAINT evaluation_personnel_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.evaluation_personnel DROP CONSTRAINT evaluation_personnel_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.evaluation_soutenance ADD CONSTRAINT evaluation_soutenance_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.evaluation_soutenance DROP CONSTRAINT evaluation_soutenance_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.evaluation_soutenance ADD CONSTRAINT evaluation_soutenance_soutenance_id_evaluateur_id_key UNIQUE (soutenance_id, evaluateur_id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.evaluation_soutenance DROP CONSTRAINT evaluation_soutenance_soutenance_id_evaluateur_id_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.fiche_paie ADD CONSTRAINT fiche_paie_contrat_id_annee_mois_key UNIQUE (contrat_id, annee, mois);
ALTER TABLE ONLY tenant_universite_d_antsiranana.fiche_paie DROP CONSTRAINT fiche_paie_contrat_id_annee_mois_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.fiche_paie ADD CONSTRAINT fiche_paie_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.fiche_paie DROP CONSTRAINT fiche_paie_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.fiche_suivi_stage ADD CONSTRAINT fiche_suivi_stage_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.fiche_suivi_stage DROP CONSTRAINT fiche_suivi_stage_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.frais_inscription ADD CONSTRAINT frais_inscription_parcours_id_annee_academique_id_key UNIQUE (parcours_id, annee_academique_id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.frais_inscription DROP CONSTRAINT frais_inscription_parcours_id_annee_academique_id_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.frais_inscription ADD CONSTRAINT frais_inscription_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.frais_inscription DROP CONSTRAINT frais_inscription_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.grille_tarifaire ADD CONSTRAINT grille_tarifaire_parcours_id_annee_academique_id_annee_nive_key UNIQUE (parcours_id, annee_academique_id, annee_niveau);
ALTER TABLE ONLY tenant_universite_d_antsiranana.grille_tarifaire DROP CONSTRAINT grille_tarifaire_parcours_id_annee_academique_id_annee_nive_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.grille_tarifaire ADD CONSTRAINT grille_tarifaire_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.grille_tarifaire DROP CONSTRAINT grille_tarifaire_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.heure_complementaire ADD CONSTRAINT heure_complementaire_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.heure_complementaire DROP CONSTRAINT heure_complementaire_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.incident_disciplinaire ADD CONSTRAINT incident_disciplinaire_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.incident_disciplinaire DROP CONSTRAINT incident_disciplinaire_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.inscription ADD CONSTRAINT inscription_etudiant_id_parcours_id_annee_academique_id_key UNIQUE (etudiant_id, parcours_id, annee_academique_id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.inscription DROP CONSTRAINT inscription_etudiant_id_parcours_id_annee_academique_id_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.inscription ADD CONSTRAINT inscription_numero_carte_key UNIQUE (numero_carte);
ALTER TABLE ONLY tenant_universite_d_antsiranana.inscription DROP CONSTRAINT inscription_numero_carte_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.inscription ADD CONSTRAINT inscription_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.inscription DROP CONSTRAINT inscription_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.message ADD CONSTRAINT message_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.message DROP CONSTRAINT message_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.mouvement_stock ADD CONSTRAINT mouvement_stock_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.mouvement_stock DROP CONSTRAINT mouvement_stock_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.note_derogatoire ADD CONSTRAINT note_derogatoire_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.note_derogatoire DROP CONSTRAINT note_derogatoire_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.note ADD CONSTRAINT note_etudiant_id_ec_id_session_id_key UNIQUE (etudiant_id, ec_id, session_id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.note DROP CONSTRAINT note_etudiant_id_ec_id_session_id_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.note ADD CONSTRAINT note_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.note DROP CONSTRAINT note_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.notification ADD CONSTRAINT notification_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.notification DROP CONSTRAINT notification_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.paiement ADD CONSTRAINT paiement_numero_recu_key UNIQUE (numero_recu);
ALTER TABLE ONLY tenant_universite_d_antsiranana.paiement DROP CONSTRAINT paiement_numero_recu_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.paiement ADD CONSTRAINT paiement_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.paiement DROP CONSTRAINT paiement_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.paiement ADD CONSTRAINT paiement_reference_key UNIQUE (reference);
ALTER TABLE ONLY tenant_universite_d_antsiranana.paiement DROP CONSTRAINT paiement_reference_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.parcours ADD CONSTRAINT parcours_code_key UNIQUE (code);
ALTER TABLE ONLY tenant_universite_d_antsiranana.parcours DROP CONSTRAINT parcours_code_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.parcours ADD CONSTRAINT parcours_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.parcours DROP CONSTRAINT parcours_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.permissions_portail ADD CONSTRAINT permissions_portail_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.permissions_portail DROP CONSTRAINT permissions_portail_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.permissions_portail ADD CONSTRAINT permissions_portail_type_portail_permission_key_key UNIQUE (type_portail, permission_key);
ALTER TABLE ONLY tenant_universite_d_antsiranana.permissions_portail DROP CONSTRAINT permissions_portail_type_portail_permission_key_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.attestation ADD CONSTRAINT pk_attestation PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.attestation DROP CONSTRAINT pk_attestation;
ALTER TABLE ONLY tenant_universite_d_antsiranana.planning_entretien ADD CONSTRAINT planning_entretien_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.planning_entretien DROP CONSTRAINT planning_entretien_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.pointage_qr ADD CONSTRAINT pointage_qr_code_qr_key UNIQUE (code_qr);
ALTER TABLE ONLY tenant_universite_d_antsiranana.pointage_qr DROP CONSTRAINT pointage_qr_code_qr_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.pointage_qr ADD CONSTRAINT pointage_qr_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.pointage_qr DROP CONSTRAINT pointage_qr_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.presence ADD CONSTRAINT presence_etudiant_id_seance_id_key UNIQUE (etudiant_id, seance_id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.presence DROP CONSTRAINT presence_etudiant_id_seance_id_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.presence ADD CONSTRAINT presence_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.presence DROP CONSTRAINT presence_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.presence_surveillance ADD CONSTRAINT presence_surveillance_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.presence_surveillance DROP CONSTRAINT presence_surveillance_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.proces_verbal ADD CONSTRAINT proces_verbal_numero_key UNIQUE (numero);
ALTER TABLE ONLY tenant_universite_d_antsiranana.proces_verbal DROP CONSTRAINT proces_verbal_numero_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.proces_verbal ADD CONSTRAINT proces_verbal_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.proces_verbal DROP CONSTRAINT proces_verbal_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.pv_deliberation ADD CONSTRAINT pv_deliberation_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.pv_deliberation DROP CONSTRAINT pv_deliberation_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.rapport_conduite ADD CONSTRAINT rapport_conduite_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.rapport_conduite DROP CONSTRAINT rapport_conduite_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.rapport_entretien ADD CONSTRAINT rapport_entretien_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.rapport_entretien DROP CONSTRAINT rapport_entretien_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.rattrapage ADD CONSTRAINT rattrapage_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.rattrapage DROP CONSTRAINT rattrapage_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.recrutement ADD CONSTRAINT recrutement_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.recrutement DROP CONSTRAINT recrutement_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.referentiel_competences ADD CONSTRAINT referentiel_competences_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.referentiel_competences DROP CONSTRAINT referentiel_competences_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.reservation_salle ADD CONSTRAINT reservation_salle_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.reservation_salle DROP CONSTRAINT reservation_salle_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.resultat_deliberation ADD CONSTRAINT resultat_deliberation_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.resultat_deliberation DROP CONSTRAINT resultat_deliberation_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.resultat_deliberation ADD CONSTRAINT resultat_deliberation_pv_id_etudiant_id_key UNIQUE (pv_id, etudiant_id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.resultat_deliberation DROP CONSTRAINT resultat_deliberation_pv_id_etudiant_id_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.salle ADD CONSTRAINT salle_code_key UNIQUE (code);
ALTER TABLE ONLY tenant_universite_d_antsiranana.salle DROP CONSTRAINT salle_code_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.salle ADD CONSTRAINT salle_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.salle DROP CONSTRAINT salle_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.secretaire_parcours ADD CONSTRAINT secretaire_parcours_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.secretaire_parcours DROP CONSTRAINT secretaire_parcours_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.secretaire_parcours ADD CONSTRAINT secretaire_parcours_secretaire_id_parcours_id_actif_key UNIQUE (secretaire_id, parcours_id, actif);
ALTER TABLE ONLY tenant_universite_d_antsiranana.secretaire_parcours DROP CONSTRAINT secretaire_parcours_secretaire_id_parcours_id_actif_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.session_examen ADD CONSTRAINT session_examen_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.session_examen DROP CONSTRAINT session_examen_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.session_jwt ADD CONSTRAINT session_jwt_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.session_jwt DROP CONSTRAINT session_jwt_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.session_jwt ADD CONSTRAINT session_jwt_refresh_token_key UNIQUE (refresh_token);
ALTER TABLE ONLY tenant_universite_d_antsiranana.session_jwt DROP CONSTRAINT session_jwt_refresh_token_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.soutenance ADD CONSTRAINT soutenance_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.soutenance DROP CONSTRAINT soutenance_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.soutenance ADD CONSTRAINT soutenance_stage_id_key UNIQUE (stage_id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.soutenance DROP CONSTRAINT soutenance_stage_id_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.stage ADD CONSTRAINT stage_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.stage DROP CONSTRAINT stage_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.stock ADD CONSTRAINT stock_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.stock DROP CONSTRAINT stock_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.stock ADD CONSTRAINT stock_reference_key UNIQUE (reference);
ALTER TABLE ONLY tenant_universite_d_antsiranana.stock DROP CONSTRAINT stock_reference_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.suivi_moral ADD CONSTRAINT suivi_moral_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.suivi_moral DROP CONSTRAINT suivi_moral_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.sujet_examen ADD CONSTRAINT sujet_examen_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.sujet_examen DROP CONSTRAINT sujet_examen_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.support_cours ADD CONSTRAINT support_cours_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.support_cours DROP CONSTRAINT support_cours_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.ticket_maintenance ADD CONSTRAINT ticket_maintenance_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.ticket_maintenance DROP CONSTRAINT ticket_maintenance_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.unite_enseignement ADD CONSTRAINT unite_enseignement_parcours_id_code_key UNIQUE (parcours_id, code);
ALTER TABLE ONLY tenant_universite_d_antsiranana.unite_enseignement DROP CONSTRAINT unite_enseignement_parcours_id_code_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.unite_enseignement ADD CONSTRAINT unite_enseignement_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.unite_enseignement DROP CONSTRAINT unite_enseignement_pkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.utilisateur ADD CONSTRAINT utilisateur_email_key UNIQUE (email);
ALTER TABLE ONLY tenant_universite_d_antsiranana.utilisateur DROP CONSTRAINT utilisateur_email_key;
ALTER TABLE ONLY tenant_universite_d_antsiranana.utilisateur ADD CONSTRAINT utilisateur_pkey PRIMARY KEY (id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.utilisateur DROP CONSTRAINT utilisateur_pkey;
ALTER TABLE ONLY public.abonnement ADD CONSTRAINT abonnement_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plan_abonnement(id);
ALTER TABLE ONLY public.abonnement DROP CONSTRAINT abonnement_plan_id_fkey;
ALTER TABLE ONLY public.abonnement ADD CONSTRAINT abonnement_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenant(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.abonnement DROP CONSTRAINT abonnement_tenant_id_fkey;
ALTER TABLE ONLY public.domaine ADD CONSTRAINT domaine_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenant(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.domaine DROP CONSTRAINT domaine_tenant_id_fkey;
ALTER TABLE ONLY tenant_ispm.absence_enseignant ADD CONSTRAINT absence_enseignant_declaree_par_fkey FOREIGN KEY (declaree_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.absence_enseignant DROP CONSTRAINT absence_enseignant_declaree_par_fkey;
ALTER TABLE ONLY tenant_ispm.absence_enseignant ADD CONSTRAINT absence_enseignant_enseignant_id_fkey FOREIGN KEY (enseignant_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.absence_enseignant DROP CONSTRAINT absence_enseignant_enseignant_id_fkey;
ALTER TABLE ONLY tenant_ispm.absence_enseignant ADD CONSTRAINT absence_enseignant_seance_id_fkey FOREIGN KEY (seance_id) REFERENCES tenant_ispm.emploi_du_temps(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_ispm.absence_enseignant DROP CONSTRAINT absence_enseignant_seance_id_fkey;
ALTER TABLE ONLY tenant_ispm.absence_enseignant ADD CONSTRAINT absence_enseignant_validee_par_fkey FOREIGN KEY (validee_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.absence_enseignant DROP CONSTRAINT absence_enseignant_validee_par_fkey;
ALTER TABLE ONLY tenant_ispm.affectation_cours ADD CONSTRAINT affectation_cours_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_ispm.annee_academique(id);
ALTER TABLE ONLY tenant_ispm.affectation_cours DROP CONSTRAINT affectation_cours_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_ispm.affectation_cours ADD CONSTRAINT affectation_cours_ec_id_fkey FOREIGN KEY (ec_id) REFERENCES tenant_ispm.element_constitutif(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.affectation_cours DROP CONSTRAINT affectation_cours_ec_id_fkey;
ALTER TABLE ONLY tenant_ispm.affectation_cours ADD CONSTRAINT affectation_cours_enseignant_id_fkey FOREIGN KEY (enseignant_id) REFERENCES tenant_ispm.enseignant(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_ispm.affectation_cours DROP CONSTRAINT affectation_cours_enseignant_id_fkey;
ALTER TABLE ONLY tenant_ispm.affectation_cours ADD CONSTRAINT affectation_cours_ue_id_fkey FOREIGN KEY (ue_id) REFERENCES tenant_ispm.unite_enseignement(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.affectation_cours DROP CONSTRAINT affectation_cours_ue_id_fkey;
ALTER TABLE ONLY tenant_ispm.affectation_cours ADD CONSTRAINT affectation_cours_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.affectation_cours DROP CONSTRAINT affectation_cours_valide_par_fkey;
ALTER TABLE ONLY tenant_ispm.annonce ADD CONSTRAINT annonce_auteur_id_fkey FOREIGN KEY (auteur_id) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.annonce DROP CONSTRAINT annonce_auteur_id_fkey;
ALTER TABLE ONLY tenant_ispm.annonce ADD CONSTRAINT annonce_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_ispm.parcours(id);
ALTER TABLE ONLY tenant_ispm.annonce DROP CONSTRAINT annonce_parcours_id_fkey;
ALTER TABLE ONLY tenant_ispm.archive_scolarite ADD CONSTRAINT archive_scolarite_archive_par_fkey FOREIGN KEY (archive_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.archive_scolarite DROP CONSTRAINT archive_scolarite_archive_par_fkey;
ALTER TABLE ONLY tenant_ispm.archive_scolarite ADD CONSTRAINT archive_scolarite_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_ispm.archive_scolarite DROP CONSTRAINT archive_scolarite_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.budget ADD CONSTRAINT budget_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_ispm.annee_academique(id);
ALTER TABLE ONLY tenant_ispm.budget DROP CONSTRAINT budget_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_ispm.budget ADD CONSTRAINT budget_created_by_fkey FOREIGN KEY (created_by) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.budget DROP CONSTRAINT budget_created_by_fkey;
ALTER TABLE ONLY tenant_ispm.budget ADD CONSTRAINT budget_departement_id_fkey FOREIGN KEY (departement_id) REFERENCES tenant_ispm.departement(id);
ALTER TABLE ONLY tenant_ispm.budget DROP CONSTRAINT budget_departement_id_fkey;
ALTER TABLE ONLY tenant_ispm.calendrier_academique ADD CONSTRAINT calendrier_academique_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_ispm.annee_academique(id);
ALTER TABLE ONLY tenant_ispm.calendrier_academique DROP CONSTRAINT calendrier_academique_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_ispm.calendrier_academique ADD CONSTRAINT calendrier_academique_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_ispm.parcours(id);
ALTER TABLE ONLY tenant_ispm.calendrier_academique DROP CONSTRAINT calendrier_academique_parcours_id_fkey;
ALTER TABLE ONLY tenant_ispm.candidature ADD CONSTRAINT candidature_recrutement_id_fkey FOREIGN KEY (recrutement_id) REFERENCES tenant_ispm.recrutement(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.candidature DROP CONSTRAINT candidature_recrutement_id_fkey;
ALTER TABLE ONLY tenant_ispm.conge_personnel ADD CONSTRAINT conge_personnel_approuve_par_fkey FOREIGN KEY (approuve_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.conge_personnel DROP CONSTRAINT conge_personnel_approuve_par_fkey;
ALTER TABLE ONLY tenant_ispm.conge_personnel ADD CONSTRAINT conge_personnel_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.conge_personnel DROP CONSTRAINT conge_personnel_utilisateur_id_fkey;
ALTER TABLE ONLY tenant_ispm.contrat_personnel ADD CONSTRAINT contrat_personnel_departement_id_fkey FOREIGN KEY (departement_id) REFERENCES tenant_ispm.departement(id);
ALTER TABLE ONLY tenant_ispm.contrat_personnel DROP CONSTRAINT contrat_personnel_departement_id_fkey;
ALTER TABLE ONLY tenant_ispm.contrat_personnel ADD CONSTRAINT contrat_personnel_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_ispm.contrat_personnel DROP CONSTRAINT contrat_personnel_utilisateur_id_fkey;
ALTER TABLE ONLY tenant_ispm.convocation ADD CONSTRAINT convocation_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.convocation DROP CONSTRAINT convocation_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.convocation ADD CONSTRAINT convocation_genere_par_fkey FOREIGN KEY (genere_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.convocation DROP CONSTRAINT convocation_genere_par_fkey;
ALTER TABLE ONLY tenant_ispm.convocation ADD CONSTRAINT convocation_salle_id_fkey FOREIGN KEY (salle_id) REFERENCES tenant_ispm.salle(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_ispm.convocation DROP CONSTRAINT convocation_salle_id_fkey;
ALTER TABLE ONLY tenant_ispm.convocation ADD CONSTRAINT convocation_session_examen_id_fkey FOREIGN KEY (session_examen_id) REFERENCES tenant_ispm.session_examen(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.convocation DROP CONSTRAINT convocation_session_examen_id_fkey;
ALTER TABLE ONLY tenant_ispm.deliberation ADD CONSTRAINT deliberation_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_ispm.parcours(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_ispm.deliberation DROP CONSTRAINT deliberation_parcours_id_fkey;
ALTER TABLE ONLY tenant_ispm.deliberation ADD CONSTRAINT deliberation_president_jury_id_fkey FOREIGN KEY (president_jury_id) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.deliberation DROP CONSTRAINT deliberation_president_jury_id_fkey;
ALTER TABLE ONLY tenant_ispm.deliberation ADD CONSTRAINT deliberation_session_examen_id_fkey FOREIGN KEY (session_examen_id) REFERENCES tenant_ispm.session_examen(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_ispm.deliberation DROP CONSTRAINT deliberation_session_examen_id_fkey;
ALTER TABLE ONLY tenant_ispm.deliberation ADD CONSTRAINT deliberation_validee_par_fkey FOREIGN KEY (validee_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.deliberation DROP CONSTRAINT deliberation_validee_par_fkey;
ALTER TABLE ONLY tenant_ispm.demande_etudiant ADD CONSTRAINT demande_etudiant_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.demande_etudiant DROP CONSTRAINT demande_etudiant_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.demande_etudiant ADD CONSTRAINT demande_etudiant_traite_par_fkey FOREIGN KEY (traite_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.demande_etudiant DROP CONSTRAINT demande_etudiant_traite_par_fkey;
ALTER TABLE ONLY tenant_ispm.demande_ressource ADD CONSTRAINT demande_ressource_demandeur_id_fkey FOREIGN KEY (demandeur_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.demande_ressource DROP CONSTRAINT demande_ressource_demandeur_id_fkey;
ALTER TABLE ONLY tenant_ispm.demande_ressource ADD CONSTRAINT demande_ressource_traite_par_fkey FOREIGN KEY (traite_par) REFERENCES tenant_ispm.utilisateur(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_ispm.demande_ressource DROP CONSTRAINT demande_ressource_traite_par_fkey;
ALTER TABLE ONLY tenant_ispm.departement ADD CONSTRAINT departement_responsable_id_fkey FOREIGN KEY (responsable_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_ispm.departement DROP CONSTRAINT departement_responsable_id_fkey;
ALTER TABLE ONLY tenant_ispm.depense ADD CONSTRAINT depense_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_ispm.annee_academique(id);
ALTER TABLE ONLY tenant_ispm.depense DROP CONSTRAINT depense_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_ispm.depense ADD CONSTRAINT depense_approuve_par_fkey FOREIGN KEY (approuve_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.depense DROP CONSTRAINT depense_approuve_par_fkey;
ALTER TABLE ONLY tenant_ispm.depense ADD CONSTRAINT depense_budget_id_fkey FOREIGN KEY (budget_id) REFERENCES tenant_ispm.budget(id);
ALTER TABLE ONLY tenant_ispm.depense DROP CONSTRAINT depense_budget_id_fkey;
ALTER TABLE ONLY tenant_ispm.depense ADD CONSTRAINT depense_demande_par_fkey FOREIGN KEY (demande_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.depense DROP CONSTRAINT depense_demande_par_fkey;
ALTER TABLE ONLY tenant_ispm.diplome ADD CONSTRAINT diplome_delivre_par_fkey FOREIGN KEY (delivre_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.diplome DROP CONSTRAINT diplome_delivre_par_fkey;
ALTER TABLE ONLY tenant_ispm.diplome ADD CONSTRAINT diplome_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_ispm.diplome DROP CONSTRAINT diplome_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.diplome ADD CONSTRAINT diplome_inscription_id_fkey FOREIGN KEY (inscription_id) REFERENCES tenant_ispm.inscription(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_ispm.diplome DROP CONSTRAINT diplome_inscription_id_fkey;
ALTER TABLE ONLY tenant_ispm.diplome ADD CONSTRAINT diplome_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_ispm.parcours(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_ispm.diplome DROP CONSTRAINT diplome_parcours_id_fkey;
ALTER TABLE ONLY tenant_ispm.dossier_etudiant ADD CONSTRAINT dossier_etudiant_demande_par_fkey FOREIGN KEY (demande_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.dossier_etudiant DROP CONSTRAINT dossier_etudiant_demande_par_fkey;
ALTER TABLE ONLY tenant_ispm.dossier_etudiant ADD CONSTRAINT dossier_etudiant_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.dossier_etudiant DROP CONSTRAINT dossier_etudiant_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.dossier_etudiant ADD CONSTRAINT dossier_etudiant_traite_par_fkey FOREIGN KEY (traite_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.dossier_etudiant DROP CONSTRAINT dossier_etudiant_traite_par_fkey;
ALTER TABLE ONLY tenant_ispm.echeancier ADD CONSTRAINT echeancier_inscription_id_fkey FOREIGN KEY (inscription_id) REFERENCES tenant_ispm.inscription(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.echeancier DROP CONSTRAINT echeancier_inscription_id_fkey;
ALTER TABLE ONLY tenant_ispm.element_constitutif ADD CONSTRAINT element_constitutif_ue_id_fkey FOREIGN KEY (ue_id) REFERENCES tenant_ispm.unite_enseignement(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.element_constitutif DROP CONSTRAINT element_constitutif_ue_id_fkey;
ALTER TABLE ONLY tenant_ispm.emploi_du_temps ADD CONSTRAINT emploi_du_temps_affectation_id_fkey FOREIGN KEY (affectation_id) REFERENCES tenant_ispm.affectation_cours(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.emploi_du_temps DROP CONSTRAINT emploi_du_temps_affectation_id_fkey;
ALTER TABLE ONLY tenant_ispm.emploi_du_temps ADD CONSTRAINT emploi_du_temps_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_ispm.annee_academique(id);
ALTER TABLE ONLY tenant_ispm.emploi_du_temps DROP CONSTRAINT emploi_du_temps_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_ispm.emploi_du_temps ADD CONSTRAINT emploi_du_temps_salle_id_fkey FOREIGN KEY (salle_id) REFERENCES tenant_ispm.salle(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_ispm.emploi_du_temps DROP CONSTRAINT emploi_du_temps_salle_id_fkey;
ALTER TABLE ONLY tenant_ispm.enseignant ADD CONSTRAINT enseignant_departement_id_fkey FOREIGN KEY (departement_id) REFERENCES tenant_ispm.departement(id);
ALTER TABLE ONLY tenant_ispm.enseignant DROP CONSTRAINT enseignant_departement_id_fkey;
ALTER TABLE ONLY tenant_ispm.enseignant ADD CONSTRAINT enseignant_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_ispm.enseignant DROP CONSTRAINT enseignant_utilisateur_id_fkey;
ALTER TABLE ONLY tenant_ispm.etudiant ADD CONSTRAINT etudiant_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_ispm.etudiant DROP CONSTRAINT etudiant_utilisateur_id_fkey;
ALTER TABLE ONLY tenant_ispm.evaluation_soutenance ADD CONSTRAINT evaluation_soutenance_evaluateur_id_fkey FOREIGN KEY (evaluateur_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.evaluation_soutenance DROP CONSTRAINT evaluation_soutenance_evaluateur_id_fkey;
ALTER TABLE ONLY tenant_ispm.evaluation_soutenance ADD CONSTRAINT evaluation_soutenance_soutenance_id_fkey FOREIGN KEY (soutenance_id) REFERENCES tenant_ispm.soutenance(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.evaluation_soutenance DROP CONSTRAINT evaluation_soutenance_soutenance_id_fkey;
ALTER TABLE ONLY tenant_ispm.fiche_paie ADD CONSTRAINT fiche_paie_contrat_id_fkey FOREIGN KEY (contrat_id) REFERENCES tenant_ispm.contrat_personnel(id);
ALTER TABLE ONLY tenant_ispm.fiche_paie DROP CONSTRAINT fiche_paie_contrat_id_fkey;
ALTER TABLE ONLY tenant_ispm.fiche_suivi_stage ADD CONSTRAINT fiche_suivi_stage_auteur_id_fkey FOREIGN KEY (auteur_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.fiche_suivi_stage DROP CONSTRAINT fiche_suivi_stage_auteur_id_fkey;
ALTER TABLE ONLY tenant_ispm.fiche_suivi_stage ADD CONSTRAINT fiche_suivi_stage_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES tenant_ispm.stage(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.fiche_suivi_stage DROP CONSTRAINT fiche_suivi_stage_stage_id_fkey;
ALTER TABLE ONLY tenant_ispm.message_enseignant ADD CONSTRAINT fk_enseignant FOREIGN KEY (enseignant_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.message_enseignant DROP CONSTRAINT fk_enseignant;
ALTER TABLE ONLY tenant_ispm.message_enseignant ADD CONSTRAINT fk_etudiant FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.message_enseignant DROP CONSTRAINT fk_etudiant;
ALTER TABLE ONLY tenant_ispm.message_destinataire ADD CONSTRAINT fk_etudiant_dest FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.message_destinataire DROP CONSTRAINT fk_etudiant_dest;
ALTER TABLE ONLY tenant_ispm.message_destinataire ADD CONSTRAINT fk_message FOREIGN KEY (message_id) REFERENCES tenant_ispm.message_enseignant(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.message_destinataire DROP CONSTRAINT fk_message;
ALTER TABLE ONLY tenant_ispm.message_enseignant ADD CONSTRAINT fk_niveau FOREIGN KEY (niveau_id) REFERENCES tenant_ispm.niveau_etude(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_ispm.message_enseignant DROP CONSTRAINT fk_niveau;
ALTER TABLE ONLY tenant_ispm.message_enseignant ADD CONSTRAINT fk_parcours FOREIGN KEY (parcours_id) REFERENCES tenant_ispm.parcours(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_ispm.message_enseignant DROP CONSTRAINT fk_parcours;
ALTER TABLE ONLY tenant_ispm.secretaire_parcours ADD CONSTRAINT fk_secretaire_parcours_parcours FOREIGN KEY (parcours_id) REFERENCES tenant_ispm.parcours(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.secretaire_parcours DROP CONSTRAINT fk_secretaire_parcours_parcours;
ALTER TABLE ONLY tenant_ispm.grille_tarifaire ADD CONSTRAINT grille_tarifaire_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_ispm.annee_academique(id);
ALTER TABLE ONLY tenant_ispm.grille_tarifaire DROP CONSTRAINT grille_tarifaire_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_ispm.grille_tarifaire ADD CONSTRAINT grille_tarifaire_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_ispm.parcours(id);
ALTER TABLE ONLY tenant_ispm.grille_tarifaire DROP CONSTRAINT grille_tarifaire_parcours_id_fkey;
ALTER TABLE ONLY tenant_ispm.heure_complementaire ADD CONSTRAINT heure_complementaire_enseignant_id_fkey FOREIGN KEY (enseignant_id) REFERENCES tenant_ispm.enseignant(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.heure_complementaire DROP CONSTRAINT heure_complementaire_enseignant_id_fkey;
ALTER TABLE ONLY tenant_ispm.heure_complementaire ADD CONSTRAINT heure_complementaire_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.heure_complementaire DROP CONSTRAINT heure_complementaire_valide_par_fkey;
ALTER TABLE ONLY tenant_ispm.incident_disciplinaire ADD CONSTRAINT incident_disciplinaire_arbitre_par_fkey FOREIGN KEY (arbitre_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.incident_disciplinaire DROP CONSTRAINT incident_disciplinaire_arbitre_par_fkey;
ALTER TABLE ONLY tenant_ispm.incident_disciplinaire ADD CONSTRAINT incident_disciplinaire_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id);
ALTER TABLE ONLY tenant_ispm.incident_disciplinaire DROP CONSTRAINT incident_disciplinaire_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.incident_disciplinaire ADD CONSTRAINT incident_disciplinaire_rapporte_par_fkey FOREIGN KEY (rapporte_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.incident_disciplinaire DROP CONSTRAINT incident_disciplinaire_rapporte_par_fkey;
ALTER TABLE ONLY tenant_ispm.inscription ADD CONSTRAINT inscription_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_ispm.annee_academique(id);
ALTER TABLE ONLY tenant_ispm.inscription DROP CONSTRAINT inscription_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_ispm.inscription ADD CONSTRAINT inscription_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_ispm.inscription DROP CONSTRAINT inscription_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.inscription ADD CONSTRAINT inscription_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_ispm.parcours(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_ispm.inscription DROP CONSTRAINT inscription_parcours_id_fkey;
ALTER TABLE ONLY tenant_ispm.inscription ADD CONSTRAINT inscription_validee_par_fkey FOREIGN KEY (validee_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.inscription DROP CONSTRAINT inscription_validee_par_fkey;
ALTER TABLE ONLY tenant_ispm.message ADD CONSTRAINT message_destinataire_id_fkey FOREIGN KEY (destinataire_id) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.message DROP CONSTRAINT message_destinataire_id_fkey;
ALTER TABLE ONLY tenant_ispm.message ADD CONSTRAINT message_expediteur_id_fkey FOREIGN KEY (expediteur_id) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.message DROP CONSTRAINT message_expediteur_id_fkey;
ALTER TABLE ONLY tenant_ispm.message ADD CONSTRAINT message_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES tenant_ispm.message(id);
ALTER TABLE ONLY tenant_ispm.message DROP CONSTRAINT message_parent_id_fkey;
ALTER TABLE ONLY tenant_ispm.mouvement_stock ADD CONSTRAINT mouvement_stock_stock_id_fkey FOREIGN KEY (stock_id) REFERENCES tenant_ispm.stock(id);
ALTER TABLE ONLY tenant_ispm.mouvement_stock DROP CONSTRAINT mouvement_stock_stock_id_fkey;
ALTER TABLE ONLY tenant_ispm.mouvement_stock ADD CONSTRAINT mouvement_stock_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.mouvement_stock DROP CONSTRAINT mouvement_stock_utilisateur_id_fkey;
ALTER TABLE ONLY tenant_ispm.note_derogatoire ADD CONSTRAINT note_derogatoire_ec_id_fkey FOREIGN KEY (ec_id) REFERENCES tenant_ispm.element_constitutif(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_ispm.note_derogatoire DROP CONSTRAINT note_derogatoire_ec_id_fkey;
ALTER TABLE ONLY tenant_ispm.note_derogatoire ADD CONSTRAINT note_derogatoire_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.note_derogatoire DROP CONSTRAINT note_derogatoire_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.note_derogatoire ADD CONSTRAINT note_derogatoire_saisie_par_fkey FOREIGN KEY (saisie_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.note_derogatoire DROP CONSTRAINT note_derogatoire_saisie_par_fkey;
ALTER TABLE ONLY tenant_ispm.note_derogatoire ADD CONSTRAINT note_derogatoire_session_examen_id_fkey FOREIGN KEY (session_examen_id) REFERENCES tenant_ispm.session_examen(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_ispm.note_derogatoire DROP CONSTRAINT note_derogatoire_session_examen_id_fkey;
ALTER TABLE ONLY tenant_ispm.note_derogatoire ADD CONSTRAINT note_derogatoire_ue_id_fkey FOREIGN KEY (ue_id) REFERENCES tenant_ispm.unite_enseignement(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_ispm.note_derogatoire DROP CONSTRAINT note_derogatoire_ue_id_fkey;
ALTER TABLE ONLY tenant_ispm.note_derogatoire ADD CONSTRAINT note_derogatoire_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.note_derogatoire DROP CONSTRAINT note_derogatoire_valide_par_fkey;
ALTER TABLE ONLY tenant_ispm.note_derogatoire ADD CONSTRAINT note_derogatoire_valide_par_scolarite_fkey FOREIGN KEY (valide_par_scolarite) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.note_derogatoire DROP CONSTRAINT note_derogatoire_valide_par_scolarite_fkey;
ALTER TABLE ONLY tenant_ispm.note ADD CONSTRAINT note_ec_id_fkey FOREIGN KEY (ec_id) REFERENCES tenant_ispm.element_constitutif(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_ispm.note DROP CONSTRAINT note_ec_id_fkey;
ALTER TABLE ONLY tenant_ispm.note ADD CONSTRAINT note_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_ispm.note DROP CONSTRAINT note_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.note ADD CONSTRAINT note_saisi_par_fkey FOREIGN KEY (saisi_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.note DROP CONSTRAINT note_saisi_par_fkey;
ALTER TABLE ONLY tenant_ispm.note ADD CONSTRAINT note_session_id_fkey FOREIGN KEY (session_id) REFERENCES tenant_ispm.session_examen(id);
ALTER TABLE ONLY tenant_ispm.note DROP CONSTRAINT note_session_id_fkey;
ALTER TABLE ONLY tenant_ispm.note ADD CONSTRAINT note_ue_id_fkey FOREIGN KEY (ue_id) REFERENCES tenant_ispm.unite_enseignement(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_ispm.note DROP CONSTRAINT note_ue_id_fkey;
ALTER TABLE ONLY tenant_ispm.note ADD CONSTRAINT note_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.note DROP CONSTRAINT note_valide_par_fkey;
ALTER TABLE ONLY tenant_ispm.notification ADD CONSTRAINT notification_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.notification DROP CONSTRAINT notification_utilisateur_id_fkey;
ALTER TABLE ONLY tenant_ispm.paiement ADD CONSTRAINT paiement_caissier_id_fkey FOREIGN KEY (caissier_id) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.paiement DROP CONSTRAINT paiement_caissier_id_fkey;
ALTER TABLE ONLY tenant_ispm.paiement ADD CONSTRAINT paiement_echeancier_id_fkey FOREIGN KEY (echeancier_id) REFERENCES tenant_ispm.echeancier(id);
ALTER TABLE ONLY tenant_ispm.paiement DROP CONSTRAINT paiement_echeancier_id_fkey;
ALTER TABLE ONLY tenant_ispm.paiement_inscription ADD CONSTRAINT paiement_inscription_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.paiement_inscription DROP CONSTRAINT paiement_inscription_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.paiement ADD CONSTRAINT paiement_inscription_id_fkey FOREIGN KEY (inscription_id) REFERENCES tenant_ispm.inscription(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_ispm.paiement DROP CONSTRAINT paiement_inscription_id_fkey;
ALTER TABLE ONLY tenant_ispm.paiement_inscription ADD CONSTRAINT paiement_inscription_inscription_id_fkey FOREIGN KEY (inscription_id) REFERENCES tenant_ispm.inscription(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.paiement_inscription DROP CONSTRAINT paiement_inscription_inscription_id_fkey;
ALTER TABLE ONLY tenant_ispm.paiement_inscription ADD CONSTRAINT paiement_inscription_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.paiement_inscription DROP CONSTRAINT paiement_inscription_valide_par_fkey;
ALTER TABLE ONLY tenant_ispm.parcours ADD CONSTRAINT parcours_departement_id_fkey FOREIGN KEY (departement_id) REFERENCES tenant_ispm.departement(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_ispm.parcours DROP CONSTRAINT parcours_departement_id_fkey;
ALTER TABLE ONLY tenant_ispm.parcours ADD CONSTRAINT parcours_responsable_id_fkey FOREIGN KEY (responsable_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_ispm.parcours DROP CONSTRAINT parcours_responsable_id_fkey;
ALTER TABLE ONLY tenant_ispm.parcours ADD CONSTRAINT parcours_secretaire_id_fkey FOREIGN KEY (secretaire_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_ispm.parcours DROP CONSTRAINT parcours_secretaire_id_fkey;
ALTER TABLE ONLY tenant_ispm.planning_entretien ADD CONSTRAINT planning_entretien_batiment_id_fkey FOREIGN KEY (batiment_id) REFERENCES tenant_ispm.batiment(id);
ALTER TABLE ONLY tenant_ispm.planning_entretien DROP CONSTRAINT planning_entretien_batiment_id_fkey;
ALTER TABLE ONLY tenant_ispm.planning_entretien ADD CONSTRAINT planning_entretien_responsable_id_fkey FOREIGN KEY (responsable_id) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.planning_entretien DROP CONSTRAINT planning_entretien_responsable_id_fkey;
ALTER TABLE ONLY tenant_ispm.planning_entretien ADD CONSTRAINT planning_entretien_salle_id_fkey FOREIGN KEY (salle_id) REFERENCES tenant_ispm.salle(id);
ALTER TABLE ONLY tenant_ispm.planning_entretien DROP CONSTRAINT planning_entretien_salle_id_fkey;
ALTER TABLE ONLY tenant_ispm.presence ADD CONSTRAINT presence_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.presence DROP CONSTRAINT presence_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.presence ADD CONSTRAINT presence_saisi_par_fkey FOREIGN KEY (saisi_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.presence DROP CONSTRAINT presence_saisi_par_fkey;
ALTER TABLE ONLY tenant_ispm.presence ADD CONSTRAINT presence_seance_id_fkey FOREIGN KEY (seance_id) REFERENCES tenant_ispm.emploi_du_temps(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.presence DROP CONSTRAINT presence_seance_id_fkey;
ALTER TABLE ONLY tenant_ispm.presence ADD CONSTRAINT presence_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.presence DROP CONSTRAINT presence_valide_par_fkey;
ALTER TABLE ONLY tenant_ispm.proces_verbal ADD CONSTRAINT proces_verbal_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_ispm.annee_academique(id);
ALTER TABLE ONLY tenant_ispm.proces_verbal DROP CONSTRAINT proces_verbal_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_ispm.proces_verbal ADD CONSTRAINT proces_verbal_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_ispm.parcours(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.proces_verbal DROP CONSTRAINT proces_verbal_parcours_id_fkey;
ALTER TABLE ONLY tenant_ispm.proces_verbal ADD CONSTRAINT proces_verbal_redige_par_fkey FOREIGN KEY (redige_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.proces_verbal DROP CONSTRAINT proces_verbal_redige_par_fkey;
ALTER TABLE ONLY tenant_ispm.proces_verbal ADD CONSTRAINT proces_verbal_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_ispm.utilisateur(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_ispm.proces_verbal DROP CONSTRAINT proces_verbal_valide_par_fkey;
ALTER TABLE ONLY tenant_ispm.pv_deliberation ADD CONSTRAINT pv_deliberation_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_ispm.parcours(id);
ALTER TABLE ONLY tenant_ispm.pv_deliberation DROP CONSTRAINT pv_deliberation_parcours_id_fkey;
ALTER TABLE ONLY tenant_ispm.pv_deliberation ADD CONSTRAINT pv_deliberation_president_jury_fkey FOREIGN KEY (president_jury) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.pv_deliberation DROP CONSTRAINT pv_deliberation_president_jury_fkey;
ALTER TABLE ONLY tenant_ispm.pv_deliberation ADD CONSTRAINT pv_deliberation_session_id_fkey FOREIGN KEY (session_id) REFERENCES tenant_ispm.session_examen(id);
ALTER TABLE ONLY tenant_ispm.pv_deliberation DROP CONSTRAINT pv_deliberation_session_id_fkey;
ALTER TABLE ONLY tenant_ispm.rapport_entretien ADD CONSTRAINT rapport_entretien_planning_id_fkey FOREIGN KEY (planning_id) REFERENCES tenant_ispm.planning_entretien(id);
ALTER TABLE ONLY tenant_ispm.rapport_entretien DROP CONSTRAINT rapport_entretien_planning_id_fkey;
ALTER TABLE ONLY tenant_ispm.rapport_entretien ADD CONSTRAINT rapport_entretien_realise_par_fkey FOREIGN KEY (realise_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.rapport_entretien DROP CONSTRAINT rapport_entretien_realise_par_fkey;
ALTER TABLE ONLY tenant_ispm.rattrapage ADD CONSTRAINT rattrapage_absence_id_fkey FOREIGN KEY (absence_id) REFERENCES tenant_ispm.absence_enseignant(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.rattrapage DROP CONSTRAINT rattrapage_absence_id_fkey;
ALTER TABLE ONLY tenant_ispm.rattrapage ADD CONSTRAINT rattrapage_planifie_par_fkey FOREIGN KEY (planifie_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.rattrapage DROP CONSTRAINT rattrapage_planifie_par_fkey;
ALTER TABLE ONLY tenant_ispm.rattrapage ADD CONSTRAINT rattrapage_remplaceur_id_fkey FOREIGN KEY (remplaceur_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_ispm.rattrapage DROP CONSTRAINT rattrapage_remplaceur_id_fkey;
ALTER TABLE ONLY tenant_ispm.rattrapage ADD CONSTRAINT rattrapage_salle_id_fkey FOREIGN KEY (salle_id) REFERENCES tenant_ispm.salle(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_ispm.rattrapage DROP CONSTRAINT rattrapage_salle_id_fkey;
ALTER TABLE ONLY tenant_ispm.recrutement ADD CONSTRAINT recrutement_departement_id_fkey FOREIGN KEY (departement_id) REFERENCES tenant_ispm.departement(id);
ALTER TABLE ONLY tenant_ispm.recrutement DROP CONSTRAINT recrutement_departement_id_fkey;
ALTER TABLE ONLY tenant_ispm.recrutement ADD CONSTRAINT recrutement_responsable_id_fkey FOREIGN KEY (responsable_id) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.recrutement DROP CONSTRAINT recrutement_responsable_id_fkey;
ALTER TABLE ONLY tenant_ispm.referentiel_competences ADD CONSTRAINT referentiel_competences_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_ispm.parcours(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.referentiel_competences DROP CONSTRAINT referentiel_competences_parcours_id_fkey;
ALTER TABLE ONLY tenant_ispm.referentiel_competences ADD CONSTRAINT referentiel_competences_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_ispm.utilisateur(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_ispm.referentiel_competences DROP CONSTRAINT referentiel_competences_valide_par_fkey;
ALTER TABLE ONLY tenant_ispm.reservation_salle ADD CONSTRAINT reservation_salle_approuve_par_fkey FOREIGN KEY (approuve_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.reservation_salle DROP CONSTRAINT reservation_salle_approuve_par_fkey;
ALTER TABLE ONLY tenant_ispm.reservation_salle ADD CONSTRAINT reservation_salle_demande_par_fkey FOREIGN KEY (demande_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.reservation_salle DROP CONSTRAINT reservation_salle_demande_par_fkey;
ALTER TABLE ONLY tenant_ispm.reservation_salle ADD CONSTRAINT reservation_salle_salle_id_fkey FOREIGN KEY (salle_id) REFERENCES tenant_ispm.salle(id);
ALTER TABLE ONLY tenant_ispm.reservation_salle DROP CONSTRAINT reservation_salle_salle_id_fkey;
ALTER TABLE ONLY tenant_ispm.resultat_deliberation ADD CONSTRAINT resultat_deliberation_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id);
ALTER TABLE ONLY tenant_ispm.resultat_deliberation DROP CONSTRAINT resultat_deliberation_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.resultat_deliberation ADD CONSTRAINT resultat_deliberation_pv_id_fkey FOREIGN KEY (pv_id) REFERENCES tenant_ispm.pv_deliberation(id);
ALTER TABLE ONLY tenant_ispm.resultat_deliberation DROP CONSTRAINT resultat_deliberation_pv_id_fkey;
ALTER TABLE ONLY tenant_ispm.resultat_semestre ADD CONSTRAINT resultat_semestre_deliberation_id_fkey FOREIGN KEY (deliberation_id) REFERENCES tenant_ispm.deliberation(id);
ALTER TABLE ONLY tenant_ispm.resultat_semestre DROP CONSTRAINT resultat_semestre_deliberation_id_fkey;
ALTER TABLE ONLY tenant_ispm.resultat_semestre ADD CONSTRAINT resultat_semestre_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_ispm.resultat_semestre DROP CONSTRAINT resultat_semestre_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.resultat_semestre ADD CONSTRAINT resultat_semestre_inscription_id_fkey FOREIGN KEY (inscription_id) REFERENCES tenant_ispm.inscription(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_ispm.resultat_semestre DROP CONSTRAINT resultat_semestre_inscription_id_fkey;
ALTER TABLE ONLY tenant_ispm.resultat_ue ADD CONSTRAINT resultat_ue_compensation_ue_id_fkey FOREIGN KEY (compensation_ue_id) REFERENCES tenant_ispm.unite_enseignement(id);
ALTER TABLE ONLY tenant_ispm.resultat_ue DROP CONSTRAINT resultat_ue_compensation_ue_id_fkey;
ALTER TABLE ONLY tenant_ispm.resultat_ue ADD CONSTRAINT resultat_ue_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_ispm.resultat_ue DROP CONSTRAINT resultat_ue_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.resultat_ue ADD CONSTRAINT resultat_ue_resultat_semestre_id_fkey FOREIGN KEY (resultat_semestre_id) REFERENCES tenant_ispm.resultat_semestre(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_ispm.resultat_ue DROP CONSTRAINT resultat_ue_resultat_semestre_id_fkey;
ALTER TABLE ONLY tenant_ispm.resultat_ue ADD CONSTRAINT resultat_ue_ue_id_fkey FOREIGN KEY (ue_id) REFERENCES tenant_ispm.unite_enseignement(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_ispm.resultat_ue DROP CONSTRAINT resultat_ue_ue_id_fkey;
ALTER TABLE ONLY tenant_ispm.salle ADD CONSTRAINT salle_batiment_id_fkey FOREIGN KEY (batiment_id) REFERENCES tenant_ispm.batiment(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_ispm.salle DROP CONSTRAINT salle_batiment_id_fkey;
ALTER TABLE ONLY tenant_ispm.session_examen ADD CONSTRAINT session_examen_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_ispm.annee_academique(id);
ALTER TABLE ONLY tenant_ispm.session_examen DROP CONSTRAINT session_examen_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_ispm.session_jwt ADD CONSTRAINT session_jwt_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.session_jwt DROP CONSTRAINT session_jwt_utilisateur_id_fkey;
ALTER TABLE ONLY tenant_ispm.soutenance ADD CONSTRAINT soutenance_president_jury_id_fkey FOREIGN KEY (president_jury_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_ispm.soutenance DROP CONSTRAINT soutenance_president_jury_id_fkey;
ALTER TABLE ONLY tenant_ispm.soutenance ADD CONSTRAINT soutenance_salle_id_fkey FOREIGN KEY (salle_id) REFERENCES tenant_ispm.salle(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_ispm.soutenance DROP CONSTRAINT soutenance_salle_id_fkey;
ALTER TABLE ONLY tenant_ispm.soutenance ADD CONSTRAINT soutenance_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES tenant_ispm.stage(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.soutenance DROP CONSTRAINT soutenance_stage_id_fkey;
ALTER TABLE ONLY tenant_ispm.stage ADD CONSTRAINT stage_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_ispm.annee_academique(id);
ALTER TABLE ONLY tenant_ispm.stage DROP CONSTRAINT stage_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_ispm.stage ADD CONSTRAINT stage_encadrant_id_fkey FOREIGN KEY (encadrant_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_ispm.stage DROP CONSTRAINT stage_encadrant_id_fkey;
ALTER TABLE ONLY tenant_ispm.stage ADD CONSTRAINT stage_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.stage DROP CONSTRAINT stage_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.stage ADD CONSTRAINT stage_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_ispm.parcours(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_ispm.stage DROP CONSTRAINT stage_parcours_id_fkey;
ALTER TABLE ONLY tenant_ispm.stage ADD CONSTRAINT stage_rapporteur_id_fkey FOREIGN KEY (rapporteur_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_ispm.stage DROP CONSTRAINT stage_rapporteur_id_fkey;
ALTER TABLE ONLY tenant_ispm.sujet_examen ADD CONSTRAINT sujet_examen_ec_id_fkey FOREIGN KEY (ec_id) REFERENCES tenant_ispm.element_constitutif(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_ispm.sujet_examen DROP CONSTRAINT sujet_examen_ec_id_fkey;
ALTER TABLE ONLY tenant_ispm.sujet_examen ADD CONSTRAINT sujet_examen_enseignant_id_fkey FOREIGN KEY (enseignant_id) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.sujet_examen DROP CONSTRAINT sujet_examen_enseignant_id_fkey;
ALTER TABLE ONLY tenant_ispm.sujet_examen ADD CONSTRAINT sujet_examen_relu_par_fkey FOREIGN KEY (relu_par) REFERENCES tenant_ispm.utilisateur(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_ispm.sujet_examen DROP CONSTRAINT sujet_examen_relu_par_fkey;
ALTER TABLE ONLY tenant_ispm.sujet_examen ADD CONSTRAINT sujet_examen_soumis_par_fkey FOREIGN KEY (soumis_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.sujet_examen DROP CONSTRAINT sujet_examen_soumis_par_fkey;
ALTER TABLE ONLY tenant_ispm.sujet_examen ADD CONSTRAINT sujet_examen_ue_id_fkey FOREIGN KEY (ue_id) REFERENCES tenant_ispm.unite_enseignement(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_ispm.sujet_examen DROP CONSTRAINT sujet_examen_ue_id_fkey;
ALTER TABLE ONLY tenant_ispm.sujet_examen ADD CONSTRAINT sujet_examen_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_ispm.utilisateur(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_ispm.sujet_examen DROP CONSTRAINT sujet_examen_valide_par_fkey;
ALTER TABLE ONLY tenant_ispm.suplement_diplome ADD CONSTRAINT suplement_diplome_certifie_par_fkey FOREIGN KEY (certifie_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.suplement_diplome DROP CONSTRAINT suplement_diplome_certifie_par_fkey;
ALTER TABLE ONLY tenant_ispm.suplement_diplome ADD CONSTRAINT suplement_diplome_diplome_id_fkey FOREIGN KEY (diplome_id) REFERENCES tenant_ispm.diplome(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_ispm.suplement_diplome DROP CONSTRAINT suplement_diplome_diplome_id_fkey;
ALTER TABLE ONLY tenant_ispm.support_cours ADD CONSTRAINT support_cours_auteur_id_fkey FOREIGN KEY (auteur_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.support_cours DROP CONSTRAINT support_cours_auteur_id_fkey;
ALTER TABLE ONLY tenant_ispm.support_cours ADD CONSTRAINT support_cours_ec_id_fkey FOREIGN KEY (ec_id) REFERENCES tenant_ispm.element_constitutif(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_ispm.support_cours DROP CONSTRAINT support_cours_ec_id_fkey;
ALTER TABLE ONLY tenant_ispm.ticket_maintenance ADD CONSTRAINT ticket_maintenance_assigne_a_fkey FOREIGN KEY (assigne_a) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.ticket_maintenance DROP CONSTRAINT ticket_maintenance_assigne_a_fkey;
ALTER TABLE ONLY tenant_ispm.ticket_maintenance ADD CONSTRAINT ticket_maintenance_batiment_id_fkey FOREIGN KEY (batiment_id) REFERENCES tenant_ispm.batiment(id);
ALTER TABLE ONLY tenant_ispm.ticket_maintenance DROP CONSTRAINT ticket_maintenance_batiment_id_fkey;
ALTER TABLE ONLY tenant_ispm.ticket_maintenance ADD CONSTRAINT ticket_maintenance_salle_id_fkey FOREIGN KEY (salle_id) REFERENCES tenant_ispm.salle(id);
ALTER TABLE ONLY tenant_ispm.ticket_maintenance DROP CONSTRAINT ticket_maintenance_salle_id_fkey;
ALTER TABLE ONLY tenant_ispm.ticket_maintenance ADD CONSTRAINT ticket_maintenance_signale_par_fkey FOREIGN KEY (signale_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.ticket_maintenance DROP CONSTRAINT ticket_maintenance_signale_par_fkey;
ALTER TABLE ONLY tenant_ispm.transfert_etudiant ADD CONSTRAINT transfert_etudiant_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_ispm.transfert_etudiant DROP CONSTRAINT transfert_etudiant_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.transfert_etudiant ADD CONSTRAINT transfert_etudiant_parcours_destination_id_fkey FOREIGN KEY (parcours_destination_id) REFERENCES tenant_ispm.parcours(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_ispm.transfert_etudiant DROP CONSTRAINT transfert_etudiant_parcours_destination_id_fkey;
ALTER TABLE ONLY tenant_ispm.transfert_etudiant ADD CONSTRAINT transfert_etudiant_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.transfert_etudiant DROP CONSTRAINT transfert_etudiant_valide_par_fkey;
ALTER TABLE ONLY tenant_ispm.unite_enseignement ADD CONSTRAINT unite_enseignement_enseignant_id_fkey FOREIGN KEY (enseignant_id) REFERENCES tenant_ispm.enseignant(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_ispm.unite_enseignement DROP CONSTRAINT unite_enseignement_enseignant_id_fkey;
ALTER TABLE ONLY tenant_ispm.unite_enseignement ADD CONSTRAINT unite_enseignement_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_ispm.parcours(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_ispm.unite_enseignement DROP CONSTRAINT unite_enseignement_parcours_id_fkey;
ALTER TABLE ONLY tenant_ispm.verrouillage_notes ADD CONSTRAINT verrouillage_notes_autorise_par_fkey FOREIGN KEY (autorise_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.verrouillage_notes DROP CONSTRAINT verrouillage_notes_autorise_par_fkey;
ALTER TABLE ONLY tenant_ispm.verrouillage_notes ADD CONSTRAINT verrouillage_notes_deliberation_id_fkey FOREIGN KEY (deliberation_id) REFERENCES tenant_ispm.deliberation(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_ispm.verrouillage_notes DROP CONSTRAINT verrouillage_notes_deliberation_id_fkey;
ALTER TABLE ONLY tenant_ispm.verrouillage_notes ADD CONSTRAINT verrouillage_notes_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_ispm.verrouillage_notes DROP CONSTRAINT verrouillage_notes_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.verrouillage_notes ADD CONSTRAINT verrouillage_notes_session_examen_id_fkey FOREIGN KEY (session_examen_id) REFERENCES tenant_ispm.session_examen(id);
ALTER TABLE ONLY tenant_ispm.verrouillage_notes DROP CONSTRAINT verrouillage_notes_session_examen_id_fkey;
ALTER TABLE ONLY tenant_ispm.verrouillage_notes ADD CONSTRAINT verrouillage_notes_verrouille_par_fkey FOREIGN KEY (verrouille_par) REFERENCES tenant_ispm.utilisateur(id);
ALTER TABLE ONLY tenant_ispm.verrouillage_notes DROP CONSTRAINT verrouillage_notes_verrouille_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.absence_enseignant ADD CONSTRAINT absence_enseignant_declaree_par_fkey FOREIGN KEY (declaree_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.absence_enseignant DROP CONSTRAINT absence_enseignant_declaree_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.absence_enseignant ADD CONSTRAINT absence_enseignant_enseignant_id_fkey FOREIGN KEY (enseignant_id) REFERENCES tenant_universite_d_antsiranana.enseignant(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_universite_d_antsiranana.absence_enseignant DROP CONSTRAINT absence_enseignant_enseignant_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.absence_enseignant ADD CONSTRAINT absence_enseignant_seance_id_fkey FOREIGN KEY (seance_id) REFERENCES tenant_universite_d_antsiranana.emploi_du_temps(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_universite_d_antsiranana.absence_enseignant DROP CONSTRAINT absence_enseignant_seance_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.absence_enseignant ADD CONSTRAINT absence_enseignant_validee_par_fkey FOREIGN KEY (validee_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.absence_enseignant DROP CONSTRAINT absence_enseignant_validee_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.affectation_cours ADD CONSTRAINT affectation_cours_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_universite_d_antsiranana.annee_academique(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.affectation_cours DROP CONSTRAINT affectation_cours_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.affectation_cours ADD CONSTRAINT affectation_cours_ec_id_fkey FOREIGN KEY (ec_id) REFERENCES tenant_universite_d_antsiranana.element_constitutif(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_universite_d_antsiranana.affectation_cours DROP CONSTRAINT affectation_cours_ec_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.affectation_cours ADD CONSTRAINT affectation_cours_enseignant_id_fkey FOREIGN KEY (enseignant_id) REFERENCES tenant_universite_d_antsiranana.enseignant(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_universite_d_antsiranana.affectation_cours DROP CONSTRAINT affectation_cours_enseignant_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.affectation_cours ADD CONSTRAINT affectation_cours_ue_id_fkey FOREIGN KEY (ue_id) REFERENCES tenant_universite_d_antsiranana.unite_enseignement(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_universite_d_antsiranana.affectation_cours DROP CONSTRAINT affectation_cours_ue_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.affectation_cours ADD CONSTRAINT affectation_cours_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.affectation_cours DROP CONSTRAINT affectation_cours_valide_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.annonce ADD CONSTRAINT annonce_auteur_id_fkey FOREIGN KEY (auteur_id) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.annonce DROP CONSTRAINT annonce_auteur_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.annonce ADD CONSTRAINT annonce_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_universite_d_antsiranana.parcours(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.annonce DROP CONSTRAINT annonce_parcours_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.budget ADD CONSTRAINT budget_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_universite_d_antsiranana.annee_academique(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.budget DROP CONSTRAINT budget_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.budget ADD CONSTRAINT budget_created_by_fkey FOREIGN KEY (created_by) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.budget DROP CONSTRAINT budget_created_by_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.budget ADD CONSTRAINT budget_departement_id_fkey FOREIGN KEY (departement_id) REFERENCES tenant_universite_d_antsiranana.departement(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.budget DROP CONSTRAINT budget_departement_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.calendrier_academique ADD CONSTRAINT calendrier_academique_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_universite_d_antsiranana.annee_academique(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.calendrier_academique DROP CONSTRAINT calendrier_academique_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.calendrier_academique ADD CONSTRAINT calendrier_academique_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_universite_d_antsiranana.parcours(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.calendrier_academique DROP CONSTRAINT calendrier_academique_parcours_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.candidature ADD CONSTRAINT candidature_recrutement_id_fkey FOREIGN KEY (recrutement_id) REFERENCES tenant_universite_d_antsiranana.recrutement(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_universite_d_antsiranana.candidature DROP CONSTRAINT candidature_recrutement_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.cloture_caisse ADD CONSTRAINT cloture_caisse_caissier_id_fkey FOREIGN KEY (caissier_id) REFERENCES tenant_universite_d_antsiranana.utilisateur(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_universite_d_antsiranana.cloture_caisse DROP CONSTRAINT cloture_caisse_caissier_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.cloture_caisse ADD CONSTRAINT cloture_caisse_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.cloture_caisse DROP CONSTRAINT cloture_caisse_valide_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.conge_personnel ADD CONSTRAINT conge_personnel_approuve_par_fkey FOREIGN KEY (approuve_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.conge_personnel DROP CONSTRAINT conge_personnel_approuve_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.conge_personnel ADD CONSTRAINT conge_personnel_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.conge_personnel DROP CONSTRAINT conge_personnel_utilisateur_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.contrat_personnel ADD CONSTRAINT contrat_personnel_departement_id_fkey FOREIGN KEY (departement_id) REFERENCES tenant_universite_d_antsiranana.departement(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.contrat_personnel DROP CONSTRAINT contrat_personnel_departement_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.contrat_personnel ADD CONSTRAINT contrat_personnel_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES tenant_universite_d_antsiranana.utilisateur(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_universite_d_antsiranana.contrat_personnel DROP CONSTRAINT contrat_personnel_utilisateur_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.convocation ADD CONSTRAINT convocation_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_universite_d_antsiranana.etudiant(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_universite_d_antsiranana.convocation DROP CONSTRAINT convocation_etudiant_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.convocation ADD CONSTRAINT convocation_genere_par_fkey FOREIGN KEY (genere_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.convocation DROP CONSTRAINT convocation_genere_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.convocation ADD CONSTRAINT convocation_salle_id_fkey FOREIGN KEY (salle_id) REFERENCES tenant_universite_d_antsiranana.salle(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_universite_d_antsiranana.convocation DROP CONSTRAINT convocation_salle_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.convocation ADD CONSTRAINT convocation_session_examen_id_fkey FOREIGN KEY (session_examen_id) REFERENCES tenant_universite_d_antsiranana.session_examen(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_universite_d_antsiranana.convocation DROP CONSTRAINT convocation_session_examen_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.demande_etudiant ADD CONSTRAINT demande_etudiant_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_universite_d_antsiranana.etudiant(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_universite_d_antsiranana.demande_etudiant DROP CONSTRAINT demande_etudiant_etudiant_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.demande_etudiant ADD CONSTRAINT demande_etudiant_traite_par_fkey FOREIGN KEY (traite_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.demande_etudiant DROP CONSTRAINT demande_etudiant_traite_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.demande_ressource ADD CONSTRAINT demande_ressource_demandeur_id_fkey FOREIGN KEY (demandeur_id) REFERENCES tenant_universite_d_antsiranana.utilisateur(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_universite_d_antsiranana.demande_ressource DROP CONSTRAINT demande_ressource_demandeur_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.demande_ressource ADD CONSTRAINT demande_ressource_traite_par_fkey FOREIGN KEY (traite_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_universite_d_antsiranana.demande_ressource DROP CONSTRAINT demande_ressource_traite_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.departement ADD CONSTRAINT departement_responsable_id_fkey FOREIGN KEY (responsable_id) REFERENCES tenant_universite_d_antsiranana.utilisateur(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_universite_d_antsiranana.departement DROP CONSTRAINT departement_responsable_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.depense ADD CONSTRAINT depense_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_universite_d_antsiranana.annee_academique(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.depense DROP CONSTRAINT depense_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.depense ADD CONSTRAINT depense_approuve_par_fkey FOREIGN KEY (approuve_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.depense DROP CONSTRAINT depense_approuve_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.depense ADD CONSTRAINT depense_budget_id_fkey FOREIGN KEY (budget_id) REFERENCES tenant_universite_d_antsiranana.budget(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.depense DROP CONSTRAINT depense_budget_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.depense ADD CONSTRAINT depense_demande_par_fkey FOREIGN KEY (demande_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.depense DROP CONSTRAINT depense_demande_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.diplome ADD CONSTRAINT diplome_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_universite_d_antsiranana.annee_academique(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.diplome DROP CONSTRAINT diplome_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.diplome ADD CONSTRAINT diplome_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_universite_d_antsiranana.etudiant(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_universite_d_antsiranana.diplome DROP CONSTRAINT diplome_etudiant_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.diplome ADD CONSTRAINT diplome_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_universite_d_antsiranana.parcours(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.diplome DROP CONSTRAINT diplome_parcours_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.diplome ADD CONSTRAINT diplome_signe_par_fkey FOREIGN KEY (signe_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.diplome DROP CONSTRAINT diplome_signe_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.dossier_etudiant ADD CONSTRAINT dossier_etudiant_demande_par_fkey FOREIGN KEY (demande_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.dossier_etudiant DROP CONSTRAINT dossier_etudiant_demande_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.dossier_etudiant ADD CONSTRAINT dossier_etudiant_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_universite_d_antsiranana.etudiant(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_universite_d_antsiranana.dossier_etudiant DROP CONSTRAINT dossier_etudiant_etudiant_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.dossier_etudiant ADD CONSTRAINT dossier_etudiant_traite_par_fkey FOREIGN KEY (traite_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.dossier_etudiant DROP CONSTRAINT dossier_etudiant_traite_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.echeancier ADD CONSTRAINT echeancier_inscription_id_fkey FOREIGN KEY (inscription_id) REFERENCES tenant_universite_d_antsiranana.inscription(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_universite_d_antsiranana.echeancier DROP CONSTRAINT echeancier_inscription_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.element_constitutif ADD CONSTRAINT element_constitutif_ue_id_fkey FOREIGN KEY (ue_id) REFERENCES tenant_universite_d_antsiranana.unite_enseignement(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_universite_d_antsiranana.element_constitutif DROP CONSTRAINT element_constitutif_ue_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.emploi_du_temps ADD CONSTRAINT emploi_du_temps_affectation_id_fkey FOREIGN KEY (affectation_id) REFERENCES tenant_universite_d_antsiranana.affectation_cours(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_universite_d_antsiranana.emploi_du_temps DROP CONSTRAINT emploi_du_temps_affectation_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.emploi_du_temps ADD CONSTRAINT emploi_du_temps_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_universite_d_antsiranana.annee_academique(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.emploi_du_temps DROP CONSTRAINT emploi_du_temps_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.emploi_du_temps ADD CONSTRAINT emploi_du_temps_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES tenant_universite_d_antsiranana.utilisateur(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_universite_d_antsiranana.emploi_du_temps DROP CONSTRAINT emploi_du_temps_created_by_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.emploi_du_temps ADD CONSTRAINT emploi_du_temps_salle_id_fkey FOREIGN KEY (salle_id) REFERENCES tenant_universite_d_antsiranana.salle(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_universite_d_antsiranana.emploi_du_temps DROP CONSTRAINT emploi_du_temps_salle_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.enseignant ADD CONSTRAINT enseignant_departement_id_fkey FOREIGN KEY (departement_id) REFERENCES tenant_universite_d_antsiranana.departement(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.enseignant DROP CONSTRAINT enseignant_departement_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.enseignant ADD CONSTRAINT enseignant_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES tenant_universite_d_antsiranana.utilisateur(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_universite_d_antsiranana.enseignant DROP CONSTRAINT enseignant_utilisateur_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.etudiant ADD CONSTRAINT etudiant_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES tenant_universite_d_antsiranana.utilisateur(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_universite_d_antsiranana.etudiant DROP CONSTRAINT etudiant_utilisateur_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.evaluation_soutenance ADD CONSTRAINT evaluation_soutenance_evaluateur_id_fkey FOREIGN KEY (evaluateur_id) REFERENCES tenant_universite_d_antsiranana.utilisateur(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_universite_d_antsiranana.evaluation_soutenance DROP CONSTRAINT evaluation_soutenance_evaluateur_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.evaluation_soutenance ADD CONSTRAINT evaluation_soutenance_soutenance_id_fkey FOREIGN KEY (soutenance_id) REFERENCES tenant_universite_d_antsiranana.soutenance(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_universite_d_antsiranana.evaluation_soutenance DROP CONSTRAINT evaluation_soutenance_soutenance_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.fiche_paie ADD CONSTRAINT fiche_paie_contrat_id_fkey FOREIGN KEY (contrat_id) REFERENCES tenant_universite_d_antsiranana.contrat_personnel(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.fiche_paie DROP CONSTRAINT fiche_paie_contrat_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.fiche_suivi_stage ADD CONSTRAINT fiche_suivi_stage_auteur_id_fkey FOREIGN KEY (auteur_id) REFERENCES tenant_universite_d_antsiranana.utilisateur(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_universite_d_antsiranana.fiche_suivi_stage DROP CONSTRAINT fiche_suivi_stage_auteur_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.fiche_suivi_stage ADD CONSTRAINT fiche_suivi_stage_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES tenant_universite_d_antsiranana.stage(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_universite_d_antsiranana.fiche_suivi_stage DROP CONSTRAINT fiche_suivi_stage_stage_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.attestation ADD CONSTRAINT fk_attestation_etudiant FOREIGN KEY (etudiant_id) REFERENCES tenant_universite_d_antsiranana.etudiant(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.attestation DROP CONSTRAINT fk_attestation_etudiant;
ALTER TABLE ONLY tenant_universite_d_antsiranana.frais_inscription ADD CONSTRAINT frais_inscription_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_universite_d_antsiranana.annee_academique(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_universite_d_antsiranana.frais_inscription DROP CONSTRAINT frais_inscription_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.frais_inscription ADD CONSTRAINT frais_inscription_cree_par_fkey FOREIGN KEY (cree_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.frais_inscription DROP CONSTRAINT frais_inscription_cree_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.frais_inscription ADD CONSTRAINT frais_inscription_modifie_par_fkey FOREIGN KEY (modifie_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.frais_inscription DROP CONSTRAINT frais_inscription_modifie_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.frais_inscription ADD CONSTRAINT frais_inscription_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_universite_d_antsiranana.parcours(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_universite_d_antsiranana.frais_inscription DROP CONSTRAINT frais_inscription_parcours_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.grille_tarifaire ADD CONSTRAINT grille_tarifaire_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_universite_d_antsiranana.annee_academique(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.grille_tarifaire DROP CONSTRAINT grille_tarifaire_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.grille_tarifaire ADD CONSTRAINT grille_tarifaire_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_universite_d_antsiranana.parcours(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.grille_tarifaire DROP CONSTRAINT grille_tarifaire_parcours_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.heure_complementaire ADD CONSTRAINT heure_complementaire_enseignant_id_fkey FOREIGN KEY (enseignant_id) REFERENCES tenant_universite_d_antsiranana.enseignant(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_universite_d_antsiranana.heure_complementaire DROP CONSTRAINT heure_complementaire_enseignant_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.heure_complementaire ADD CONSTRAINT heure_complementaire_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.heure_complementaire DROP CONSTRAINT heure_complementaire_valide_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.incident_disciplinaire ADD CONSTRAINT incident_disciplinaire_arbitre_par_fkey FOREIGN KEY (arbitre_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.incident_disciplinaire DROP CONSTRAINT incident_disciplinaire_arbitre_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.incident_disciplinaire ADD CONSTRAINT incident_disciplinaire_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_universite_d_antsiranana.etudiant(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.incident_disciplinaire DROP CONSTRAINT incident_disciplinaire_etudiant_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.incident_disciplinaire ADD CONSTRAINT incident_disciplinaire_rapporte_par_fkey FOREIGN KEY (rapporte_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.incident_disciplinaire DROP CONSTRAINT incident_disciplinaire_rapporte_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.inscription ADD CONSTRAINT inscription_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_universite_d_antsiranana.annee_academique(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.inscription DROP CONSTRAINT inscription_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.inscription ADD CONSTRAINT inscription_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_universite_d_antsiranana.etudiant(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_universite_d_antsiranana.inscription DROP CONSTRAINT inscription_etudiant_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.inscription ADD CONSTRAINT inscription_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_universite_d_antsiranana.parcours(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_universite_d_antsiranana.inscription DROP CONSTRAINT inscription_parcours_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.inscription ADD CONSTRAINT inscription_validee_par_fkey FOREIGN KEY (validee_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.inscription DROP CONSTRAINT inscription_validee_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.message ADD CONSTRAINT message_destinataire_id_fkey FOREIGN KEY (destinataire_id) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.message DROP CONSTRAINT message_destinataire_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.message ADD CONSTRAINT message_expediteur_id_fkey FOREIGN KEY (expediteur_id) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.message DROP CONSTRAINT message_expediteur_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.message ADD CONSTRAINT message_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES tenant_universite_d_antsiranana.message(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.message DROP CONSTRAINT message_parent_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.mouvement_stock ADD CONSTRAINT mouvement_stock_stock_id_fkey FOREIGN KEY (stock_id) REFERENCES tenant_universite_d_antsiranana.stock(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.mouvement_stock DROP CONSTRAINT mouvement_stock_stock_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.mouvement_stock ADD CONSTRAINT mouvement_stock_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.mouvement_stock DROP CONSTRAINT mouvement_stock_utilisateur_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.note_derogatoire ADD CONSTRAINT note_derogatoire_ec_id_fkey FOREIGN KEY (ec_id) REFERENCES tenant_universite_d_antsiranana.element_constitutif(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_universite_d_antsiranana.note_derogatoire DROP CONSTRAINT note_derogatoire_ec_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.note_derogatoire ADD CONSTRAINT note_derogatoire_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_universite_d_antsiranana.etudiant(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_universite_d_antsiranana.note_derogatoire DROP CONSTRAINT note_derogatoire_etudiant_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.note_derogatoire ADD CONSTRAINT note_derogatoire_saisie_par_fkey FOREIGN KEY (saisie_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.note_derogatoire DROP CONSTRAINT note_derogatoire_saisie_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.note_derogatoire ADD CONSTRAINT note_derogatoire_session_examen_id_fkey FOREIGN KEY (session_examen_id) REFERENCES tenant_universite_d_antsiranana.session_examen(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_universite_d_antsiranana.note_derogatoire DROP CONSTRAINT note_derogatoire_session_examen_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.note_derogatoire ADD CONSTRAINT note_derogatoire_ue_id_fkey FOREIGN KEY (ue_id) REFERENCES tenant_universite_d_antsiranana.unite_enseignement(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_universite_d_antsiranana.note_derogatoire DROP CONSTRAINT note_derogatoire_ue_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.note_derogatoire ADD CONSTRAINT note_derogatoire_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.note_derogatoire DROP CONSTRAINT note_derogatoire_valide_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.note_derogatoire ADD CONSTRAINT note_derogatoire_valide_par_scolarite_fkey FOREIGN KEY (valide_par_scolarite) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.note_derogatoire DROP CONSTRAINT note_derogatoire_valide_par_scolarite_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.note ADD CONSTRAINT note_ec_id_fkey FOREIGN KEY (ec_id) REFERENCES tenant_universite_d_antsiranana.element_constitutif(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_universite_d_antsiranana.note DROP CONSTRAINT note_ec_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.note ADD CONSTRAINT note_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_universite_d_antsiranana.etudiant(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_universite_d_antsiranana.note DROP CONSTRAINT note_etudiant_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.note ADD CONSTRAINT note_saisi_par_fkey FOREIGN KEY (saisi_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.note DROP CONSTRAINT note_saisi_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.note ADD CONSTRAINT note_session_id_fkey FOREIGN KEY (session_id) REFERENCES tenant_universite_d_antsiranana.session_examen(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.note DROP CONSTRAINT note_session_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.note ADD CONSTRAINT note_ue_id_fkey FOREIGN KEY (ue_id) REFERENCES tenant_universite_d_antsiranana.unite_enseignement(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_universite_d_antsiranana.note DROP CONSTRAINT note_ue_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.note ADD CONSTRAINT note_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.note DROP CONSTRAINT note_valide_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.notification ADD CONSTRAINT notification_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES tenant_universite_d_antsiranana.utilisateur(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_universite_d_antsiranana.notification DROP CONSTRAINT notification_utilisateur_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.paiement ADD CONSTRAINT paiement_caissier_id_fkey FOREIGN KEY (caissier_id) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.paiement DROP CONSTRAINT paiement_caissier_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.paiement ADD CONSTRAINT paiement_cloture_caisse_id_fkey FOREIGN KEY (cloture_caisse_id) REFERENCES tenant_universite_d_antsiranana.cloture_caisse(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.paiement DROP CONSTRAINT paiement_cloture_caisse_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.paiement ADD CONSTRAINT paiement_echeancier_id_fkey FOREIGN KEY (echeancier_id) REFERENCES tenant_universite_d_antsiranana.echeancier(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.paiement DROP CONSTRAINT paiement_echeancier_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.paiement ADD CONSTRAINT paiement_inscription_id_fkey FOREIGN KEY (inscription_id) REFERENCES tenant_universite_d_antsiranana.inscription(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_universite_d_antsiranana.paiement DROP CONSTRAINT paiement_inscription_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.parcours ADD CONSTRAINT parcours_departement_id_fkey FOREIGN KEY (departement_id) REFERENCES tenant_universite_d_antsiranana.departement(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_universite_d_antsiranana.parcours DROP CONSTRAINT parcours_departement_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.parcours ADD CONSTRAINT parcours_responsable_id_fkey FOREIGN KEY (responsable_id) REFERENCES tenant_universite_d_antsiranana.utilisateur(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_universite_d_antsiranana.parcours DROP CONSTRAINT parcours_responsable_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.parcours ADD CONSTRAINT parcours_secretaire_id_fkey FOREIGN KEY (secretaire_id) REFERENCES tenant_universite_d_antsiranana.utilisateur(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_universite_d_antsiranana.parcours DROP CONSTRAINT parcours_secretaire_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.planning_entretien ADD CONSTRAINT planning_entretien_batiment_id_fkey FOREIGN KEY (batiment_id) REFERENCES tenant_universite_d_antsiranana.batiment(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.planning_entretien DROP CONSTRAINT planning_entretien_batiment_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.planning_entretien ADD CONSTRAINT planning_entretien_responsable_id_fkey FOREIGN KEY (responsable_id) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.planning_entretien DROP CONSTRAINT planning_entretien_responsable_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.planning_entretien ADD CONSTRAINT planning_entretien_salle_id_fkey FOREIGN KEY (salle_id) REFERENCES tenant_universite_d_antsiranana.salle(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.planning_entretien DROP CONSTRAINT planning_entretien_salle_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.presence ADD CONSTRAINT presence_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_universite_d_antsiranana.etudiant(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_universite_d_antsiranana.presence DROP CONSTRAINT presence_etudiant_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.presence ADD CONSTRAINT presence_saisi_par_fkey FOREIGN KEY (saisi_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.presence DROP CONSTRAINT presence_saisi_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.presence ADD CONSTRAINT presence_seance_id_fkey FOREIGN KEY (seance_id) REFERENCES tenant_universite_d_antsiranana.emploi_du_temps(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_universite_d_antsiranana.presence DROP CONSTRAINT presence_seance_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.presence ADD CONSTRAINT presence_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.presence DROP CONSTRAINT presence_valide_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.proces_verbal ADD CONSTRAINT proces_verbal_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_universite_d_antsiranana.annee_academique(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.proces_verbal DROP CONSTRAINT proces_verbal_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.proces_verbal ADD CONSTRAINT proces_verbal_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_universite_d_antsiranana.parcours(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_universite_d_antsiranana.proces_verbal DROP CONSTRAINT proces_verbal_parcours_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.proces_verbal ADD CONSTRAINT proces_verbal_redige_par_fkey FOREIGN KEY (redige_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.proces_verbal DROP CONSTRAINT proces_verbal_redige_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.proces_verbal ADD CONSTRAINT proces_verbal_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_universite_d_antsiranana.proces_verbal DROP CONSTRAINT proces_verbal_valide_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.pv_deliberation ADD CONSTRAINT pv_deliberation_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_universite_d_antsiranana.parcours(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.pv_deliberation DROP CONSTRAINT pv_deliberation_parcours_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.pv_deliberation ADD CONSTRAINT pv_deliberation_president_jury_fkey FOREIGN KEY (president_jury) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.pv_deliberation DROP CONSTRAINT pv_deliberation_president_jury_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.pv_deliberation ADD CONSTRAINT pv_deliberation_session_id_fkey FOREIGN KEY (session_id) REFERENCES tenant_universite_d_antsiranana.session_examen(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.pv_deliberation DROP CONSTRAINT pv_deliberation_session_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.rapport_entretien ADD CONSTRAINT rapport_entretien_planning_id_fkey FOREIGN KEY (planning_id) REFERENCES tenant_universite_d_antsiranana.planning_entretien(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.rapport_entretien DROP CONSTRAINT rapport_entretien_planning_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.rapport_entretien ADD CONSTRAINT rapport_entretien_realise_par_fkey FOREIGN KEY (realise_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.rapport_entretien DROP CONSTRAINT rapport_entretien_realise_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.rattrapage ADD CONSTRAINT rattrapage_absence_id_fkey FOREIGN KEY (absence_id) REFERENCES tenant_universite_d_antsiranana.absence_enseignant(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_universite_d_antsiranana.rattrapage DROP CONSTRAINT rattrapage_absence_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.rattrapage ADD CONSTRAINT rattrapage_planifie_par_fkey FOREIGN KEY (planifie_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.rattrapage DROP CONSTRAINT rattrapage_planifie_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.rattrapage ADD CONSTRAINT rattrapage_remplaceur_id_fkey FOREIGN KEY (remplaceur_id) REFERENCES tenant_universite_d_antsiranana.enseignant(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_universite_d_antsiranana.rattrapage DROP CONSTRAINT rattrapage_remplaceur_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.rattrapage ADD CONSTRAINT rattrapage_salle_id_fkey FOREIGN KEY (salle_id) REFERENCES tenant_universite_d_antsiranana.salle(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_universite_d_antsiranana.rattrapage DROP CONSTRAINT rattrapage_salle_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.recrutement ADD CONSTRAINT recrutement_departement_id_fkey FOREIGN KEY (departement_id) REFERENCES tenant_universite_d_antsiranana.departement(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.recrutement DROP CONSTRAINT recrutement_departement_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.recrutement ADD CONSTRAINT recrutement_responsable_id_fkey FOREIGN KEY (responsable_id) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.recrutement DROP CONSTRAINT recrutement_responsable_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.referentiel_competences ADD CONSTRAINT referentiel_competences_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_universite_d_antsiranana.parcours(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_universite_d_antsiranana.referentiel_competences DROP CONSTRAINT referentiel_competences_parcours_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.referentiel_competences ADD CONSTRAINT referentiel_competences_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_universite_d_antsiranana.referentiel_competences DROP CONSTRAINT referentiel_competences_valide_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.reservation_salle ADD CONSTRAINT reservation_salle_approuve_par_fkey FOREIGN KEY (approuve_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.reservation_salle DROP CONSTRAINT reservation_salle_approuve_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.reservation_salle ADD CONSTRAINT reservation_salle_demande_par_fkey FOREIGN KEY (demande_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.reservation_salle DROP CONSTRAINT reservation_salle_demande_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.reservation_salle ADD CONSTRAINT reservation_salle_salle_id_fkey FOREIGN KEY (salle_id) REFERENCES tenant_universite_d_antsiranana.salle(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.reservation_salle DROP CONSTRAINT reservation_salle_salle_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.resultat_deliberation ADD CONSTRAINT resultat_deliberation_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_universite_d_antsiranana.etudiant(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.resultat_deliberation DROP CONSTRAINT resultat_deliberation_etudiant_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.resultat_deliberation ADD CONSTRAINT resultat_deliberation_pv_id_fkey FOREIGN KEY (pv_id) REFERENCES tenant_universite_d_antsiranana.pv_deliberation(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.resultat_deliberation DROP CONSTRAINT resultat_deliberation_pv_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.salle ADD CONSTRAINT salle_batiment_id_fkey FOREIGN KEY (batiment_id) REFERENCES tenant_universite_d_antsiranana.batiment(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_universite_d_antsiranana.salle DROP CONSTRAINT salle_batiment_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.secretaire_parcours ADD CONSTRAINT secretaire_parcours_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES tenant_universite_d_antsiranana.utilisateur(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_universite_d_antsiranana.secretaire_parcours DROP CONSTRAINT secretaire_parcours_assigned_by_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.secretaire_parcours ADD CONSTRAINT secretaire_parcours_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_universite_d_antsiranana.parcours(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_universite_d_antsiranana.secretaire_parcours DROP CONSTRAINT secretaire_parcours_parcours_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.session_examen ADD CONSTRAINT session_examen_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_universite_d_antsiranana.annee_academique(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.session_examen DROP CONSTRAINT session_examen_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.session_jwt ADD CONSTRAINT session_jwt_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES tenant_universite_d_antsiranana.utilisateur(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_universite_d_antsiranana.session_jwt DROP CONSTRAINT session_jwt_utilisateur_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.soutenance ADD CONSTRAINT soutenance_president_jury_id_fkey FOREIGN KEY (president_jury_id) REFERENCES tenant_universite_d_antsiranana.utilisateur(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_universite_d_antsiranana.soutenance DROP CONSTRAINT soutenance_president_jury_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.soutenance ADD CONSTRAINT soutenance_salle_id_fkey FOREIGN KEY (salle_id) REFERENCES tenant_universite_d_antsiranana.salle(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_universite_d_antsiranana.soutenance DROP CONSTRAINT soutenance_salle_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.soutenance ADD CONSTRAINT soutenance_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES tenant_universite_d_antsiranana.stage(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_universite_d_antsiranana.soutenance DROP CONSTRAINT soutenance_stage_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.stage ADD CONSTRAINT stage_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_universite_d_antsiranana.annee_academique(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.stage DROP CONSTRAINT stage_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.stage ADD CONSTRAINT stage_encadrant_id_fkey FOREIGN KEY (encadrant_id) REFERENCES tenant_universite_d_antsiranana.utilisateur(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_universite_d_antsiranana.stage DROP CONSTRAINT stage_encadrant_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.stage ADD CONSTRAINT stage_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_universite_d_antsiranana.etudiant(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_universite_d_antsiranana.stage DROP CONSTRAINT stage_etudiant_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.stage ADD CONSTRAINT stage_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_universite_d_antsiranana.parcours(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_universite_d_antsiranana.stage DROP CONSTRAINT stage_parcours_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.stage ADD CONSTRAINT stage_rapporteur_id_fkey FOREIGN KEY (rapporteur_id) REFERENCES tenant_universite_d_antsiranana.utilisateur(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_universite_d_antsiranana.stage DROP CONSTRAINT stage_rapporteur_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.sujet_examen ADD CONSTRAINT sujet_examen_ec_id_fkey FOREIGN KEY (ec_id) REFERENCES tenant_universite_d_antsiranana.element_constitutif(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_universite_d_antsiranana.sujet_examen DROP CONSTRAINT sujet_examen_ec_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.sujet_examen ADD CONSTRAINT sujet_examen_enseignant_id_fkey FOREIGN KEY (enseignant_id) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.sujet_examen DROP CONSTRAINT sujet_examen_enseignant_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.sujet_examen ADD CONSTRAINT sujet_examen_relu_par_fkey FOREIGN KEY (relu_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_universite_d_antsiranana.sujet_examen DROP CONSTRAINT sujet_examen_relu_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.sujet_examen ADD CONSTRAINT sujet_examen_soumis_par_fkey FOREIGN KEY (soumis_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.sujet_examen DROP CONSTRAINT sujet_examen_soumis_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.sujet_examen ADD CONSTRAINT sujet_examen_ue_id_fkey FOREIGN KEY (ue_id) REFERENCES tenant_universite_d_antsiranana.unite_enseignement(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_universite_d_antsiranana.sujet_examen DROP CONSTRAINT sujet_examen_ue_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.sujet_examen ADD CONSTRAINT sujet_examen_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_universite_d_antsiranana.sujet_examen DROP CONSTRAINT sujet_examen_valide_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.support_cours ADD CONSTRAINT support_cours_auteur_id_fkey FOREIGN KEY (auteur_id) REFERENCES tenant_universite_d_antsiranana.utilisateur(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_universite_d_antsiranana.support_cours DROP CONSTRAINT support_cours_auteur_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.support_cours ADD CONSTRAINT support_cours_ec_id_fkey FOREIGN KEY (ec_id) REFERENCES tenant_universite_d_antsiranana.element_constitutif(id) ON DELETE CASCADE;
ALTER TABLE ONLY tenant_universite_d_antsiranana.support_cours DROP CONSTRAINT support_cours_ec_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.ticket_maintenance ADD CONSTRAINT ticket_maintenance_assigne_a_fkey FOREIGN KEY (assigne_a) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.ticket_maintenance DROP CONSTRAINT ticket_maintenance_assigne_a_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.ticket_maintenance ADD CONSTRAINT ticket_maintenance_batiment_id_fkey FOREIGN KEY (batiment_id) REFERENCES tenant_universite_d_antsiranana.batiment(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.ticket_maintenance DROP CONSTRAINT ticket_maintenance_batiment_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.ticket_maintenance ADD CONSTRAINT ticket_maintenance_salle_id_fkey FOREIGN KEY (salle_id) REFERENCES tenant_universite_d_antsiranana.salle(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.ticket_maintenance DROP CONSTRAINT ticket_maintenance_salle_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.ticket_maintenance ADD CONSTRAINT ticket_maintenance_signale_par_fkey FOREIGN KEY (signale_par) REFERENCES tenant_universite_d_antsiranana.utilisateur(id);
ALTER TABLE ONLY tenant_universite_d_antsiranana.ticket_maintenance DROP CONSTRAINT ticket_maintenance_signale_par_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.unite_enseignement ADD CONSTRAINT unite_enseignement_enseignant_id_fkey FOREIGN KEY (enseignant_id) REFERENCES tenant_universite_d_antsiranana.enseignant(id) ON DELETE SET NULL;
ALTER TABLE ONLY tenant_universite_d_antsiranana.unite_enseignement DROP CONSTRAINT unite_enseignement_enseignant_id_fkey;
ALTER TABLE ONLY tenant_universite_d_antsiranana.unite_enseignement ADD CONSTRAINT unite_enseignement_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_universite_d_antsiranana.parcours(id) ON DELETE RESTRICT;
ALTER TABLE ONLY tenant_universite_d_antsiranana.unite_enseignement DROP CONSTRAINT unite_enseignement_parcours_id_fkey;

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER prevent_locked_note_modification BEFORE DELETE OR UPDATE ON tenant_ispm.note FOR EACH ROW EXECUTE FUNCTION tenant_ispm.check_note_verrouillee();
CREATE TRIGGER trg_alerte_stock AFTER INSERT OR UPDATE ON tenant_ispm.stock FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_alerte_stock();
CREATE TRIGGER trg_note_verrouille BEFORE UPDATE ON tenant_ispm.note FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_note_verrouille();
CREATE TRIGGER trg_notif_paiement AFTER INSERT ON tenant_ispm.paiement FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_notification_paiement();
CREATE TRIGGER trg_numero_recu BEFORE INSERT ON tenant_ispm.paiement FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_numero_recu();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.absence_enseignant FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.affectation_cours FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.annonce FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.budget FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.contrat_personnel FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.convocation FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.demande_etudiant FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.depense FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.dossier_etudiant FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.emploi_du_temps FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.enseignant FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.inscription FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.note FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.note_derogatoire FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.parcours FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.presence FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.proces_verbal FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.pv_deliberation FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.rattrapage FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.referentiel_competences FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.sujet_examen FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.ticket_maintenance FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.utilisateur FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();
CREATE TRIGGER trigger_update_paiement_inscription_updated_at BEFORE UPDATE ON tenant_ispm.paiement_inscription FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_paiement_inscription_updated_at();
CREATE TRIGGER update_archive_scolarite_updated_at BEFORE UPDATE ON tenant_ispm.archive_scolarite FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();
CREATE TRIGGER update_candidature_updated_at BEFORE UPDATE ON tenant_ispm.candidature FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();
CREATE TRIGGER update_declaration_sociale_updated_at BEFORE UPDATE ON tenant_ispm.declaration_sociale FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();
CREATE TRIGGER update_deliberation_updated_at BEFORE UPDATE ON tenant_ispm.deliberation FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();
CREATE TRIGGER update_demande_ressource_updated_at BEFORE UPDATE ON tenant_ispm.demande_ressource FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();
CREATE TRIGGER update_diplome_updated_at BEFORE UPDATE ON tenant_ispm.diplome FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();
CREATE TRIGGER update_evaluation_personnel_updated_at BEFORE UPDATE ON tenant_ispm.evaluation_personnel FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();
CREATE TRIGGER update_heure_complementaire_updated_at BEFORE UPDATE ON tenant_ispm.heure_complementaire FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();
CREATE TRIGGER update_recrutement_updated_at BEFORE UPDATE ON tenant_ispm.recrutement FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();
CREATE TRIGGER update_resultat_semestre_updated_at BEFORE UPDATE ON tenant_ispm.resultat_semestre FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();
CREATE TRIGGER update_resultat_ue_updated_at BEFORE UPDATE ON tenant_ispm.resultat_ue FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();
CREATE TRIGGER update_soutenance_updated_at BEFORE UPDATE ON tenant_ispm.soutenance FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();
CREATE TRIGGER update_stage_updated_at BEFORE UPDATE ON tenant_ispm.stage FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();
CREATE TRIGGER update_suplement_diplome_updated_at BEFORE UPDATE ON tenant_ispm.suplement_diplome FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();
CREATE TRIGGER update_support_cours_updated_at BEFORE UPDATE ON tenant_ispm.support_cours FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();
CREATE TRIGGER update_transfert_etudiant_updated_at BEFORE UPDATE ON tenant_ispm.transfert_etudiant FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();
CREATE TRIGGER update_verrouillage_notes_updated_at BEFORE UPDATE ON tenant_ispm.verrouillage_notes FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();
CREATE TRIGGER prevent_locked_note_modification BEFORE DELETE OR UPDATE ON tenant_universite_d_antsiranana.note FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.check_note_verrouillee();
CREATE TRIGGER trg_alerte_stock AFTER INSERT OR UPDATE ON tenant_universite_d_antsiranana.stock FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.trigger_alerte_stock();
CREATE TRIGGER trg_note_verrouille BEFORE UPDATE ON tenant_universite_d_antsiranana.note FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.trigger_note_verrouille();
CREATE TRIGGER trg_notif_paiement AFTER INSERT ON tenant_universite_d_antsiranana.paiement FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.trigger_notification_paiement();
CREATE TRIGGER trg_numero_recu BEFORE INSERT ON tenant_universite_d_antsiranana.paiement FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.trigger_numero_recu();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_universite_d_antsiranana.absence_enseignant FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_universite_d_antsiranana.affectation_cours FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_universite_d_antsiranana.annonce FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_universite_d_antsiranana.budget FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_universite_d_antsiranana.contrat_personnel FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_universite_d_antsiranana.convocation FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_universite_d_antsiranana.demande_etudiant FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_universite_d_antsiranana.depense FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_universite_d_antsiranana.dossier_etudiant FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_universite_d_antsiranana.emploi_du_temps FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_universite_d_antsiranana.enseignant FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_universite_d_antsiranana.inscription FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_universite_d_antsiranana.note FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_universite_d_antsiranana.note_derogatoire FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_universite_d_antsiranana.parcours FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_universite_d_antsiranana.presence FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_universite_d_antsiranana.proces_verbal FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_universite_d_antsiranana.pv_deliberation FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_universite_d_antsiranana.rattrapage FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_universite_d_antsiranana.referentiel_competences FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_universite_d_antsiranana.sujet_examen FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_universite_d_antsiranana.ticket_maintenance FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.trigger_set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_universite_d_antsiranana.utilisateur FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.trigger_set_updated_at();
CREATE TRIGGER update_candidature_updated_at BEFORE UPDATE ON tenant_universite_d_antsiranana.candidature FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.update_updated_at_column();
CREATE TRIGGER update_declaration_sociale_updated_at BEFORE UPDATE ON tenant_universite_d_antsiranana.declaration_sociale FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.update_updated_at_column();
CREATE TRIGGER update_demande_ressource_updated_at BEFORE UPDATE ON tenant_universite_d_antsiranana.demande_ressource FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.update_updated_at_column();
CREATE TRIGGER update_diplome_updated_at BEFORE UPDATE ON tenant_universite_d_antsiranana.diplome FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.update_updated_at_column();
CREATE TRIGGER update_evaluation_personnel_updated_at BEFORE UPDATE ON tenant_universite_d_antsiranana.evaluation_personnel FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.update_updated_at_column();
CREATE TRIGGER update_heure_complementaire_updated_at BEFORE UPDATE ON tenant_universite_d_antsiranana.heure_complementaire FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.update_updated_at_column();
CREATE TRIGGER update_recrutement_updated_at BEFORE UPDATE ON tenant_universite_d_antsiranana.recrutement FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.update_updated_at_column();
CREATE TRIGGER update_soutenance_updated_at BEFORE UPDATE ON tenant_universite_d_antsiranana.soutenance FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.update_updated_at_column();
CREATE TRIGGER update_stage_updated_at BEFORE UPDATE ON tenant_universite_d_antsiranana.stage FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.update_updated_at_column();
CREATE TRIGGER update_support_cours_updated_at BEFORE UPDATE ON tenant_universite_d_antsiranana.support_cours FOR EACH ROW EXECUTE FUNCTION tenant_universite_d_antsiranana.update_updated_at_column();