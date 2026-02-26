import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { BoutiqueService } from '../../../core/services/boutique.service';
import { ProduitService } from '../../../core/services/produit.service';
import { CommandeService } from '../../../core/services/commande.service';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-merchant-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './merchant-dashboard.component.html',
  styleUrls: ['./merchant-dashboard.component.css']
})
export class MerchantDashboardComponent implements OnInit {
  // Stats
  totalProduits = 0;
  totalCommandes = 0;
  chiffreAffaires = 0;
  produitsRuptureStock = 0;

  // Loyer stats
  totalLoyerMensuel = 0;
  loyersImpayes: any[] = [];
  totalImpayes = 0;

  // Evolution CA
  evolutionCA: { mois: number; montant: number }[] = [];
  selectedBoutiqueCA = '';
  isLoadingCA = false;

  // Données
  mesBoutiques: any[] = [];
  dernieresCommandes: any[] = [];
  produitsStockFaible: any[] = [];

  // Loading
  isLoading = false;
  errorMessage = '';

  // User info
  currentUser: any;

  constructor(
    private authService: AuthService,
    private boutiqueService: BoutiqueService,
    private produitService: ProduitService,
    private commandeService: CommandeService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Charger les stats loyer depuis le backend (indépendant)
    this.loadMerchantStats();

    // Charger les boutiques d'abord, puis les données dépendantes
    this.boutiqueService.getAll().subscribe({
      next: (response: any) => {
        const allBoutiques = response.data || response;
        this.mesBoutiques = allBoutiques.filter((b: any) =>
          b.commercant?._id === this.currentUser?._id || b.commercant === this.currentUser?._id
        );

        // Maintenant charger les données par boutique
        this.loadStatsFromBoutiques();
        this.isLoading = false;
      },
      error: (err: any) => {
        this.errorMessage = 'Erreur lors du chargement';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  loadMerchantStats(): void {
    this.dashboardService.getMerchantStats().subscribe({
      next: (response: any) => {
        if (response.success) {
          const data = response.data;
          this.totalLoyerMensuel = data.loyers.totalMensuel;
          this.loyersImpayes = data.loyers.loyersImpayes || [];
          this.totalImpayes = data.loyers.totalImpayes;
          this.evolutionCA = data.evolutionCA || [];
        }
      },
      error: (err: any) => {
        console.error('Erreur chargement stats merchant:', err);
      }
    });
  }

  loadStatsFromBoutiques(): void {
    if (this.mesBoutiques.length === 0) return;

    // Charger produits et commandes pour chaque boutique
    const produitRequests = this.mesBoutiques.map(b =>
      this.produitService.getProduitsByBoutique(b._id)
    );
    const commandeRequests = this.mesBoutiques.map(b =>
      this.commandeService.getCommandesByBoutique(b._id)
    );

    // Produits
    forkJoin(produitRequests).subscribe({
      next: (responses: any[]) => {
        const allProduits = responses.flatMap(r => r.data || r);
        this.totalProduits = allProduits.length;
        this.produitsRuptureStock = allProduits.filter((p: any) => p.stock === 0).length;
        this.produitsStockFaible = allProduits
          .filter((p: any) => p.stock > 0 && p.stock < 10)
          .sort((a: any, b: any) => a.stock - b.stock)
          .slice(0, 5);
      },
      error: (err) => console.error('Erreur chargement produits:', err)
    });

    // Commandes
    forkJoin(commandeRequests).subscribe({
      next: (responses: any[]) => {
        const allCommandes = responses.flatMap(r => r.data || r);

        // Commandes du mois en cours
        const now = new Date();
        const moisEnCours = allCommandes.filter((c: any) => {
          const dateCommande = new Date(c.dateCommande || c.createdAt);
          return dateCommande.getMonth() === now.getMonth() &&
                 dateCommande.getFullYear() === now.getFullYear();
        });

        this.totalCommandes = moisEnCours.length;
        this.chiffreAffaires = moisEnCours.reduce((sum: number, c: any) => sum + (c.montantTotal || 0), 0);

        // Dernières commandes
        this.dernieresCommandes = allCommandes
          .sort((a: any, b: any) => {
            const dateA = new Date(a.dateCommande || a.createdAt);
            const dateB = new Date(b.dateCommande || b.createdAt);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 5);
      },
      error: (err) => console.error('Erreur chargement commandes:', err)
    });
  }

  onBoutiqueCAChange(): void {
    this.isLoadingCA = true;
    const boutiqueId = this.selectedBoutiqueCA || undefined;
    this.dashboardService.getMerchantStats(boutiqueId).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.evolutionCA = response.data.evolutionCA || [];
        }
        this.isLoadingCA = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement evolution CA:', err);
        this.isLoadingCA = false;
      }
    });
  }

  getStatutBadgeClass(statut: string): string {
    switch (statut) {
      case 'nouvelle':
        return 'bg-blue-100 text-blue-800';
      case 'en_cours':
        return 'bg-yellow-100 text-yellow-800';
      case 'terminee':
        return 'bg-green-100 text-green-800';
      case 'livree':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  getMonthName(month: number): string {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    return months[month - 1] || '';
  }

  getBarHeight(montant: number): string {
    const max = Math.max(...this.evolutionCA.map(m => m.montant), 1);
    const height = Math.round((montant / max) * 200);
    return height + 'px';
  }

  get totalCAannuel(): number {
    return this.evolutionCA.reduce((sum, m) => sum + m.montant, 0);
  }
}
