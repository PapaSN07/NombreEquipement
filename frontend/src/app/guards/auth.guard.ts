import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, of } from 'rxjs';

/** Pages protégées : redirige vers /login sans session valide. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isLoggedIn() ? true : inject(Router).createUrlTree(['/login']);
};

/** Page de connexion : redirige vers /equipements si déjà connecté. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isLoggedIn() ? inject(Router).createUrlTree(['/equipements']) : true;
};


/** Pages réservées aux administrateurs. */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.loadProfil().pipe(
    map((u) => (u.role === 'admin' ? true : router.createUrlTree(['/equipements']))),
    catchError(() => of(router.createUrlTree(['/login']))),
  );
};
