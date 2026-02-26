import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DepenseService {
  private apiUrl = `${environment.apiUrl}/depenses`;

  constructor(private http: HttpClient) { }

  getDepenses(filters?: any): Observable<any> {
    return this.http.get<any>(this.apiUrl, { params: filters });
  }

  getDepense(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createDepense(depense: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, depense);
  }

  updateDepense(id: string, depense: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, depense);
  }

  deleteDepense(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }
}
