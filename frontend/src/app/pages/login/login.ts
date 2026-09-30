import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { messageErreur } from '../../services/api-error';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  template: `
    <main class="login-page">
      <form class="card login-card" [formGroup]="form" (ngSubmit)="submit()">
        <div class="brand-stripe card-stripe"></div>
        <div class="brand">
          <span class="brand-mark">S</span>
          <div>
            <h1>Suivi des équipements</h1>
            <p class="muted">Senelec — connexion</p>
          </div>
        </div>

        <label>
          Email
          <input type="email" formControlName="email" autocomplete="username" placeholder="admin@senelec.sn" />
        </label>
        <label>
          Mot de passe
          <input type="password" formControlName="mot_de_passe" autocomplete="current-password" />
        </label>

        @if (erreur()) {
          <p class="alert alert-error">{{ erreur() }}</p>
        }

        <button class="btn btn-primary" type="submit" [disabled]="form.invalid || loading()">
          {{ loading() ? 'Connexion…' : 'Se connecter' }}
        </button>
      </form>
    </main>
  `,
  styles: `
    .login-page {
      min-height: 100vh; display: grid; place-items: center; padding: 16px;
      background: linear-gradient(160deg, var(--senelec-bleu) 0%, #0a2a5e 55%, var(--bg) 55.1%);
    }
    .login-card {
      width: 100%; max-width: 380px; display: flex; flex-direction: column; gap: 16px;
      padding: 28px; position: relative; overflow: hidden; box-shadow: 0 12px 32px rgba(7, 58, 139, 0.18);
    }
    .card-stripe { position: absolute; top: 0; left: 0; right: 0; }
    .brand h1 { color: var(--senelec-bleu); }
    .brand { display: flex; gap: 12px; align-items: center; margin-bottom: 8px; }
    .brand h1 { font-size: 1.25rem; margin: 0; }
    .brand p { margin: 2px 0 0; }
  `,
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  erreur = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    email: ['admin@senelec.sn', [Validators.required, Validators.email]],
    mot_de_passe: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.erreur.set(null);
    const { email, mot_de_passe } = this.form.getRawValue();
    this.auth.login(email.trim().toLowerCase(), mot_de_passe).subscribe({
      next: () => this.router.navigate(['/equipements']),
      error: (err) => {
        this.erreur.set(messageErreur(err));
        this.loading.set(false);
      },
    });
  }
}
