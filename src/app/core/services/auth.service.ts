import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '../models/user.model';
import { API_CONFIG } from '../constants/app.constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = API_CONFIG.API_URL;
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        if (response.success) {
          this.setSession(response);
        }
      })
    );
  }

  register(data: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/register`, data).pipe(
      tap(response => {
        if (response.success) {
          this.setSession(response);
        }
      })
    );
  }

  logout(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/logout`).pipe(
      tap(() => {
        this.clearSession();
        this.router.navigate(['/login']);
      })
    );
  }

  getMe(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/me`).pipe(
      tap(response => {
        if (response.success) {
          this.currentUser.set(response.data);
        }
      })
    );
  }

  updateDetails(data: Partial<User>): Observable<any> {
    return this.http.put(`${this.apiUrl}/auth/updatedetails`, data).pipe(
      tap((response: any) => {
        if (response.success) {
          this.currentUser.set(response.data);
          this.saveUserToStorage(response.data);
        }
      })
    );
  }

  updatePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/auth/updatepassword`, {
      currentPassword,
      newPassword
    });
  }

  private setSession(authResult: LoginResponse): void {
    localStorage.setItem('token', authResult.token);
    localStorage.setItem('user', JSON.stringify(authResult.user));

    const user: User = {
      _id: authResult.user.id,
      nom: authResult.user.nom,
      prenom: authResult.user.prenom,
      email: authResult.user.email,
      role: authResult.user.role as any,
      photo: authResult.user.photo
    };

    this.currentUser.set(user);
    this.isAuthenticated.set(true);
  }

  private clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        const user: User = {
          _id: userData.id,
          nom: userData.nom,
          prenom: userData.prenom,
          email: userData.email,
          role: userData.role,
          photo: userData.photo
        };
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      } catch (e) {
        this.clearSession();
      }
    }
  }

  private saveUserToStorage(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  hasRole(roles: string[]): boolean {
    const user = this.currentUser();
    return user ? roles.includes(user.role) : false;
  }

  isAdmin(): boolean {
    return this.hasRole(['administrateur']);
  }

  isMerchant(): boolean {
    return this.hasRole(['commerçant']);
  }

  isClient(): boolean {
    return this.hasRole(['client']);
  }
}

