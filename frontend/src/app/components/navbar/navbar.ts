import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="topbar">
      <div class="brand">
        <span class="brand-mark">S</span>
        <strong>Suivi des équipements</strong>
      </div>

      <nav class="nav">
        <a routerLink="/equipements" routerLinkActive="active">Équipements</a>
        @if (auth.isAdmin()) {
          <a routerLink="/types-equipement" routerLinkActive="active">Types</a>
          <a routerLink="/utilisateurs" routerLinkActive="active">Utilisateurs</a>
        }
      </nav>

      <div class="user">
        <span class="email">{{ auth.email() }}</span>
        <button class="btn btn-ghost btn-logout" type="button" (click)="auth.logout()">Déconnexion</button>
      </div>
    </header>
    <div class="brand-stripe"></div>
  `,
  styles: `
    .topbar {
      display: flex; justify-content: space-between; align-items: center; gap: 12px;
      padding: 12px 24px; background: var(--senelec-bleu); color: #fff;
    }
    :host { display: block; position: sticky; top: 0; z-index: 10; }
    .user .email { color: rgba(255, 255, 255, 0.75); }
    .btn-logout { color: #fff; }
    .btn-logout:hover { background: rgba(255, 255, 255, 0.12); }
    .brand { display: flex; align-items: center; gap: 10px; }
    .user { display: flex; align-items: center; gap: 12px; }

    .nav { display: flex; gap: 4px; flex: 1; margin-left: 24px; }
    .nav a {
      color: rgba(255, 255, 255, 0.75); text-decoration: none;
      padding: 6px 12px; border-radius: 6px; font-size: 0.95rem;
    }
    .nav a:hover { background: rgba(255, 255, 255, 0.12); color: #fff; }
    .nav a.active { background: rgba(255, 255, 255, 0.2); color: #fff; font-weight: 600; }

    @media (max-width: 800px) {
      .topbar { padding: 12px 16px; flex-wrap: wrap; }
      .user .email { display: none; }
      .nav { order: 3; flex-basis: 100%; margin-left: 0; overflow-x: auto; }
    }
  `,
})
export class Navbar implements OnInit {
  auth = inject(AuthService);

  ngOnInit(): void {
    // Recharge le rôle après un rafraîchissement de page (le profil n'est pas stocké)
    if (this.auth.isLoggedIn()) this.auth.loadProfil().subscribe();
  }
}
