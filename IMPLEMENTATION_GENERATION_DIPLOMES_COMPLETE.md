# 🎓 IMPLÉMENTATION COMPLÈTE - GÉNÉRATION DE DIPLÔMES

## 📋 Vue d'Ensemble

Système complet de génération, prévisualisation, signature et délivrance de diplômes avec workflow d'approbation.

## ✅ Étape 1 : Génération de Base (COMPLÉTÉ)

### Backend
- ✅ Endpoint POST `/scolarite/:tenantId/diplomes/generer`
- ✅ Méthode `genererDiplomes()` dans ScolariteService
- ✅ Vérification éligibilité (moyenne >= 10, statut admis)
- ✅ Génération numéro unique
- ✅ Support filtres année/parcours

### Frontend
- ✅ Bouton "Générer Diplômes" fonctionnel
- ✅ Confirmation avant génération
- ✅ Affichage message succès/erreur

## 🔄 Étape 2 : Filtres UI et Prévisualisation (EN COURS)

### 2.1 Filtres dans l'Interface

**Composants à ajouter** :
```typescript
// État des filtres
const [selectedAnnee, setSelectedAnnee] = useState<string>('');
const [selectedParcours, setSelectedParcours] = useState<string>('');
const [showPreview, setShowPreview] = useState(false);
const [etudiantsEligibles, setEtudiantsEligibles] = useState([]);
```

**UI des filtres** :
- Dropdown "Année Académique"
- Dropdown "Parcours"
- Bouton "Prévisualiser"
- Modal de prévisualisation

### 2.2 Endpoint Prévisualisation

**Backend** :
```typescript
@Get('diplomes/eligibles')
async getEtudiantsEligibles(
  @Req() req: any,
  @Query('anneeAcademiqueId') anneeId?: string,
  @Query('parcoursId') parcoursId?: string
) {
  return await this.scolariteService.getEtudiantsEligiblesDiplome(
    req.tenantSchema,
    anneeId,
    parcoursId
  );
}
```

**Service** :
```typescript
async getEtudiantsEligiblesDiplome(
  tenantSchema: string,
  anneeAcademiqueId?: string,
  parcoursId?: string
) {
  // Même requête que genererDiplomes mais sans INSERT
  // Retourne la liste des étudiants éligibles
}
```

## 📄 Étape 3 : Génération PDF

### 3.1 Installation Dépendances

```bash
npm install pdfkit
npm install @types/pdfkit --save-dev
```

### 3.2 Service PDF

**Fichier** : `backend/src/scolarite/services/diplome-pdf.service.ts`

```typescript
import PDFDocument from 'pdfkit';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DiplomePdfService {
  async genererPdfDiplome(diplome: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // En-tête
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .text('DIPLÔME', { align: 'center' });

      doc.moveDown();
      doc.fontSize(16)
         .font('Helvetica')
         .text(diplome.typeDiplome, { align: 'center' });

      doc.moveDown(2);

      // Corps
      doc.fontSize(14)
         .text('Le Président de l\'Université certifie que', { align: 'center' });

      doc.moveDown();
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .text(`${diplome.etudiant.prenom} ${diplome.etudiant.nom}`, { align: 'center' });

      doc.moveDown();
      doc.fontSize(14)
         .font('Helvetica')
         .text(`Né(e) le ${new Date(diplome.etudiant.dateNaissance).toLocaleDateString('fr-FR')}`, { align: 'center' });

      doc.moveDown(2);
      doc.text('A obtenu le diplôme de', { align: 'center' });

      doc.moveDown();
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .text(diplome.parcours.nom, { align: 'center' });

      doc.moveDown();
      doc.fontSize(14)
         .font('Helvetica')
         .text(`Avec la mention : ${diplome.mentionGenerale}`, { align: 'center' });
      doc.text(`Moyenne : ${diplome.moyenneFinale}/20`, { align: 'center' });

      doc.moveDown(2);
      doc.text(`Fait à [Ville], le ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });

      // Pied de page
      doc.moveDown(3);
      doc.fontSize(12);
      doc.text('Le Président', 100, doc.page.height - 150);
      doc.text('Le Directeur des Études', doc.page.width - 250, doc.page.height - 150);

      if (diplome.signePresident) {
        doc.text('[Signature]', 100, doc.page.height - 120);
      }

      doc.fontSize(10)
         .text(`N° ${diplome.numeroDiplome}`, 50, doc.page.height - 50, { align: 'center' });

      doc.end();
    });
  }
}
```

### 3.3 Endpoint Téléchargement PDF

```typescript
@Get('diplomes/:diplomeId/pdf')
@Roles('admin', 'scolarite', 'president')
async telechargerDiplomePdf(
  @Req() req: any,
  @Param('diplomeId') diplomeId: string,
  @Res() res: Response
) {
  const diplome = await this.scolariteService.getDiplomeById(req.tenantSchema, diplomeId);
  const pdfBuffer = await this.diplomePdfService.genererPdfDiplome(diplome);
  
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename=diplome-${diplome.numeroDiplome}.pdf`,
    'Content-Length': pdfBuffer.length
  });
  
  res.send(pdfBuffer);
}
```

## ✍️ Étape 4 : Workflow Signature Président

### 4.1 Intégration avec Module Président

**Le module Président a déjà** :
- ✅ `getDiplomesASigner()` - Liste des diplômes à signer
- ✅ `signerDiplome()` - Signature individuelle
- ✅ `signerDiplomesEnMasse()` - Signature en masse

**Modifications nécessaires** :
1. Les diplômes générés doivent apparaître dans la liste du président
2. Statut : `en_preparation` → `pret_signature` → `signe` → `delivre`

### 4.2 Mise à Jour Statuts

**Service Scolarité** :
```typescript
async marquerPretPourSignature(tenantSchema: string, diplomeIds: string[]) {
  const schema = this.validateSchema(tenantSchema);
  
  await this.dataSource.query(`
    UPDATE ${schema}.diplome
    SET statut = 'pret_signature', updated_at = NOW()
    WHERE id = ANY($1) AND statut = 'en_preparation'
  `, [diplomeIds]);
  
  return { success: true, message: 'Diplômes marqués prêts pour signature' };
}
```

### 4.3 Workflow Complet

```
1. GÉNÉRATION (Scolarité)
   ↓ statut: en_preparation
   
2. VALIDATION (Scolarité)
   ↓ statut: pret_signature
   
3. SIGNATURE (Président)
   ↓ statut: signe
   ↓ signe_president: true
   ↓ date_signature: NOW()
   
4. DÉLIVRANCE (Scolarité)
   ↓ statut: delivre
   ↓ date_delivrance: NOW()
   
5. RETRAIT (Étudiant)
   ↓ statut: retire
   ↓ date_retrait: NOW()
```

## 📧 Étape 5 : Notifications

### 5.1 Service de Notification

**Fichier** : `backend/src/scolarite/services/notification.service.ts`

```typescript
@Injectable()
export class NotificationService {
  async notifierDiplomeDisponible(etudiantId: string, diplomeId: string) {
    // 1. Récupérer email étudiant
    // 2. Envoyer email
    // 3. Créer notification in-app
    
    const emailContent = `
      Bonjour,
      
      Votre diplôme est maintenant disponible.
      Vous pouvez le retirer au service scolarité.
      
      Numéro de diplôme : ${diplome.numeroDiplome}
      
      Cordialement,
      Le Service Scolarité
    `;
    
    // Envoyer email (à implémenter avec nodemailer)
    // Créer notification in-app
  }
}
```

### 5.2 Déclencheurs de Notification

- ✉️ Diplôme généré → Notification scolarité
- ✉️ Diplôme signé → Notification étudiant
- ✉️ Diplôme disponible → Email + SMS étudiant
- ✉️ Rappel retrait → Après 30 jours

## 🎨 Étape 6 : Interface Utilisateur Complète

### 6.1 Page Génération (Scolarité)

**Sections** :
1. **Filtres**
   - Année académique
   - Parcours
   - Bouton "Prévisualiser"

2. **Prévisualisation**
   - Modal avec liste étudiants éligibles
   - Tableau : Nom, Matricule, Parcours, Moyenne, Mention
   - Compteur : X étudiants éligibles
   - Bouton "Générer X diplômes"

3. **Liste des Diplômes**
   - Tableau avec tous les diplômes
   - Filtres par statut
   - Actions : Voir PDF, Marquer prêt, Délivrer

### 6.2 Page Signature (Président)

**Déjà implémentée** dans `frontend/src/modules/president/pages/DiplomesPage.tsx`
- Liste diplômes à signer
- Signature individuelle
- Signature en masse
- Filtres par mention

### 6.3 Portail Étudiant

**Nouvelle page** : `frontend/src/pages/portals/etudiant/DiplomesEtudiantPage.tsx`

```typescript
// Afficher les diplômes de l'étudiant
// Statut : En préparation, Signé, Disponible, Retiré
// Bouton télécharger PDF (si signé)
// Informations de retrait
```

## 📊 Base de Données

### Colonnes Diplome

```sql
CREATE TABLE diplome (
  id UUID PRIMARY KEY,
  etudiant_id UUID NOT NULL,
  inscription_id UUID NOT NULL,
  parcours_id UUID NOT NULL,
  numero_diplome VARCHAR(50) UNIQUE NOT NULL,
  type_diplome VARCHAR(50),
  date_obtention DATE,
  moyenne_finale NUMERIC(5,2),
  mention_generale VARCHAR(50),
  statut VARCHAR(20) DEFAULT 'en_preparation',
  -- Signature
  signe_president BOOLEAN DEFAULT FALSE,
  date_signature TIMESTAMP,
  signature_hash VARCHAR(255),
  -- Délivrance
  delivre_par UUID,
  date_delivrance TIMESTAMP,
  -- Retrait
  retire_par UUID,
  date_retrait TIMESTAMP,
  observations TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Statuts Possibles

- `en_preparation` - Diplôme créé, en cours de vérification
- `pret_signature` - Validé par scolarité, prêt pour signature président
- `signe` - Signé par le président
- `delivre` - Délivré, disponible pour retrait
- `retire` - Retiré par l'étudiant
- `annule` - Annulé (erreur, fraude, etc.)

## 🔐 Sécurité

### Permissions

- **Scolarité** : Générer, valider, délivrer
- **Président** : Signer
- **Étudiant** : Consulter ses diplômes, télécharger PDF

### Audit Trail

Chaque action doit être loggée :
- Qui a généré le diplôme
- Qui l'a validé
- Qui l'a signé
- Qui l'a délivré
- Qui l'a retiré

## 📈 Statistiques

Dashboard Scolarité :
- Diplômes générés ce mois
- Diplômes en attente de signature
- Diplômes disponibles non retirés
- Taux de retrait
- Délai moyen génération → retrait

## 🚀 Plan d'Implémentation

### Phase 1 (Priorité Haute) ✅
- [x] Génération de base
- [ ] Filtres UI
- [ ] Prévisualisation

### Phase 2 (Priorité Moyenne)
- [ ] Génération PDF
- [ ] Workflow signature
- [ ] Statuts avancés

### Phase 3 (Priorité Basse)
- [ ] Notifications
- [ ] Portail étudiant
- [ ] Statistiques avancées

---

**Développé avec ❤️ par Bob**  
**Date** : 18 mai 2026  
**Version** : 1.0.0