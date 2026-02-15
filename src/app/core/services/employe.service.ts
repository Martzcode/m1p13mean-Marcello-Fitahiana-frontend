import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeService {
  private apiUrl = 'http://localhost:3000/api/v1/employes';

  constructor(private http: HttpClient) { }

  /**
   * Récupère la liste des employés avec filtres optionnels
   * @param filters - Filtres optionnels (actif, fonction, etc.)
   */
  getEmployes(filters?: any): Observable<any> {
    return this.http.get<any>(this.apiUrl, { params: filters });
  }

  /**
   * Récupère les détails d'un employé
   * @param id - ID de l'employé
   */
  getEmploye(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crée un nouvel employé
   * @param employe - Données de l'employé
   */
  createEmploye(employe: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, employe);
  }

  /**
   * Modifie un employé
   * @param id - ID de l'employé
   * @param employe - Données à modifier
   */
  updateEmploye(id: string, employe: Partial<any>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, employe);
  }

  /**
   * Supprime un employé
   * @param id - ID de l'employé
   */
  deleteEmploye(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupère les paiements de salaire d'un employé
   * @param id - ID de l'employé
   */
  getEmployePaiements(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/paiements`);
  }

  /**
   * Enregistre un paiement de salaire pour un employé
   * @param id - ID de l'employé
   * @param paiement - Données du paiement
   */
  createSalairePaiement(id: string, paiement: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/paiements`, paiement);
  }

  /**
   * Récupère les statistiques des salaires
   */
  getSalairesStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/salaires`);
  }
}

