import { Component, effect, inject, input, output } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Equipement, EquipementInput, TypeEquipement } from '../../models';

function datesValides(group: AbstractControl): ValidationErrors | null {
  const debut = group.get('date_debut')?.value;
  const fin = group.get('date_fin')?.value;
  return debut && fin && fin < debut ? { datesInversees: true } : null;
}

/** Formulaire de saisie : création, ou modification quand `equipement` est fourni. */
@Component({
  selector: 'app-equipement-form',
  imports: [ReactiveFormsModule],
  templateUrl: './equipement-form.html',
  styleUrl: './equipement-form.css',
})
export class EquipementForm {
  private fb = inject(FormBuilder);

  types = input.required<TypeEquipement[]>();
  /** Saisie en cours de modification, ou null pour une création. */
  equipement = input<Equipement | null>(null);
  enregistrement = input(false);

  save = output<EquipementInput>();
  cancel = output<void>();

  form = this.fb.group(
    {
      type_equipement_id: this.fb.control<number | null>(null, Validators.required),
      date_debut: this.fb.nonNullable.control('', Validators.required),
      date_fin: this.fb.nonNullable.control('', Validators.required),
      nombre: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    },
    { validators: datesValides },
  );

  constructor() {
    // Remplit ou vide le formulaire quand la saisie à modifier change
    effect(() => {
      const e = this.equipement();
      if (e) {
        this.form.setValue({
          type_equipement_id: e.type_equipement_id,
          date_debut: e.date_debut,
          date_fin: e.date_fin,
          nombre: e.nombre,
        });
      } else {
        this.reset();
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.save.emit({
      type_equipement_id: Number(v.type_equipement_id),
      date_debut: v.date_debut,
      date_fin: v.date_fin,
      nombre: Number(v.nombre),
    });
  }

  reset(): void {
    this.form.reset({ type_equipement_id: null, date_debut: '', date_fin: '', nombre: null });
  }
}
