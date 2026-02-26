import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CentreCommercial } from '../models/centre.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CentreService {
  private apiUrl = `${environment.apiUrl}/centre`;

  constructor(private http: HttpClient) { }

  /**
   * Récupère les informations du centre commercial
   */
  getCentre(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  /**
   * Met à jour les informations du centre commercial
   * @param centre - Données du centre à mettre à jour
   */
  updateCentre(centre: Partial<CentreCommercial>): Observable<any> {
    return this.http.post<any>(this.apiUrl, centre);
  }
}

