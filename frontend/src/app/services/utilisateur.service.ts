import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Utilisateur } from '../models';

export interface UtilisateurCreate { email: string; mot_de_passe: string; role: string; }
export interface UtilisateurUpdate { role: string; actif: boolean; mot_de_passe?: string | null; }

@Injectable({ providedIn: 'root' })
export class UtilisateurService {
  private http = inject(HttpClient);
  private readonly url = '/api/utilisateurs';

  list(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(this.url);
  }
  create(d: UtilisateurCreate): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(this.url, d);
  }
  update(id: number, d: UtilisateurUpdate): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(`${this.url}/${id}`, d);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
