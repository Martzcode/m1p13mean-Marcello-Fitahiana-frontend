import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { BoutiqueService } from '../../../core/services/boutique.service';
import { ProduitService } from '../../../core/services/produit.service';
import { CommandeService } from '../../../core/services/commande.service';

@Component({
  selector: 'app-merchant-boutique',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './merchant-boutique.component.html',
  styleUrls: ['./merchant-boutique.component.css']
})
export class MerchantBoutiqueComponent implements OnInit {
  mesBoutiques: any[] = [];
  selectedBoutique: any = null;

  // Stats par boutique
  statsParBoutique: Map<string, any> = new Map();

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
    this.loadMesBoutiques();
  }

  loadMesBoutiques(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.boutiqueService.getAll().subscribe({
      next: (response) => {
        const allBoutiques = response.data || response;
        // Filtrer les boutiques du commerçant connecté
        if (this.currentUser && this.currentUser.boutiques) {
          this.mesBoutiques = allBoutiques.filter((b: any) =>
            this.currentUser.boutiques.includes(b._id)
          );

          // Charger les stats pour chaque boutique
          this.mesBoutiques.forEach(boutique => {
            this.loadStatsBoutique(boutique._id);
          });
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des boutiques';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  loadStatsBoutique(boutiqueId: string): void {
    const stats = {
      nbProduits: 0,
      nbCommandes: 0,
      chiffreAffaires: 0,
      produitsActifs: 0
    };

    // Charger produits de la boutique
    this.produitService.getProduits().subscribe({
      next: (response) => {
        const allProduits = response.data || response;
        const produitsBoutique = allProduits.filter((p: any) =>
          p.boutique?._id === boutiqueId || p.boutique === boutiqueId
        );
        stats.nbProduits = produitsBoutique.length;
        stats.produitsActifs = produitsBoutique.filter((p: any) => p.actif).length;
        this.statsParBoutique.set(boutiqueId, stats);
      },
      error: (err: any) => console.error('Erreur chargement produits:', err)
    });

    // Charger commandes de la boutique
    this.commandeService.getAllCommandes().subscribe({
      next: (response: any) => {
        const allCommandes = response.data || response;
        const commandesBoutique = allCommandes.filter((c: any) =>
          c.boutique?._id === boutiqueId || c.boutique === boutiqueId
        );

        // Commandes du mois en cours
        const now = new Date();
        const commandesMois = commandesBoutique.filter((c: any) => {
          const dateCommande = new Date(c.dateCommande || c.createdAt);
          return dateCommande.getMonth() === now.getMonth() &&
                 dateCommande.getFullYear() === now.getFullYear();
        });

        stats.nbCommandes = commandesMois.length;
        stats.chiffreAffaires = commandesMois.reduce((sum: number, c: any) => sum + (c.montantTotal || 0), 0);
        this.statsParBoutique.set(boutiqueId, stats);
      },
      error: (err: any) => console.error('Erreur chargement commandes:', err)
    });
  }

  getStats(boutiqueId: string): any {
    return this.statsParBoutique.get(boutiqueId) || {
      nbProduits: 0,
      nbCommandes: 0,
      chiffreAffaires: 0,
      produitsActifs: 0
    };
  }

  selectBoutique(boutique: any): void {
    this.selectedBoutique = boutique;
  }

  closeBoutiqueDetail(): void {
    this.selectedBoutique = null;
  }

  getStatutBadgeClass(statut: string): string {
    switch (statut) {
      case 'occupee':
        return 'bg-green-100 text-green-800';
      case 'disponible':
        return 'bg-blue-100 text-blue-800';
      case 'en_travaux':
        return 'bg-yellow-100 text-yellow-800';
      case 'fermee':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}

