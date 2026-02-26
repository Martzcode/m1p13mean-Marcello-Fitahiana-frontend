import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProduitService } from '../../../core/services/produit.service';
import { PanierService } from '../../../core/services/panier.service';
import { BoutiqueService } from '../../../core/services/boutique.service';
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
  };
  actif: boolean;
}

interface Boutique {
  _id: string;
  nom: string;
}

@Component({
  selector: 'app-produits-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './produits-list.component.html',
  styleUrls: ['./produits-list.component.css']
})
export class ProduitsListComponent implements OnInit {
  readonly defaultImage = DEFAULT_PRODUCT_IMAGE;

  produits: Produit[] = [];
  produitsAffiches: Produit[] = [];
  boutiques: Boutique[] = [];
  categories: string[] = [];

  // Filtres
  recherche: string = '';
  boutiqueSelectionnee: string = '';
  categoriesSelectionnees: string[] = [];
  prixMin: number = 0;
  prixMax: number = 1000000;
  enStockUniquement: boolean = false;

  // Tri
  triActuel: string = 'recent';

  // Affichage
  affichageGrid: boolean = true;

  // Pagination
  page: number = 1;
  itemsParPage: number = 20;
  totalPages: number = 1;

  loading: boolean = false;
  error: string = '';

  constructor(
    private produitService: ProduitService,
    private panierService: PanierService,
    private boutiqueService: BoutiqueService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.chargerDonnees();
  }

  chargerDonnees(): void {
    this.loading = true;
    this.error = '';

    // Charger les produits
    this.produitService.getProduits().subscribe({
      next: (data: any) => {
        this.produits = data.data || data;
        // Filtrer seulement les produits actifs
        this.produits = this.produits.filter(p => p.actif);
        this.extraireCategories();
        this.appliquerFiltres();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement produits:', err);
        this.error = 'Erreur lors du chargement des produits';
        this.loading = false;
      }
    });

    // Charger les boutiques
    this.boutiqueService.getAll().subscribe({
      next: (data: any) => {
        this.boutiques = data.boutiques || data.data || data;
      },
      error: (err: any) => {
        console.error('Erreur chargement boutiques:', err);
      }
    });
  }

  extraireCategories(): void {
    const categoriesSet = new Set<string>();
    this.produits.forEach(p => {
      if (p.categorie) {
        categoriesSet.add(p.categorie);
      }
    });
    this.categories = Array.from(categoriesSet).sort();
  }

  appliquerFiltres(): void {
    let resultats = [...this.produits];

    // Filtre recherche
    if (this.recherche) {
      const terme = this.recherche.toLowerCase();
      resultats = resultats.filter(p =>
        p.nom.toLowerCase().includes(terme) ||
        p.description.toLowerCase().includes(terme)
      );
    }

    // Filtre boutique
    if (this.boutiqueSelectionnee) {
      resultats = resultats.filter(p => p.boutique._id === this.boutiqueSelectionnee);
    }

    // Filtre catégories
    if (this.categoriesSelectionnees.length > 0) {
      resultats = resultats.filter(p =>
        this.categoriesSelectionnees.includes(p.categorie)
      );
    }

    // Filtre prix
    resultats = resultats.filter(p =>
      p.prix >= this.prixMin && p.prix <= this.prixMax
    );

    // Filtre stock
    if (this.enStockUniquement) {
      resultats = resultats.filter(p => p.stock > 0);
    }

    // Appliquer le tri
    this.appliquerTri(resultats);

    // Calculer pagination
    this.totalPages = Math.ceil(resultats.length / this.itemsParPage);
    const debut = (this.page - 1) * this.itemsParPage;
    const fin = debut + this.itemsParPage;
    this.produitsAffiches = resultats.slice(debut, fin);
  }

  appliquerTri(produits: Produit[]): void {
    switch (this.triActuel) {
      case 'prix-asc':
        produits.sort((a, b) => a.prix - b.prix);
        break;
      case 'prix-desc':
        produits.sort((a, b) => b.prix - a.prix);
        break;
      case 'alpha':
        produits.sort((a, b) => a.nom.localeCompare(b.nom));
        break;
      case 'recent':
      default:
        // Garder l'ordre par défaut (plus récent)
        break;
    }
  }

  toggleCategorie(categorie: string): void {
    const index = this.categoriesSelectionnees.indexOf(categorie);
    if (index > -1) {
      this.categoriesSelectionnees.splice(index, 1);
    } else {
      this.categoriesSelectionnees.push(categorie);
    }
    this.page = 1;
    this.appliquerFiltres();
  }

  changerTri(tri: string): void {
    this.triActuel = tri;
    this.appliquerFiltres();
  }

  toggleAffichage(): void {
    this.affichageGrid = !this.affichageGrid;
  }

  changerPage(nouvellePage: number): void {
    if (nouvellePage >= 1 && nouvellePage <= this.totalPages) {
      this.page = nouvellePage;
      this.appliquerFiltres();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  ajouterAuPanier(produit: Produit): void {
    // Si non connecté, rediriger vers login
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    if (produit.stock === 0) {
      alert('Produit en rupture de stock');
      return;
    }

    // Utiliser le service panier localStorage
    this.panierService.ajouterProduit(produit, 1);
    alert(`${produit.nom} ajouté au panier !`);
  }

  voirDetails(produit: Produit): void {
    this.router.navigate(['/produits', produit._id]);
  }

  formatPrix(prix: number): string {
    return new Intl.NumberFormat('fr-FR').format(prix) + ' Ar';
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultImage;
  }

  resetFiltres(): void {
    this.recherche = '';
    this.boutiqueSelectionnee = '';
    this.categoriesSelectionnees = [];
    this.prixMin = 0;
    this.prixMax = 1000000;
    this.enStockUniquement = false;
    this.triActuel = 'recent';
    this.page = 1;
    this.appliquerFiltres();
  }
}

