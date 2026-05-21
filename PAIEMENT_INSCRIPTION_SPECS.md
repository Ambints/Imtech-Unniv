# Spécifications : Système de Paiement d'Inscription et Module Caissier

## Vue d'ensemble

Système complet de gestion des paiements d'inscription avec validation par le caissier.

## Workflow

```
Étudiant inscrit → Effectue paiement en ligne → Caissier valide → Accès complet au portail
```

## 1. Paiement d'Inscription (Portail Étudiant)

### 1.1 Après inscription
- Afficher section "Paiement des frais d'inscription"
- Montant à payer (récupéré de la grille tarifaire)
- 2 méthodes de paiement :
  - **Virement bancaire** : Afficher RIB de l'université
  - **Mobile Money** : Afficher numéro et opérateur

### 1.2 Formulaire de paiement
```typescript
interface PaiementInscription {
  inscriptionId: string;
  montant: number;
  methodePaiement: 'virement' | 'mobile_money';
  referencePaiement: string; // Numéro de transaction
  datePaiement: Date;
  preuve?: File; // Capture d'écran optionnelle
  statut: 'en_attente' | 'valide' | 'rejete';
}
```

### 1.3 Affichage
- Carte avec statut du paiement
- Badge coloré : En attente (orange), Validé (vert), Rejeté (rouge)
- Bouton "Effectuer le paiement" si pas encore payé
- Affichage de la référence si déjà soumis

## 2. Module Caissier

### 2.1 Dashboard Caissier

**Cartes KPI** :
- Encaissement du jour
- Caisse du jour (solde)
- Paiements en attente de validation
- Impayés

**Graphiques** :
- Évolution des encaissements (7 derniers jours)
- Répartition par mode de paiement

### 2.2 Validation des Paiements d'Inscription

**Liste des paiements en attente** :
- Nom de l'étudiant
- Parcours
- Montant
- Méthode de paiement
- Référence
- Date de soumission
- Actions : Valider / Rejeter

**Modal de validation** :
- Vérifier la référence
- Ajouter une note
- Confirmer la validation
- Génération automatique du reçu

### 2.3 Encaissement

**Formulaire d'encaissement** :
- Recherche étudiant (autocomplétion)
- Sélection du type de frais
- Montant
- Mode de paiement
- Référence
- Génération de reçu

### 2.4 Gestion de Caisse

**Caisse du jour** :
- Solde initial
- Encaissements
- Décaissements
- Solde final

**Clôture de caisse** :
- Saisie du montant physique
- Calcul des écarts
- Justification
- Génération du rapport

### 2.5 Échéanciers

**Gestion des paiements échelonnés** :
- Liste des étudiants avec échéancier
- Dates d'échéance
- Montants
- Statut
- Relances automatiques

### 2.6 Impayés

**Suivi des impayés** :
- Liste des étudiants
- Montant dû
- Ancienneté
- Actions : Relance, Blocage

### 2.7 Rapports

**Types de rapports** :
- Rapport journalier
- Rapport mensuel
- Rapport annuel
- Export Excel/PDF

## 3. Structure de la Base de Données

### 3.1 Table `paiement_inscription`
```sql
CREATE TABLE paiement_inscription (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inscription_id UUID REFERENCES inscription(id),
  etudiant_id UUID REFERENCES etudiant(id),
  montant DECIMAL(10,2) NOT NULL,
  methode_paiement VARCHAR(50) NOT NULL,
  reference_paiement VARCHAR(255) NOT NULL,
  date_paiement TIMESTAMP NOT NULL,
  preuve_url TEXT,
  statut VARCHAR(50) DEFAULT 'en_attente',
  valide_par UUID REFERENCES utilisateur(id),
  date_validation TIMESTAMP,
  note_validation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 Table `paiement` (existante - à vérifier)
```sql
-- Vérifier si existe, sinon créer
CREATE TABLE IF NOT EXISTS paiement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inscription_id UUID REFERENCES inscription(id),
  montant DECIMAL(10,2) NOT NULL,
  mode_paiement VARCHAR(50) NOT NULL,
  reference VARCHAR(255),
  date_paiement TIMESTAMP NOT NULL,
  statut VARCHAR(50) DEFAULT 'valide',
  caissier_id UUID REFERENCES utilisateur(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.3 Table `cloture_caisse` (existante)
```sql
-- Déjà existe dans caissier.module
```

### 3.4 Table `echeancier` (existante)
```sql
-- Déjà existe dans caissier.module
```

## 4. API Endpoints

### 4.1 Portail Étudiant
- `POST /api/v1/portail/:tid/etudiant/paiement-inscription` - Soumettre un paiement
- `GET /api/v1/portail/:tid/etudiant/paiement-inscription/:inscriptionId` - Statut du paiement
- `GET /api/v1/portail/:tid/etudiant/montant-inscription/:inscriptionId` - Montant à payer

### 4.2 Module Caissier
- `GET /api/v1/caissier/:tid/dashboard` - KPIs du dashboard
- `GET /api/v1/caissier/:tid/paiements-en-attente` - Liste des paiements à valider
- `PATCH /api/v1/caissier/:tid/paiement-inscription/:id/valider` - Valider un paiement
- `PATCH /api/v1/caissier/:tid/paiement-inscription/:id/rejeter` - Rejeter un paiement
- `POST /api/v1/caissier/:tid/encaissement` - Enregistrer un encaissement
- `GET /api/v1/caissier/:tid/caisse-du-jour` - État de la caisse
- `POST /api/v1/caissier/:tid/cloture-caisse` - Clôturer la caisse
- `GET /api/v1/caissier/:tid/echeanciers` - Liste des échéanciers
- `GET /api/v1/caissier/:tid/impayes` - Liste des impayés
- `GET /api/v1/caissier/:tid/rapports/:type` - Générer un rapport

## 5. Composants Frontend

### 5.1 Portail Étudiant
- `PaiementInscriptionCard.tsx` - Carte de paiement
- `PaiementInscriptionModal.tsx` - Modal de paiement

### 5.2 Module Caissier
- `CaissierDashboard.tsx` - Dashboard principal
- `ValidationPaiementsPage.tsx` - Validation des paiements
- `EncaissementPage.tsx` - Formulaire d'encaissement
- `CaisseDuJourPage.tsx` - Gestion de caisse
- `ClotureCaissePage.tsx` - Clôture de caisse
- `EcheanciersPage.tsx` - Gestion des échéanciers
- `ImpayesPage.tsx` - Suivi des impayés
- `ReportingPage.tsx` - Rapports

## 6. Notifications

### 6.1 Email
- Étudiant : Confirmation de soumission du paiement
- Caissier : Nouveau paiement à valider
- Étudiant : Paiement validé/rejeté

### 6.2 In-app
- Badge sur l'icône caissier (nombre de paiements en attente)
- Notification temps réel

## 7. Sécurité

- Validation côté serveur de tous les montants
- Vérification de l'unicité des références de paiement
- Logs de toutes les opérations de caisse
- Permissions strictes (seul le caissier peut valider)

## 8. Prochaines Étapes

1. ✅ Créer les migrations SQL
2. ✅ Implémenter les services backend
3. ✅ Créer les contrôleurs API
4. ✅ Développer les composants frontend
5. ✅ Tester le workflow complet
6. ✅ Ajouter les notifications
7. ✅ Générer les rapports PDF