import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeService } from '../../../core/services/employe.service';
import { Employe, SalairePaiement } from '../../../core/models/employe.model';

@Component({
  selector: 'app-employes-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './employes-list.component.html',
  styleUrls: ['./employes-list.component.css']
})
export class EmployesListComponent implements OnInit {
  employes: Employe[] = [];
  filteredEmployes: Employe[] = [];

  // Modal employé
  isModalOpen = false;
  isEditMode = false;
  employeForm!: FormGroup;
  currentEmployeId: string | null = null;

  // Modal paiement salaire
  isPaiementModalOpen = false;
  paiementForm!: FormGroup;
  selectedEmploye: Employe | null = null;
  employePaiements: SalairePaiement[] = [];

  // Confirmation Modal
  isConfirmModalOpen = false;
  confirmAction: (() => void) | null = null;
  confirmMessage = '';

  // Filtres
  searchTerm = '';
  selectedFonction = '';
  selectedStatus = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  // Stats
  masseSalariale = 0;

  // Loading
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Exposer Math pour le template
  Math = Math;

  fonctions = [
    'Agent de sécurité',
    'Agent d\'entretien',
    'Réceptionniste',
    'Gestionnaire',
    'Technicien',
    'Autre'
  ];

  constructor(
    private employeService: EmployeService,
    private fb: FormBuilder
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    this.loadEmployes();
    this.loadStats();
  }

  initForms(): void {
    this.employeForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.email]],
      telephone: ['', Validators.required],
      fonction: ['Agent de sécurité', Validators.required],
      salaire: ['', [Validators.required, Validators.min(0)]],
      dateEmbauche: ['', Validators.required]
    });

    this.paiementForm = this.fb.group({
      montant: ['', [Validators.required, Validators.min(0)]],
      mois: [new Date().getMonth() + 1, Validators.required],
      annee: [new Date().getFullYear(), Validators.required],
      methodePaiement: ['espèces', Validators.required],
      datePaiement: [new Date().toISOString().split('T')[0]]
    });
  }

  loadEmployes(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.employeService.getEmployes().subscribe({
      next: (response) => {
        this.employes = response.data || response;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des employés';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  loadStats(): void {
    this.employeService.getSalairesStats().subscribe({
      next: (response) => {
        this.masseSalariale = response.data?.masseSalariale || 0;
      },
      error: (err) => {
        console.error('Erreur chargement stats:', err);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.employes];

    // Filtre par recherche (nom ou prénom)
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(emp =>
        emp.nom.toLowerCase().includes(term) ||
        emp.prenom.toLowerCase().includes(term)
      );
    }

    // Filtre par fonction
    if (this.selectedFonction) {
      filtered = filtered.filter(emp => emp.fonction === this.selectedFonction);
    }

    // Filtre par statut
    if (this.selectedStatus) {
      const isActive = this.selectedStatus === 'actif';
      filtered = filtered.filter(emp => emp.actif === isActive);
    }

    this.filteredEmployes = filtered;
    this.totalPages = Math.ceil(this.filteredEmployes.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  get paginatedEmployes(): Employe[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredEmployes.slice(start, end);
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.currentEmployeId = null;
    this.employeForm.reset({
      fonction: 'Agent de sécurité',
      dateEmbauche: new Date().toISOString().split('T')[0]
    });
    this.isModalOpen = true;
  }

  openEditModal(employe: Employe): void {
    this.isEditMode = true;
    this.currentEmployeId = employe._id || null;

    this.employeForm.patchValue({
      nom: employe.nom,
      prenom: employe.prenom,
      email: employe.email,
      telephone: employe.telephone,
      fonction: employe.fonction,
      salaire: employe.salaire,
      dateEmbauche: new Date(employe.dateEmbauche).toISOString().split('T')[0]
    });

    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.employeForm.reset();
  }

  onSubmit(): void {
    if (this.employeForm.invalid) {
      Object.keys(this.employeForm.controls).forEach(key => {
        this.employeForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    const formData = this.employeForm.value;

    const request = this.isEditMode && this.currentEmployeId
      ? this.employeService.updateEmploye(this.currentEmployeId, formData)
      : this.employeService.createEmploye(formData);

    request.subscribe({
      next: () => {
        this.successMessage = this.isEditMode
          ? 'Employé modifié avec succès'
          : 'Employé créé avec succès';
        this.loadEmployes();
        this.loadStats();
        this.closeModal();
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de l\'enregistrement';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  toggleEmployeStatus(employe: Employe): void {
    if (!employe._id) return;

    this.confirmMessage = `Voulez-vous vraiment ${employe.actif ? 'désactiver' : 'activer'} cet employé ?`;
    this.confirmAction = () => {
      this.employeService.updateEmploye(employe._id!, { actif: !employe.actif }).subscribe({
        next: () => {
          this.successMessage = `Employé ${employe.actif ? 'désactivé' : 'activé'} avec succès`;
          this.loadEmployes();
          this.loadStats();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          this.errorMessage = 'Erreur lors de la modification du statut';
          console.error(err);
        }
      });
    };
    this.isConfirmModalOpen = true;
  }

  openPaiementModal(employe: Employe): void {
    this.selectedEmploye = employe;
    this.paiementForm.patchValue({
      montant: employe.salaire,
      mois: new Date().getMonth() + 1,
      annee: new Date().getFullYear(),
      methodePaiement: 'espèces',
      datePaiement: new Date().toISOString().split('T')[0]
    });

    // Charger historique paiements
    if (employe._id) {
      this.employeService.getEmployePaiements(employe._id).subscribe({
        next: (response) => {
          this.employePaiements = response.data || [];
        },
        error: (err) => {
          console.error('Erreur chargement paiements:', err);
          this.employePaiements = [];
        }
      });
    }

    this.isPaiementModalOpen = true;
  }

  closePaiementModal(): void {
    this.isPaiementModalOpen = false;
    this.selectedEmploye = null;
    this.employePaiements = [];
    this.paiementForm.reset();
  }

  onPaiementSubmit(): void {
    if (this.paiementForm.invalid || !this.selectedEmploye?._id) {
      Object.keys(this.paiementForm.controls).forEach(key => {
        this.paiementForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    const formData = {
      ...this.paiementForm.value,
      statut: 'payé'
    };

    this.employeService.createSalairePaiement(this.selectedEmploye._id, formData).subscribe({
      next: () => {
        this.successMessage = 'Paiement enregistré avec succès';
        this.closePaiementModal();
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de l\'enregistrement du paiement';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  confirmActionExecute(): void {
    if (this.confirmAction) {
      this.confirmAction();
    }
    this.isConfirmModalOpen = false;
    this.confirmAction = null;
  }

  cancelConfirm(): void {
    this.isConfirmModalOpen = false;
    this.confirmAction = null;
  }

  getFonctionBadgeClass(fonction: string): string {
    switch (fonction) {
      case 'Agent de sécurité':
        return 'bg-red-100 text-red-800';
      case 'Agent d\'entretien':
        return 'bg-green-100 text-green-800';
      case 'Réceptionniste':
        return 'bg-blue-100 text-blue-800';
      case 'Gestionnaire':
        return 'bg-purple-100 text-purple-800';
      case 'Technicien':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusBadgeClass(actif: boolean): string {
    return actif
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  }

  getMethodePaiementBadge(methode: string): string {
    switch (methode) {
      case 'espèces':
        return 'bg-green-100 text-green-800';
      case 'virement':
        return 'bg-blue-100 text-blue-800';
      case 'chèque':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getMoisNom(mois: number): string {
    const mois_noms = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                       'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return mois_noms[mois - 1] || '';
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}

