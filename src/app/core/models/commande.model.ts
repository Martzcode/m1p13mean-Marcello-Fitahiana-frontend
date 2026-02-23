import { Produit } from './produit.model';

export interface ItemCommande {
  produit: string | Produit; // ID ou objet Produit populé
  nom: string;
  prix: number;
  quantite: number;
  sousTotal: number;
}

export interface Commande {
  _id: string;
  numero: string;
  client: string | any; // ID ou objet User populé
  boutique: string | any; // ID ou objet Boutique populé
  produits: ItemCommande[];
  montantTotal: number;
  statut: StatutCommande;
  modePaiement: ModePaiement;
  paye: boolean;
  dateCommande: Date;
  dateLivraison?: Date;
  adresseLivraison?: AdresseLivraison;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum StatutCommande {
  Nouvelle = 'nouvelle',
  EnCours = 'en_cours',
  Terminee = 'terminee',
  Livree = 'livree'
}

export enum ModePaiement {
  Livraison = 'livraison',
  EnLigne = 'en_ligne'
}

export interface AdresseLivraison {
  rue?: string;
  ville?: string;
  codePostal?: string;
  pays?: string;
  telephone?: string;
}

export interface CreateCommandeDto {
  boutique: string;
  produits: {
    produit: string;
    quantite: number;
  }[];
  modePaiement: ModePaiement;
  adresseLivraison?: AdresseLivraison;
  notes?: string;
}

export interface UpdateStatutDto {
  statut: StatutCommande;
}

