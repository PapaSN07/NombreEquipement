import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/** Ajoute le JWT aux appels API ; déconnecte si le serveur répond 401. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;
  // Les appels /api/auth/* (login, vérification de session) gèrent eux-mêmes leurs 401
  const isAuthCall = req.url.includes('/api/auth/');
  const isLogin = req.url.endsWith('/api/auth/login');

  const authReq = token && !isLogin ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !isAuthCall) auth.logout();
      return throwError(() => err);
    }),
  );
};
