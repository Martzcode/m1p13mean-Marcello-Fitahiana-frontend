import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  // Infos utilisateur
  nom = '';
  prenom = '';
  email = '';
  telephone = '';
  adresse = '';

  // Changement mot de passe
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  // UI state
  isLoadingProfile = false;
  isLoadingPassword = false;
  successMessage = '';
  errorMessage = '';
  passwordSuccessMessage = '';
  passwordErrorMessage = '';

  // Mode édition
  isEditing = false;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoadingProfile = true;
    this.authService.getMe().subscribe({
      next: (response) => {
        const user = response.data;
        this.nom = user.nom || '';
        this.prenom = user.prenom || '';
        this.email = user.email || '';
        this.telephone = user.telephone || '';
        this.adresse = user.adresse || '';
        this.isLoadingProfile = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement du profil';
        console.error(err);
        this.isLoadingProfile = false;
      }
    });
  }

  enableEditing(): void {
    this.isEditing = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.loadProfile();
    this.successMessage = '';
    this.errorMessage = '';
  }

  saveProfile(): void {
    this.isLoadingProfile = true;
    this.successMessage = '';
    this.errorMessage = '';

    const data = {
      nom: this.nom,
      prenom: this.prenom,
      email: this.email,
      telephone: this.telephone,
      adresse: this.adresse
    };

    this.authService.updateDetails(data).subscribe({
      next: () => {
        this.successMessage = 'Profil mis à jour avec succès';
        this.isEditing = false;
        this.isLoadingProfile = false;
        setTimeout(() => this.successMessage = '', 4000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la mise à jour du profil';
        this.isLoadingProfile = false;
      }
    });
  }

  changePassword(): void {
    this.passwordSuccessMessage = '';
    this.passwordErrorMessage = '';

    if (this.newPassword !== this.confirmPassword) {
      this.passwordErrorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    if (this.newPassword.length < 6) {
      this.passwordErrorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }

    this.isLoadingPassword = true;

    this.authService.updatePassword(this.currentPassword, this.newPassword).subscribe({
      next: () => {
        this.passwordSuccessMessage = 'Mot de passe modifié avec succès';
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.isLoadingPassword = false;
        setTimeout(() => this.passwordSuccessMessage = '', 4000);
      },
      error: (err) => {
        this.passwordErrorMessage = err.error?.message || 'Erreur lors du changement de mot de passe';
        this.isLoadingPassword = false;
      }
    });
  }

  getRoleLabel(): string {
    const user = this.authService.currentUser();
    if (!user) return '';
    switch (user.role) {
      case 'administrateur': return 'Administrateur';
      case 'commerçant': return 'Commerçant';
      case 'client': return 'Client';
      default: return user.role;
    }
  }
}
