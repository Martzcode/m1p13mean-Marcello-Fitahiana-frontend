import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];

  // Exposer Math pour le template
  Math = Math;

  // Modal
  isModalOpen = false;
  isEditMode = false;
  userForm!: FormGroup;
  currentUserId: string | null = null;

  // Confirmation Modal
  isConfirmModalOpen = false;
  confirmAction: (() => void) | null = null;
  confirmMessage = '';

  // Filtres
  searchTerm = '';
  selectedRole = '';
  selectedStatus = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  // Loading
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  initForm(): void {
    this.userForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      role: ['client', Validators.required],
      photo: [''],
      telephone: [''],
      adresse: ['']
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.userService.getAll().subscribe({
      next: (response) => {
        this.users = response.data || response;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des utilisateurs';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.users];

    // Filtre par recherche (nom, prénom ou email)
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.nom.toLowerCase().includes(term) ||
        user.prenom.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    }

    // Filtre par rôle
    if (this.selectedRole) {
      filtered = filtered.filter(user => user.role === this.selectedRole);
    }

    // Filtre par statut
    if (this.selectedStatus) {
      const isActive = this.selectedStatus === 'actif';
      filtered = filtered.filter(user => user.actif === isActive);
    }

    this.filteredUsers = filtered;
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  get paginatedUsers(): User[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredUsers.slice(start, end);
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.currentUserId = null;
    this.initForm();
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.isModalOpen = true;
  }

  openEditModal(user: User): void {
    this.isEditMode = true;
    this.currentUserId = user._id || null;

    this.userForm.patchValue({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      photo: user.photo === 'default-user.jpg' ? '' : (user.photo || ''),
      telephone: user.telephone || '',
      adresse: user.adresse || ''
    });

    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.initForm();
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    const formData = this.userForm.value;

    // Ne pas envoyer le mot de passe si vide en mode édition
    if (this.isEditMode && !formData.password) {
      delete formData.password;
    }

    const request = this.isEditMode && this.currentUserId
      ? this.userService.update(this.currentUserId, formData)
      : this.userService.create(formData);

    request.subscribe({
      next: () => {
        this.successMessage = this.isEditMode
          ? 'Utilisateur modifié avec succès'
          : 'Utilisateur créé avec succès';
        this.loadUsers();
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

  toggleUserStatus(user: User): void {
    if (!user._id) return;

    this.confirmMessage = `Voulez-vous vraiment ${user.actif ? 'désactiver' : 'activer'} cet utilisateur ?`;
    this.confirmAction = () => {
      this.userService.update(user._id!, { actif: !user.actif }).subscribe({
        next: () => {
          this.successMessage = `Utilisateur ${user.actif ? 'désactivé' : 'activé'} avec succès`;
          this.loadUsers();
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

  resetPassword(user: User): void {
    if (!user._id) return;

    this.confirmMessage = `Voulez-vous vraiment réinitialiser le mot de passe de ${user.prenom} ${user.nom} ?`;
    this.confirmAction = () => {
      // Générer un mot de passe temporaire
      const tempPassword = 'temp' + Math.random().toString(36).slice(-8);

      this.userService.update(user._id!, { password: tempPassword }).subscribe({
        next: () => {
          this.successMessage = `Mot de passe réinitialisé. Nouveau mot de passe : ${tempPassword}`;
          setTimeout(() => this.successMessage = '', 10000);
        },
        error: (err) => {
          this.errorMessage = 'Erreur lors de la réinitialisation du mot de passe';
          console.error(err);
        }
      });
    };
    this.isConfirmModalOpen = true;
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

  getBoutiquesDisplay(boutiques: any[]): string {
    if (!boutiques || boutiques.length === 0) return '-';

    return boutiques
      .map(b => {
        if (typeof b === 'object' && b !== null) {
          return b.nom || b.numero || '-';
        }
        return b;
      })
      .join(', ');
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

