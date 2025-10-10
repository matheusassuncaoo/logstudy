import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError, from } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Não adicionar token em rotas públicas do Supabase
  const publicRoutes = ['/auth/v1/signup', '/auth/v1/token', '/auth/v1/recover'];
  const isPublicRoute = publicRoutes.some(route => req.url.includes(route));

  if (isPublicRoute) {
    return next(req);
  }

  // Obter token de forma assíncrona
  return from(authService.getAccessToken()).pipe(
    switchMap(token => {
      if (token) {
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
            apikey: token // Supabase precisa do apikey também
          }
        });
      }
      return next(req);
    }),
    catchError((error) => {
      // Se erro 401 (não autorizado), tentar refresh do token
      if (error.status === 401) {
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Retry request com novo token
            return from(authService.getAccessToken()).pipe(
              switchMap(newToken => {
                if (newToken) {
                  const clonedReq = req.clone({
                    setHeaders: {
                      Authorization: `Bearer ${newToken}`,
                      apikey: newToken
                    }
                  });
                  return next(clonedReq);
                }
                return next(req);
              })
            );
          }),
          catchError((refreshError) => {
            // Se refresh falhar, fazer logout
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
