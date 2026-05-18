# 📄 IMPLÉMENTATION SYSTÈME D'ATTESTATIONS

## 🎯 Objectif
Créer un système complet de gestion des attestations avec:
- Table dédiée en base de données
- Création manuelle d'attestations
- Génération automatique de numéros
- Gestion des statuts
- Génération PDF

## 📊 Structure Base de Données

### Table `attestation`
```sql
CREATE TABLE attestation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  etudiant_id UUID NOT NULL REFERENCES etudiant(id),
  inscription_id UUID REFERENCES inscription(id),
  type_attestation VARCHAR(50) NOT NULL,
  numero_attestation VARCHAR(50) UNIQUE NOT NULL,
  annee_academique_id UUID REFERENCES annee_academique(id),
  date_emission DATE DEFAULT CURRENT_DATE,
  date_validite DATE,
  statut VARCHAR(20) DEFAULT 'en_attente',
  motif TEXT,
  observations TEXT,
  delivre_par UUID REFERENCES utilisateur(id),
  date_delivrance TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_attestation_etudiant ON attestation(etudiant_id);
CREATE INDEX idx_attestation_type ON attestation(type_attestation);
CREATE INDEX idx_attestation_statut ON attestation(statut);
```

### Types d'Attestations
- `inscription` - Attestation d'Inscription
- `scolarite` - Certificat de Scolarité
- `reussite` - Attestation de Réussite
- `presence` - Attestation de Présence
- `stage` - Convention de Stage

### Statuts
- `en_attente` - En attente de validation
- `validee` - Validée, prête à délivrer
- `delivree` - Délivrée à l'étudiant
- `annulee` - Annulée

## 🔧 Backend Implementation

### 1. Service Method - Créer Attestation
```typescript
async creerAttestation(
  tenantSchema: string,
  data: {
    etudiantId: string;
    inscriptionId?: string;
    typeAttestation: string;
    anneeAcademiqueId?: string;
    motif?: string;
    observations?: string;
  }
) {
  const schema = this.validateSchema(tenantSchema);
  
  // Générer numéro unique
  const numeroAttestation = await this.genererNumeroAttestation(schema, data.typeAttestation);
  
  // Insérer attestation
  const result = await this.dataSource.query(`
    INSERT INTO ${schema}.attestation (
      etudiant_id,
      inscription_id,
      type_attestation,
      numero_attestation,
      annee_academique_id,
      motif,
      observations,
      statut
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `, [
    data.etudiantId,
    data.inscriptionId,
    data.typeAttestation,
    numeroAttestation,
    data.anneeAcademiqueId,
    data.motif,
    data.observations,
    'en_attente'
  ]);
  
  return result[0];
}
```

### 2. Génération Numéro Attestation
```typescript
async genererNumeroAttestation(schema: string, type: string): Promise<string> {
  const prefix = {
    'inscription': 'ATT-INS',
    'scolarite': 'ATT-SCO',
    'reussite': 'ATT-REU',
    'presence': 'ATT-PRE',
    'stage': 'ATT-STG'
  }[type] || 'ATT';
  
  const annee = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  
  return `${prefix}-${annee}-${timestamp}`;
}
```

### 3. Controller Endpoint
```typescript
@Post('attestations')
@Roles('admin', 'scolarite')
async creerAttestation(
  @Req() req: any,
  @Param('tenantId') tenantId: string,
  @Body() body: {
    etudiantId: string;
    inscriptionId?: string;
    typeAttestation: string;
    anneeAcademiqueId?: string;
    motif?: string;
    observations?: string;
  }
) {
  return await this.scolariteService.creerAttestation(req.tenantSchema, body);
}
```

## 🎨 Frontend Implementation

### Modal Création Attestation

```typescript
interface ModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const NouvelleAttestationModal: React.FC<ModalProps> = ({ show, onClose, onSuccess }) => {
  const [etudiantId, setEtudiantId] = useState('');
  const [typeAttestation, setTypeAttestation] = useState('inscription');
  const [motif, setMotif] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async () => {
    try {
      setLoading(true);
      await api.post(`/scolarite/${tenantId}/attestations`, {
        etudiantId,
        typeAttestation,
        motif
      });
      onSuccess();
      onClose();
    } catch (error) {
      alert('Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Modal show={show} onClose={onClose}>
      <h3>Nouvelle Attestation</h3>
      
      <Select
        label="Étudiant"
        value={etudiantId}
        onChange={setEtudiantId}
        options={etudiants}
      />
      
      <Select
        label="Type d'Attestation"
        value={typeAttestation}
        onChange={setTypeAttestation}
        options={[
          { value: 'inscription', label: "Attestation d'Inscription" },
          { value: 'scolarite', label: 'Certificat de Scolarité' },
          { value: 'reussite', label: 'Attestation de Réussite' },
          { value: 'presence', label: 'Attestation de Présence' },
          { value: 'stage', label: 'Convention de Stage' }
        ]}
      />
      
      <Textarea
        label="Motif (optionnel)"
        value={motif}
        onChange={setMotif}
      />
      
      <Button onClick={handleSubmit} loading={loading}>
        Créer Attestation
      </Button>
    </Modal>
  );
};
```

## 📋 Workflow Complet

```
1. CRÉATION
   ↓ Utilisateur clique "Nouvelle Attestation"
   ↓ Modal s'ouvre
   ↓ Sélection étudiant + type
   ↓ Soumission formulaire
   
2. BACKEND
   ↓ Validation données
   ↓ Génération numéro unique
   ↓ Insertion en base
   ↓ Statut: en_attente
   
3. VALIDATION
   ↓ Scolarité vérifie l'attestation
   ↓ Change statut: validee
   
4. DÉLIVRANCE
   ↓ Génération PDF
   ↓ Remise à l'étudiant
   ↓ Statut: delivree
   ↓ Date de délivrance enregistrée
```

## 🔐 Permissions

- **Admin / Scolarité**: Créer, valider, délivrer, annuler
- **Responsable Pédagogique**: Consulter, valider
- **Étudiant**: Consulter ses propres attestations

## 📈 Statistiques

Dashboard Scolarité:
- Attestations en attente
- Attestations délivrées ce mois
- Attestations par type
- Délai moyen de traitement

## 🚀 Plan d'Implémentation

### Phase 1: Base de Données ✅
- [x] Créer table attestation
- [x] Ajouter indexes
- [x] Définir contraintes

### Phase 2: Backend
- [ ] Méthode creerAttestation()
- [ ] Méthode genererNumeroAttestation()
- [ ] Méthode validerAttestation()
- [ ] Méthode delivrerAttestation()
- [ ] Endpoint POST /attestations
- [ ] Endpoint PUT /attestations/:id/statut

### Phase 3: Frontend
- [ ] Modal création attestation
- [ ] Sélecteur étudiant avec recherche
- [ ] Formulaire complet
- [ ] Gestion états de chargement
- [ ] Messages succès/erreur
- [ ] Rafraîchissement liste après création

### Phase 4: PDF
- [ ] Template attestation inscription
- [ ] Template certificat scolarité
- [ ] Template attestation réussite
- [ ] Endpoint téléchargement PDF

---

**Créé par Bob**  
**Date**: 18 mai 2026  
**Version**: 1.0.0