import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Loyer } from '../models/loyer.model';

@Injectable({
  providedIn: 'root'
})
export class LoyerService {
  private apiUrl = (window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://m1p13mean-marcello-fitahiana-backen.vercel.app') + '/api/v1/loyers';

  constructor(private http: HttpClient) { }

  getAll(params?: any): Observable<any> {
    return this.http.get<any>(this.apiUrl, { params });
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(loyer: Loyer): Observable<any> {
    return this.http.post<any>(this.apiUrl, loyer);
  }

  update(id: string, loyer: Partial<Loyer>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, loyer);
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getImpayes(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/impayes`);
  }

  getMonthlyStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/monthly`);
  }
}

