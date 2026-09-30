import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { TypeEquipement } from '../../models';
import { messageErreur } from '../../services/api-error';
import { TypeEquipementService } from '../../services/type-equipement.service';

@Component({
  selector: 'app-types-equipement',
  imports: [Navbar, ReactiveFormsModule],
  template: `
    <app-navbar />
    <main class="page">
      <section class="card">
        <h2>{{ enEdition() ? "Modifier le type" : "Nouveau type d'équipement" }}</h2>
        <form class="grid-form" [formGroup]="form" (ngSubmit)="submit()">
          <label>
            Nom
            <input type="text" formControlName="nom" maxlength="50" />
          </label>
          <div class="actions">
            <button class="btn btn-primary" type="submit" [disabled]="form.invalid || enregistrement()">
              {{ enEdition() ? 'Enregistrer' : 'Ajouter' }}
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
        <h2>Types <span class="muted">({{ types().length }})</span></h2>
        @if (types().length === 0) {
          <p class="muted">Aucun type.</p>
        } @else {
          <div class="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Nom</th><th class="actions-col">Actions</th></tr></thead>
              <tbody>
                @for (t of types(); track t.id) {
                  <tr [class.editing]="enEdition()?.id === t.id">
                    <td>{{ t.id }}</td>
                    <td>{{ t.nom }}</td>
                    <td class="actions-col">
                      @if (suppressionId() === t.id) {
                        <span class="confirm">Supprimer ?</span>
                        <button class="btn btn-small btn-danger" type="button" (click)="supprimer(t)">Oui</button>
                        <button class="btn btn-small btn-ghost" type="button" (click)="suppressionId.set(null)">Non</button>
                      } @else {
                        <button class="btn btn-small" type="button" (click)="modifier(t)">Modifier</button>
                        <button class="btn btn-small btn-ghost-danger" type="button" (click)="suppressionId.set(t.id)">
                          Supprimer
                        </button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>
    </main>
  `,
})
export class TypesEquipement implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(TypeEquipementService);

  types = signal<TypeEquipement[]>([]);
  enEdition = signal<TypeEquipement | null>(null);
  suppressionId = signal<number | null>(null);
  enregistrement = signal(false);
  erreur = signal<string | null>(null);
  succes = signal<string | null>(null);

  form = this.fb.nonNullable.group({ nom: ['', [Validators.required, Validators.maxLength(50)]] });

  ngOnInit(): void { this.charger(); }

  charger(): void {
    this.service.list().subscribe({
      next: (t) => this.types.set(t),
      error: (e) => this.erreur.set(messageErreur(e)),
    });
  }

  modifier(t: TypeEquipement): void {
    this.effacer();
    this.enEdition.set(t);
    this.form.setValue({ nom: t.nom ?? '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  annuler(): void {
    this.effacer();
    this.enEdition.set(null);
    this.form.reset({ nom: '' });
  }

  submit(): void {
    if (this.form.invalid) return;
    const nom = this.form.getRawValue().nom.trim();
    const edit = this.enEdition();
    this.effacer();
    this.enregistrement.set(true);
    const req = edit ? this.service.update(edit.id, nom) : this.service.create(nom);
    req.subscribe({
      next: () => {
        this.succes.set(edit ? 'Type modifié.' : 'Type ajouté.');
        this.enEdition.set(null);
        this.form.reset({ nom: '' });
        this.enregistrement.set(false);
        this.charger();
      },
      error: (e) => {
        this.erreur.set(messageErreur(e));
        this.enregistrement.set(false);
      },
    });
  }

  supprimer(t: TypeEquipement): void {
    this.effacer();
    this.suppressionId.set(null);
    this.service.delete(t.id).subscribe({
      next: () => {
        this.succes.set('Type supprimé.');
        this.charger();
      },
      error: (e) => this.erreur.set(messageErreur(e)), // ex. 409 si le type est utilisé
    });
  }

  private effacer(): void {
    this.erreur.set(null);
    this.succes.set(null);
  }
}
