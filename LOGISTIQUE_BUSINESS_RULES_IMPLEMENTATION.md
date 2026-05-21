# 🏢 IMPLÉMENTATION DES RÈGLES MÉTIER LOGISTIQUE & MAINTENANCE

## 🎯 Objectif

Implémenter 10 règles métier essentielles pour la gestion logistique et maintenance :

1. **Règle 01** : Une salle ne peut être réservée que si elle n'est pas déjà occupée sur le même créneau horaire
2. **Règle 02** : Un ticket de maintenance doit être assigné à un responsable dans les 48h suivant sa création
3. **Règle 03** : Le stock d'un produit d'entretien sous le seuil critique déclenche automatiquement une alerte à la logistique
4. **Règle 04** : Une réservation de salle pour événement hors cours requiert la validation du responsable logistique
5. **Règle 05** : Le planning de nettoyage ne peut être modifié que par le responsable logistique
6. **Règle 06** : Un équipement (matériel informatique, mobilier) doit être codifié avant enregistrement dans l'inventaire
7. **Règle 07** : Tout mouvement de stock (entrée/sortie) est obligatoirement tracé avec date, quantité et responsable
8. **Règle 08** : La consommation énergétique est enregistrée mensuellement et reportée à l'économat pour imputation budgétaire
9. **Règle 09** : Un prestataire ménage externalisé est validé sur feuille de présence contrôlée par le responsable logistique
10. **Règle 10** : Aucune infrastructure ne peut être mise hors service sans validation préalable du responsable logistique et du président

---

## 📁 Fichiers Créés

### 1. Migration SQL
**Fichier** : `backend/scripts/add-logistique-business-rules.sql` (717 lignes)

Contient :
- ✅ 5 nouvelles tables
- ✅ 10 fonctions de validation
- ✅ 9 triggers automatiques
- ✅ 5 vues métier
- ✅ 7 index de performance

### 2. Script d'Application
**Fichier** : `backend/scripts/apply-logistique-business-rules.js` (268 lignes)

Script Node.js pour appliquer la migration à tous les tenants actifs.

---

## 🗄️ Nouvelles Tables Créées

### 1. `consommation_energetique`
Enregistrement mensuel des consommations énergétiques par bâtiment.

**Colonnes principales** :
- `batiment_id`, `type_energie` (électricité, eau, gaz)
- `mois`, `annee`, `consommation`, `unite`
- `cout`, `releve_par`, `date_releve`
- `transmis_economat` (boolean), `date_transmission`

### 2. `prestataire_externe`
Gestion des prestataires externes (ménage, sécurité, maintenance).

**Colonnes principales** :
- `nom`, `type_service`, `contact`
- `telephone`, `email`, `actif`

### 3. `feuille_presence_prestataire`
Validation des interventions des prestataires externes.

**Colonnes principales** :
- `prestataire_id`, `date_intervention`
- `heure_debut`, `heure_fin`, `zone_intervention`
- `taches_effectuees`, `valide_par`, `date_validation`

### 4. `mise_hors_service`
Workflow de validation double pour mise hors service d'infrastructures.

**Colonnes principales** :
- `type_infrastructure` (batiment, salle, equipement)
- `infrastructure_id`, `motif`, `date_debut`, `date_fin_prevue`
- `demande_par`, `valide_responsable_logistique`, `valide_president`
- `statut` (en_attente, valide_logistique, valide_president, active, terminee)

### 5. `equipement`
Inventaire des équipements avec codification obligatoire.

**Colonnes principales** :
- `code_equipement` (UNIQUE, obligatoire)
- `libelle`, `categorie`, `salle_id`, `batiment_id`
- `date_acquisition`, `valeur_acquisition`, `etat`
- `numero_serie`, `fournisseur`, `garantie_jusqu_au`

---

## 🔧 Règles Implémentées en Détail

### RÈGLE 01 : Réservation Salle Sans Conflit

**Fonction** : `check_reservation_salle_conflit()`

**Logique** :
1. Vérifie les conflits avec d'autres réservations sur le même créneau
2. Vérifie les conflits avec l'emploi du temps des cours
3. Bloque l'insertion/modification si conflit détecté

**Triggers** :
- `trigger_check_reservation_conflit_insert` (BEFORE INSERT)
- `trigger_check_reservation_conflit_update` (BEFORE UPDATE)

**Message d'erreur** :
```
"Cette salle est déjà réservée sur ce créneau horaire. Veuillez choisir un autre créneau."
```

---

### RÈGLE 02 : Ticket Maintenance Assigné Sous 48h

**Fonction** : `check_ticket_assignment_deadline()`

Retourne tous les tickets non assignés depuis plus de 48h.

**Fonction** : `notify_unassigned_tickets()`

Crée automatiquement une notification pour les responsables logistique si un ticket dépasse 48h sans assignation.

**Vue associée** : `vue_tickets_maintenance_alerte`

Affiche tous les tickets avec leur niveau d'alerte :
- `NON_ASSIGNE_48H` : Plus de 48h sans assignation
- `NON_ASSIGNE_24H` : Plus de 24h sans assignation
- `NON_ASSIGNE` : Moins de 24h
- `ASSIGNE` : Ticket assigné

---

### RÈGLE 03 : Alerte Stock Automatique

**Note** : Le trigger `trigger_alerte_stock()` existe déjà dans le système.

**Vue améliorée** : `vue_stock_critique`

Affiche tous les stocks sous le seuil avec niveau d'alerte :
- `RUPTURE` : Stock = 0
- `CRITIQUE` : Stock ≤ 50% du seuil
- `ALERTE` : Stock ≤ seuil
- `NORMAL` : Stock > seuil

**Colonnes** :
- Informations produit (référence, libellé, catégorie)
- `quantite_stock`, `seuil_alerte`, `pourcentage_seuil`
- `niveau_alerte`, `prix_unitaire`, `fournisseur`

---

### RÈGLE 04 : Validation Réservation Événement

**Fonction** : `require_validation_for_event_reservation()`

**Logique** :
1. Toute nouvelle réservation est automatiquement en statut `en_attente`
2. Seul un utilisateur avec rôle `logistique` ou `admin` peut approuver
3. Bloque l'approbation si l'utilisateur n'a pas les droits

**Trigger** : `trigger_require_validation_reservation`

**Message d'erreur** :
```
"Seul le responsable logistique ou un administrateur peut approuver une réservation."
```

---

### RÈGLE 05 : Modification Planning Nettoyage Restreinte

**Fonction** : `restrict_planning_entretien_modification()`

**Logique** :
1. Vérifie le rôle de l'utilisateur via variable de session `app.current_user_role`
2. Autorise uniquement les rôles `logistique` et `admin`
3. Bloque toute modification par d'autres rôles

**Trigger** : `trigger_restrict_planning_modification` (BEFORE UPDATE)

**Message d'erreur** :
```
"Seul le responsable logistique peut modifier le planning de nettoyage."
```

**Note** : Nécessite de définir la variable de session côté application :
```sql
SET app.current_user_role = 'logistique';
```

---

### RÈGLE 06 : Codification Équipement Obligatoire

**Fonction** : `validate_equipement_code()`

**Logique** :
1. Vérifie que `code_equipement` n'est pas NULL ou vide
2. Recommande le format : `CAT-YYYY-NNNN` (ex: INF-2024-0001)
3. Émet un WARNING si format non standard

**Trigger** : `trigger_validate_equipement_code` (BEFORE INSERT/UPDATE)

**Format recommandé** :
- `INF-2024-0001` : Informatique
- `MOB-2024-0001` : Mobilier
- `AUD-2024-0001` : Audiovisuel
- `LAB-2024-0001` : Laboratoire

**Message d'erreur** :
```
"Le code équipement est obligatoire. Format recommandé: CAT-YYYY-NNNN (ex: INF-2024-0001)"
```

---

### RÈGLE 07 : Traçabilité Mouvement Stock

**Fonction** : `enforce_stock_movement_traceability()`

**Logique** :
1. Vérifie que `utilisateur_id` est renseigné
2. Vérifie que `motif` est renseigné
3. Vérifie que `quantite` est non nulle
4. Met à jour automatiquement le stock selon le type de mouvement :
   - `entree` : +quantité
   - `sortie` : -quantité
   - `ajustement` : =quantité

**Trigger** : `trigger_enforce_stock_traceability` (BEFORE INSERT)

**Champs obligatoires** :
- `utilisateur_id` : Qui effectue le mouvement
- `motif` : Pourquoi (ex: "Réapprovisionnement", "Utilisation salle 101")
- `quantite` : Combien
- `date_mouvement` : Quand (auto si non fourni)

---

### RÈGLE 08 : Consommation Énergétique Mensuelle

**Fonction** : `validate_consommation_energetique()`

**Logique** :
1. Vérifie que `releve_par` est renseigné
2. Vérifie que `consommation` > 0
3. Crée automatiquement une notification pour l'économat
4. Contrainte UNIQUE sur (batiment, type_energie, mois, annee)

**Trigger** : `trigger_validate_consommation` (BEFORE INSERT/UPDATE)

**Vue associée** : `vue_consommations_non_transmises`

Affiche toutes les consommations non encore transmises à l'économat avec :
- Nombre de jours depuis le relevé
- Détails du bâtiment et de la consommation
- Qui a effectué le relevé

---

### RÈGLE 09 : Validation Prestataire Externe

**Fonction** : `validate_feuille_presence_prestataire()`

**Logique** :
1. Vérifie que seul un responsable logistique peut valider
2. Enregistre automatiquement la date de validation
3. Vérifie la cohérence des heures (fin > début)

**Trigger** : `trigger_validate_feuille_presence` (BEFORE INSERT/UPDATE)

**Workflow** :
1. Création de la feuille de présence (non validée)
2. Validation par responsable logistique
3. Date de validation enregistrée automatiquement

---

### RÈGLE 10 : Validation Double Mise Hors Service

**Fonction** : `validate_mise_hors_service()`

**Workflow de validation** :
1. **Demande** : Statut `en_attente`
2. **Validation Logistique** : Statut `valide_logistique`
3. **Validation Président** : Statut `valide_president`
4. **Activation** : Statut `active` + mise à jour infrastructure

**Trigger** : `trigger_validate_mise_hors_service` (BEFORE INSERT/UPDATE)

**Actions automatiques lors de l'activation** :
- Salle : `disponible = FALSE`
- Bâtiment : `actif = FALSE`
- Équipement : `etat = 'hors_service'`

**Vue associée** : `vue_mises_hors_service_pending`

Affiche toutes les demandes en attente de validation avec :
- Type et nom de l'infrastructure
- Demandeur et dates
- Statut de validation (logistique, président)

---

## 📊 Vues Métier Créées

### 1. `vue_reservations_salles`
Liste complète des réservations avec détails salle, bâtiment, demandeur, approbateur.

### 2. `vue_tickets_maintenance_alerte`
Tickets avec niveau d'alerte selon temps écoulé et statut d'assignation.

### 3. `vue_stock_critique`
Stocks sous le seuil avec niveau d'alerte (RUPTURE, CRITIQUE, ALERTE).

### 4. `vue_consommations_non_transmises`
Consommations énergétiques non encore transmises à l'économat.

### 5. `vue_mises_hors_service_pending`
Demandes de mise hors service en attente de validation.

---

## 🚀 Installation

### Étape 1 : Appliquer la Migration SQL

```bash
cd backend/scripts
node apply-logistique-business-rules.js
```

**Sortie attendue** :
```
🚀 Début de l'application des règles métier logistique...

📊 2 tenant(s) trouvé(s)

📋 Application des règles métier logistique au schéma: tenant_ispm
  ✓ Création des nouvelles tables...
  ✓ Création des fonctions de validation...
  ✓ Création des vues...
  ✓ Création des triggers...
  ✓ Création des index...
✅ Règles métier logistique appliquées avec succès au schéma: tenant_ispm

✅ Migration terminée avec succès pour tous les tenants!

📋 Résumé des règles implémentées:
   01. ✓ Réservation salle sans conflit horaire
   02. ✓ Ticket maintenance assigné sous 48h
   03. ✓ Alerte stock automatique (vue améliorée)
   04. ✓ Validation réservation événement
   05. ✓ Modification planning nettoyage restreinte
   06. ✓ Codification équipement obligatoire
   07. ✓ Traçabilité mouvement stock
   08. ✓ Enregistrement consommation énergétique
   09. ✓ Validation prestataire externe
   10. ✓ Validation double mise hors service
```

---

## 🧪 Tests des Règles

### Test 1 : Conflit Réservation Salle

```sql
-- Créer une première réservation
INSERT INTO reservation_salle (salle_id, titre, date_reservation, heure_debut, heure_fin, demande_par)
VALUES ('salle-uuid', 'Réunion A', '2024-06-15', '14:00', '16:00', 'user-uuid');

-- Tenter de créer une réservation qui chevauche
INSERT INTO reservation_salle (salle_id, titre, date_reservation, heure_debut, heure_fin, demande_par)
VALUES ('salle-uuid', 'Réunion B', '2024-06-15', '15:00', '17:00', 'user-uuid');

-- Résultat attendu : ERREUR
-- "Cette salle est déjà réservée sur ce créneau horaire."
```

### Test 2 : Codification Équipement

```sql
-- Tenter d'insérer un équipement sans code
INSERT INTO equipement (libelle, categorie)
VALUES ('Ordinateur portable', 'informatique');

-- Résultat attendu : ERREUR
-- "Le code équipement est obligatoire."

-- Insertion correcte
INSERT INTO equipement (code_equipement, libelle, categorie)
VALUES ('INF-2024-0001', 'Ordinateur portable', 'informatique');

-- Résultat attendu : SUCCESS
```

### Test 3 : Traçabilité Stock

```sql
-- Tenter un mouvement sans utilisateur
INSERT INTO mouvement_stock (stock_id, type_mouvement, quantite, motif)
VALUES ('stock-uuid', 'sortie', 10, 'Utilisation');

-- Résultat attendu : ERREUR
-- "Le responsable du mouvement de stock doit être identifié."

-- Mouvement correct
INSERT INTO mouvement_stock (stock_id, type_mouvement, quantite, motif, utilisateur_id)
VALUES ('stock-uuid', 'sortie', 10, 'Utilisation salle 101', 'user-uuid');

-- Résultat attendu : SUCCESS + mise à jour automatique du stock
```

### Test 4 : Validation Double Mise Hors Service

```sql
-- 1. Créer une demande
INSERT INTO mise_hors_service (type_infrastructure, infrastructure_id, motif, date_debut, demande_par)
VALUES ('salle', 'salle-uuid', 'Rénovation complète', '2024-07-01', 'user-uuid');
-- Statut automatique : 'en_attente'

-- 2. Validation par logistique
UPDATE mise_hors_service 
SET valide_responsable_logistique = 'logistique-user-uuid'
WHERE id = 'demande-uuid';
-- Statut devient : 'valide_logistique'

-- 3. Validation par président
UPDATE mise_hors_service 
SET valide_president = 'president-user-uuid'
WHERE id = 'demande-uuid';
-- Statut devient : 'valide_president'

-- 4. Activation
UPDATE mise_hors_service 
SET statut = 'active'
WHERE id = 'demande-uuid';
-- La salle est automatiquement mise disponible = FALSE
```

---

## 📡 Utilisation des Vues

### Consulter les Stocks Critiques

```sql
SELECT * FROM vue_stock_critique;
```

**Résultat** :
```
reference    | libelle              | niveau_alerte | quantite_stock | seuil_alerte
-------------|----------------------|---------------|----------------|-------------
PAP-A4-001   | Papier A4           | RUPTURE       | 0              | 10
NET-SAVON-001| Savon liquide       | CRITIQUE      | 2              | 5
NET-JAVEL-001| Javel               | ALERTE        | 3              | 3
```

### Consulter les Tickets Non Assignés

```sql
SELECT * FROM vue_tickets_maintenance_alerte
WHERE niveau_alerte IN ('NON_ASSIGNE_48H', 'NON_ASSIGNE_24H');
```

### Consulter les Consommations Non Transmises

```sql
SELECT * FROM vue_consommations_non_transmises
ORDER BY jours_depuis_releve DESC;
```

### Consulter les Demandes de Mise Hors Service

```sql
SELECT * FROM vue_mises_hors_service_pending
WHERE statut = 'en_attente';
```

---

## 🎨 Intégration Backend (Exemple)

### Service Logistique

```typescript
@Injectable()
export class LogistiqueService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  // Vérifier disponibilité salle
  async checkSalleDisponibilite(
    salleId: string,
    date: string,
    heureDebut: string,
    heureFin: string
  ): Promise<{ disponible: boolean; conflits: any[] }> {
    const query = `
      SELECT * FROM reservation_salle
      WHERE salle_id = $1
      AND date_reservation = $2
      AND statut NOT IN ('refusee', 'annulee')
      AND (
        ($3 >= heure_debut AND $3 < heure_fin)
        OR ($4 > heure_debut AND $4 <= heure_fin)
        OR ($3 <= heure_debut AND $4 >= heure_fin)
      )
    `;
    
    const conflits = await this.dataSource.query(query, [
      salleId, date, heureDebut, heureFin
    ]);
    
    return {
      disponible: conflits.length === 0,
      conflits
    };
  }

  // Récupérer tickets non assignés
  async getTicketsNonAssignes(): Promise<any[]> {
    return await this.dataSource.query(`
      SELECT * FROM vue_tickets_maintenance_alerte
      WHERE niveau_alerte LIKE 'NON_ASSIGNE%'
      ORDER BY heures_ecoulees DESC
    `);
  }

  // Récupérer stocks critiques
  async getStocksCritiques(): Promise<any[]> {
    return await this.dataSource.query(`
      SELECT * FROM vue_stock_critique
      ORDER BY 
        CASE niveau_alerte
          WHEN 'RUPTURE' THEN 1
          WHEN 'CRITIQUE' THEN 2
          WHEN 'ALERTE' THEN 3
        END
    `);
  }

  // Enregistrer consommation énergétique
  async enregistrerConsommation(data: {
    batimentId: string;
    typeEnergie: string;
    mois: number;
    annee: number;
    consommation: number;
    unite: string;
    cout?: number;
    relevePar: string;
  }): Promise<any> {
    const query = `
      INSERT INTO consommation_energetique 
      (batiment_id, type_energie, mois, annee, consommation, unite, cout, releve_par)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const result = await this.dataSource.query(query, [
      data.batimentId, data.typeEnergie, data.mois, data.annee,
      data.consommation, data.unite, data.cout, data.relevePar
    ]);
    
    return result[0];
  }
}
```

---

## ✅ Checklist de Validation

- [x] Migration SQL créée (717 lignes)
- [x] Script d'application créé (268 lignes)
- [x] 5 nouvelles tables créées
- [x] 10 fonctions de validation implémentées
- [x] 9 triggers automatiques créés
- [x] 5 vues métier créées
- [x] 7 index de performance créés
- [x] Documentation complète
- [ ] Service backend
- [ ] Contrôleur API
- [ ] Tests unitaires
- [ ] Tests d'intégration
- [ ] Intégration frontend

---

## 📊 Impact

### Avant l'Implémentation
- ❌ Conflits de réservation de salles possibles
- ❌ Tickets maintenance non suivis
- ❌ Pas de traçabilité des mouvements de stock
- ❌ Équipements sans codification
- ❌ Pas de workflow de validation pour mise hors service
- ❌ Consommations énergétiques non suivies

### Après l'Implémentation
- ✅ Réservations sans conflit garanties
- ✅ Suivi automatique des tickets (alerte 48h)
- ✅ Traçabilité complète des stocks
- ✅ Codification obligatoire des équipements
- ✅ Workflow de validation double (logistique + président)
- ✅ Suivi mensuel des consommations énergétiques
- ✅ Validation des prestataires externes
- ✅ Alertes automatiques pour stocks critiques

---

## 🔒 Sécurité

- ✅ Validation au niveau base de données (triggers)
- ✅ Contraintes d'intégrité (UNIQUE, CHECK)
- ✅ Workflow de validation multi-niveaux
- ✅ Traçabilité complète (qui, quand, pourquoi)
- ✅ Contrôle d'accès par rôles
- ✅ Notifications automatiques

---

## 📝 Notes Importantes

1. **Performance** : Les vues sont optimisées avec 7 index sur les colonnes critiques
2. **Maintenance** : Les triggers sont automatiques, pas besoin de code applicatif
3. **Évolutivité** : Le système peut être étendu pour d'autres règles métier
4. **Multi-tenant** : Toutes les règles sont appliquées à chaque tenant indépendamment
5. **Règle 05** : Nécessite de définir `app.current_user_role` côté application

---

## 🆘 Support

En cas de problème :
1. Vérifier les logs PostgreSQL
2. Tester les vues manuellement
3. Vérifier que les triggers sont actifs : `\dft reservation_salle`
4. Consulter les contraintes : `\d equipement`
5. Vérifier les nouvelles tables : `\dt consommation_energetique`

---

**Date de création** : 2026-05-17  
**Version** : 1.0.0  
**Auteur** : Bob - IMTECH University Development Team