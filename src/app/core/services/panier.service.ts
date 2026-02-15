import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ItemPanier {
  produit: any;
  quantite: number;
  prixUnitaire: number;
}

@Injectable({
  providedIn: 'root'
})
export class PanierService {
  private readonly STORAGE_KEY = 'panier';
  private panierSubject: BehaviorSubject<ItemPanier[]>;
  public panier$: Observable<ItemPanier[]>;

  constructor() {
    // Initialiser avec le panier du localStorage ou un tableau vide
    const panierSauvegarde = this.chargerPanier();
    this.panierSubject = new BehaviorSubject<ItemPanier[]>(panierSauvegarde);
    this.panier$ = this.panierSubject.asObservable();
  }

  /**
   * Charge le panier depuis le localStorage
   */
  private chargerPanier(): ItemPanier[] {
    try {
      const panier = localStorage.getItem(this.STORAGE_KEY);
      return panier ? JSON.parse(panier) : [];
    } catch (error) {
      console.error('Erreur lors du chargement du panier:', error);
      return [];
    }
  }

  /**
   * Sauvegarde le panier dans le localStorage
   */
  private sauvegarderPanier(panier: ItemPanier[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(panier));
      this.panierSubject.next(panier);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du panier:', error);
    }
  }

  /**
   * Récupère le panier actuel
   */
  getPanier(): ItemPanier[] {
    return this.panierSubject.value;
  }

  /**
   * Observable du panier pour réactivité
   */
  getPanier$(): Observable<ItemPanier[]> {
    return this.panier$;
  }

  /**
   * Ajoute un produit au panier ou augmente sa quantité
   * @param produit - Produit à ajouter
   * @param quantite - Quantité à ajouter (défaut: 1)
   */
  ajouterProduit(produit: any, quantite: number = 1): void {
    const panier = this.getPanier();
    const index = panier.findIndex(item => item.produit._id === produit._id);

    if (index !== -1) {
      // Produit déjà dans le panier, augmenter la quantité
      panier[index].quantite += quantite;
    } else {
      // Nouveau produit
      const nouveauItem: ItemPanier = {
        produit: produit,
        quantite: quantite,
        prixUnitaire: produit.prix
      };
      panier.push(nouveauItem);
    }

    this.sauvegarderPanier(panier);
  }

  /**
   * Retire un produit du panier
   * @param produitId - ID du produit à retirer
   */
  retirerProduit(produitId: string): void {
    const panier = this.getPanier();
    const panierFiltre = panier.filter(item => item.produit._id !== produitId);
    this.sauvegarderPanier(panierFiltre);
  }

  /**
   * Met à jour la quantité d'un produit dans le panier
   * @param produitId - ID du produit
   * @param quantite - Nouvelle quantité
   */
  updateQuantite(produitId: string, quantite: number): void {
    if (quantite <= 0) {
      this.retirerProduit(produitId);
      return;
    }

    const panier = this.getPanier();
    const index = panier.findIndex(item => item.produit._id === produitId);

    if (index !== -1) {
      panier[index].quantite = quantite;
      this.sauvegarderPanier(panier);
    }
  }

  /**
   * Vide complètement le panier
   */
  viderPanier(): void {
    this.sauvegarderPanier([]);
  }

  /**
   * Calcule le total du panier
   */
  calculerTotal(): number {
    const panier = this.getPanier();
    return panier.reduce((total, item) => {
      return total + (item.prixUnitaire * item.quantite);
    }, 0);
  }

  /**
   * Récupère le nombre total d'items dans le panier
   */
  getNombreItems(): number {
    const panier = this.getPanier();
    return panier.reduce((total, item) => total + item.quantite, 0);
  }

  /**
   * Vérifie si un produit est dans le panier
   * @param produitId - ID du produit
   */
  estDansPanier(produitId: string): boolean {
    const panier = this.getPanier();
    return panier.some(item => item.produit._id === produitId);
  }

  /**
   * Récupère la quantité d'un produit dans le panier
   * @param produitId - ID du produit
   */
  getQuantiteProduit(produitId: string): number {
    const panier = this.getPanier();
    const item = panier.find(item => item.produit._id === produitId);
    return item ? item.quantite : 0;
  }
}

