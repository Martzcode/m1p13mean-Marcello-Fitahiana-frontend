import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoutiqueService } from '../../../core/services/boutique.service';
import { ZoneService } from '../../../core/services/zone.service';
import { Boutique } from '../../../core/models/boutique.model';
import { Zone } from '../../../core/models/zone.model';
import { BOUTIQUE_CATEGORIES } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-boutiques-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './boutiques-list.component.html',
  styleUrl: './boutiques-list.component.css'
})
export class BoutiquesListComponent implements OnInit {
  boutiques = signal<Boutique[]>([]);
  zones = signal<Zone[]>([]);
  loading = signal(false);
  error = signal('');
  success = signal('');

  filterZone = '';
  filterStatut = '';
  filterCategorie = '';

  showModal = signal(false);
  isEditMode = signal(false);
  currentBoutique = signal<Boutique | null>(null);

  categories = BOUTIQUE_CATEGORIES;

  formData: any = {
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
    private zoneService: ZoneService
  ) {}

  ngOnInit() {
    this.loadBoutiques();
    this.loadZones();
  }

  loadBoutiques() {
    this.loading.set(true);
    const params: any = {};

    if (this.filterZone) params.zone = this.filterZone;
    if (this.filterStatut) params.statut = this.filterStatut;
    if (this.filterCategorie) params.categorie = this.filterCategorie;

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
      zone: typeof boutique.zone === 'object' ? boutique.zone._id! : boutique.zone
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.currentBoutique.set(null);
  }

  save() {
    this.loading.set(true);
    const dataToSend: any = {
      numero: this.formData.numero,
      nom: this.formData.nom,
      categorie: this.formData.categorie,
      surface: this.formData.surface,
      zone: this.formData.zone,
      statut: this.formData.statut,
      actif: this.formData.actif
    };
    if (this.formData.description) {
      dataToSend.description = this.formData.description;
    }
    if (this.formData.telephone) {
      dataToSend.telephone = this.formData.telephone;
    }
    if (this.formData.email) {
      dataToSend.email = this.formData.email;
    }

    if (this.isEditMode() && this.currentBoutique()) {
      this.boutiqueService.update(this.currentBoutique()!._id!, dataToSend).subscribe({
        next: () => {
          this.loading.set(false);
          this.closeModal();
          this.showSuccess('Boutique modifiée avec succès');
          this.loadBoutiques();
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Erreur lors de la mise à jour');
          this.loading.set(false);
        }
      });
    } else {
      this.boutiqueService.create(dataToSend).subscribe({
        next: () => {
          this.loading.set(false);
          this.closeModal();
          this.showSuccess('Boutique créée avec succès');
          this.loadBoutiques();
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Erreur lors de la création');
          this.loading.set(false);
        }
      });
    }
  }

  deleteBoutique(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette boutique ?')) {
      this.boutiqueService.delete(id).subscribe({
        next: () => {
          this.showSuccess('Boutique supprimée avec succès');
          this.loadBoutiques();
        },
        error: (err) => this.error.set(err.error?.message || 'Erreur lors de la suppression')
      });
    }
  }

  applyFilters() {
    this.loadBoutiques();
  }

  resetFilters() {
    this.filterZone = '';
    this.filterStatut = '';
    this.filterCategorie = '';
    this.loadBoutiques();
  }

  showSuccess(message: string) {
    this.success.set(message);
    setTimeout(() => this.success.set(''), 4000);
  }

  getZoneName(zone: any): string {
    return typeof zone === 'object' ? zone.nom : '';
  }

}

