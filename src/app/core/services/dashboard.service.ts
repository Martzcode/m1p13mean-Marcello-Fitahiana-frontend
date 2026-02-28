import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStats } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = (window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://m1p13mean-marcello-fitahiana-backen.vercel.app') + '/api/v1/dashboard';

  constructor(private http: HttpClient) { }

  getStats(): Observable<{ success: boolean; data: DashboardStats }> {
    return this.http.get<{ success: boolean; data: DashboardStats }>(`${this.apiUrl}/stats`);
  }

  getYearlyRevenue(year: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/revenue/${year}`);
  }

  getMerchantStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/merchant/stats`);
  }
}

