import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaiementService {
  private apiUrl = (window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://m1p13mean-marcello-fitahiana-backen.vercel.app') + '/api/v1/paiements';

  constructor(private http: HttpClient) { }

  /**
   * Récupère la liste des paiements avec filtres optionnels
   * @param filters - Filtres optionnels (loyer, boutique, période, etc.)
   */
  getPaiements(filters?: any): Observable<any> {
    return this.http.get<any>(this.apiUrl, { params: filters });
  }

  /**
   * Récupère les détails d'un paiement
   * @param id - ID du paiement
   */
  getPaiement(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Enregistre un nouveau paiement (admin)
   * @param paiement - Données du paiement
   */
  createPaiement(paiement: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, paiement);
  }

  /**
   * Modifie un paiement (admin)
   * @param id - ID du paiement
   * @param paiement - Données à modifier
   */
  updatePaiement(id: string, paiement: Partial<any>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, paiement);
  }

  /**
   * Supprime un paiement (admin)
   * @param id - ID du paiement
   */
  deletePaiement(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupère les paiements d'un commerçant (admin)
   * @param commercantId - ID du commerçant
   */
  getPaiementsByCommercant(commercantId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/commercant/${commercantId}`);
  }

  getMoisPayes(loyerId: string, annee: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/loyer/${loyerId}/mois-payes`, { params: { annee: annee.toString() } });
  }

  /**
   * Récupère les paiements d'un loyer
   * @param loyerId - ID du loyer
   */
  getPaiementsByLoyer(loyerId: string, filters?: any): Observable<any> {
    const params = { ...filters, loyer: loyerId };
    return this.http.get<any>(this.apiUrl, { params });
  }

  /**
   * Récupère les paiements d'une boutique
   * @param boutiqueId - ID de la boutique
   */
  getPaiementsByBoutique(boutiqueId: string, filters?: any): Observable<any> {
    const url = `${window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://m1p13mean-marcello-fitahiana-backen.vercel.app'}/api/v1/boutiques/${boutiqueId}/paiements`;
    return this.http.get<any>(url, { params: filters });
  }

  /**
   * Récupère les statistiques des paiements
   */
  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }
}

