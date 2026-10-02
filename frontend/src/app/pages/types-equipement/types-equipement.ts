import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { TypeEquipement } from '../../models';
import { messageErreur } from '../../services/api-error';
import { TypeEquipementService } from '../../services/type-equipement.service';

@Component({
  selector: 'app-types-equipement',
  imports: [Navbar, ReactiveFormsModule],
  templateUrl: './types-equipement.html',
  styleUrl: './types-equipement.css',
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
