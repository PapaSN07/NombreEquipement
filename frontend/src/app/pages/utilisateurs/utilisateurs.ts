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
  templateUrl: './utilisateurs.html',
  styleUrl: './utilisateurs.css',
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
