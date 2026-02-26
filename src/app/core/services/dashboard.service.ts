import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStats } from '../models/dashboard.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) { }

  getStats(): Observable<{ success: boolean; data: DashboardStats }> {
    return this.http.get<{ success: boolean; data: DashboardStats }>(`${this.apiUrl}/stats`);
  }

  getYearlyRevenue(year: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/revenue/${year}`);
  }

  getMerchantStats(boutiqueId?: string): Observable<any> {
    const params: any = {};
    if (boutiqueId) params.boutique = boutiqueId;
    return this.http.get<any>(`${this.apiUrl}/merchant/stats`, { params });
  }
}

