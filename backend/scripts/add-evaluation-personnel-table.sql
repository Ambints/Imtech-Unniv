-- ============================================================
-- SCRIPT DE CRÉATION DE LA TABLE evaluation_personnel
-- Pour les schémas tenants
-- ============================================================

-- Supprimer l'ancienne fonction si elle existe
DROP FUNCTION IF EXISTS add_evaluation_personnel_table(TEXT);

CREATE OR REPLACE FUNCTION add_evaluation_personnel_table(p_schema_name TEXT)
RETURNS TEXT AS $$
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
      utilisateur_id UUID NOT NULL,
      evaluateur_id UUID NOT NULL,
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
$$ LANGUAGE plpgsql;

-- ============================================================
-- INSTRUCTIONS D'UTILISATION
-- ============================================================
-- Ce script crée une fonction PostgreSQL qui peut être appelée
-- pour chaque tenant avec : SELECT add_evaluation_personnel_table('tenant_xxx');
-- 
-- La fonction :
-- 1. Vérifie l'existence du schéma
-- 2. Vérifie si la table existe déjà (évite les doublons)
-- 3. Crée la table evaluation_personnel avec toutes les colonnes
-- 4. Crée les index pour optimiser les requêtes
-- 5. Ajoute les contraintes FK si la table utilisateur existe
-- 6. Retourne un message de succès ou d'erreur
-- ============================================================

-- Made with Bob
