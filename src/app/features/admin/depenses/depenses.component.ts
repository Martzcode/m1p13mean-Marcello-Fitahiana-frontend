import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepenseService } from '../../../core/services/depense.service';

interface Depense {
  _id: string;
  nom: string;
  description: string;
  montant: number;
  typeCharge: string;
  estPrevisible: boolean;
  impactBudgetaire: string;
  categorie: string;
  date: string;
  statut: string;
  createdAt: string;
}

@Component({
  selector: 'app-depenses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './depenses.component.html',
  styleUrl: './depenses.component.css'
})
export class DepensesComponent implements OnInit {
  depenses = signal<Depense[]>([]);
  loading = signal(false);
  error = signal('');
  success = signal('');

  Math = Math;

  // Filtres
  filtreType = signal('tous');
  filtreImpact = signal('tous');
  filtreStatut = signal('tous');
  filtrePrevisible = signal('tous');

  // Pagination
  page = signal(1);
  itemsParPage = 10;

  // Modal
  showModal = signal(false);
  showDetailsModal = signal(false);
  isEditing = signal(false);
  currentDepense: any = {};
  selectedDepense: Depense | null = null;

  // Stats
  stats: any = null;

  typesCharge = [
    { value: 'FIXE', label: 'Fixe', color: 'blue' },
    { value: 'VARIABLE', label: 'Variable', color: 'amber' },
    { value: 'MIXTE', label: 'Mixte', color: 'purple' },
    { value: 'EXCEPTIONNELLE', label: 'Exceptionnelle', color: 'red' },
    { value: 'INVESTISSEMENT', label: 'Investissement', color: 'emerald' }
  ];

  constructor(private depenseService: DepenseService) {}

  ngOnInit() {
    this.loadDepenses();
    this.loadStats();
  }

  loadDepenses() {
    this.loading.set(true);
    this.depenseService.getDepenses().subscribe({
      next: (response) => {
        if (response.success) {
          this.depenses.set(response.data);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement des dépenses');
        this.loading.set(false);
      }
    });
  }

  loadStats() {
    this.depenseService.getStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.data;
        }
      },
      error: () => {}
    });
  }

  get depensesFiltrees() {
    let result = this.depenses();

    if (this.filtreType() !== 'tous') {
      result = result.filter(d => d.typeCharge === this.filtreType());
    }

    if (this.filtreImpact() !== 'tous') {
      result = result.filter(d => d.impactBudgetaire === this.filtreImpact());
    }

    if (this.filtreStatut() !== 'tous') {
      result = result.filter(d => d.statut === this.filtreStatut());
    }

    if (this.filtrePrevisible() !== 'tous') {
      result = result.filter(d => d.estPrevisible === (this.filtrePrevisible() === 'true'));
    }

    return result;
  }

  get depensesPaginees() {
    const start = (this.page() - 1) * this.itemsParPage;
    const end = start + this.itemsParPage;
    return this.depensesFiltrees.slice(start, end);
  }

  get totalPages() {
    return Math.ceil(this.depensesFiltrees.length / this.itemsParPage);
  }

  get pages() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get totalMontant() {
    return this.depensesFiltrees
      .filter(d => d.statut !== 'annulee')
      .reduce((sum, d) => sum + d.montant, 0);
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page.set(newPage);
    }
  }

  resetFiltres() {
    this.filtreType.set('tous');
    this.filtreImpact.set('tous');
    this.filtreStatut.set('tous');
    this.filtrePrevisible.set('tous');
    this.page.set(1);
  }

  openCreateModal() {
    this.isEditing.set(false);
    this.currentDepense = {
      nom: '',
      description: '',
      montant: 0,
      typeCharge: 'FIXE',
      estPrevisible: false,
      impactBudgetaire: 'OPEX',
      categorie: '',
      date: new Date().toISOString().split('T')[0],
      statut: 'en_attente'
    };
    this.showModal.set(true);
  }

  openEditModal(depense: Depense) {
    this.isEditing.set(true);
    this.currentDepense = {
      ...depense,
      date: new Date(depense.date).toISOString().split('T')[0]
    };
    this.showModal.set(true);
  }

  openDetailsModal(depense: Depense) {
    this.selectedDepense = depense;
    this.showDetailsModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.showDetailsModal.set(false);
    this.currentDepense = {};
    this.selectedDepense = null;
  }

  saveDepense() {
    if (this.isEditing()) {
      this.depenseService.updateDepense(this.currentDepense._id, this.currentDepense).subscribe({
        next: () => {
          this.closeModal();
          this.showSuccess('Dépense modifiée avec succès');
          this.loadDepenses();
          this.loadStats();
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Erreur lors de la modification');
        }
      });
    } else {
      this.depenseService.createDepense(this.currentDepense).subscribe({
        next: () => {
          this.closeModal();
          this.showSuccess('Dépense créée avec succès');
          this.loadDepenses();
          this.loadStats();
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Erreur lors de la création');
        }
      });
    }
  }

  deleteDepense(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
      this.depenseService.deleteDepense(id).subscribe({
        next: () => {
          this.showSuccess('Dépense supprimée avec succès');
          this.loadDepenses();
          this.loadStats();
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Erreur lors de la suppression');
        }
      });
    }
  }

  showSuccess(message: string) {
    this.success.set(message);
    setTimeout(() => this.success.set(''), 4000);
  }

  getTypeColor(type: string): string {
    const found = this.typesCharge.find(t => t.value === type);
    return found ? found.color : 'gray';
  }

  getTypeLabel(type: string): string {
    const found = this.typesCharge.find(t => t.value === type);
    return found ? found.label : type;
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'payee': return 'Payée';
      case 'en_attente': return 'En attente';
      case 'annulee': return 'Annulée';
      default: return statut;
    }
  }

  getStatTotal(type: string): number {
    if (!this.stats?.totalParType) return 0;
    const found = this.stats.totalParType.find((t: any) => t._id === type);
    return found ? found.total : 0;
  }

  getImpactTotal(impact: string): number {
    if (!this.stats?.totalParImpact) return 0;
    const found = this.stats.totalParImpact.find((t: any) => t._id === impact);
    return found ? found.total : 0;
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

  exportCSV() {
    const data = this.depensesFiltrees;
    const headers = ['Nom', 'Type', 'Montant', 'Impact', 'Prévisible', 'Catégorie', 'Date', 'Statut'];

    let csv = headers.join(',') + '\n';

    data.forEach((d: Depense) => {
      const row = [
        `"${d.nom}"`,
        d.typeCharge,
        d.montant,
        d.impactBudgetaire,
        d.estPrevisible ? 'Oui' : 'Non',
        `"${d.categorie || ''}"`,
        this.formatDate(d.date),
        this.getStatutLabel(d.statut)
      ];
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `depenses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
