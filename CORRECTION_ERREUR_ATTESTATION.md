# 🔧 CORRECTION ERREUR - Table Attestation Manquante

## ❌ Erreur Constatée

```
Erreur lors de la création de l'attestation: 
la relation « tenant_ispm.attestation » n'existe pas
```

## 🔍 Diagnostic

Le modal frontend fonctionne parfaitement, mais la **table `attestation` n'existe pas encore** dans la base de données PostgreSQL.

## ✅ Solution

### Étape 1: Exécuter la Migration SQL

Le script de migration a déjà été créé dans:
```
backend/migrations/create-attestation-table.sql
```

**Exécuter la migration**:
```bash
# Option 1: Via psql
psql -U postgres -d imtech_saas -f backend/migrations/create-attestation-table.sql

# Option 2: Via pgAdmin
# 1. Ouvrir pgAdmin
# 2. Connecter à la base imtech_saas
# 3. Ouvrir Query Tool
# 4. Copier/coller le contenu du fichier SQL
# 5. Exécuter (F5)

# Option 3: Via DBeaver/autre client
# 1. Connecter à imtech_saas
# 2. Ouvrir SQL Editor
# 3. Copier/coller le script
# 4. Exécuter
```

### Étape 2: Vérifier la Création

```sql
-- Vérifier que la table existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'tenant_ispm' 
  AND table_name = 'attestation';

-- Vérifier la structure
\d tenant_ispm.attestation

-- Devrait afficher:
-- id, etudiant_id, inscription_id, type_attestation, 
-- numero_attestation, annee_academique_id, date_emission,
-- date_validite, statut, motif, observations, delivre_par,
-- date_delivrance, created_at, updated_at
```

### Étape 3: Tester la Création

Après avoir exécuté la migration:
1. Rafraîchir la page des attestations
2. Cliquer "Nouvelle Attestation"
3. Sélectionner un étudiant
4. Choisir un type
5. Cliquer "Créer Attestation"

✅ **Devrait fonctionner sans erreur**

## 📋 Contenu de la Migration

Le script crée:

### Table `attestation`
```sql
CREATE TABLE attestation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  etudiant_id UUID NOT NULL,
  inscription_id UUID,
  type_attestation VARCHAR(50) NOT NULL,
  numero_attestation VARCHAR(50) UNIQUE NOT NULL,
  annee_academique_id UUID,
  date_emission DATE DEFAULT CURRENT_DATE,
  date_validite DATE,
  statut VARCHAR(20) DEFAULT 'en_attente',
  motif TEXT,
  observations TEXT,
  delivre_par UUID,
  date_delivrance TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Contraintes
- Foreign keys vers `etudiant`, `inscription`, `annee_academique`, `utilisateur`
- Check constraints sur `type_attestation` et `statut`
- Unique constraint sur `numero_attestation`

### Indexes
- `idx_attestation_etudiant` sur `etudiant_id`
- `idx_attestation_type` sur `type_attestation`
- `idx_attestation_statut` sur `statut`
- `idx_attestation_numero` sur `numero_attestation`
- `idx_attestation_date_emission` sur `date_emission`

### Trigger
- `update_attestation_updated_at` pour mettre à jour `updated_at` automatiquement

## 🔄 Alternative: Création Manuelle Rapide

Si vous ne pouvez pas exécuter le script complet, voici la version minimale:

```sql
-- Créer la table dans le schema tenant
CREATE TABLE tenant_ispm.attestation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  etudiant_id UUID NOT NULL REFERENCES tenant_ispm.etudiant(id),
  inscription_id UUID REFERENCES tenant_ispm.inscription(id),
  type_attestation VARCHAR(50) NOT NULL,
  numero_attestation VARCHAR(50) UNIQUE NOT NULL,
  annee_academique_id UUID REFERENCES tenant_ispm.annee_academique(id),
  date_emission DATE DEFAULT CURRENT_DATE,
  statut VARCHAR(20) DEFAULT 'en_attente',
  motif TEXT,
  observations TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes essentiels
CREATE INDEX idx_attestation_etudiant ON tenant_ispm.attestation(etudiant_id);
CREATE INDEX idx_attestation_type ON tenant_ispm.attestation(type_attestation);
```

## ⚠️ Note Importante

Le script de migration est conçu pour créer la table dans **tous les schemas tenant** automatiquement. Si vous avez plusieurs tenants (tenant_ispm, tenant_autre, etc.), le script les gérera tous.

## 🎯 Après la Migration

Une fois la table créée, le système sera **100% fonctionnel**:

✅ Modal s'ouvre  
✅ Liste étudiants se charge  
✅ Sélection étudiant fonctionne  
✅ Création attestation réussit  
✅ Numéro unique généré (ATT-INS-2026-123456)  
✅ Attestation apparaît dans la liste  
✅ Statut "en attente" par défaut  

## 📞 Support

Si l'erreur persiste après la migration:
1. Vérifier que la table existe: `\dt tenant_ispm.attestation`
2. Vérifier les permissions: `GRANT ALL ON tenant_ispm.attestation TO votre_user;`
3. Vérifier les foreign keys: Les tables `etudiant`, `inscription` doivent exister
4. Consulter les logs backend pour plus de détails

---

**Résumé**: Le frontend est parfait, il suffit d'exécuter la migration SQL pour créer la table `attestation` dans la base de données! 🚀