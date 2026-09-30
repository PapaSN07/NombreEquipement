import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { inject } from '@angular/core';
import { catchError, firstValueFrom, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Exécuté avant le démarrage de l'application (provideAppInitializer) :
 * - enregistre la locale française (dates, nombres) ;
 * - si un token est présent, vérifie auprès de l'API qu'il est toujours
 *   valide (utilisateur supprimé, secret JWT changé...) et nettoie sinon.
 */
export function initApp(): Promise<unknown> {
  registerLocaleData(localeFr);

  const auth = inject(AuthService);
  if (!auth.isLoggedIn()) {
    auth.clear();
    return Promise.resolve();
  }
  return firstValueFrom(
    auth.me().pipe(
      catchError(() => {
        auth.clear();
        return of(null);
      }),
    ),
  );
}
