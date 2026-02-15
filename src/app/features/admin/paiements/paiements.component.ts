import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PaiementService } from '../../../core/services/paiement.service';
import { LoyerService } from '../../../core/services/loyer.service';
import { BoutiqueService } from '../../../core/services/boutique.service';

interface Paiement {
  _id: string;
  loyer: {
    _id: string;
    boutique: { numero: string; nom: string };
    commercant: { prenom: string; nom: string };
    montant: number;
  };
  datePaiement: string;
  montant: number;
  modePaiement: string;
  reference?: string;
  note?: string;
}

@Component({
  selector: 'app-paiements',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './paiements.component.html',
  styleUrl: './paiements.component.css'
})
export class PaiementsComponent implements OnInit {
  paiements = signal<Paiement[]>([]);
  loyers = signal<any[]>([]);
  loading = signal(false);
  error = signal('');

  // Pour utilisation dans le template
  Math = Math;

  // Filtres
  filtreBoutique = signal('tous');
  filtreStatut = signal('tous');
  filtreModePaiement = signal('tous');
  filtreMois = signal('');
  filtreAnnee = signal('');

  // Pagination
  page = signal(1);
  itemsParPage = 10;

  // Modal
  showModal = signal(false);
  showDetailsModal = signal(false);
  currentPaiement: any = {};
  selectedPaiement: any = null;

  constructor(
    private paiementService: PaiementService,
    private loyerService: LoyerService,
    private boutiqueService: BoutiqueService
  ) {}

  ngOnInit() {
    this.loadPaiements();
    this.loadLoyers();
  }

  loadPaiements() {
    this.loading.set(true);
    this.paiementService.getPaiements().subscribe({
      next: (response) => {
        if (response.success) {
          this.paiements.set(response.data);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement des paiements');
        this.loading.set(false);
      }
    });
  }

  loadLoyers() {
    this.loyerService.getAll({ statut: 'actif' }).subscribe({
      next: (response) => {
        if (response.success) {
          this.loyers.set(response.data);
        }
      },
      error: () => {}
    });
  }

  get paiementsFiltres() {
    let result = this.paiements();

    if (this.filtreBoutique() !== 'tous') {
      result = result.filter(p => p.loyer?.boutique?._id === this.filtreBoutique());
    }

    if (this.filtreModePaiement() !== 'tous') {
      result = result.filter(p => p.modePaiement === this.filtreModePaiement());
    }

    if (this.filtreMois()) {
      result = result.filter(p => {
        const date = new Date(p.datePaiement);
        return date.getMonth() + 1 === parseInt(this.filtreMois());
      });
    }

    if (this.filtreAnnee()) {
      result = result.filter(p => {
        const date = new Date(p.datePaiement);
        return date.getFullYear() === parseInt(this.filtreAnnee());
      });
    }

    return result;
  }

  get paiementsPagines() {
    const start = (this.page() - 1) * this.itemsParPage;
    const end = start + this.itemsParPage;
    return this.paiementsFiltres.slice(start, end);
  }

  get totalPages() {
    return Math.ceil(this.paiementsFiltres.length / this.itemsParPage);
  }

  get pages() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get totalPercu() {
    return this.paiementsFiltres().reduce((sum, p) => sum + p.montant, 0);
  }

  get boutiquesUniques() {
    const boutiques = new Map();
    this.paiements().forEach(p => {
      if (p.loyer?.boutique) {
        const b = p.loyer.boutique;
        boutiques.set(b._id, b);
      }
    });
    return Array.from(boutiques.values());
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page.set(newPage);
    }
  }

  resetFiltres() {
    this.filtreBoutique.set('tous');
    this.filtreStatut.set('tous');
    this.filtreModePaiement.set('tous');
    this.filtreMois.set('');
    this.filtreAnnee.set('');
    this.page.set(1);
  }

  openCreateModal() {
    this.currentPaiement = {
      loyer: '',
      datePaiement: new Date().toISOString().split('T')[0],
      montant: 0,
      modePaiement: 'especes',
      reference: '',
      note: ''
    };
    this.showModal.set(true);
  }

  openDetailsModal(paiement: Paiement) {
    this.selectedPaiement = paiement;
    this.showDetailsModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.showDetailsModal.set(false);
    this.currentPaiement = {};
    this.selectedPaiement = null;
  }

  onLoyerChange() {
    const loyer = this.loyers().find(l => l._id === this.currentPaiement.loyer);
    if (loyer) {
      this.currentPaiement.montant = loyer.montant;
    }
  }

  savePaiement() {
    this.paiementService.createPaiement(this.currentPaiement).subscribe({
      next: () => {
        this.closeModal();
        this.loadPaiements();
      },
      error: (err) => {
        this.error.set('Erreur lors de l\'enregistrement du paiement');
      }
    });
  }

  deletePaiement(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
      this.paiementService.deletePaiement(id).subscribe({
        next: () => {
          this.loadPaiements();
        },
        error: (err) => {
          this.error.set('Erreur lors de la suppression');
        }
      });
    }
  }

  exportCSV() {
    const data = this.paiementsFiltres();
    const headers = ['Date', 'Boutique', 'Commerçant', 'Montant', 'Mode Paiement', 'Référence'];

    let csv = headers.join(',') + '\n';

    data.forEach(p => {
      const row = [
        this.formatDate(p.datePaiement),
        `"${p.loyer?.boutique?.numero} - ${p.loyer?.boutique?.nom}"`,
        `"${p.loyer?.commercant?.prenom} ${p.loyer?.commercant?.nom}"`,
        p.montant,
        p.modePaiement,
        p.reference || ''
      ];
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `paiements_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  getMoisNom(mois: number): string {
    const moisNoms = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return moisNoms[mois - 1] || '';
  }
}

