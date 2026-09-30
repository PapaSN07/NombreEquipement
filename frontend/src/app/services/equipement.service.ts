import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Equipement, EquipementInput } from '../models';

@Injectable({ providedIn: 'root' })
export class EquipementService {
  private http = inject(HttpClient);
  private readonly url = '/api/equipements';

  list(): Observable<Equipement[]> {
    return this.http.get<Equipement[]>(this.url);
  }

  create(data: EquipementInput): Observable<Equipement> {
    return this.http.post<Equipement>(this.url, data);
  }

  update(id: number, data: EquipementInput): Observable<Equipement> {
    return this.http.put<Equipement>(`${this.url}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
