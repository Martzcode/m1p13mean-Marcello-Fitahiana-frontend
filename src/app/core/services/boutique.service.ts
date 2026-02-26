import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Boutique } from '../models/boutique.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BoutiqueService {
  private apiUrl = `${environment.apiUrl}/boutiques`;

  constructor(private http: HttpClient) { }

  getAll(params?: any): Observable<any> {
    return this.http.get<any>(this.apiUrl, { params });
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(boutique: Boutique): Observable<any> {
    return this.http.post<any>(this.apiUrl, boutique);
  }

  update(id: string, boutique: Partial<Boutique>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, boutique);
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  updateMyBoutique(id: string, data: Partial<any>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/my`, data);
  }
}

