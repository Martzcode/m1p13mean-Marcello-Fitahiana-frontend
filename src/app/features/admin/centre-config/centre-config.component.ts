import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CentreService } from '../../../core/services/centre.service';
import { CentreCommercial } from '../../../core/models/centre.model';

@Component({
  selector: 'app-centre-config',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './centre-config.component.html',
  styleUrls: ['./centre-config.component.css']
})
export class CentreConfigComponent implements OnInit {
  centreForm!: FormGroup;
  centreId: string | null = null;

  // Loading
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private centreService: CentreService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadCentre();
  }

  initForm(): void {
    this.centreForm = this.fb.group({
      nom: ['', Validators.required],
      adresse: this.fb.group({
        rue: ['', Validators.required],
        ville: ['', Validators.required],
        codePostal: [''],
        pays: ['Madagascar', Validators.required]
      }),
      telephone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      description: [''],
      horaires: this.fb.group({
        lundi: this.fb.group({
          ouverture: ['08:00'],
          fermeture: ['18:00']
        }),
        mardi: this.fb.group({
          ouverture: ['08:00'],
          fermeture: ['18:00']
        }),
        mercredi: this.fb.group({
          ouverture: ['08:00'],
          fermeture: ['18:00']
        }),
        jeudi: this.fb.group({
          ouverture: ['08:00'],
          fermeture: ['18:00']
        }),
        vendredi: this.fb.group({
          ouverture: ['08:00'],
          fermeture: ['18:00']
        }),
        samedi: this.fb.group({
          ouverture: ['08:00'],
          fermeture: ['18:00']
        }),
        dimanche: this.fb.group({
          ouverture: ['09:00'],
          fermeture: ['17:00']
        })
      })
    });
  }

  loadCentre(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.centreService.getCentre().subscribe({
      next: (response) => {
        const centre = response.data || response;
        if (centre && centre._id) {
          this.centreId = centre._id;
          this.patchFormValues(centre);
        }
        this.isLoading = false;
      },
      error: (err) => {
        // Si le centre n'existe pas encore, ce n'est pas une erreur
        if (err.status === 404) {
          this.errorMessage = '';
        } else {
          this.errorMessage = 'Erreur lors du chargement des informations du centre';
          console.error(err);
        }
        this.isLoading = false;
      }
    });
  }

  patchFormValues(centre: CentreCommercial): void {
    this.centreForm.patchValue({
      nom: centre.nom || '',
      adresse: {
        rue: centre.adresse?.rue || '',
        ville: centre.adresse?.ville || '',
        codePostal: centre.adresse?.codePostal || '',
        pays: centre.adresse?.pays || 'Madagascar'
      },
      telephone: centre.telephone || '',
      email: centre.email || '',
      description: centre.description || '',
      horaires: {
        lundi: {
          ouverture: centre.horaires?.lundi?.ouverture || '08:00',
          fermeture: centre.horaires?.lundi?.fermeture || '18:00'
        },
        mardi: {
          ouverture: centre.horaires?.mardi?.ouverture || '08:00',
          fermeture: centre.horaires?.mardi?.fermeture || '18:00'
        },
        mercredi: {
          ouverture: centre.horaires?.mercredi?.ouverture || '08:00',
          fermeture: centre.horaires?.mercredi?.fermeture || '18:00'
        },
        jeudi: {
          ouverture: centre.horaires?.jeudi?.ouverture || '08:00',
          fermeture: centre.horaires?.jeudi?.fermeture || '18:00'
        },
        vendredi: {
          ouverture: centre.horaires?.vendredi?.ouverture || '08:00',
          fermeture: centre.horaires?.vendredi?.fermeture || '18:00'
        },
        samedi: {
          ouverture: centre.horaires?.samedi?.ouverture || '08:00',
          fermeture: centre.horaires?.samedi?.fermeture || '18:00'
        },
        dimanche: {
          ouverture: centre.horaires?.dimanche?.ouverture || '09:00',
          fermeture: centre.horaires?.dimanche?.fermeture || '17:00'
        }
      }
    });
  }

  onSubmit(): void {
    if (this.centreForm.invalid) {
      Object.keys(this.centreForm.controls).forEach(key => {
        this.centreForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = this.centreForm.value;

    this.centreService.updateCentre(formData).subscribe({
      next: (response) => {
        this.successMessage = 'Informations enregistrées avec succès';
        if (response.data && response.data._id) {
          this.centreId = response.data._id;
        }
        this.isSaving = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de l\'enregistrement';
        console.error(err);
        this.isSaving = false;
      }
    });
  }

  copyHoraires(jour: string): void {
    const horaires = this.centreForm.get(`horaires.${jour}`)?.value;
    const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

    jours.forEach(j => {
      if (j !== jour) {
        this.centreForm.patchValue({
          horaires: {
            [j]: horaires
          }
        });
      }
    });

    this.successMessage = `Horaires de ${jour} copiés à tous les jours`;
    setTimeout(() => this.successMessage = '', 2000);
  }
}

