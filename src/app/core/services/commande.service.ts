import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommandeService {
  private apiUrl = `${environment.apiUrl}/commandes`;

  constructor(private http: HttpClient) { }

  /**
   * Crée une nouvelle commande (client)
   * @param commande - Données de la commande (items, adresseLivraison, etc.)
   */
  createCommande(commande: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, commande);
  }

  /**
   * Récupère les commandes de l'utilisateur connecté (client)
   */
  getMesCommandes(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/mes-commandes`);
  }

  /**
   * Récupère toutes les commandes (admin)
   * @param filters - Filtres optionnels (statut, date, etc.)
   */
  getAllCommandes(filters?: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/all`, { params: filters });
  }

  /**
   * Récupère les détails d'une commande
   * @param id - ID de la commande
   */
  getCommande(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupère les commandes d'une boutique (commerçant)
   * @param boutiqueId - ID de la boutique
   * @param filters - Filtres optionnels
   */
  getCommandesByBoutique(boutiqueId: string, filters?: any): Observable<any> {
    const url = `${environment.apiUrl}/boutiques/${boutiqueId}/commandes`;
    return this.http.get<any>(url, { params: filters });
  }

  changerStatut(id: string, statut: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/statut`, { statut });
  }

  marquerPayee(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/paiement`, {});
  }

  mettreEnCours(id: string): Observable<any> {
    return this.changerStatut(id, 'en_cours');
  }

  terminerCommande(id: string): Observable<any> {
    return this.changerStatut(id, 'terminee');
  }

  marquerLivree(id: string): Observable<any> {
    return this.changerStatut(id, 'livree');
  }
}

