# Guide de Création de Compte Enseignant - Règles de Gestion

## Vue d'ensemble

Ce document décrit le processus complet de création et de gestion d'un compte enseignant dans le système IMTECH University, depuis la création initiale jusqu'à l'affectation aux unités d'enseignement (UE).

## Processus Complet

### 1. Création du Compte Utilisateur (Rôle: Admin/Super Admin)

**Endpoint**: `POST /users`

**Données requises**:
```json
{
  "email": "enseignant@example.com",
  "nom": "Dupont",
  "prenom": "Jean",
  "telephone": "+261340000000",
  "role": "enseignant",
  "tenantId": "uuid-de-l-universite",
  "titre": "Docteur",           // Optionnel: Dr, Pr, etc.
  "grade": "Maître de conférences", // Optionnel
  "specialite": "Informatique"   // Optionnel
}
```

**Comportement automatique**:

1. **Création dans la table `utilisateur`**:
   - Génération automatique d'un mot de passe sécurisé (si non fourni)
   - Hash du mot de passe avec bcrypt
   - Envoi d'email avec les identifiants
   - Marquage pour changement de mot de passe obligatoire

2. **Création automatique dans la table `enseignant`** (NOUVEAU):
   - Génération automatique d'un matricule unique (format: ENS00001, ENS00002, etc.)
   - Copie des informations: id, matricule, nom, prenom, titre, grade, specialite, email, telephone
   - Liaison avec l'utilisateur via `utilisateur_id`
   - Statut actif par défaut

**Exemple de réponse**:
```json
{
  "id": "uuid-utilisateur",
  "email": "enseignant@example.com",
  "nom": "Dupont",
  "prenom": "Jean",
  "role": "enseignant",
  "enseignantId": "uuid-enseignant",
  "matricule": "ENS00001",
  "plainPassword": "MotDePasseGenere123!",
  "passwordResetRequired": true,
  "emailSent": true,
  "tenantId": "uuid-de-l-universite",
  "university": "IMTECH University"
}
```

### 2. Création du Contrat RH (Rôle: RH/Responsable RH)

**Endpoint**: `POST /rh/contrats`

**Données requises**:
```json
{
  "utilisateurId": "uuid-utilisateur",
  "typeContrat": "permanent",  // ou "vacataire", "cdd", etc.
  "poste": "Enseignant-Chercheur",
  "departementId": "uuid-departement",
  "dateDebut": "2024-01-01",
  "dateFin": "2025-12-31",     // null pour CDI
  "salaireBrut": 2500000,
  "salaireNet": 2000000,
  "volumeHoraireHebdo": 40,
  "actif": true,
  "observations": "Contrat initial"
}
```

**Vérifications automatiques**:
- L'utilisateur existe
- Le département existe
- Pas de chevauchement de contrats actifs

**Importance**: Sans contrat actif, l'enseignant ne peut pas être affecté à une UE.

### 3. Affectation à une Unité d'Enseignement (Rôle: Responsable Pédagogique)

**Endpoint**: `POST /pedagogique/affectations`

**Données requises**:
```json
{
  "enseignantId": "uuid-enseignant",
  "ueId": "uuid-ue",           // OU ecId pour un élément constitutif
  "anneeAcademiqueId": "uuid-annee",
  "typeSeance": "CM",          // CM, TD, TP
  "volumePrevu": 40            // Heures prévues
}
```

**Vérifications automatiques**:
1. L'enseignant existe et est actif
2. L'enseignant a un contrat actif (vérifié via `contrat_personnel`)
3. L'UE/EC existe et est actif
4. L'année académique existe
5. Pas de double affectation pour la même UE/EC

**Endpoint de vérification préalable**: `POST /enseignant-affectation/validate`

### 4. Utilisation du Compte Enseignant

Une fois le compte créé, le contrat établi et l'affectation effectuée, l'enseignant peut:

1. **Se connecter** avec ses identifiants
2. **Changer son mot de passe** (obligatoire à la première connexion)
3. **Accéder à son portail** avec les fonctionnalités:
   - Consulter ses affectations
   - Gérer les notes de ses étudiants
   - Consulter l'emploi du temps
   - Envoyer des messages aux étudiants
   - Uploader des ressources pédagogiques

## Endpoints de Vérification

### Vérifier le statut d'un enseignant

**Endpoint**: `GET /enseignant-affectation/statut/:enseignantId`

**Réponse**:
```json
{
  "success": true,
  "hasAffectation": true,
  "hasActiveContract": true,
  "affectations": [
    {
      "ueCode": "INFO101",
      "ueIntitule": "Programmation C",
      "typeSeance": "CM",
      "volumePrevu": 40,
      "volumeRealise": 10
    }
  ],
  "statistics": {
    "nbUeAffectees": 3,
    "volumeHoraireTotal": 120,
    "aContratActif": true
  },
  "message": "Vous êtes affecté à 3 UE."
}
```

### Vérifier si un enseignant a un contrat actif

**Endpoint**: `GET /enseignant-affectation/check-contract/:enseignantId`

### Lister les enseignants sans affectation

**Endpoint**: `GET /enseignant-affectation/sans-affectation`

## Structure des Tables

### Table `utilisateur`
```sql
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- nom (VARCHAR)
- prenom (VARCHAR)
- telephone (VARCHAR)
- role (VARCHAR) -- 'enseignant'
- actif (BOOLEAN)
- created_at (TIMESTAMP)
```

### Table `enseignant`
```sql
- id (UUID, PK)
- utilisateur_id (UUID, FK -> utilisateur.id, UNIQUE)
- matricule (VARCHAR, UNIQUE) -- Auto-généré: ENS00001
- nom (VARCHAR)
- prenom (VARCHAR)
- titre (VARCHAR) -- Dr, Pr, etc.
- grade (VARCHAR) -- Maître de conférences, Professeur, etc.
- specialite (VARCHAR)
- type_contrat (VARCHAR) -- permanent, vacataire, hdr, invite
- departement_id (UUID, FK)
- email (VARCHAR)
- telephone (VARCHAR)
- actif (BOOLEAN)
- created_at (TIMESTAMP)
```

### Table `contrat_personnel`
```sql
- id (UUID, PK)
- utilisateur_id (UUID, FK -> utilisateur.id)
- type_contrat (VARCHAR)
- poste (VARCHAR)
- departement_id (UUID, FK)
- date_debut (DATE)
- date_fin (DATE)
- salaire_brut (DECIMAL)
- salaire_net (DECIMAL)
- volume_horaire_hebdo (INTEGER)
- actif (BOOLEAN)
- observations (TEXT)
```

### Table `affectation_cours`
```sql
- id (UUID, PK)
- enseignant_id (UUID, FK -> enseignant.id)
- ue_id (UUID, FK -> unite_enseignement.id)
- ec_id (UUID, FK -> element_constitutif.id)
- annee_academique_id (UUID, FK)
- type_seance (VARCHAR) -- CM, TD, TP
- volume_prevu (INTEGER)
- volume_realise (INTEGER)
- valide_par (UUID)
```

## Règles de Gestion Importantes

1. **Création automatique**: Lors de la création d'un utilisateur avec le rôle "enseignant", un enregistrement est automatiquement créé dans la table `enseignant`.

2. **Matricule unique**: Le matricule est généré automatiquement au format ENS + numéro séquentiel sur 5 chiffres.

3. **Contrat obligatoire**: Un enseignant doit avoir un contrat actif pour pouvoir être affecté à une UE.

4. **Validation d'affectation**: Avant de créer une affectation, le système vérifie:
   - Existence de l'enseignant
   - Contrat actif
   - Pas de double affectation
   - Charge de travail raisonnable (warning si > 5 UE)

5. **Gestion des erreurs**: Si la création de l'enregistrement enseignant échoue, l'utilisateur est automatiquement supprimé pour maintenir la cohérence.

## Workflow Complet - Exemple

```
1. Admin crée le compte
   POST /users
   {
     "email": "prof.martin@imtech.mg",
     "nom": "Martin",
     "prenom": "Sophie",
     "role": "enseignant",
     "titre": "Docteur",
     "grade": "Maître de conférences",
     "specialite": "Intelligence Artificielle",
     "tenantId": "uuid-imtech"
   }
   
   → Utilisateur créé avec ID: user-123
   → Enseignant créé avec ID: ens-456, Matricule: ENS00015
   → Email envoyé avec mot de passe temporaire

2. RH crée le contrat
   POST /rh/contrats
   {
     "utilisateurId": "user-123",
     "typeContrat": "permanent",
     "poste": "Enseignant-Chercheur",
     "dateDebut": "2024-09-01",
     "salaireBrut": 3000000,
     "volumeHoraireHebdo": 40
   }
   
   → Contrat créé et actif

3. Responsable Pédagogique affecte à une UE
   POST /pedagogique/affectations
   {
     "enseignantId": "ens-456",
     "ueId": "ue-789",
     "anneeAcademiqueId": "annee-2024",
     "typeSeance": "CM",
     "volumePrevu": 40
   }
   
   → Affectation créée
   → Enseignant peut maintenant utiliser son compte

4. Enseignant se connecte
   POST /auth/login
   {
     "email": "prof.martin@imtech.mg",
     "password": "MotDePasseTemporaire"
   }
   
   → Redirection vers changement de mot de passe
   → Accès au portail enseignant
```

## Codes d'Erreur Courants

- `ConflictException`: Email déjà utilisé
- `NotFoundException`: Université/Département/UE non trouvé
- `BadRequestException`: 
  - Enseignant sans contrat actif
  - Double affectation
  - Données invalides

## Notes Techniques

- **Transaction**: La création utilisateur + enseignant est atomique (rollback si erreur)
- **Cache**: Les listes d'utilisateurs sont mises en cache (invalidation automatique)
- **Sécurité**: Mot de passe hashé avec bcrypt (12 rounds)
- **Email**: Envoi asynchrone des identifiants (ne bloque pas la création)
- **Tenant**: Toutes les opérations sont isolées par schéma de base de données

## Maintenance

### Vérifier les enseignants sans contrat
```sql
SELECT e.* 
FROM enseignant e
LEFT JOIN contrat_personnel cp ON cp.utilisateur_id = e.utilisateur_id 
  AND cp.actif = TRUE
WHERE cp.id IS NULL AND e.actif = TRUE;
```

### Vérifier les enseignants sans affectation
```sql
SELECT * FROM vue_enseignants_sans_affectation;
```

### Statistiques d'affectation
```sql
SELECT * FROM vue_statistiques_affectation_enseignant;
```

---

**Date de création**: 2026-05-20  
**Version**: 1.0  
**Auteur**: Bob (Assistant IA)