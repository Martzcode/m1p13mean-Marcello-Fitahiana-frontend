import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PanierService } from '../../../core/services/panier.service';
import { CommandeService } from '../../../core/services/commande.service';
import { ItemPanier } from '../../../core/models/panier.model';
import { DEFAULT_PRODUCT_IMAGE } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-commande-validate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './commande-validate.component.html',
  styleUrl: './commande-validate.component.css'
})
export class CommandeValidateComponent implements OnInit {
  panier: ItemPanier[] = [];
  total: number = 0;
  modePaiement: string = 'livraison'; // Par défaut
  notes: string = '';
  loading: boolean = false;
  error: string = '';
  success: boolean = false;
  numeroCommande: string = '';
  commandeId: string = '';

  constructor(
    private panierService: PanierService,
    private commandeService: CommandeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.chargerPanier();
  }

  /**
   * Charge le panier actuel
   */
  chargerPanier(): void {
    this.panier = this.panierService.getPanier();
    this.total = this.panierService.calculerTotal();

    // Vérifier que le panier n'est pas vide
    if (this.panier.length === 0) {
      this.error = 'Votre panier est vide. Veuillez ajouter des produits avant de commander.';
    }
  }

  /**
   * Valide et crée la commande
   */
  validerCommande(): void {
    // Réinitialiser les messages
    this.error = '';
    this.success = false;

    // Vérifications
    if (this.panier.length === 0) {
      this.error = 'Votre panier est vide.';
      return;
    }

    // Vérifier les stocks (simulation - en production, le backend vérifiera)
    const produitsInsuffisants = this.panier.filter(item => {
      return item.produit.stock < item.quantite;
    });

    if (produitsInsuffisants.length > 0) {
      const noms = produitsInsuffisants.map(item => item.produit.nom).join(', ');
      this.error = `Stock insuffisant pour: ${noms}. Veuillez ajuster votre panier.`;
      return;
    }

    // Préparer les données de la commande
    this.loading = true;
    const commandeData = {
      items: this.panier.map(item => ({
        produit: item.produit._id,
        quantite: item.quantite,
        prixUnitaire: item.prixUnitaire
      })),
      modePaiement: this.modePaiement === 'livraison' ? 'a_la_livraison' : 'en_ligne',
      notes: this.notes.trim() || undefined
    };

    // Appel API pour créer la commande
    this.commandeService.createCommande(commandeData).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = true;
        const commande = response.data || response.commande || response;
        this.numeroCommande = commande.numero || commande._id || '';
        this.commandeId = commande._id || '';

        // Vider le panier après succès
        this.panierService.viderPanier();
        this.panier = [];
        this.total = 0;
      },
      error: (err) => {
        this.loading = false;
        console.error('Erreur création commande:', err);

        // Gestion des erreurs spécifiques
        if (err.error?.message) {
          this.error = err.error.message;
        } else if (err.status === 400) {
          this.error = 'Données de commande invalides. Veuillez vérifier votre panier.';
        } else if (err.status === 409) {
          this.error = 'Stock insuffisant pour certains produits. Veuillez rafraîchir la page.';
        } else {
          this.error = 'Une erreur est survenue lors de la création de la commande. Veuillez réessayer.';
        }
      }
    });
  }

  /**
   * Navigation vers mes commandes
   */
  voirMesCommandes(): void {
    this.router.navigate(['/client/commandes']);
  }

  /**
   * Retour à l'accueil
   */
  retourAccueil(): void {
    this.router.navigate(['/client/catalogue']);
  }

  /**
   * Annuler et retour au panier
   */
  retourPanier(): void {
    this.router.navigate(['/client/panier']);
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMAGE;
  }
}

