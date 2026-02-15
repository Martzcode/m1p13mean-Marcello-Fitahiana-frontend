import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BoutiqueService } from '../../../core/services/boutique.service';
import { ZoneService } from '../../../core/services/zone.service';
import { UserService } from '../../../core/services/user.service';
import { Boutique } from '../../../core/models/boutique.model';
import { Zone } from '../../../core/models/zone.model';
import { User } from '../../../core/models/user.model';
import { BOUTIQUE_CATEGORIES } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-boutiques-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './boutiques-list.component.html',
  styleUrl: './boutiques-list.component.css'
})
export class BoutiquesListComponent implements OnInit {
  boutiques = signal<Boutique[]>([]);
  zones = signal<Zone[]>([]);
  commercants = signal<User[]>([]);
  loading = signal(false);
  error = signal('');

  filterZone = signal('');
  filterStatut = signal('');
  filterCategorie = signal('');

  showModal = signal(false);
  isEditMode = signal(false);
  currentBoutique = signal<Boutique | null>(null);

  categories = BOUTIQUE_CATEGORIES;

  formData: Boutique = {
    numero: '',
    nom: '',
    categorie: 'Mode',
    surface: 0,
    zone: '',
    statut: 'libre',
    description: '',
    telephone: '',
    email: '',
    actif: true
  };

  constructor(
    private boutiqueService: BoutiqueService,
    private zoneService: ZoneService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadBoutiques();
    this.loadZones();
    this.loadCommercants();
  }

  loadBoutiques() {
    this.loading.set(true);
    const params: any = {};

    if (this.filterZone()) params.zone = this.filterZone();
    if (this.filterStatut()) params.statut = this.filterStatut();
    if (this.filterCategorie()) params.categorie = this.filterCategorie();

    this.boutiqueService.getAll(params).subscribe({
      next: (response) => {
        if (response.success) {
          this.boutiques.set(response.data);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement des boutiques');
        this.loading.set(false);
      }
    });
  }

  loadZones() {
    this.zoneService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.zones.set(response.data);
        }
      }
    });
  }

  loadCommercants() {
    this.userService.getCommercants().subscribe({
      next: (response) => {
        if (response.success) {
          this.commercants.set(response.data);
        }
      }
    });
  }

  openCreateModal() {
    this.isEditMode.set(false);
    this.formData = {
      numero: '',
      nom: '',
      categorie: 'Mode',
      surface: 0,
      zone: '',
      statut: 'libre',
      description: '',
      telephone: '',
      email: '',
      actif: true
    };
    this.showModal.set(true);
  }

  openEditModal(boutique: Boutique) {
    this.isEditMode.set(true);
    this.currentBoutique.set(boutique);
    this.formData = {
      ...boutique,
      zone: typeof boutique.zone === 'object' ? boutique.zone._id! : boutique.zone,
      commercant: typeof boutique.commercant === 'object' ? boutique.commercant?._id : boutique.commercant
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.currentBoutique.set(null);
  }

  save() {
    this.loading.set(true);

    if (this.isEditMode() && this.currentBoutique()) {
      this.boutiqueService.update(this.currentBoutique()!._id!, this.formData).subscribe({
        next: () => {
          this.loading.set(false);
          this.closeModal();
          this.loadBoutiques();
        },
        error: () => {
          this.error.set('Erreur lors de la mise à jour');
          this.loading.set(false);
        }
      });
    } else {
      this.boutiqueService.create(this.formData).subscribe({
        next: () => {
          this.loading.set(false);
          this.closeModal();
          this.loadBoutiques();
        },
        error: () => {
          this.error.set('Erreur lors de la création');
          this.loading.set(false);
        }
      });
    }
  }

  deleteBoutique(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette boutique ?')) {
      this.boutiqueService.delete(id).subscribe({
        next: () => this.loadBoutiques(),
        error: () => this.error.set('Erreur lors de la suppression')
      });
    }
  }

  applyFilters() {
    this.loadBoutiques();
  }

  resetFilters() {
    this.filterZone.set('');
    this.filterStatut.set('');
    this.filterCategorie.set('');
    this.loadBoutiques();
  }

  getZoneName(zone: any): string {
    return typeof zone === 'object' ? zone.nom : '';
  }

  getCommercantName(commercant: any): string {
    if (!commercant) return '-';
    return typeof commercant === 'object' ? `${commercant.prenom} ${commercant.nom}` : '-';
  }
}

