import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CentreCommercial } from '../models/centre.model';

@Injectable({
  providedIn: 'root'
})
export class CentreService {
  private apiUrl = (window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://m1p13mean-marcello-fitahiana-backen.vercel.app') + '/api/v1/centre';

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
    return this.http.put<any>(this.apiUrl, centre);
  }
}

