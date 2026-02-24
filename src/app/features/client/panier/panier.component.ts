import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PanierService } from '../../../core/services/panier.service';
import { ItemPanier } from '../../../core/models/panier.model';
import { DEFAULT_PRODUCT_IMAGE } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-panier',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './panier.component.html',
  styleUrls: ['./panier.component.css']
})
export class PanierComponent implements OnInit, OnDestroy {
  readonly defaultImage = DEFAULT_PRODUCT_IMAGE;

  items: ItemPanier[] = [];
  itemsParBoutique: Map<string, ItemPanier[]> = new Map();
  total: number = 0;
  nombreItems: number = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private panierService: PanierService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // S'abonner aux changements du panier
    this.panierService.panier$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.items = items;
        this.calculerTotaux();
        this.buildItemsParBoutique();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  calculerTotaux(): void {
    this.total = this.panierService.calculerTotal();
    this.nombreItems = this.panierService.getNombreItems();
  }

  updateQuantite(produitId: string, nouvelleQuantite: number): void {
    if (nouvelleQuantite <= 0) {
      this.retirerItem(produitId);
      return;
    }

    // Vérifier le stock
    const item = this.items.find(i => i.produit._id === produitId);
    if (item && nouvelleQuantite > item.produit.stock) {
      alert(`Stock insuffisant. Maximum disponible: ${item.produit.stock}`);
      return;
    }

    this.panierService.updateQuantite(produitId, nouvelleQuantite);
  }

  incrementerQuantite(item: ItemPanier): void {
    if (item.quantite < item.produit.stock) {
      this.updateQuantite(item.produit._id, item.quantite + 1);
    }
  }

  decrementerQuantite(item: ItemPanier): void {
    if (item.quantite > 1) {
      this.updateQuantite(item.produit._id, item.quantite - 1);
    }
  }

  retirerItem(produitId: string): void {
    if (confirm('Voulez-vous vraiment retirer ce produit du panier ?')) {
      this.panierService.retirerProduit(produitId);
    }
  }

  viderPanier(): void {
    if (confirm('Voulez-vous vraiment vider tout le panier ?')) {
      this.panierService.viderPanier();
    }
  }

  continuerAchats(): void {
    this.router.navigate(['/client/catalogue']);
  }

  validerCommande(): void {
    if (this.items.length === 0) {
      alert('Votre panier est vide');
      return;
    }
    this.router.navigate(['/client/commande/valider']);
  }

  voirProduit(produitId: string): void {
    this.router.navigate(['/produits', produitId]);
  }

  formatPrix(prix: number): string {
    return new Intl.NumberFormat('fr-FR').format(prix) + ' Ar';
  }

  getSousTotal(item: ItemPanier): number {
    return item.prixUnitaire * item.quantite;
  }

  // Regroupement par boutique
  private buildItemsParBoutique(): void {
    const grouped = new Map<string, ItemPanier[]>();

    this.items.forEach(item => {
      const boutiqueId = item.produit.boutique?._id || 'inconnu';
      if (!grouped.has(boutiqueId)) {
        grouped.set(boutiqueId, []);
      }
      grouped.get(boutiqueId)!.push(item);
    });

    this.itemsParBoutique = grouped;
  }

  getNomBoutique(boutiqueId: string): string {
    const item = this.items.find(i => i.produit.boutique?._id === boutiqueId);
    return item?.produit.boutique?.nom || 'Boutique inconnue';
  }

  getSousTotalBoutique(items: ItemPanier[]): number {
    return items.reduce((total, item) => total + this.getSousTotal(item), 0);
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultImage;
  }
}

