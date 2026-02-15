import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommandeService {
  private apiUrl = 'http://localhost:3000/api/v1/commandes';

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
    const url = `http://localhost:3000/api/v1/boutiques/${boutiqueId}/commandes`;
    return this.http.get<any>(url, { params: filters });
  }

  /**
   * Change le statut d'une commande (commerçant/admin)
   * @param id - ID de la commande
   * @param statut - Nouveau statut (en_attente, confirmee, en_preparation, prete, livree, annulee)
   */
  changerStatut(id: string, statut: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/statut`, { statut });
  }

  /**
   * Marque une commande comme payée (commerçant/admin)
   * @param id - ID de la commande
   */
  marquerPayee(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/paiement`, {});
  }

  /**
   * Annule une commande (client - avant certains statuts)
   * @param id - ID de la commande
   */
  annulerCommande(id: string): Observable<any> {
    return this.changerStatut(id, 'annulee');
  }

  /**
   * Confirme une commande (commerçant)
   * @param id - ID de la commande
   */
  confirmerCommande(id: string): Observable<any> {
    return this.changerStatut(id, 'confirmee');
  }

  /**
   * Passe une commande en préparation (commerçant)
   * @param id - ID de la commande
   */
  mettreEnPreparation(id: string): Observable<any> {
    return this.changerStatut(id, 'en_preparation');
  }

  /**
   * Marque une commande comme prête (commerçant)
   * @param id - ID de la commande
   */
  marquerPrete(id: string): Observable<any> {
    return this.changerStatut(id, 'prete');
  }

  /**
   * Marque une commande comme livrée (commerçant)
   * @param id - ID de la commande
   */
  marquerLivree(id: string): Observable<any> {
    return this.changerStatut(id, 'livree');
  }
}

