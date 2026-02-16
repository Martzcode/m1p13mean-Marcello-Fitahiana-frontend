import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { BoutiqueService } from '../../../core/services/boutique.service';
import { ProduitService } from '../../../core/services/produit.service';
import { CommandeService } from '../../../core/services/commande.service';

@Component({
  selector: 'app-merchant-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './merchant-dashboard.component.html',
  styleUrls: ['./merchant-dashboard.component.css']
})
export class MerchantDashboardComponent implements OnInit {
  // Stats
  totalProduits = 0;
  totalCommandes = 0;
  chiffreAffaires = 0;
  produitsRuptureStock = 0;

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
    private commandeService: CommandeService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Charger les boutiques du commerçant
    this.loadMesBoutiques();

    // Charger les statistiques
    this.loadStats();

    // Charger les dernières commandes
    this.loadDernieresCommandes();

    // Charger les produits à faible stock
    this.loadProduitsStockFaible();

    this.isLoading = false;
  }

  loadMesBoutiques(): void {
    this.boutiqueService.getAll().subscribe({
      next: (response: any) => {
        const allBoutiques = response.data || response;
        // Filtrer les boutiques du commerçant connecté
        if (this.currentUser && this.currentUser.boutiques) {
          this.mesBoutiques = allBoutiques.filter((b: any) =>
            this.currentUser.boutiques.includes(b._id)
          );
        }
      },
      error: (err: any) => {
        console.error('Erreur chargement boutiques:', err);
      }
    });
  }

  loadStats(): void {
    // Total produits
    this.produitService.getProduits().subscribe({
      next: (response: any) => {
        const allProduits = response.data || response;
        // Filtrer les produits des boutiques du commerçant
        const mesProduits = allProduits.filter((p: any) =>
          this.mesBoutiques.some(b => b._id === p.boutique?._id || p.boutique)
        );
        this.totalProduits = mesProduits.length;

        // Produits en rupture de stock
        this.produitsRuptureStock = mesProduits.filter((p: any) => p.stock === 0).length;
      },
      error: (err: any) => {
        console.error('Erreur chargement produits:', err);
      }
    });

    // Total commandes et chiffre d'affaires du mois
    this.commandeService.getAllCommandes().subscribe({
      next: (response: any) => {
        const allCommandes = response.data || response;
        // Filtrer les commandes des boutiques du commerçant
        const mesCommandes = allCommandes.filter((c: any) =>
          this.mesBoutiques.some(b => b._id === c.boutique?._id || c.boutique)
        );

        // Commandes du mois en cours
        const now = new Date();
        const moisEnCours = mesCommandes.filter((c: any) => {
          const dateCommande = new Date(c.dateCommande || c.createdAt);
          return dateCommande.getMonth() === now.getMonth() &&
                 dateCommande.getFullYear() === now.getFullYear();
        });

        this.totalCommandes = moisEnCours.length;
        this.chiffreAffaires = moisEnCours.reduce((sum: number, c: any) => sum + (c.montantTotal || 0), 0);
      },
      error: (err: any) => {
        console.error('Erreur chargement commandes:', err);
      }
    });
  }

  loadDernieresCommandes(): void {
    this.commandeService.getAllCommandes().subscribe({
      next: (response: any) => {
        const allCommandes = response.data || response;
        // Filtrer et trier les commandes
        const mesCommandes = allCommandes
          .filter((c: any) => this.mesBoutiques.some(b => b._id === c.boutique?._id || c.boutique))
          .sort((a: any, b: any) => {
            const dateA = new Date(a.dateCommande || a.createdAt);
            const dateB = new Date(b.dateCommande || b.createdAt);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 5);

        this.dernieresCommandes = mesCommandes;
      },
      error: (err: any) => {
        console.error('Erreur chargement dernières commandes:', err);
      }
    });
  }

  loadProduitsStockFaible(): void {
    this.produitService.getProduits().subscribe({
      next: (response) => {
        const allProduits = response.data || response;
        // Filtrer les produits avec stock faible (< 10)
        this.produitsStockFaible = allProduits
          .filter((p: any) => {
            const isMaBoutique = this.mesBoutiques.some(b => b._id === p.boutique?._id || p.boutique);
            return isMaBoutique && p.stock > 0 && p.stock < 10;
          })
          .sort((a: any, b: any) => a.stock - b.stock)
          .slice(0, 5);
      },
      error: (err) => {
        console.error('Erreur chargement produits stock faible:', err);
      }
    });
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
}

