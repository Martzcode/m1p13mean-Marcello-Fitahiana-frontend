import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BoutiqueService } from '../../../core/services/boutique.service';

@Component({
  selector: 'app-boutiques-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './boutiques-list.component.html'
})
export class BoutiquesListComponent implements OnInit {
  boutiques: any[] = [];
  filteredBoutiques: any[] = [];
  recherche = '';
  isLoading = true;
  errorMessage = '';

  constructor(private boutiqueService: BoutiqueService) {}

  ngOnInit(): void {
    this.loadBoutiques();
  }

  loadBoutiques(): void {
    this.isLoading = true;
    this.boutiqueService.getAll().subscribe({
      next: (response) => {
        const all = response.data || response;
        // Afficher uniquement les boutiques occupées (qui ont un commerçant)
        this.boutiques = all.filter((b: any) => b.statut === 'occupée');
        this.filteredBoutiques = [...this.boutiques];
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des boutiques';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  filtrer(): void {
    if (!this.recherche.trim()) {
      this.filteredBoutiques = [...this.boutiques];
      return;
    }
    const terme = this.recherche.toLowerCase();
    this.filteredBoutiques = this.boutiques.filter(b =>
      b.nom?.toLowerCase().includes(terme) ||
      b.categorie?.toLowerCase().includes(terme) ||
      b.zone?.nom?.toLowerCase().includes(terme) ||
      b.description?.toLowerCase().includes(terme)
    );
  }
}
