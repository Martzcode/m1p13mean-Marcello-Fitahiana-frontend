import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { LoyerService } from '../../../core/services/loyer.service';
import { PaiementService } from '../../../core/services/paiement.service';

@Component({
  selector: 'app-merchant-loyers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './merchant-loyers.component.html'
})
export class MerchantLoyersComponent implements OnInit {
  loyersActifs: any[] = [];
  loyersExpires: any[] = [];
  paiementsParLoyer: Map<string, any[]> = new Map();

  // Loading
  isLoading = false;
  errorMessage = '';

  // Detail modal
  selectedLoyer: any = null;
  isDetailOpen = false;

  constructor(
    private authService: AuthService,
    private loyerService: LoyerService,
    private paiementService: PaiementService
  ) {}

  ngOnInit(): void {
    this.loadLoyers();
  }

  loadLoyers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.loyerService.getAll().subscribe({
      next: (response) => {
        const loyers = response.data || response;
        this.loyersActifs = loyers.filter((l: any) => l.statut === 'actif');
        this.loyersExpires = loyers.filter((l: any) => l.statut !== 'actif');

        // Charger les paiements pour chaque loyer actif
        this.loyersActifs.forEach(loyer => this.loadPaiements(loyer._id));

        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des loyers';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  loadPaiements(loyerId: string): void {
    this.paiementService.getPaiementsByLoyer(loyerId).subscribe({
      next: (response) => {
        const paiements = response.data || response;
        // Trier par date décroissante
        paiements.sort((a: any, b: any) => {
          if (a.annee !== b.annee) return b.annee - a.annee;
          return b.mois - a.mois;
        });
        this.paiementsParLoyer.set(loyerId, paiements);
      },
      error: (err) => console.error('Erreur chargement paiements:', err)
    });
  }

  getPaiements(loyerId: string): any[] {
    return this.paiementsParLoyer.get(loyerId) || [];
  }

  getImpayes(loyerId: string): any[] {
    return this.getPaiements(loyerId).filter(p => p.statut === 'impayé');
  }

  getTotalImpayes(loyerId: string): number {
    return this.getImpayes(loyerId).reduce((sum, p) => sum + p.montant, 0);
  }

  openDetail(loyer: any): void {
    this.selectedLoyer = loyer;
    this.isDetailOpen = true;
  }

  closeDetail(): void {
    this.isDetailOpen = false;
    this.selectedLoyer = null;
  }

  getStatutBadgeClass(statut: string): string {
    switch (statut) {
      case 'actif': return 'bg-green-100 text-green-800';
      case 'expiré': return 'bg-gray-100 text-gray-800';
      case 'résilié': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getPaiementBadgeClass(statut: string): string {
    switch (statut) {
      case 'payé': return 'bg-green-100 text-green-800';
      case 'impayé': return 'bg-red-100 text-red-800';
      case 'en_attente': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getMoisNom(mois: number): string {
    const noms = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return noms[mois] || '';
  }
}
