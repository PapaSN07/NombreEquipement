import { Component, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { EquipementForm } from '../../components/equipement-form/equipement-form';
import { EquipementTable } from '../../components/equipement-table/equipement-table';
import { Navbar } from '../../components/navbar/navbar';
import { Equipement, EquipementInput, TypeEquipement } from '../../models';
import { messageErreur } from '../../services/api-error';
import { EquipementService } from '../../services/equipement.service';
import { TypeEquipementService } from '../../services/type-equipement.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-equipements',
  imports: [Navbar, EquipementForm, EquipementTable],
  templateUrl: './equipements.html',
  styleUrl: './equipements.css',
})
export class Equipements implements OnInit {
  private equipementService = inject(EquipementService);
  private typeService = inject(TypeEquipementService);
  private formulaire = viewChild.required(EquipementForm);

  types = signal<TypeEquipement[]>([]);
  equipements = signal<Equipement[]>([]);
  chargement = signal(true);
  enregistrement = signal(false);

  /** Saisie en cours de modification (null = création). */
  enEdition = signal<Equipement | null>(null);

  erreur = signal<string | null>(null);
  succes = signal<string | null>(null);
  /** Entrée existante qui chevauche la saisie (proposée à la modification). */
  conflit = signal<Equipement | null>(null);
  auth = inject(AuthService);

  filtreType = signal<number | null>(null);
  equipementsFiltres = computed(() => {
    const t = this.filtreType();
    return t === null ? this.equipements() : this.equipements().filter((e) => e.type_equipement_id === t);
  });

  ngOnInit(): void {
    this.typeService.list().subscribe({
      next: (t) => this.types.set(t),
      error: (e) => this.erreur.set(messageErreur(e)),
    });
    this.charger();
  }

  charger(): void {
    this.chargement.set(true);
    this.equipementService.list().subscribe({
      next: (rows) => {
        this.equipements.set(rows);
        this.chargement.set(false);
      },
      error: (e) => {
        this.erreur.set(messageErreur(e));
        this.chargement.set(false);
      },
    });
  }

  enregistrer(data: EquipementInput): void {
    if (data.date_debut > data.date_fin) {
      this.erreur.set('La date de début doit être antérieure ou égale à la date de fin.');
      this.succes.set(null);
      this.conflit.set(null);
      return;
    }

    const id = this.enEdition()?.id ?? null;
    this.enregistrement.set(true);
    this.effacerMessages();

    const req = id === null
      ? this.equipementService.create(data)
      : this.equipementService.update(id, data);

    req.subscribe({
      next: () => {
        this.succes.set(id === null ? 'Saisie enregistrée.' : 'Modification enregistrée.');
        this.enEdition.set(null);
        this.formulaire().reset();
        this.charger();
        this.enregistrement.set(false);
      },
      error: (e) => {
        this.erreur.set(messageErreur(e));
        if (e.status === 409) {
          this.conflit.set(this.trouverConflit(data, id));
        }
        this.enregistrement.set(false);
      },
    });
  }

  modifier(e: Equipement): void {
    this.effacerMessages();
    this.enEdition.set(e);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  annuler(): void {
    this.effacerMessages();
    this.enEdition.set(null);
  }

  supprimer(e: Equipement): void {
    this.effacerMessages();
    this.equipementService.delete(e.id).subscribe({
      next: () => {
        if (this.enEdition()?.id === e.id) this.enEdition.set(null);
        this.succes.set('Saisie supprimée.');
        this.charger();
      },
      error: (err) => this.erreur.set(messageErreur(err)),
    });
  }

  onFiltre(value: string): void {
    this.filtreType.set(value === '' ? null : Number(value));
  }

  private effacerMessages(): void {
    this.erreur.set(null);
    this.succes.set(null);
    this.conflit.set(null);
  }

  private trouverConflit(d: EquipementInput, exclureId: number | null): Equipement | null {
    return (
      this.equipements().find(
        (e) =>
          e.id !== exclureId &&
          e.type_equipement_id === d.type_equipement_id &&
          e.date_debut <= d.date_fin &&
          e.date_fin >= d.date_debut,
      ) ?? null
    );
  }
}
