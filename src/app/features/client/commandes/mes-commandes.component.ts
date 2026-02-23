import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommandeService } from '../../../core/services/commande.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mes-commandes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mes-commandes.component.html',
  styleUrls: ['./mes-commandes.component.css']
})
export class MesCommandesComponent implements OnInit {
  commandes: any[] = [];
  commandesFiltrees: any[] = [];
  loading = true;
  error = '';

  // Math pour template
  Math = Math;

  // Filtres
  filtreStatut = '';
  filtreDateDebut = '';
  filtreDateFin = '';
  filtreBoutique = '';

  // Pagination
  page = 1;
  limit = 9;
  totalPages = 1;

  // Modal détails
  showModal = false;
  commandeSelectionnee: any = null;

  // Listes pour filtres
  boutiquesUniques: string[] = [];
  statutsDisponibles = [
    { value: 'nouvelle', label: 'Nouvelle', color: 'bg-blue-100 text-blue-800' },
    { value: 'en_cours', label: 'En cours', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'terminee', label: 'Terminée', color: 'bg-green-100 text-green-800' },
    { value: 'livree', label: 'Livrée', color: 'bg-teal-100 text-teal-800' }
  ];

  constructor(
    private commandeService: CommandeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.chargerCommandes();
  }

  chargerCommandes(): void {
    this.loading = true;
    this.error = '';

    this.commandeService.getMesCommandes().subscribe({
      next: (response) => {
        this.commandes = response.data || response || [];
        // Tri par date décroissant (plus récent en premier)
        this.commandes.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Extraire les boutiques uniques
        this.boutiquesUniques = [...new Set(this.commandes.map(c => c.boutique?.nom).filter(Boolean))];

        this.appliquerFiltres();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement commandes:', err);
        this.error = 'Erreur lors du chargement des commandes';
        this.loading = false;
      }
    });
  }

  appliquerFiltres(): void {
    let resultats = [...this.commandes];

    // Filtre par statut
    if (this.filtreStatut) {
      resultats = resultats.filter(c => c.statut === this.filtreStatut);
    }

    // Filtre par boutique
    if (this.filtreBoutique) {
      resultats = resultats.filter(c => c.boutique?.nom === this.filtreBoutique);
    }

    // Filtre par date
    if (this.filtreDateDebut) {
      const dateDebut = new Date(this.filtreDateDebut);
      resultats = resultats.filter(c => new Date(c.createdAt) >= dateDebut);
    }

    if (this.filtreDateFin) {
      const dateFin = new Date(this.filtreDateFin);
      dateFin.setHours(23, 59, 59, 999);
      resultats = resultats.filter(c => new Date(c.createdAt) <= dateFin);
    }

    this.commandesFiltrees = resultats;
    this.totalPages = Math.ceil(this.commandesFiltrees.length / this.limit);
    this.page = 1; // Reset à la première page
  }

  reinitialiserFiltres(): void {
    this.filtreStatut = '';
    this.filtreDateDebut = '';
    this.filtreDateFin = '';
    this.filtreBoutique = '';
    this.appliquerFiltres();
  }

  get commandesPaginees(): any[] {
    const debut = (this.page - 1) * this.limit;
    const fin = debut + this.limit;
    return this.commandesFiltrees.slice(debut, fin);
  }

  changerPage(nouvellePage: number): void {
    if (nouvellePage >= 1 && nouvellePage <= this.totalPages) {
      this.page = nouvellePage;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  voirDetails(commande: any): void {
    this.commandeSelectionnee = commande;
    this.showModal = true;
  }

  fermerModal(): void {
    this.showModal = false;
    this.commandeSelectionnee = null;
  }

  getStatutColor(statut: string): string {
    const statutObj = this.statutsDisponibles.find(s => s.value === statut);
    return statutObj ? statutObj.color : 'bg-gray-100 text-gray-800';
  }

  getStatutLabel(statut: string): string {
    const statutObj = this.statutsDisponibles.find(s => s.value === statut);
    return statutObj ? statutObj.label : statut;
  }

  getPaiementColor(statutPaiement: string): string {
    return statutPaiement === 'payee'
      ? 'bg-green-100 text-green-800'
      : 'bg-orange-100 text-orange-800';
  }

  getPaiementLabel(statutPaiement: string): string {
    return statutPaiement === 'payee' ? 'Payée' : 'En attente';
  }

  naviguerCatalogue(): void {
    this.router.navigate(['/client/catalogue']);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatMontant(montant: number): string {
    return new Intl.NumberFormat('fr-FR').format(montant) + ' Ar';
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}

