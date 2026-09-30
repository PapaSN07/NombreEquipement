import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'equipements',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/equipements/equipements').then((m) => m.Equipements),
  },
  {
  path: 'types-equipement',
  canActivate: [authGuard, adminGuard],
  loadComponent: () => import('./pages/types-equipement/types-equipement').then((m) => m.TypesEquipement),
},
{
  path: 'utilisateurs',
  canActivate: [authGuard, adminGuard],
  loadComponent: () => import('./pages/utilisateurs/utilisateurs').then((m) => m.Utilisateurs),
},
  { path: '', pathMatch: 'full', redirectTo: 'equipements' },
  { path: '**', redirectTo: 'equipements' },
];
