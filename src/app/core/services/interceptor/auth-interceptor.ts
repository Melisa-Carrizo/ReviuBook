// auth.interceptor.ts
import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { SessionExpiredService } from '../session-expired-service';
import { ApiConnectionAuth } from '../auth-service';

export const SKIP_SESSION_EXPIRY = new HttpContextToken<boolean>(() => false);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const sessionExpiredService = inject(SessionExpiredService);
    const authService = inject(ApiConnectionAuth);
    const skipSessionExpiry = req.context.get(SKIP_SESSION_EXPIRY);
    
    // 1. Obtiene el token actual desde el servicio (reactivo)
    const token = authService.currentToken();

    if (token) {
        const clonedRequest = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        
        return next(clonedRequest).pipe(
            catchError((error) => {
                if (!skipSessionExpiry && (error.status === 401 || error.status === 403)) {
                    const hadToken = !!authService.currentToken();
                    if (hadToken) {
                        authService.logout({ forced: true });
                        setTimeout(() => {
                            sessionExpiredService.notifySessionExpired();
                        }, 100);
                        const retryRequest = req.clone({
                            headers: req.headers.delete('Authorization')
                        });
                        return next(retryRequest);
                    }
                }
                return throwError(() => error);
            })
        );
    }

    // También capturar errores en requests sin token
    return next(req).pipe(
        catchError((error) => {
            // Si el error es 401 o 403 y hay un token, significa que expiró
            const hadToken = !!authService.currentToken();
            if (!skipSessionExpiry && (error.status === 401 || error.status === 403) && hadToken) {
                authService.logout({ forced: true });
                setTimeout(() => {
                    sessionExpiredService.notifySessionExpired();
                }, 0);
            }
            return throwError(() => error);
        })
    );
};