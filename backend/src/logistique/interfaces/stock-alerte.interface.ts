export interface StockAlerte {
  id: string;
  reference: string;
  libelle: string;
  categorie: string;
  unite: string;
  quantite_stock: number;
  seuil_alerte: number;
  deficit: number;
  prix_unitaire?: number;
  fournisseur?: string;
}

// Made with Bob
