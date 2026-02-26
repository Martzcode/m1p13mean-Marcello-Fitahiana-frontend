import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProduitService } from '../../../core/services/produit.service';
import { PanierService } from '../../../core/services/panier.service';
import { AuthService } from '../../../core/services/auth.service';
import { DEFAULT_PRODUCT_IMAGE } from '../../../core/constants/app.constants';

interface Produit {
  _id: string;
  nom: string;
  description: string;
  prix: number;
  stock: number;
  categorie: string;
  images: string[];
  boutique: {
    _id: string;
    nom: string;
    categorie?: string;
  };
  actif: boolean;
}

@Component({
  selector: 'app-produit-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './produit-detail.component.html',
  styleUrls: ['./produit-detail.component.css']
})
export class ProduitDetailComponent implements OnInit {
  readonly defaultImage = DEFAULT_PRODUCT_IMAGE;

  produit: Produit | null = null;
  produitsSimilaires: Produit[] = [];

  imageActive: number = 0;
  quantite: number = 1;

  loading: boolean = false;
  error: string = '';
  ajoutReussi: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private produitService: ProduitService,
    private panierService: PanierService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.chargerProduit(id);
      }
    });
  }

  chargerProduit(id: string): void {
    this.loading = true;
    this.error = '';

    this.produitService.getProduit(id).subscribe({
      next: (data: any) => {
        this.produit = data.data || data;
        this.loading = false;

        // Charger les produits similaires
        if (this.produit) {
          this.chargerProduitsSimilaires();
        }
      },
      error: (err) => {
        console.error('Erreur chargement produit:', err);
        this.error = 'Produit introuvable';
        this.loading = false;
      }
    });
  }

  chargerProduitsSimilaires(): void {
    if (!this.produit) return;

    // Chercher des produits de la même catégorie
    this.produitService.getProduits({
      categorie: this.produit.categorie,
      actif: true
    }).subscribe({
      next: (data: any) => {
        let similaires = data.data || data;

        // Exclure le produit actuel
        similaires = similaires.filter((p: Produit) => p._id !== this.produit!._id);

        // Limiter à 6 produits
        this.produitsSimilaires = similaires.slice(0, 6);

        // Si moins de 3 produits, chercher dans la même boutique
        if (this.produitsSimilaires.length < 3 && this.produit?.boutique?._id) {
          this.produitService.getProduitsByBoutique(this.produit.boutique._id).subscribe({
            next: (data: any) => {
              let boutiqueProduits = data.data || data;
              boutiqueProduits = boutiqueProduits.filter((p: Produit) =>
                p._id !== this.produit!._id &&
                !this.produitsSimilaires.find(ps => ps._id === p._id)
              );
              this.produitsSimilaires = [...this.produitsSimilaires, ...boutiqueProduits].slice(0, 6);
            },
            error: (err) => console.error('Erreur chargement produits boutique:', err)
          });
        }
      },
      error: (err) => {
        console.error('Erreur chargement produits similaires:', err);
      }
    });
  }

  changerImage(index: number): void {
    this.imageActive = index;
  }

  incrementerQuantite(): void {
    if (this.produit && this.quantite < this.produit.stock) {
      this.quantite++;
    }
  }

  decrementerQuantite(): void {
    if (this.quantite > 1) {
      this.quantite--;
    }
  }

  ajouterAuPanier(): void {
    if (!this.produit) return;

    // Si non connecté, rediriger vers login
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.produit.stock === 0) {
      alert('Produit en rupture de stock');
      return;
    }

    if (this.quantite > this.produit.stock) {
      alert(`Stock insuffisant. Disponible: ${this.produit.stock}`);
      return;
    }

    // Ajouter au panier localStorage
    this.panierService.ajouterProduit(this.produit, this.quantite);

    // Afficher feedback succès
    this.ajoutReussi = true;
    setTimeout(() => {
      this.ajoutReussi = false;
    }, 3000);

    // Optionnel: reset quantité
    this.quantite = 1;
  }

  allerAuPanier(): void {
    this.router.navigate(['/client/panier']);
  }

  voirBoutique(): void {
    if (this.produit?.boutique?._id) {
      this.router.navigate(['/boutiques', this.produit.boutique._id]);
    }
  }

  voirProduit(produitId: string): void {
    this.router.navigate(['/produits', produitId]);
    // Recharger les données
    this.chargerProduit(produitId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  retourCatalogue(): void {
    if (this.authService.isClient()) {
      this.router.navigate(['/client/catalogue']);
    } else {
      this.router.navigate(['/produits']);
    }
  }

  get catalogueUrl(): string {
    return this.authService.isClient() ? '/client/catalogue' : '/produits';
  }

  get catalogueLabel(): string {
    return this.authService.isClient() ? 'Catalogue' : 'Produits';
  }

  get estDansPanier(): boolean {
    return this.produit ? this.panierService.estDansPanier(this.produit._id) : false;
  }

  get quantiteDansPanier(): number {
    return this.produit ? this.panierService.getQuantiteProduit(this.produit._id) : 0;
  }

  formatPrix(prix: number): string {
    return new Intl.NumberFormat('fr-FR').format(prix) + ' Ar';
  }

  getImageUrl(index: number): string {
    if (!this.produit || !this.produit.images || this.produit.images.length === 0) {
      return this.defaultImage;
    }
    return this.produit.images[index] || this.produit.images[0];
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultImage;
  }

  getImageActive(): string {
    return this.getImageUrl(this.imageActive);
  }
}

