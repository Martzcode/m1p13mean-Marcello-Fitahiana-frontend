import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LoyerService } from '../../../core/services/loyer.service';
import { BoutiqueService } from '../../../core/services/boutique.service';
import { UserService } from '../../../core/services/user.service';

interface Loyer {
  _id: string;
  boutique: { _id: string; numero: string; nom: string };
  commercant: { _id: string; prenom: string; nom: string };
  montant: number;
  periodicite: string;
  dateDebut: string;
  dateFin: string;
  statut: string;
}

@Component({
  selector: 'app-loyers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './loyers.component.html',
  styleUrl: './loyers.component.css'
})
export class LoyersComponent implements OnInit {
  loyers = signal<Loyer[]>([]);
  boutiques = signal<any[]>([]);
  commercants = signal<any[]>([]);
  loading = signal(false);
  error = signal('');

  // Pour utilisation dans le template
  Math = Math;

  // Filtres
  filtreStatut = signal('tous');
  filtreRecherche = signal('');
  filtreRetardPaiement = signal<boolean | null>(null);

  // Pagination
  page = signal(1);
  itemsParPage = 10;

  // Modal
  showModal = signal(false);
  editMode = signal(false);
  currentLoyer: any = {};

  constructor(
    private loyerService: LoyerService,
    private boutiqueService: BoutiqueService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadLoyers();
    this.loadBoutiques();
    this.loadCommercants();
  }

  loadLoyers() {
    this.loading.set(true);
    this.loyerService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.loyers.set(response.data);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement des loyers');
        this.loading.set(false);
      }
    });
  }

  loadBoutiques() {
    this.boutiqueService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.boutiques.set(response.data.filter((b: any) => b.statut === 'libre'));
        }
      },
      error: () => {}
    });
  }

  loadCommercants() {
    this.userService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.commercants.set(response.data.filter((u: any) => u.role === 'commerçant'));
        }
      },
      error: () => {}
    });
  }

  get loyersFiltres() {
    let result = this.loyers();

    if (this.filtreStatut() !== 'tous') {
      result = result.filter(l => l.statut === this.filtreStatut());
    }

    if (this.filtreRecherche()) {
      const search = this.filtreRecherche().toLowerCase();
      result = result.filter(l =>
        l.boutique.nom.toLowerCase().includes(search) ||
        l.commercant.nom.toLowerCase().includes(search)
      );
    }

    if (this.filtreRetardPaiement() !== null) {
      result = result.filter(l => this.hasRetardPaiement(l) === this.filtreRetardPaiement());
    }

    return result;
  }

  get loyersPagines() {
    const start = (this.page() - 1) * this.itemsParPage;
    const end = start + this.itemsParPage;
    return this.loyersFiltres.slice(start, end);
  }

  get totalPages() {
    return Math.ceil(this.loyersFiltres.length / this.itemsParPage);
  }

  get pages() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page.set(newPage);
    }
  }

  hasRetardPaiement(loyer: any): boolean {
    // Logique simplifiée - à améliorer avec les vraies données de paiement
    return loyer.statut === 'actif' && Math.random() > 0.7;
  }

  resetFiltres() {
    this.filtreStatut.set('tous');
    this.filtreRecherche.set('');
    this.filtreRetardPaiement.set(null);
    this.page.set(1);
  }

  openCreateModal() {
    this.editMode.set(false);
    this.currentLoyer = {
      boutique: '',
      commercant: '',
      montant: 0,
      periodicite: 'mensuel',
      dateDebut: '',
      dateFin: '',
      statut: 'actif'
    };
    this.showModal.set(true);
  }

  openEditModal(loyer: Loyer) {
    this.editMode.set(true);
    this.currentLoyer = { ...loyer };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.currentLoyer = {};
  }

  saveLoyer() {
    if (this.editMode()) {
      this.loyerService.update(this.currentLoyer._id, this.currentLoyer).subscribe({
        next: () => {
          this.closeModal();
          this.loadLoyers();
        },
        error: (err) => {
          this.error.set('Erreur lors de la mise à jour');
        }
      });
    } else {
      this.loyerService.create(this.currentLoyer).subscribe({
        next: () => {
          this.closeModal();
          this.loadLoyers();
        },
        error: (err) => {
          this.error.set('Erreur lors de la création');
        }
      });
    }
  }

  deleteLoyer(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce loyer ?')) {
      this.loyerService.delete(id).subscribe({
        next: () => {
          this.loadLoyers();
        },
        error: (err) => {
          this.error.set('Erreur lors de la suppression');
        }
      });
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0
    }).format(amount).replace('MGA', 'Ar');
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }
}

