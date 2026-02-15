export interface Produit {
  _id: string;
  nom: string;
  description: string;
  prix: number;
  stock: number;
  images: string[];
  categorie: CategorieProduit;
  boutique: string | any; // ID ou objet Boutique populé
  actif: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum CategorieProduit {
  Vetements = 'Vêtements',
  Electronique = 'Électronique',
  Alimentation = 'Alimentation',
  Beaute = 'Beauté',
  Sport = 'Sport',
  Maison = 'Maison',
  Autre = 'Autre'
}

export interface CreateProduitDto {
  nom: string;
  description: string;
  prix: number;
  stock: number;
  images?: string[];
  categorie: CategorieProduit;
  boutique: string;
}

export interface UpdateProduitDto {
  nom?: string;
  description?: string;
  prix?: number;
  stock?: number;
  images?: string[];
  categorie?: CategorieProduit;
  actif?: boolean;
}

