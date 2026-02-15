import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { BoutiqueService } from '../../../core/services/boutique.service';
import { CommandeService } from '../../../core/services/commande.service';

@Component({
  selector: 'app-merchant-commandes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './merchant-commandes.component.html',
  styleUrls: ['./merchant-commandes.component.css']
})
export class MerchantCommandesComponent implements OnInit {
  commandes: any[] = [];
  filteredCommandes: any[] = [];
  mesBoutiques: any[] = [];

  // Modal
  selectedCommande: any = null;
  isDetailModalOpen = false;

  // Confirmation
  isConfirmModalOpen = false;
  confirmAction: (() => void) | null = null;
  confirmMessage = '';

  // Filtres
  searchTerm = '';
  selectedBoutique = '';
  selectedStatut = '';

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

  statuts = [
    { value: 'nouvelle', label: 'Nouvelle' },
    { value: 'confirmee', label: 'Confirmée' },
    { value: 'en_preparation', label: 'En préparation' },
    { value: 'prete', label: 'Prête' },
    { value: 'livree', label: 'Livrée' },
    { value: 'annulee', label: 'Annulée' }
  ];

  constructor(
    private authService: AuthService,
    private boutiqueService: BoutiqueService,
    private commandeService: CommandeService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser();
    this.loadMesBoutiques();
    this.loadCommandes();
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

  loadCommandes(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.commandeService.getCommandes().subscribe({
      next: (response) => {
        const allCommandes = response.data || response;
        // Filtrer les commandes des boutiques du commerçant
        this.commandes = allCommandes.filter((c: any) => {
          const boutiqueId = c.boutique?._id || c.boutique;
          return this.mesBoutiques.some(b => b._id === boutiqueId);
        });

        // Trier par date décroissante
        this.commandes.sort((a, b) => {
          const dateA = new Date(a.dateCommande || a.createdAt);
          const dateB = new Date(b.dateCommande || b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });

        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des commandes';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.commandes];

    // Recherche par numéro
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.numero && c.numero.toLowerCase().includes(term)
      );
    }

    // Filtre boutique
    if (this.selectedBoutique) {
      filtered = filtered.filter(c => {
        const boutiqueId = c.boutique?._id || c.boutique;
        return boutiqueId === this.selectedBoutique;
      });
    }

    // Filtre statut
    if (this.selectedStatut) {
      filtered = filtered.filter(c => c.statut === this.selectedStatut);
    }

    this.filteredCommandes = filtered;
    this.totalPages = Math.ceil(this.filteredCommandes.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  get paginatedCommandes(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredCommandes.slice(start, end);
  }

  openDetailModal(commande: any): void {
    this.selectedCommande = commande;
    this.isDetailModalOpen = true;
  }

  closeDetailModal(): void {
    this.isDetailModalOpen = false;
    this.selectedCommande = null;
  }

  changeStatut(commande: any, newStatut: string): void {
    this.confirmMessage = `Changer le statut de "${commande.numero}" vers "${this.getStatutLabel(newStatut)}" ?`;
    this.confirmAction = () => {
      if (!commande._id) return;
      this.commandeService.updateCommande(commande._id, { statut: newStatut }).subscribe({
        next: () => {
          this.successMessage = 'Statut mis à jour avec succès';
          this.loadCommandes();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          this.errorMessage = 'Erreur lors de la mise à jour du statut';
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

  getStatutBadgeClass(statut: string): string {
    switch (statut) {
      case 'nouvelle':
        return 'bg-blue-100 text-blue-800';
      case 'confirmee':
        return 'bg-green-100 text-green-800';
      case 'en_preparation':
        return 'bg-yellow-100 text-yellow-800';
      case 'prete':
        return 'bg-purple-100 text-purple-800';
      case 'livree':
        return 'bg-emerald-100 text-emerald-800';
      case 'annulee':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatutLabel(statut: string): string {
    const s = this.statuts.find(st => st.value === statut);
    return s ? s.label : statut;
  }

  getBoutiqueName(boutiqueId: string): string {
    const boutique = this.mesBoutiques.find(b => b._id === boutiqueId);
    return boutique ? boutique.nom : 'Boutique inconnue';
  }

  getNextStatut(currentStatut: string): string[] {
    switch (currentStatut) {
      case 'nouvelle':
        return ['confirmee', 'annulee'];
      case 'confirmee':
        return ['en_preparation', 'annulee'];
      case 'en_preparation':
        return ['prete', 'annulee'];
      case 'prete':
        return ['livree'];
      case 'livree':
        return [];
      case 'annulee':
        return [];
      default:
        return [];
    }
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

