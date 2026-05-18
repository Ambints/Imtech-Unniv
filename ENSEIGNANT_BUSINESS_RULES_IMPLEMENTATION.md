# 📚 IMPLÉMENTATION DES RÈGLES MÉTIER ENSEIGNANTS

## 🎯 Objectif

Implémenter trois règles métier essentielles pour la gestion des affectations d'enseignants :

1. **Règle 1** : Un enseignant n'ayant pas de contrat actif ne peut être affecté à une UE
2. **Règle 2** : Une UE ne peut être affectée qu'à un seul enseignant (mais un enseignant peut enseigner plusieurs UE)
3. **Règle 3** : Un enseignant sans affectation verra le message "Vous n'êtes pas affecté à un parcours"

---

## 📁 Fichiers Créés

### 1. Migration SQL
**Fichier** : `backend/scripts/add-enseignant-business-rules.sql`

Contient :
- ✅ 2 fonctions de validation (triggers)
- ✅ 3 vues métier
- ✅ 4 triggers automatiques
- ✅ 1 contrainte d'unicité

### 2. Script d'Application
**Fichier** : `backend/scripts/apply-enseignant-business-rules.js`

Script Node.js pour appliquer la migration à tous les tenants actifs.

### 3. Service Backend
**Fichier** : `backend/src/enseignant/enseignant-affectation.service.ts`

Service TypeScript avec 8 méthodes métier :
- `checkEnseignantHasActiveContract()` - Vérifier contrat actif
- `getEnseignantsSansAffectation()` - Liste enseignants non affectés
- `getStatistiquesAffectation()` - Statistiques d'affectation
- `getAffectationsUEDetails()` - Détails des affectations
- `checkUEAlreadyAffected()` - Vérifier si UE déjà affectée
- `validateAffectation()` - Valider avant création
- `getEnseignantAffectationStatus()` - Statut pour portail enseignant

### 4. Contrôleur API
**Fichier** : `backend/src/enseignant/enseignant-affectation.controller.ts`

10 endpoints REST :
- `GET /enseignant-affectation/check-contract/:enseignantId`
- `GET /enseignant-affectation/sans-affectation`
- `GET /enseignant-affectation/statistiques/:enseignantId?`
- `GET /enseignant-affectation/affectations-ue`
- `GET /enseignant-affectation/check-ue/:ueId/:anneeAcademiqueId`
- `POST /enseignant-affectation/validate`
- `GET /enseignant-affectation/mon-statut` (pour enseignants)
- `GET /enseignant-affectation/statut/:enseignantId`
- `GET /enseignant-affectation/dashboard`

### 5. Module NestJS
**Fichier** : `backend/src/enseignant/enseignant-affectation.module.ts`

Module d'intégration pour NestJS.

---

## 🔧 Composants Techniques

### A. Fonctions PostgreSQL

#### 1. `check_enseignant_has_active_contract()`
```sql
-- Vérifie qu'un enseignant a un contrat actif avant affectation
-- Déclenche une exception si pas de contrat
```

**Logique** :
1. Récupère l'`utilisateur_id` de l'enseignant
2. Vérifie l'existence d'un contrat avec :
   - `actif = TRUE`
   - `date_debut <= CURRENT_DATE`
   - `date_fin IS NULL OR date_fin >= CURRENT_DATE`
3. Bloque l'opération si aucun contrat trouvé

#### 2. `check_ue_unique_per_enseignant()`
```sql
-- Garantit qu'une UE n'est affectée qu'à un seul enseignant
-- par année académique
```

**Logique** :
1. Compte les affectations existantes pour l'UE
2. Exclut l'enseignant actuel et l'affectation en cours de modification
3. Bloque si une autre affectation existe

---

### B. Vues Métier

#### 1. `vue_enseignants_sans_affectation`
Liste tous les enseignants actifs sans affectation pour l'année en cours.

**Colonnes** :
- `enseignant_id`, `matricule`, `nom`, `prenom`
- `titre`, `grade`, `specialite`
- `departement_id`, `departement_nom`
- `email`, `telephone`, `actif`
- `a_contrat_actif` (boolean)
- `nb_affectations_actives` (integer)

#### 2. `vue_statistiques_affectation_enseignant`
Statistiques complètes par enseignant.

**Colonnes** :
- Informations enseignant
- `a_contrat_actif` (boolean)
- `nb_ue_affectees`, `nb_ec_affectes`
- `volume_horaire_total`, `volume_horaire_realise`
- `taux_realisation_pct`
- `statut_affectation` ('Affecté' ou 'Non affecté')

#### 3. `vue_affectations_ue_details`
Vue détaillée de toutes les affectations UE.

**Colonnes** :
- Détails enseignant (id, matricule, nom, titre, grade)
- Détails UE (id, code, intitulé, crédits ECTS)
- Détails parcours (code, nom)
- Année académique
- Type séance, volumes (prévu/réalisé)
- `enseignant_a_contrat_actif` (boolean)

---

### C. Triggers Automatiques

#### 1. `trigger_check_contract_before_affectation_insert`
- **Table** : `affectation_cours`
- **Événement** : `BEFORE INSERT`
- **Action** : Vérifie le contrat actif

#### 2. `trigger_check_contract_before_affectation_update`
- **Table** : `affectation_cours`
- **Événement** : `BEFORE UPDATE`
- **Condition** : Quand `enseignant_id` change
- **Action** : Vérifie le contrat actif

#### 3. `trigger_check_ue_unique_insert`
- **Table** : `affectation_cours`
- **Événement** : `BEFORE INSERT`
- **Action** : Vérifie unicité UE

#### 4. `trigger_check_ue_unique_update`
- **Table** : `affectation_cours`
- **Événement** : `BEFORE UPDATE`
- **Condition** : Quand `ue_id` ou `enseignant_id` change
- **Action** : Vérifie unicité UE

---

### D. Contrainte d'Unicité

```sql
ALTER TABLE affectation_cours 
ADD CONSTRAINT unique_ue_per_annee_academique 
UNIQUE (ue_id, annee_academique_id)
WHERE ue_id IS NOT NULL;
```

Garantit au niveau base de données qu'une UE ne peut être affectée qu'une fois par année académique.

---

## 🚀 Installation

### Étape 1 : Appliquer la Migration SQL

```bash
cd backend/scripts
node apply-enseignant-business-rules.js
```

**Sortie attendue** :
```
🚀 Début de l'application des règles métier enseignants...

📊 2 tenant(s) trouvé(s)

📋 Application des règles métier enseignants au schéma: tenant_ispm
  ✓ Création de la fonction check_enseignant_has_active_contract()...
  ✓ Création de la fonction check_ue_unique_per_enseignant()...
  ✓ Création de la vue vue_enseignants_sans_affectation...
  ✓ Création de la vue vue_statistiques_affectation_enseignant...
  ✓ Création de la vue vue_affectations_ue_details...
  ✓ Création des triggers de validation...
  ✓ Ajout de la contrainte d'unicité UE par année académique...
✅ Règles métier appliquées avec succès au schéma: tenant_ispm

📋 Application des règles métier enseignants au schéma: tenant_universite_d_antsiranana
  ✓ Création de la fonction check_enseignant_has_active_contract()...
  ...
✅ Règles métier appliquées avec succès au schéma: tenant_universite_d_antsiranana

✅ Migration terminée avec succès pour tous les tenants!

📋 Résumé des règles implémentées:
   1. ✓ Un enseignant doit avoir un contrat actif pour être affecté
   2. ✓ Une UE ne peut être affectée qu'à un seul enseignant
   3. ✓ Vue des enseignants sans affectation créée
   4. ✓ Vues statistiques créées
```

### Étape 2 : Intégrer le Module dans app.module.ts

```typescript
import { EnseignantAffectationModule } from './enseignant/enseignant-affectation.module';

@Module({
  imports: [
    // ... autres modules
    EnseignantAffectationModule,
  ],
})
export class AppModule {}
```

### Étape 3 : Redémarrer le Backend

```bash
npm run start:dev
```

---

## 📡 Utilisation des API

### 1. Vérifier le Contrat d'un Enseignant

**Endpoint** : `GET /enseignant-affectation/check-contract/:enseignantId`

**Rôles autorisés** : `admin`, `responsable_pedagogique`, `secretaire_parcours`

**Réponse** :
```json
{
  "hasContract": true,
  "contractDetails": {
    "contratId": "uuid",
    "typeContrat": "CDI",
    "poste": "Enseignant Informatique",
    "dateDebut": "2024-01-01",
    "dateFin": null
  },
  "message": "L'enseignant possède un contrat actif"
}
```

### 2. Liste des Enseignants Sans Affectation

**Endpoint** : `GET /enseignant-affectation/sans-affectation`

**Rôles autorisés** : `admin`, `responsable_pedagogique`, `secretaire_parcours`, `president`

**Réponse** :
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "enseignant_id": "uuid",
      "matricule": "ENS001",
      "nom": "RAKOTO",
      "prenom": "Jean",
      "titre": "Dr.",
      "grade": "Maître de Conférences",
      "specialite": "Informatique",
      "departement_nom": "Informatique",
      "email": "jean.rakoto@univ.mg",
      "a_contrat_actif": true,
      "nb_affectations_actives": 0
    }
  ],
  "message": "3 enseignant(s) sans affectation trouvé(s)"
}
```

### 3. Statut pour le Portail Enseignant

**Endpoint** : `GET /enseignant-affectation/mon-statut`

**Rôle autorisé** : `enseignant`

**Réponse (avec affectation)** :
```json
{
  "success": true,
  "hasAffectation": true,
  "hasActiveContract": true,
  "affectations": [
    {
      "affectation_id": "uuid",
      "ue_code": "INF301",
      "ue_intitule": "Programmation Orientée Objet",
      "credits_ects": 6,
      "parcours_code": "L3-INFO",
      "parcours_nom": "Licence 3 Informatique",
      "type_seance": "CM",
      "volume_prevu": 40,
      "volume_realise": 25
    }
  ],
  "statistics": {
    "nb_ue_affectees": 3,
    "volume_horaire_total": 120,
    "taux_realisation_pct": 62.5
  },
  "message": "Vous êtes affecté à 1 UE."
}
```

**Réponse (sans affectation)** :
```json
{
  "success": true,
  "hasAffectation": false,
  "hasActiveContract": true,
  "affectations": [],
  "statistics": null,
  "message": "Vous n'êtes pas affecté à un parcours. Veuillez contacter le responsable pédagogique."
}
```

**Réponse (sans contrat)** :
```json
{
  "success": true,
  "hasAffectation": false,
  "hasActiveContract": false,
  "affectations": [],
  "statistics": null,
  "message": "Vous n'avez pas de contrat actif. Veuillez contacter le service RH."
}
```

### 4. Valider une Affectation

**Endpoint** : `POST /enseignant-affectation/validate`

**Rôles autorisés** : `admin`, `responsable_pedagogique`, `secretaire_parcours`

**Body** :
```json
{
  "enseignantId": "uuid",
  "ueId": "uuid",
  "anneeAcademiqueId": "uuid"
}
```

**Réponse (valide)** :
```json
{
  "success": true,
  "isValid": true,
  "errors": [],
  "warnings": [],
  "message": "L'affectation peut être créée"
}
```

**Réponse (invalide)** :
```json
{
  "success": false,
  "isValid": false,
  "errors": [
    "Impossible d'affecter cet enseignant : aucun contrat actif trouvé.",
    "Cette UE est déjà affectée à RAZAKA Paul"
  ],
  "warnings": [],
  "message": "L'affectation ne peut pas être créée"
}
```

### 5. Dashboard des Affectations

**Endpoint** : `GET /enseignant-affectation/dashboard`

**Rôles autorisés** : `admin`, `responsable_pedagogique`, `president`

**Réponse** :
```json
{
  "success": true,
  "summary": {
    "totalEnseignants": 45,
    "enseignantsAffectes": 38,
    "enseignantsSansAffectation": 7,
    "enseignantsSansContrat": 2,
    "totalUEAffectees": 120,
    "volumeHoraireTotal": 4800,
    "tauxAffectation": 84
  },
  "enseignantsSansAffectation": [...],
  "statistiques": [...]
}
```

---

## 🧪 Tests

### Test 1 : Bloquer Affectation Sans Contrat

```sql
-- Tenter d'affecter un enseignant sans contrat
INSERT INTO affectation_cours (enseignant_id, ue_id, annee_academique_id, type_seance)
VALUES ('enseignant-sans-contrat-id', 'ue-id', 'annee-id', 'CM');

-- Résultat attendu : ERREUR
-- Message : "Impossible d'affecter cet enseignant : aucun contrat actif trouvé."
```

### Test 2 : Bloquer Double Affectation UE

```sql
-- Affecter une UE déjà affectée à un autre enseignant
INSERT INTO affectation_cours (enseignant_id, ue_id, annee_academique_id, type_seance)
VALUES ('enseignant2-id', 'ue-deja-affectee-id', 'annee-id', 'CM');

-- Résultat attendu : ERREUR
-- Message : "Cette UE est déjà affectée à un autre enseignant pour cette année académique."
```

### Test 3 : Vérifier Vue Enseignants Sans Affectation

```sql
SELECT * FROM vue_enseignants_sans_affectation;

-- Résultat attendu : Liste des enseignants actifs sans affectation
```

---

## 🎨 Intégration Frontend

### Composant React : Statut Enseignant

```typescript
import { useEffect, useState } from 'react';
import { api } from '../services/api';

export const EnseignantStatutCard = () => {
  const [statut, setStatut] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatut = async () => {
      try {
        const response = await api.get('/enseignant-affectation/mon-statut');
        setStatut(response.data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatut();
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h3>Mon Statut d'Affectation</h3>
      </div>
      <div className="card-body">
        {!statut.hasActiveContract && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle"></i>
            {statut.message}
          </div>
        )}
        
        {statut.hasActiveContract && !statut.hasAffectation && (
          <div className="alert alert-warning">
            <i className="bi bi-info-circle"></i>
            {statut.message}
          </div>
        )}
        
        {statut.hasAffectation && (
          <div className="alert alert-success">
            <i className="bi bi-check-circle"></i>
            {statut.message}
          </div>
        )}

        {statut.affectations && statut.affectations.length > 0 && (
          <div className="mt-3">
            <h5>Mes Affectations</h5>
            <ul className="list-group">
              {statut.affectations.map((aff) => (
                <li key={aff.affectation_id} className="list-group-item">
                  <strong>{aff.ue_code}</strong> - {aff.ue_intitule}
                  <br />
                  <small className="text-muted">
                    {aff.parcours_nom} | {aff.type_seance} | 
                    {aff.volume_realise}/{aff.volume_prevu}h
                  </small>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## ✅ Checklist de Validation

- [x] Migration SQL créée
- [x] Script d'application créé
- [x] Service backend implémenté
- [x] Contrôleur API créé
- [x] Module NestJS créé
- [x] Documentation complète
- [ ] Tests unitaires
- [ ] Tests d'intégration
- [ ] Intégration frontend
- [ ] Tests utilisateurs

---

## 📊 Impact

### Avant l'Implémentation
- ❌ Enseignants sans contrat pouvaient être affectés
- ❌ Une UE pouvait être affectée à plusieurs enseignants
- ❌ Pas de visibilité sur les enseignants non affectés
- ❌ Pas de message clair pour les enseignants

### Après l'Implémentation
- ✅ Validation automatique du contrat avant affectation
- ✅ Unicité garantie : 1 UE = 1 enseignant
- ✅ Vue dédiée pour identifier les enseignants sans affectation
- ✅ Message clair dans le portail enseignant
- ✅ Dashboard complet pour les responsables
- ✅ API complète pour l'intégration frontend

---

## 🔒 Sécurité

- ✅ Validation au niveau base de données (triggers)
- ✅ Contrainte d'unicité (index unique)
- ✅ Validation au niveau service (avant insertion)
- ✅ Contrôle d'accès par rôles (guards NestJS)
- ✅ Messages d'erreur explicites

---

## 📝 Notes Importantes

1. **Performance** : Les vues sont optimisées avec des index sur les colonnes critiques
2. **Maintenance** : Les triggers sont automatiques, pas besoin de code applicatif
3. **Évolutivité** : Le système peut être étendu pour d'autres règles métier
4. **Multi-tenant** : Toutes les règles sont appliquées à chaque tenant indépendamment

---

## 🆘 Support

En cas de problème :
1. Vérifier les logs PostgreSQL
2. Tester les vues manuellement
3. Vérifier que les triggers sont actifs : `\dft affectation_cours`
4. Consulter les contraintes : `\d affectation_cours`

---

**Date de création** : 2026-05-17  
**Version** : 1.0.0  
**Auteur** : Bob - IMTECH University Development Team