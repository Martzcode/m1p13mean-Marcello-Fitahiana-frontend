import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProduitService } from '../../../core/services/produit.service';
import { PanierService } from '../../../core/services/panier.service';
import { BoutiqueService } from '../../../core/services/boutique.service';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalogue.component.html',
  styleUrls: ['./catalogue.component.css']
})
export class CatalogueComponent implements OnInit {
  produits: any[] = [];
  filteredProduits: any[] = [];
  boutiques: any[] = [];

  // Filtres
  searchTerm = '';
  selectedBoutique = '';
  selectedCategorie = '';
  prixMin: number | null = null;
  prixMax: number | null = null;

  // Tri
  selectedSort = 'recent'; // recent, prix_asc, prix_desc, nom

  // Pagination
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 1;

  // Loading
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Panier
  nombreItemsPanier = 0;

  // Exposer Math
  Math = Math;

  categories = [
    'Vêtements',
    'Électronique',
    'Alimentation',
    'Cosmétiques',
    'Livres',
    'Sports',
    'Maison',
    'Jouets',
    'Autre'
  ];

  constructor(
    private produitService: ProduitService,
    private panierService: PanierService,
    private boutiqueService: BoutiqueService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBoutiques();
    this.loadProduits();
    this.updatePanierCount();
  }

  loadBoutiques(): void {
    this.boutiqueService.getAll().subscribe({
      next: (response) => {
        this.boutiques = response.data || response;
      },
      error: (err) => console.error('Erreur chargement boutiques:', err)
    });
  }

  loadProduits(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.produitService.getProduits().subscribe({
      next: (response) => {
        const allProduits = response.data || response;
        // Filtrer uniquement les produits actifs avec stock > 0
        this.produits = allProduits.filter((p: any) => p.actif !== false && p.stock > 0);
        this.applyFiltersAndSort();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des produits';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  applyFiltersAndSort(): void {
    let filtered = [...this.produits];

    // Recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.nom.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term))
      );
    }

    // Filtre boutique
    if (this.selectedBoutique) {
      filtered = filtered.filter(p => {
        const boutiqueId = p.boutique?._id || p.boutique;
        return boutiqueId === this.selectedBoutique;
      });
    }

    // Filtre catégorie
    if (this.selectedCategorie) {
      filtered = filtered.filter(p => p.categorie === this.selectedCategorie);
    }

    // Filtre prix
    if (this.prixMin !== null && this.prixMin > 0) {
      filtered = filtered.filter(p => p.prix >= this.prixMin!);
    }
    if (this.prixMax !== null && this.prixMax > 0) {
      filtered = filtered.filter(p => p.prix <= this.prixMax!);
    }

    // Tri
    switch (this.selectedSort) {
      case 'prix_asc':
        filtered.sort((a, b) => a.prix - b.prix);
        break;
      case 'prix_desc':
        filtered.sort((a, b) => b.prix - a.prix);
        break;
      case 'nom':
        filtered.sort((a, b) => a.nom.localeCompare(b.nom));
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        });
    }

    this.filteredProduits = filtered;
    this.totalPages = Math.ceil(this.filteredProduits.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedBoutique = '';
    this.selectedCategorie = '';
    this.prixMin = null;
    this.prixMax = null;
    this.selectedSort = 'recent';
    this.applyFiltersAndSort();
  }

  get paginatedProduits(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredProduits.slice(start, end);
  }

  ajouterAuPanier(produit: any, event: Event): void {
    event.stopPropagation();

    this.panierService.ajouterProduit(produit, 1);
    this.successMessage = `${produit.nom} ajouté au panier !`;
    this.updatePanierCount();

    setTimeout(() => {
      this.successMessage = '';
    }, 2000);
  }

  updatePanierCount(): void {
    this.nombreItemsPanier = this.panierService.getNombreItems();
  }

  estDansPanier(produitId: string): boolean {
    return this.panierService.estDansPanier(produitId);
  }

  voirDetails(produitId: string): void {
    this.router.navigate(['/client/produit', produitId]);
  }

  allerAuPanier(): void {
    this.router.navigate(['/client/panier']);
  }

  getBoutiqueName(boutiqueId: string): string {
    const boutique = this.boutiques.find(b => b._id === boutiqueId);
    return boutique ? boutique.nom : '';
  }

  getStockBadgeClass(stock: number): string {
    if (stock < 5) return 'bg-orange-100 text-orange-800';
    if (stock < 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}

