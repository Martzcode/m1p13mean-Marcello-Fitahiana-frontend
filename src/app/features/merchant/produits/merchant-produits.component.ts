import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { BoutiqueService } from '../../../core/services/boutique.service';
import { ProduitService } from '../../../core/services/produit.service';

@Component({
  selector: 'app-merchant-produits',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './merchant-produits.component.html',
  styleUrls: ['./merchant-produits.component.css']
})
export class MerchantProduitsComponent implements OnInit {
  produits: any[] = [];
  filteredProduits: any[] = [];
  mesBoutiques: any[] = [];

  // Modal
  isModalOpen = false;
  isEditMode = false;
  produitForm!: FormGroup;
  currentProduitId: string | null = null;

  // Confirmation
  isConfirmModalOpen = false;
  confirmAction: (() => void) | null = null;
  confirmMessage = '';

  // Filtres
  searchTerm = '';
  selectedBoutique = '';
  selectedCategorie = '';
  selectedStock = ''; // tous, rupture, faible, ok
  selectedStatut = ''; // tous, actif, inactif

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  // Loading
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // User
  currentUser: any;

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
    private authService: AuthService,
    private boutiqueService: BoutiqueService,
    private produitService: ProduitService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser();
    this.loadMesBoutiques();
    this.loadProduits();
  }

  initForm(): void {
    this.produitForm = this.fb.group({
      nom: ['', Validators.required],
      description: ['', Validators.required],
      prix: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      categorie: ['Autre', Validators.required],
      boutique: ['', Validators.required],
      images: ['']
    });
  }

  loadMesBoutiques(): void {
    this.boutiqueService.getAll().subscribe({
      next: (response) => {
        const allBoutiques = response.data || response;
        if (this.currentUser && this.currentUser.boutiques) {
          this.mesBoutiques = allBoutiques.filter((b: any) =>
            this.currentUser.boutiques.includes(b._id)
          );
        }
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
        // Filtrer les produits des boutiques du commerçant
        this.produits = allProduits.filter((p: any) => {
          const boutiqueId = p.boutique?._id || p.boutique;
          return this.mesBoutiques.some(b => b._id === boutiqueId);
        });
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des produits';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
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

    // Filtre stock
    if (this.selectedStock === 'rupture') {
      filtered = filtered.filter(p => p.stock === 0);
    } else if (this.selectedStock === 'faible') {
      filtered = filtered.filter(p => p.stock > 0 && p.stock < 10);
    } else if (this.selectedStock === 'ok') {
      filtered = filtered.filter(p => p.stock >= 10);
    }

    // Filtre statut
    if (this.selectedStatut === 'actif') {
      filtered = filtered.filter(p => p.actif !== false);
    } else if (this.selectedStatut === 'inactif') {
      filtered = filtered.filter(p => p.actif === false);
    }

    this.filteredProduits = filtered;
    this.totalPages = Math.ceil(this.filteredProduits.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  get paginatedProduits(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredProduits.slice(start, end);
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.currentProduitId = null;
    this.produitForm.reset({
      categorie: 'Autre',
      boutique: this.mesBoutiques.length > 0 ? this.mesBoutiques[0]._id : ''
    });
    this.isModalOpen = true;
  }

  openEditModal(produit: any): void {
    this.isEditMode = true;
    this.currentProduitId = produit._id;
    const boutiqueId = produit.boutique?._id || produit.boutique;

    this.produitForm.patchValue({
      nom: produit.nom,
      description: produit.description,
      prix: produit.prix,
      stock: produit.stock,
      categorie: produit.categorie || 'Autre',
      boutique: boutiqueId,
      images: produit.images ? produit.images.join(', ') : ''
    });
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.produitForm.reset();
  }

  onSubmit(): void {
    if (this.produitForm.invalid) {
      Object.keys(this.produitForm.controls).forEach(key => {
        this.produitForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    const formData = { ...this.produitForm.value };

    // Convertir images en tableau
    if (formData.images) {
      formData.images = formData.images.split(',').map((url: string) => url.trim()).filter((url: string) => url);
    } else {
      formData.images = [];
    }

    // Ajouter actif par défaut
    if (!this.isEditMode) {
      formData.actif = true;
    }

    const request = this.isEditMode && this.currentProduitId
      ? this.produitService.updateProduit(this.currentProduitId, formData)
      : this.produitService.createProduit(formData);

    request.subscribe({
      next: () => {
        this.successMessage = this.isEditMode
          ? 'Produit modifié avec succès'
          : 'Produit créé avec succès';
        this.loadProduits();
        this.closeModal();
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de l\'enregistrement';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  toggleProduitStatus(produit: any): void {
    if (!produit._id) return;

    this.confirmMessage = `Voulez-vous vraiment ${produit.actif ? 'désactiver' : 'activer'} ce produit ?`;
    this.confirmAction = () => {
      this.produitService.updateProduit(produit._id, { actif: !produit.actif }).subscribe({
        next: () => {
          this.successMessage = `Produit ${produit.actif ? 'désactivé' : 'activé'} avec succès`;
          this.loadProduits();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          this.errorMessage = 'Erreur lors de la modification du statut';
          console.error(err);
        }
      });
    };
    this.isConfirmModalOpen = true;
  }

  deleteProduit(produit: any): void {
    this.confirmMessage = `Voulez-vous vraiment supprimer "${produit.nom}" ?`;
    this.confirmAction = () => {
      if (!produit._id) return;
      this.produitService.deleteProduit(produit._id).subscribe({
        next: () => {
          this.successMessage = 'Produit supprimé avec succès';
          this.loadProduits();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          this.errorMessage = 'Erreur lors de la suppression';
          console.error(err);
        }
      });
    };
    this.isConfirmModalOpen = true;
  }

  confirmActionExecute(): void {
    if (this.confirmAction) {
      this.confirmAction();
    }
    this.isConfirmModalOpen = false;
    this.confirmAction = null;
  }

  cancelConfirm(): void {
    this.isConfirmModalOpen = false;
    this.confirmAction = null;
  }

  getStockBadgeClass(stock: number): string {
    if (stock === 0) return 'bg-red-100 text-red-800';
    if (stock < 5) return 'bg-orange-100 text-orange-800';
    if (stock < 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  }

  getBoutiqueName(boutiqueId: string): string {
    const boutique = this.mesBoutiques.find(b => b._id === boutiqueId);
    return boutique ? boutique.nom : 'Boutique inconnue';
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}

