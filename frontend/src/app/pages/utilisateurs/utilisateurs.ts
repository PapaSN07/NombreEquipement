import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { Utilisateur } from '../../models';
import { messageErreur } from '../../services/api-error';
import { AuthService } from '../../services/auth.service';
import { UtilisateurService } from '../../services/utilisateur.service';

@Component({
  selector: 'app-utilisateurs',
  imports: [Navbar, ReactiveFormsModule],
  template: `
    <app-navbar />
    <main class="page">
      <section class="card">
        <h2>{{ enEdition() ? 'Modifier ' + enEdition()!.email : 'Nouvel utilisateur' }}</h2>
        <form class="grid-form" [formGroup]="form" (ngSubmit)="submit()">
          <label>
            Email
            <input type="email" formControlName="email" />
          </label>
          <label>
            {{ enEdition() ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe (8 caractères min.)' }}
            <input type="password" formControlName="mot_de_passe" autocomplete="new-password" />
          </label>
          <label>
            Rôle
            <select formControlName="role">
              <option value="utilisateur">Utilisateur</option>
              <option value="admin">Administrateur</option>
            </select>
          </label>
          @if (enEdition()) {
            <label>
              Statut
              <select formControlName="actif">
                <option [ngValue]="true">Actif</option>
                <option [ngValue]="false">Désactivé</option>
              </select>
            </label>
          }
          <div class="actions">
            <button class="btn btn-primary" type="submit" [disabled]="form.invalid || enregistrement()">
              {{ enEdition() ? 'Enregistrer' : 'Créer' }}
            </button>
            @if (enEdition()) {
              <button class="btn btn-ghost" type="button" (click)="annuler()">Annuler</button>
            }
          </div>
        </form>
        @if (erreur()) { <p class="alert alert-error">{{ erreur() }}</p> }
        @if (succes()) { <p class="alert alert-success">{{ succes() }}</p> }
      </section>

      <section class="card">
        <h2>Utilisateurs <span class="muted">({{ users().length }})</span></h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Email</th><th>Rôle</th><th>Statut</th><th class="actions-col">Actions</th></tr>
            </thead>
            <tbody>
              @for (u of users(); track u.id) {
                <tr [class.editing]="enEdition()?.id === u.id">
                  <td>{{ u.email }} @if (u.email === auth.email()) { <span class="muted">(vous)</span> }</td>
                  <td>{{ u.role === 'admin' ? 'Administrateur' : 'Utilisateur' }}</td>
                  <td>{{ u.actif ? 'Actif' : 'Désactivé' }}</td>
                  <td class="actions-col">
                    @if (suppressionId() === u.id) {
                      <span class="confirm">Supprimer ?</span>
                      <button class="btn btn-small btn-danger" type="button" (click)="supprimer(u)">Oui</button>
                      <button class="btn btn-small btn-ghost" type="button" (click)="suppressionId.set(null)">Non</button>
                    } @else {
                      <button class="btn btn-small" type="button" (click)="modifier(u)">Modifier</button>
                      <button class="btn btn-small btn-ghost-danger" type="button" (click)="suppressionId.set(u.id)">
                        Supprimer
                      </button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </main>
  `,
})
export class Utilisateurs implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(UtilisateurService);
  auth = inject(AuthService);

  users = signal<Utilisateur[]>([]);
  enEdition = signal<Utilisateur | null>(null);
  suppressionId = signal<number | null>(null);
  enregistrement = signal(false);
  erreur = signal<string | null>(null);
  succes = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    mot_de_passe: ['', [Validators.required, Validators.minLength(8)]],
    role: ['utilisateur'],
    actif: [true],
  });

  ngOnInit(): void { this.charger(); }

  charger(): void {
    this.service.list().subscribe({
      next: (u) => this.users.set(u),
      error: (e) => this.erreur.set(messageErreur(e)),
    });
  }

  modifier(u: Utilisateur): void {
    this.effacer();
    this.enEdition.set(u);
    const c = this.form.controls;
    c.email.disable();                       // l'email ne change pas
    c.mot_de_passe.setValidators([Validators.minLength(8)]); // optionnel en modification
    c.mot_de_passe.updateValueAndValidity();
    this.form.patchValue({ email: u.email, mot_de_passe: '', role: u.role, actif: u.actif });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  annuler(): void {
    this.effacer();
    this.enEdition.set(null);
    const c = this.form.controls;
    c.email.enable();
    c.mot_de_passe.setValidators([Validators.required, Validators.minLength(8)]);
    c.mot_de_passe.updateValueAndValidity();
    this.form.reset({ email: '', mot_de_passe: '', role: 'utilisateur', actif: true });
  }

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const edit = this.enEdition();
    this.effacer();
    this.enregistrement.set(true);

    const req = edit
      ? this.service.update(edit.id, { role: v.role, actif: v.actif, mot_de_passe: v.mot_de_passe || null })
      : this.service.create({ email: v.email.trim().toLowerCase(), mot_de_passe: v.mot_de_passe, role: v.role });

    req.subscribe({
      next: () => {
        this.annuler();
        this.succes.set(edit ? 'Utilisateur modifié.' : 'Utilisateur créé.');
        this.enregistrement.set(false);
        this.charger();
      },
      error: (e) => {
        this.erreur.set(messageErreur(e));
        this.enregistrement.set(false);
      },
    });
  }

  supprimer(u: Utilisateur): void {
    this.effacer();
    this.suppressionId.set(null);
    this.service.delete(u.id).subscribe({
      next: () => {
        this.succes.set('Utilisateur supprimé.');
        this.charger();
      },
      error: (e) => this.erreur.set(messageErreur(e)),
    });
  }

  private effacer(): void {
    this.erreur.set(null);
    this.succes.set(null);
  }
}
