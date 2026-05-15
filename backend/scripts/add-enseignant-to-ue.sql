-- ============================================================================
-- MIGRATION: Ajouter enseignant_id à unite_enseignement
-- RÈGLE MÉTIER: Une UE ne peut avoir qu'UN SEUL professeur responsable
-- ============================================================================

-- Ajouter la colonne enseignant_id à unite_enseignement
ALTER TABLE unite_enseignement 
ADD COLUMN IF NOT EXISTS enseignant_id UUID REFERENCES enseignant(id) ON DELETE SET NULL;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_ue_enseignant ON unite_enseignement(enseignant_id);

-- Ajouter un commentaire pour documenter la règle
COMMENT ON COLUMN unite_enseignement.enseignant_id IS 
'Professeur responsable de l''UE. Une UE ne peut avoir qu''un seul professeur responsable (règle métier).';

-- Note: La table affectation_cours reste pour gérer les détails (CM, TD, TP)
-- mais l'enseignant_id dans unite_enseignement définit le responsable principal

-- Made with Bob
