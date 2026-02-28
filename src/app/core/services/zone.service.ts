import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Zone } from '../models/zone.model';

@Injectable({
  providedIn: 'root'
})
export class ZoneService {
  private apiUrl = (window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://m1p13mean-marcello-fitahiana-backen.vercel.app') + '/api/v1/zones';

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(zone: Zone): Observable<any> {
    return this.http.post<any>(this.apiUrl, zone);
  }

  update(id: string, zone: Partial<Zone>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, zone);
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}

