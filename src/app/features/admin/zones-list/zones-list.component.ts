import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZoneService } from '../../../core/services/zone.service';
import { Zone } from '../../../core/models/zone.model';

@Component({
  selector: 'app-zones-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './zones-list.component.html',
  styleUrl: './zones-list.component.css'
})
export class ZonesListComponent implements OnInit {
  zones = signal<Zone[]>([]);
  loading = signal(false);
  error = signal('');
  success = signal('');

  showModal = signal(false);
  isEditMode = signal(false);
  currentZone = signal<Zone | null>(null);

  formData: Zone = {
    nom: '',
    description: '',
    etage: 0,
    superficie: 0
  };

  constructor(private zoneService: ZoneService) {}

  ngOnInit() {
    this.loadZones();
  }

  loadZones() {
    this.loading.set(true);
    this.zoneService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.zones.set(response.data);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement des zones');
        this.loading.set(false);
      }
    });
  }

  openCreateModal() {
    this.isEditMode.set(false);
    this.formData = {
      nom: '',
      description: '',
      etage: 0,
      superficie: 0
    };
    this.showModal.set(true);
  }

  openEditModal(zone: Zone) {
    this.isEditMode.set(true);
    this.currentZone.set(zone);
    this.formData = { ...zone };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.currentZone.set(null);
  }

  save() {
    if (!this.formData.nom || this.formData.etage === undefined) {
      this.error.set('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.loading.set(true);

    if (this.isEditMode() && this.currentZone()) {
      this.zoneService.update(this.currentZone()!._id!, this.formData).subscribe({
        next: () => {
          this.loading.set(false);
          this.closeModal();
          this.showSuccess('Zone modifiée avec succès');
          this.loadZones();
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Erreur lors de la mise à jour');
          this.loading.set(false);
        }
      });
    } else {
      this.zoneService.create(this.formData).subscribe({
        next: () => {
          this.loading.set(false);
          this.closeModal();
          this.showSuccess('Zone créée avec succès');
          this.loadZones();
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Erreur lors de la création');
          this.loading.set(false);
        }
      });
    }
  }

  deleteZone(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette zone ?')) {
      this.zoneService.delete(id).subscribe({
        next: () => {
          this.showSuccess('Zone supprimée avec succès');
          this.loadZones();
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Erreur lors de la suppression');
        }
      });
    }
  }

  showSuccess(message: string) {
    this.success.set(message);
    setTimeout(() => this.success.set(''), 4000);
  }
}

