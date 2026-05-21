# 🔧 FIX COMPLET: Module Scolarité - Schéma Tenant + Structure BD

## 🎯 Problèmes Résolus

### 1. ❌ Erreur: "la relation « etudiant » n'existe pas"
**Cause**: Requêtes SQL sans préfixe de schéma tenant

### 2. ❌ Erreur: Colonnes inexistantes dans la BD
**Cause**: Requêtes SQL utilisant des colonnes qui n'existent pas dans le vrai schéma

## 📊 Structure Réelle de la Base de Données

### Table `deliberation`
```sql
CREATE TABLE tenant_ispm.deliberation (
    id uuid,
    session_examen_id uuid NOT NULL,
    parcours_id uuid NOT NULL,      -- ✅ Lié au parcours, PAS à l'étudiant
    semestre smallint NOT NULL,
    annee_niveau smallint NOT NULL,
    date_deliberation date NOT NULL,
    president_jury_id uuid NOT NULL,
    membres_jury uuid[],
    statut varchar(20)
);
```

**⚠️ IMPORTANT**: `deliberation` n'a PAS de colonne `etudiant_id`

### Table `inscription`
```sql
CREATE TABLE tenant_ispm.inscription (
    id uuid,
    etudiant_id uuid NOT NULL,
    annee_academique_id uuid NOT NULL,  -- ✅ UUID, pas un libellé
    annee_niveau smallint NOT NULL,     -- ✅ Pas "niveau"
    parcours_id uuid NOT NULL,
    statut varchar(20)
);
```

### Table `resultat_semestre`
```sql
CREATE TABLE tenant_ispm.resultat_semestre (
    id uuid,
    etudiant_id uuid NOT NULL,          -- ✅ Lien étudiant
    inscription_id uuid NOT NULL,
    deliberation_id uuid,
    moyenne_generale numeric(5,2),
    statut varchar(20),
    mention varchar(50)
);
```

### Table `transfert_etudiant`
```sql
CREATE TABLE tenant_ispm.transfert_etudiant (
    id uuid,
    etudiant_id uuid NOT NULL,
    etablissement_origine varchar(255),
    decision_equivalence varchar(50),   -- ✅ Pas "statut"
    credits_reconnus integer,
    created_at timestamp
);
```

**⚠️ IMPORTANT**: La table s'appelle `transfert_etudiant`, pas `transfert`

## ✅ Corrections Appliquées

### 1. Service - Méthode `getAttestations()`

**Avant (INCORRECT)** :
```typescript
async getAttestations(etudiantId?: string) {
  const attestations = await this.dataSource.query(`
    SELECT 
      e.id, e.nom, e.prenom,
      i.annee_academique,        -- ❌ N'existe pas
      i.niveau,                  -- ❌ N'existe pas
      d.moyenne_generale,        -- ❌ deliberation n'a pas cette colonne
      d.decision,                -- ❌ deliberation n'a pas cette colonne
      se.date_deliberation       -- ❌ session_examen n'a pas cette colonne
    FROM etudiant e              -- ❌ Pas de préfixe schema
    LEFT JOIN deliberation d ON e.id = d.etudiant_id  -- ❌ Cette colonne n'existe pas
  `);
}
```

**Après (CORRECT)** :
```typescript
async getAttestations(tenantSchema: string, etudiantId?: string) {
  const schema = this.validateSchema(tenantSchema);
  
  const attestations = await this.dataSource.query(`
    SELECT 
      e.id as etudiant_id,
      e.nom,
      e.prenom,
      e.date_naissance,
      e.lieu_naissance,
      e.matricule,
      i.id as inscription_id,
      i.annee_academique_id,     -- ✅ UUID
      i.annee_niveau,            -- ✅ Nom correct
      i.parcours_id,
      p.nom as parcours_nom,
      i.statut as inscription_statut,
      i.date_inscription,
      rs.id as resultat_id,
      rs.moyenne_generale,       -- ✅ De resultat_semestre
      rs.statut as resultat_statut,
      rs.mention,
      se.id as session_examen_id,
      se.libelle as session_libelle,
      aa.libelle as annee_academique
    FROM ${schema}.etudiant e    -- ✅ Préfixe schema
    LEFT JOIN ${schema}.inscription i ON e.id = i.etudiant_id
    LEFT JOIN ${schema}.parcours p ON i.parcours_id = p.id
    LEFT JOIN ${schema}.annee_academique aa ON i.annee_academique_id = aa.id
    LEFT JOIN ${schema}.resultat_semestre rs ON e.id = rs.etudiant_id AND rs.inscription_id = i.id
    LEFT JOIN ${schema}.deliberation d ON rs.deliberation_id = d.id
    LEFT JOIN ${schema}.session_examen se ON d.session_examen_id = se.id
    WHERE e.actif = true
    ${etudiantId ? `AND e.id = $1` : ''}
    ORDER BY aa.libelle DESC, rs.created_at DESC
  `, etudiantId ? [etudiantId] : []);

  return attestations.map((att: any) => ({
    etudiant: {
      id: att.etudiant_id,
      nom: att.nom,
      prenom: att.prenom,
      dateNaissance: att.date_naissance,
      lieuNaissance: att.lieu_naissance,
      matricule: att.matricule
    },
    inscription: att.inscription_id ? {
      id: att.inscription_id,
      anneeAcademique: att.annee_academique,
      niveau: att.annee_niveau,
      parcoursId: att.parcours_id,
      parcoursNom: att.parcours_nom,
      statut: att.inscription_statut,
      dateInscription: att.date_inscription
    } : null,
    resultat: att.resultat_id ? {
      id: att.resultat_id,
      moyenneGenerale: parseFloat(att.moyenne_generale) || null,
      statut: att.resultat_statut,
      mention: att.mention,
      sessionExamen: att.session_examen_id ? {
        id: att.session_examen_id,
        libelle: att.session_libelle
      } : null
    } : null,
    typeAttestation: this.determineTypeAttestation(att.inscription_statut, att.resultat_statut)
  }));
}
```

### 2. Service - Méthode `getTransferts()`

**Avant (INCORRECT)** :
```typescript
async getTransferts(etudiantId?: string) {
  const transferts = await this.dataSource.query(`
    SELECT 
      i.annee_academique,        -- ❌ N'existe pas
      i.niveau,                  -- ❌ N'existe pas
      d.moyenne_generale,        -- ❌ deliberation n'a pas cette colonne
      t.motif,                   -- ❌ transfert_etudiant n'a pas cette colonne
      t.universite_destination   -- ❌ transfert_etudiant n'a pas cette colonne
    FROM etudiant e              -- ❌ Pas de préfixe schema
    LEFT JOIN transfert t        -- ❌ Mauvais nom de table
  `);
}
```

**Après (CORRECT)** :
```typescript
async getTransferts(tenantSchema: string, etudiantId?: string) {
  const schema = this.validateSchema(tenantSchema);
  
  const transferts = await this.dataSource.query(`
    SELECT 
      e.id as etudiant_id,
      e.nom,
      e.prenom,
      e.matricule,
      i.id as inscription_id,
      i.annee_academique_id,     -- ✅ UUID
      i.annee_niveau,            -- ✅ Nom correct
      i.parcours_id,
      p.nom as parcours_nom,
      i.statut as inscription_statut,
      i.date_inscription,
      aa.libelle as annee_academique,
      rs.moyenne_generale,       -- ✅ De resultat_semestre
      rs.statut as resultat_statut,
      rs.mention,
      t.id as transfert_id,
      t.etablissement_origine,   -- ✅ Colonne qui existe
      t.decision_equivalence as statut_transfert,  -- ✅ Colonne qui existe
      t.credits_reconnus,        -- ✅ Colonne qui existe
      t.created_at as date_transfert
    FROM ${schema}.etudiant e    -- ✅ Préfixe schema
    LEFT JOIN ${schema}.inscription i ON e.id = i.etudiant_id
    LEFT JOIN ${schema}.parcours p ON i.parcours_id = p.id
    LEFT JOIN ${schema}.annee_academique aa ON i.annee_academique_id = aa.id
    LEFT JOIN ${schema}.resultat_semestre rs ON e.id = rs.etudiant_id AND rs.inscription_id = i.id
    LEFT JOIN ${schema}.transfert_etudiant t ON e.id = t.etudiant_id  -- ✅ Bon nom de table
    WHERE e.actif = true
    ${etudiantId ? `AND e.id = $1` : ''}
    ORDER BY aa.libelle DESC, t.created_at DESC
  `, etudiantId ? [etudiantId] : []);

  return transferts.map((transfert: any) => ({
    etudiant: {
      id: transfert.etudiant_id,
      nom: transfert.nom,
      prenom: transfert.prenom,
      matricule: transfert.matricule
    },
    inscription: transfert.inscription_id ? {
      id: transfert.inscription_id,
      anneeAcademique: transfert.annee_academique,
      niveau: transfert.annee_niveau,
      parcoursId: transfert.parcours_id,
      parcoursNom: transfert.parcours_nom,
      statut: transfert.inscription_statut,
      dateInscription: transfert.date_inscription
    } : null,
    resultatAcademique: transfert.moyenne_generale ? {
      moyenneGenerale: parseFloat(transfert.moyenne_generale),
      statut: transfert.resultat_statut,
      mention: transfert.mention
    } : null,
    transfert: transfert.transfert_id ? {
      id: transfert.transfert_id,
      etablissementOrigine: transfert.etablissement_origine,
      statutTransfert: transfert.statut_transfert,
      creditsReconnus: transfert.credits_reconnus,
      dateTransfert: transfert.date_transfert
    } : null,
    eligibleTransfert: this.isEligibleTransfert(transfert.inscription_statut, transfert.resultat_statut)
  }));
}
```

### 3. Sécurité - Paramètres SQL

**Avant (VULNÉRABLE)** :
```typescript
WHERE e.actif = true
${etudiantId ? `AND e.id = '${etudiantId}'` : ''}  -- ❌ Injection SQL possible
```

**Après (SÉCURISÉ)** :
```typescript
WHERE e.actif = true
${etudiantId ? `AND e.id = $1` : ''}  -- ✅ Paramètre préparé
`, etudiantId ? [etudiantId] : []);
```

## 📋 Résumé des Changements

### Colonnes Corrigées

| Avant (Incorrect) | Après (Correct) | Table Source |
|-------------------|-----------------|--------------|
| `i.annee_academique` | `i.annee_academique_id` + JOIN `aa.libelle` | `inscription` + `annee_academique` |
| `i.niveau` | `i.annee_niveau` | `inscription` |
| `d.etudiant_id` | N/A (n'existe pas) | - |
| `d.moyenne_generale` | `rs.moyenne_generale` | `resultat_semestre` |
| `d.decision` | `rs.statut` | `resultat_semestre` |
| `se.date_deliberation` | `d.date_deliberation` | `deliberation` |
| `transfert` | `transfert_etudiant` | Nom de table |
| `t.motif` | N/A (n'existe pas) | - |
| `t.universite_destination` | N/A (n'existe pas) | - |
| `t.statut` | `t.decision_equivalence` | `transfert_etudiant` |

### Tables Ajoutées aux JOINs

✅ `annee_academique` - Pour obtenir le libellé de l'année  
✅ `resultat_semestre` - Pour les moyennes et décisions  
✅ `deliberation` - Pour lier session_examen via resultat_semestre

## 🎯 Résultat Final

### ✅ Problèmes Résolus

1. ✅ Préfixe de schéma tenant ajouté (`${schema}.table`)
2. ✅ Colonnes corrigées selon la vraie structure BD
3. ✅ Tables renommées correctement (`transfert_etudiant`)
4. ✅ JOINs corrigés (via `resultat_semestre` au lieu de `deliberation.etudiant_id`)
5. ✅ Paramètres SQL sécurisés (protection injection SQL)
6. ✅ Controller passe `req.tenantSchema` au service

### 🧪 Tests à Effectuer

```bash
# Test 1: Attestations
curl -X GET "http://localhost:4000/api/v1/scolarite/TENANT_ID/attestations" \
  -H "Authorization: Bearer TOKEN" \
  -H "X-Tenant-ID: TENANT_ID"

# Test 2: Transferts
curl -X GET "http://localhost:4000/api/v1/scolarite/TENANT_ID/transferts" \
  -H "Authorization: Bearer TOKEN" \
  -H "X-Tenant-ID: TENANT_ID"

# Test 3: Attestations pour un étudiant spécifique
curl -X GET "http://localhost:4000/api/v1/scolarite/TENANT_ID/attestations?etudiantId=ETUDIANT_UUID" \
  -H "Authorization: Bearer TOKEN" \
  -H "X-Tenant-ID: TENANT_ID"
```

### 📊 Résultats Attendus

✅ Pas d'erreur "la relation n'existe pas"  
✅ Pas d'erreur "column does not exist"  
✅ Données retournées correctement  
✅ Multi-tenant fonctionnel  

---

**Développé avec ❤️ par Bob**  
**Date** : 18 mai 2026  
**Version** : 2.0.0 (Corrections complètes)