import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  credentials: LoginRequest = {
    email: '',
    password: ''
  };

  error = signal<string>('');
  loading = signal<boolean>(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.redirectBasedOnRole();
    }
  }

  onSubmit() {
    if (!this.credentials.email || !this.credentials.password) {
      this.error.set('Veuillez remplir tous les champs');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          this.redirectBasedOnRole();
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Erreur de connexion. Veuillez réessayer.');
      }
    });
  }

  private redirectBasedOnRole() {
    const user = this.authService.currentUser();
    if (!user) return;

    switch (user.role) {
      case 'administrateur':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'commerçant':
        this.router.navigate(['/merchant/dashboard']);
        break;
      case 'client':
        this.router.navigate(['/']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}

