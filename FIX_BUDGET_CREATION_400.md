# Fix Budget Creation - Erreur 400

## Problème
Lors de la création d'un budget, une erreur 400 (Bad Request) est retournée.

## Cause
Le champ `annee_academique_id` est requis dans le DTO backend mais n'est pas rempli dans le formulaire frontend.

```typescript
// backend/src/economat/dto/create-budget.dto.ts
@IsUUID()
annee_academique_id: string;  // REQUIS mais vide dans le form
```

```typescript
// frontend/src/pages/economat/BudgetAnnuelPage.tsx
const [formData, setFormData] = useState({
  annee_academique_id: '',  // ❌ VIDE par défaut
  departement_id: '',
  categorie: '',
  montant_prevu: '',
  description: '',
});
```

## Solution 1 : Récupérer l'année académique active (RECOMMANDÉ)

Modifier le frontend pour récupérer automatiquement l'année académique active :

```typescript
// frontend/src/pages/economat/BudgetAnnuelPage.tsx

const [anneeAcademique, setAnneeAcademique] = useState<any>(null);

useEffect(() => {
  fetchAnneeAcademique();
  fetchBudgets();
  fetchStats();
}, []);

const fetchAnneeAcademique = async () => {
  try {
    const response = await api.get('/annees-academiques/active');
    setAnneeAcademique(response.data);
    setFormData(prev => ({
      ...prev,
      annee_academique_id: response.data.id
    }));
  } catch (error) {
    console.error('Erreur lors du chargement de l\'année académique:', error);
  }
};

// Dans le handleSubmit
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const dataToSend = {
      ...formData,
      annee_academique_id: formData.annee_academique_id || anneeAcademique?.id,
      montant_prevu: parseFloat(formData.montant_prevu),
    };
    
    if (!dataToSend.annee_academique_id) {
      alert('Aucune année académique active trouvée');
      return;
    }
    
    await api.post('/economat/budget', dataToSend);
    // ...
  } catch (error) {
    console.error('Erreur:', error);
  }
};
```

## Solution 2 : Rendre le champ optionnel dans le backend

Modifier le DTO pour utiliser l'année académique active par défaut :

```typescript
// backend/src/economat/dto/create-budget.dto.ts
export class CreateBudgetDto {
  @IsUUID()
  @IsOptional()  // ← Ajouter ceci
  annee_academique_id?: string;  // ← Rendre optionnel
  
  // ... autres champs
}
```

Puis dans le service, utiliser l'année active si non fournie :

```typescript
// backend/src/economat/economat.service.ts
async createBudget(dto: CreateBudgetDto) {
  let anneeAcademiqueId = dto.annee_academique_id;
  
  if (!anneeAcademiqueId) {
    // Récupérer l'année académique active
    const activeYear = await this.query(
      'SELECT id FROM annee_academique WHERE active = TRUE LIMIT 1'
    );
    anneeAcademiqueId = activeYear[0]?.id;
  }
  
  if (!anneeAcademiqueId) {
    throw new BadRequestException('Aucune année académique active');
  }
  
  // Continuer avec la création...
}
```

## Solution 3 : Ajouter un sélecteur d'année dans le formulaire

Ajouter un champ de sélection dans le modal :

```tsx
<div className="col-md-6 mb-3">
  <label className="form-label">Année Académique *</label>
  <select
    className="form-select"
    value={formData.annee_academique_id}
    onChange={(e) => setFormData({ ...formData, annee_academique_id: e.target.value })}
    required
  >
    <option value="">Sélectionner...</option>
    {anneesAcademiques.map((annee) => (
      <option key={annee.id} value={annee.id}>
        {annee.libelle}
      </option>
    ))}
  </select>
</div>
```

## Recommandation

Utiliser la **Solution 1** car :
- ✅ Pas besoin de modifier le backend
- ✅ Utilise automatiquement l'année active
- ✅ Évite les erreurs de l'utilisateur
- ✅ Cohérent avec le reste de l'application

## Implémentation Rapide

Voici le code complet à ajouter dans `BudgetAnnuelPage.tsx` :

```typescript
// Après les autres useState
const [anneeAcademique, setAnneeAcademique] = useState<any>(null);

// Modifier le useEffect initial
useEffect(() => {
  fetchAnneeAcademique();
}, []);

useEffect(() => {
  if (anneeAcademique) {
    fetchBudgets();
    fetchStats();
  }
}, [filters, anneeAcademique]);

// Ajouter cette fonction
const fetchAnneeAcademique = async () => {
  try {
    const response = await api.get('/annees-academiques/active');
    setAnneeAcademique(response.data);
    setFormData(prev => ({
      ...prev,
      annee_academique_id: response.data.id
    }));
  } catch (error) {
    console.error('Erreur année académique:', error);
  }
};

// Modifier handleSubmit pour vérifier
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!formData.annee_academique_id && !anneeAcademique?.id) {
    alert('Aucune année académique active');
    return;
  }
  
  try {
    const dataToSend = {
      ...formData,
      annee_academique_id: formData.annee_academique_id || anneeAcademique.id,
      montant_prevu: parseFloat(formData.montant_prevu),
    };
    
    if (editingBudget) {
      await api.put(`/economat/budget/${editingBudget.id}`, dataToSend);
    } else {
      await api.post('/economat/budget', dataToSend);
    }
    
    setShowModal(false);
    setEditingBudget(null);
    resetForm();
    fetchBudgets();
    fetchStats();
    alert('Budget sauvegardé avec succès');
  } catch (error: any) {
    console.error('Erreur:', error);
    alert(error.response?.data?.message || 'Erreur lors de la sauvegarde');
  }
};
```

Cette modification résoudra l'erreur 400 en s'assurant que `annee_academique_id` est toujours fourni.