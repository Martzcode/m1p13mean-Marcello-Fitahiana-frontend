import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProduitService {
  private apiUrl = 'http://localhost:3000/api/v1/produits';

  constructor(private http: HttpClient) { }

  /**
   * Récupère la liste des produits avec filtres optionnels
   * @param filters - Filtres optionnels (boutique, categorie, actif, etc.)
   */
  getProduits(filters?: any): Observable<any> {
    return this.http.get<any>(this.apiUrl, { params: filters });
  }

  /**
   * Récupère les détails d'un produit
   * @param id - ID du produit
   */
  getProduit(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupère les produits d'une boutique
   * @param boutiqueId - ID de la boutique
   */
  getProduitsByBoutique(boutiqueId: string, filters?: any): Observable<any> {
    const url = `http://localhost:3000/api/v1/boutiques/${boutiqueId}/produits`;
    return this.http.get<any>(url, { params: filters });
  }

  /**
   * Crée un nouveau produit (commerçant)
   * @param produit - Données du produit
   */
  createProduit(produit: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, produit);
  }

  /**
   * Modifie un produit (commerçant)
   * @param id - ID du produit
   * @param produit - Données à modifier
   */
  updateProduit(id: string, produit: Partial<any>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, produit);
  }

  /**
   * Supprime un produit (commerçant)
   * @param id - ID du produit
   */
  deleteProduit(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Active/désactive un produit
   * @param id - ID du produit
   */
  toggleActif(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/toggle-actif`, {});
  }

  /**
   * Met à jour le stock d'un produit
   * @param id - ID du produit
   * @param stock - Nouveau stock
   */
  updateStock(id: string, stock: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/stock`, { stock });
  }
}

