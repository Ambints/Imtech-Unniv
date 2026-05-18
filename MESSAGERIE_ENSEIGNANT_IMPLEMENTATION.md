# 📧 Implémentation Complète - Système de Messagerie Enseignant

## 📋 Vue d'ensemble

Système complet de messagerie permettant aux enseignants de communiquer avec les étudiants via 3 modes :
1. **Message Direct** : Envoi à un étudiant spécifique
2. **Message Classe** : Envoi à tous les étudiants d'une classe
3. **Message Parcours** : Envoi avec filtres par parcours et/ou niveau

---

## 🗄️ Base de Données

### Tables créées

#### 1. `message_enseignant`
Stocke les messages envoyés par les enseignants.

```sql
CREATE TABLE message_enseignant (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enseignant_id UUID NOT NULL,
    sujet VARCHAR(255) NOT NULL,
    contenu TEXT NOT NULL,
    type_message VARCHAR(50) NOT NULL CHECK (type_message IN ('direct', 'classe', 'parcours')),
    
    -- Pour message direct
    etudiant_id UUID,
    
    -- Pour message classe
    classe_id UUID,
    
    -- Pour message parcours
    parcours_id UUID,
    niveau_id UUID,
    
    -- Métadonnées
    nombre_destinataires INTEGER DEFAULT 0,
    date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(50) DEFAULT 'envoye',
    
    CONSTRAINT fk_enseignant FOREIGN KEY (enseignant_id) REFERENCES utilisateur(id),
    CONSTRAINT fk_etudiant FOREIGN KEY (etudiant_id) REFERENCES etudiant(id),
    CONSTRAINT fk_parcours FOREIGN KEY (parcours_id) REFERENCES parcours(id),
    CONSTRAINT fk_niveau FOREIGN KEY (niveau_id) REFERENCES niveau_etude(id)
);
```

#### 2. `message_destinataire`
Track les destinataires individuels et leur statut de lecture.

```sql
CREATE TABLE message_destinataire (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL,
    etudiant_id UUID NOT NULL,
    lu BOOLEAN DEFAULT FALSE,
    date_lecture TIMESTAMP,
    
    CONSTRAINT fk_message FOREIGN KEY (message_id) REFERENCES message_enseignant(id),
    CONSTRAINT fk_etudiant_dest FOREIGN KEY (etudiant_id) REFERENCES etudiant(id),
    CONSTRAINT unique_message_etudiant UNIQUE (message_id, etudiant_id)
);
```

### Scripts de migration

- **Fichier SQL** : `backend/scripts/create-messagerie-tables.sql`
- **Script d'application** : `backend/scripts/apply-messagerie-to-tenants.js`

**Exécution** :
```bash
cd backend
node scripts/apply-messagerie-to-tenants.js
```

---

## 🔧 Backend (NestJS)

### Structure des fichiers

```
backend/src/messagerie/
├── entities/
│   ├── message-enseignant.entity.ts
│   └── message-destinataire.entity.ts
├── messagerie.controller.ts
├── messagerie.service.ts
└── messagerie.module.ts
```

### Entities TypeORM

#### MessageEnseignant
```typescript
@Entity('message_enseignant')
export class MessageEnseignant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'enseignant_id' })
  enseignantId: string;

  @Column({ length: 255 })
  sujet: string;

  @Column('text')
  contenu: string;

  @Column({ name: 'type_message' })
  typeMessage: 'direct' | 'classe' | 'parcours';

  @Column({ name: 'nombre_destinataires', default: 0 })
  nombreDestinataires: number;

  @CreateDateColumn({ name: 'date_envoi' })
  dateEnvoi: Date;

  // Relations avec Utilisateur, Etudiant, Parcours, NiveauEtude
}
```

#### MessageDestinataire
```typescript
@Entity('message_destinataire')
export class MessageDestinataire {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'message_id' })
  messageId: string;

  @Column({ name: 'etudiant_id' })
  etudiantId: string;

  @Column({ default: false })
  lu: boolean;

  @Column({ name: 'date_lecture', nullable: true })
  dateLecture?: Date;
}
```

### Endpoints API

Tous les endpoints sont préfixés par `/api/v1/portail/enseignant` et protégés par `@Roles('enseignant')`.

#### GET Endpoints

| Endpoint | Description | Retour |
|----------|-------------|--------|
| `/tous-etudiants` | Liste tous les étudiants actifs | `Etudiant[]` |
| `/mes-classes` | Classes de l'enseignant | `Classe[]` |
| `/parcours-disponibles` | Liste des parcours | `Parcours[]` |
| `/niveaux-disponibles` | Liste des niveaux | `Niveau[]` |
| `/stats-filtres?parcours_id=&niveau_id=` | Stats selon filtres | `{ nombre_etudiants, parcours_nom, niveau_nom }` |
| `/historique-messages` | Historique des messages envoyés | `Message[]` |

#### POST Endpoints

| Endpoint | Body | Description |
|----------|------|-------------|
| `/envoyer-message-direct` | `{ etudiant_id, sujet, message }` | Envoie à 1 étudiant |
| `/envoyer-message-classe` | `{ classe_id, sujet, message }` | Envoie à une classe |
| `/envoyer-message-parcours` | `{ parcours_id, niveau_id, sujet, message }` | Envoie avec filtres |

### Service Principal

Le `MessagerieService` gère :
- ✅ Récupération des listes (étudiants, classes, parcours, niveaux)
- ✅ Calcul des statistiques selon filtres
- ✅ Envoi de messages avec transactions
- ✅ Création automatique des entrées destinataires
- ✅ Historique des messages

**Exemple de méthode d'envoi** :
```typescript
async envoyerMessageDirect(enseignantId, etudiantId, sujet, message) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.startTransaction();
  
  try {
    // Créer le message
    const messageResult = await queryRunner.query(`
      INSERT INTO message_enseignant (...)
      VALUES (...)
      RETURNING id
    `);
    
    // Créer l'entrée destinataire
    await queryRunner.query(`
      INSERT INTO message_destinataire (message_id, etudiant_id)
      VALUES ($1, $2)
    `, [messageId, etudiantId]);
    
    await queryRunner.commitTransaction();
    return { success: true, messageId, nombreDestinataires: 1 };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  }
}
```

### Intégration dans AppModule

```typescript
// backend/src/app.module.ts
import { MessagerieModule } from './messagerie/messagerie.module';

@Module({
  imports: [
    // ... autres modules
    MessagerieModule,
  ],
})
export class AppModule {}
```

---

## 🎨 Frontend (React + TypeScript)

### Structure des fichiers

```
frontend/src/pages/portals/enseignant/
├── MessageDirectPage.tsx      (227 lignes)
├── MessageClassePage.tsx      (227 lignes)
└── MessageParcoursPage.tsx    (330 lignes)
```

### 1. MessageDirectPage

**Route** : `/portail/enseignant/message-direct`

**Fonctionnalités** :
- 🔍 Recherche d'étudiants (nom, prénom, matricule)
- 👤 Sélection d'un étudiant dans la liste
- ✉️ Formulaire avec sujet et message
- 📊 Affichage des infos de l'étudiant sélectionné
- ✅ Validation avant envoi

**Interface** :
```typescript
interface Etudiant {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
  email: string;
  parcours: string;
  niveau: string;
}
```

### 2. MessageClassePage

**Route** : `/portail/enseignant/message-classe`

**Fonctionnalités** :
- 📚 Liste des classes avec nombre d'étudiants
- 🎯 Sélection d'une classe
- ✉️ Formulaire de message
- 📊 Affichage du nombre de destinataires
- ⚠️ Confirmation avant envoi groupé

**Interface** :
```typescript
interface Classe {
  id: string;
  nom: string;
  code: string;
  parcours: string;
  niveau: string;
  nombre_etudiants: number;
}
```

### 3. MessageParcoursPage

**Route** : `/portail/enseignant/message-parcours`

**Fonctionnalités** :
- 🔧 Filtres : Parcours et/ou Niveau
- 📊 Calcul dynamique du nombre de destinataires
- 🔄 Mise à jour automatique des stats
- ✉️ Formulaire de message
- 🎯 Envoi ciblé selon filtres

**Interface** :
```typescript
interface FiltreStats {
  nombre_etudiants: number;
  parcours_nom?: string;
  niveau_nom?: string;
}
```

### Routing (App.tsx)

```typescript
// Imports lazy
const MessageDirectPage = lazy(() => import('./pages/portals/enseignant/MessageDirectPage'));
const MessageClassePage = lazy(() => import('./pages/portals/enseignant/MessageClassePage'));
const MessageParcoursPage = lazy(() => import('./pages/portals/enseignant/MessageParcoursPage'));

// Routes
<Route path="/portail/enseignant/message-direct" element={<Wrapped><MessageDirectPage /></Wrapped>} />
<Route path="/portail/enseignant/message-classe" element={<Wrapped><MessageClassePage /></Wrapped>} />
<Route path="/portail/enseignant/message-parcours" element={<Wrapped><MessageParcoursPage /></Wrapped>} />
```

### Menu latéral (Sidebar.tsx)

```typescript
// Ajout dans le menu enseignant
{ 
  label: 'Messagerie', 
  icon: <MessageSquare size={18} />, 
  path: '/portail/enseignant/messagerie' 
}
```

### Page principale de messagerie (EnseignantPortal.tsx)

Affiche 3 boutons pour accéder aux différents modes :
1. **Message Direct** → `/portail/enseignant/message-direct`
2. **Message Classe** → `/portail/enseignant/message-classe`
3. **Message Parcours** → `/portail/enseignant/message-parcours`

Plus un historique des messages envoyés.

---

## 🎨 Design & UX

### Caractéristiques communes

- ✅ **Design moderne** avec cards et ombres
- ✅ **Gradients** pour les avatars et boutons
- ✅ **Responsive** avec Bootstrap grid
- ✅ **Icons Lucide** pour meilleure UX
- ✅ **Loading states** pendant les requêtes
- ✅ **Toast notifications** pour feedback
- ✅ **Validation** des champs
- ✅ **Bouton retour** vers messagerie principale

### Palette de couleurs

- **Primary** : `#3b82f6` (bleu)
- **Secondary** : `#8b5cf6` (violet)
- **Success** : `#22c55e` (vert)
- **Background** : `#f8fafc` (gris clair)
- **Text** : `#1e293b` (gris foncé)

---

## 🔐 Sécurité

### Backend
- ✅ Guard JWT sur tous les endpoints
- ✅ Guard Roles (`@Roles('enseignant')`)
- ✅ Validation des IDs (UUID)
- ✅ Transactions SQL pour intégrité
- ✅ Vérification existence des entités

### Frontend
- ✅ Axios interceptors avec token JWT
- ✅ Header `X-Tenant-ID` automatique
- ✅ Validation côté client
- ✅ Gestion des erreurs 401/403

---

## 📊 Flux de données

### Envoi d'un message

```
Frontend                    Backend                     Database
   |                          |                            |
   |-- POST /envoyer-xxx ---->|                            |
   |    (sujet, message)      |                            |
   |                          |-- START TRANSACTION ------>|
   |                          |                            |
   |                          |-- INSERT message --------->|
   |                          |<-- message_id -------------|
   |                          |                            |
   |                          |-- INSERT destinataires --->|
   |                          |    (pour chaque étudiant)  |
   |                          |                            |
   |                          |-- COMMIT TRANSACTION ----->|
   |                          |                            |
   |<-- { success, id } ------|                            |
   |                          |                            |
   |-- Toast success          |                            |
```

---

## 🧪 Tests recommandés

### Backend
1. ✅ Tester chaque endpoint avec Postman/Insomnia
2. ✅ Vérifier les transactions (rollback en cas d'erreur)
3. ✅ Tester avec différents rôles (enseignant, admin, etc.)
4. ✅ Vérifier les contraintes de clés étrangères

### Frontend
1. ✅ Tester la recherche d'étudiants
2. ✅ Tester l'envoi avec champs vides
3. ✅ Tester les filtres dynamiques
4. ✅ Vérifier le responsive design
5. ✅ Tester les notifications toast

### Base de données
1. ✅ Vérifier les index créés
2. ✅ Tester les performances avec beaucoup de messages
3. ✅ Vérifier l'intégrité référentielle

---

## 📝 Commandes utiles

### Créer les tables
```bash
cd backend
node scripts/apply-messagerie-to-tenants.js
```

### Vérifier les tables
```sql
-- Dans psql
\dt message_*
SELECT * FROM message_enseignant LIMIT 5;
SELECT * FROM message_destinataire LIMIT 5;
```

### Démarrer le backend
```bash
cd backend
npm run start:dev
```

### Démarrer le frontend
```bash
cd frontend
npm run dev
```

---

## 🚀 Améliorations futures

### Fonctionnalités
- [ ] Pièces jointes aux messages
- [ ] Réponses des étudiants
- [ ] Notifications push
- [ ] Brouillons de messages
- [ ] Templates de messages
- [ ] Planification d'envoi
- [ ] Statistiques de lecture

### Technique
- [ ] Pagination de l'historique
- [ ] Cache Redis pour les listes
- [ ] WebSockets pour temps réel
- [ ] Export des messages en PDF
- [ ] Recherche full-text

---

## 📚 Documentation API

### Authentification
Tous les endpoints nécessitent :
- **Header** : `Authorization: Bearer <JWT_TOKEN>`
- **Header** : `X-Tenant-ID: <TENANT_UUID>`

### Codes de réponse
- `200` : Succès
- `201` : Créé
- `400` : Requête invalide
- `401` : Non authentifié
- `403` : Non autorisé (pas le bon rôle)
- `404` : Ressource non trouvée
- `500` : Erreur serveur

---

## ✅ Checklist d'implémentation

### Base de données
- [x] Créer `message_enseignant` table
- [x] Créer `message_destinataire` table
- [x] Ajouter index pour performances
- [x] Script de migration pour tous les tenants

### Backend
- [x] Créer entities TypeORM
- [x] Créer service avec méthodes CRUD
- [x] Créer contrôleur avec endpoints
- [x] Créer module et l'importer dans AppModule
- [x] Ajouter guards de sécurité

### Frontend
- [x] Créer MessageDirectPage
- [x] Créer MessageClassePage
- [x] Créer MessageParcoursPage
- [x] Ajouter routes dans App.tsx
- [x] Ajouter option dans Sidebar
- [x] Mettre à jour EnseignantPortal

### Tests
- [ ] Tester tous les endpoints
- [ ] Tester toutes les pages frontend
- [ ] Vérifier la sécurité
- [ ] Tester les performances

---

## 🎉 Conclusion

Le système de messagerie enseignant est maintenant **complètement implémenté** avec :
- ✅ Base de données structurée
- ✅ Backend NestJS fonctionnel
- ✅ Frontend React moderne
- ✅ 3 modes de communication
- ✅ Sécurité et validation
- ✅ UX optimale

**Prêt pour la production après tests !** 🚀