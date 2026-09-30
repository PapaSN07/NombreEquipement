import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TokenResponse, Utilisateur } from '../models';
import { Observable, shareReplay, tap } from 'rxjs'; // ajoute shareReplay


const TOKEN_KEY = 'se_token';
const EMAIL_KEY = 'se_email';



@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  readonly email = signal<string | null>(localStorage.getItem(EMAIL_KEY));
  readonly isLoggedIn = computed(() => !!this._token() && !this.isExpired(this._token()!));

  readonly profil = signal<Utilisateur | null>(null);
  readonly isAdmin = computed(() => this.profil()?.role === 'admin');
  private profil$?: Observable<Utilisateur>;


  get token(): string | null {
    return this._token();
  }



  login(email: string, mot_de_passe: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>('/api/auth/login', { email, mot_de_passe }).pipe(
      tap((res) => {
        localStorage.setItem(TOKEN_KEY, res.access_token);
        localStorage.setItem(EMAIL_KEY, res.email);
        this._token.set(res.access_token);
        this.email.set(res.email);
      }),
    );
  }

  me(): Observable<Utilisateur> {
    return this.http.get<Utilisateur>('/api/auth/me');
  }

  /** Efface la session locale (sans navigation). */
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    this._token.set(null);
    this.email.set(null);
    this.profil.set(null);
    this.profil$ = undefined;
  }

  logout(): void {
    this.clear();
    this.router.navigate(['/login']);
  }

  private isExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }



/** Charge le profil (rôle) une seule fois par session. */
loadProfil(): Observable<Utilisateur> {
  return (this.profil$ ??= this.me().pipe(
    tap((u) => this.profil.set(u)),
    shareReplay(1),
  ));
}

}
