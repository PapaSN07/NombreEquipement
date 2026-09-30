import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { Equipement } from '../../models';

/** Tableau des saisies, avec confirmation de suppression en ligne. */
@Component({
  selector: 'app-equipement-table',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './equipement-table.html',
  styleUrl: './equipement-table.css',
})
export class EquipementTable {
  equipements = input.required<Equipement[]>();
  editionId = input<number | null>(null);
  /** Affiche la ligne de total (utile quand la liste est filtrée sur un type). */
  afficherTotal = input(false);

  edit = output<Equipement>();
  remove = output<Equipement>();


  suppressionId = signal<number | null>(null);
  total = computed(() => this.equipements().reduce((s, e) => s + (e.nombre ?? 0), 0));

  confirmer(e: Equipement): void {
    this.suppressionId.set(null);
    this.remove.emit(e);
  }
}
