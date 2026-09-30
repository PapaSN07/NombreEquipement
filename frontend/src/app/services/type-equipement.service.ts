import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TypeEquipement } from '../models';

@Injectable({ providedIn: 'root' })
export class TypeEquipementService {
  private http = inject(HttpClient);

  private readonly url = '/api/types-equipement';

list(): Observable<TypeEquipement[]> {
  return this.http.get<TypeEquipement[]>(this.url);
}
create(nom: string): Observable<TypeEquipement> {
  return this.http.post<TypeEquipement>(this.url, { nom });
}
update(id: number, nom: string): Observable<TypeEquipement> {
  return this.http.put<TypeEquipement>(`${this.url}/${id}`, { nom });
}
delete(id: number): Observable<void> {
  return this.http.delete<void>(`${this.url}/${id}`);
}
}
