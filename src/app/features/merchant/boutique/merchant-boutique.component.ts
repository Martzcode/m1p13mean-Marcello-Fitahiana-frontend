import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { BoutiqueService } from '../../../core/services/boutique.service';
import { ProduitService } from '../../../core/services/produit.service';
import { CommandeService } from '../../../core/services/commande.service';

@Component({
  selector: 'app-merchant-boutique',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './merchant-boutique.component.html',
  styleUrls: ['./merchant-boutique.component.css']
})
export class MerchantBoutiqueComponent implements OnInit {
  mesBoutiques: any[] = [];
  selectedBoutique: any = null;

  // Stats par boutique
  statsParBoutique: Map<string, any> = new Map();

  // Edit modal
  isEditModalOpen = false;
  editForm: any = {};
  isSaving = false;
  successMessage = '';

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
        this.mesBoutiques = allBoutiques.filter((b: any) =>
          b.commercant?._id === this.currentUser?._id || b.commercant === this.currentUser?._id
        );

        // Charger les stats pour chaque boutique
        this.mesBoutiques.forEach(boutique => {
          this.loadStatsBoutique(boutique._id);
        });
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
    // Charger produits de la boutique (endpoint scopé)
    this.produitService.getProduitsByBoutique(boutiqueId).subscribe({
      next: (response) => {
        const produits = response.data || response;
        const existing = this.statsParBoutique.get(boutiqueId) || { nbProduits: 0, nbCommandes: 0, chiffreAffaires: 0, produitsActifs: 0 };
        existing.nbProduits = produits.length;
        existing.produitsActifs = produits.filter((p: any) => p.actif).length;
        this.statsParBoutique.set(boutiqueId, { ...existing });
      },
      error: (err: any) => console.error('Erreur chargement produits:', err)
    });

    // Charger commandes de la boutique (endpoint scopé)
    this.commandeService.getCommandesByBoutique(boutiqueId).subscribe({
      next: (response: any) => {
        const commandes = response.data || response;

        // Commandes du mois en cours
        const now = new Date();
        const commandesMois = commandes.filter((c: any) => {
          const dateCommande = new Date(c.dateCommande || c.createdAt);
          return dateCommande.getMonth() === now.getMonth() &&
                 dateCommande.getFullYear() === now.getFullYear();
        });

        const existing = this.statsParBoutique.get(boutiqueId) || { nbProduits: 0, nbCommandes: 0, chiffreAffaires: 0, produitsActifs: 0 };
        existing.nbCommandes = commandesMois.length;
        existing.chiffreAffaires = commandesMois.reduce((sum: number, c: any) => sum + (c.montantTotal || 0), 0);
        this.statsParBoutique.set(boutiqueId, { ...existing });
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

  openEditModal(boutique: any, event?: Event): void {
    if (event) event.stopPropagation();
    this.editForm = {
      nom: boutique.nom || '',
      categorie: boutique.categorie || '',
      description: boutique.description || '',
      telephone: boutique.telephone || '',
      email: boutique.email || '',
      horaires: {
        lundi: { ouverture: boutique.horaires?.lundi?.ouverture || '', fermeture: boutique.horaires?.lundi?.fermeture || '' },
        mardi: { ouverture: boutique.horaires?.mardi?.ouverture || '', fermeture: boutique.horaires?.mardi?.fermeture || '' },
        mercredi: { ouverture: boutique.horaires?.mercredi?.ouverture || '', fermeture: boutique.horaires?.mercredi?.fermeture || '' },
        jeudi: { ouverture: boutique.horaires?.jeudi?.ouverture || '', fermeture: boutique.horaires?.jeudi?.fermeture || '' },
        vendredi: { ouverture: boutique.horaires?.vendredi?.ouverture || '', fermeture: boutique.horaires?.vendredi?.fermeture || '' },
        samedi: { ouverture: boutique.horaires?.samedi?.ouverture || '', fermeture: boutique.horaires?.samedi?.fermeture || '' },
        dimanche: { ouverture: boutique.horaires?.dimanche?.ouverture || '', fermeture: boutique.horaires?.dimanche?.fermeture || '' }
      }
    };
    this.selectedBoutique = boutique;
    this.isEditModalOpen = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
  }

  saveEdit(): void {
    if (!this.selectedBoutique?._id) return;
    this.isSaving = true;
    this.errorMessage = '';

    this.boutiqueService.updateMyBoutique(this.selectedBoutique._id, this.editForm).subscribe({
      next: () => {
        this.successMessage = 'Boutique mise à jour avec succès';
        this.isSaving = false;
        this.isEditModalOpen = false;
        this.loadMesBoutiques();
        setTimeout(() => this.successMessage = '', 4000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la mise à jour';
        this.isSaving = false;
      }
    });
  }

  jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

  getJourLabel(jour: string): string {
    return jour.charAt(0).toUpperCase() + jour.slice(1);
  }
}

