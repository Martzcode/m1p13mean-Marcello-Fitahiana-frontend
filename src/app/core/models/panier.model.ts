import { Produit } from './produit.model';

export interface ItemPanier {
  produit: Produit;
  quantite: number;
  prixUnitaire: number;
}

export interface Panier {
  items: ItemPanier[];
  montantTotal: number;
  nombreItems: number;
}

export interface UpdateQuantiteDto {
  produitId: string;
  quantite: number;
}

