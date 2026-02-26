import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BoutiqueService } from '../../../core/services/boutique.service';
import { ProduitService } from '../../../core/services/produit.service';

@Component({
  selector: 'app-boutique-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './boutique-detail.component.html'
})
export class BoutiqueDetailComponent implements OnInit {
  boutique: any = null;
  produits: any[] = [];

  isLoading = true;
  errorMessage = '';

  joursOrdre = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

  constructor(
    private route: ActivatedRoute,
    private boutiqueService: BoutiqueService,
    private produitService: ProduitService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBoutique(id);
      this.loadProduits(id);
    }
  }

  loadBoutique(id: string): void {
    this.boutiqueService.getById(id).subscribe({
      next: (response) => {
        this.boutique = response.data || response;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Boutique non trouvée';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  loadProduits(boutiqueId: string): void {
    this.produitService.getProduits({ boutique: boutiqueId, actif: true }).subscribe({
      next: (response) => {
        this.produits = response.data || response;
      },
      error: (err) => console.error('Erreur chargement produits:', err)
    });
  }

  getJourLabel(jour: string): string {
    return jour.charAt(0).toUpperCase() + jour.slice(1);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  hasHoraires(): boolean {
    if (!this.boutique?.horaires) return false;
    return this.joursOrdre.some(j =>
      this.boutique.horaires[j]?.ouverture || this.boutique.horaires[j]?.fermeture
    );
  }
}
