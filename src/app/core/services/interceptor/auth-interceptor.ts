// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    // 1. Obtiene el token del almacenamiento local
    const token = localStorage.getItem('authToken');

    if (token) {
        console.log('Interceptor: Token encontrado. Adjuntando Authorization header.');
        
        const clonedRequest = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        
        // CORRECCIÓN CLAVE: Llama a 'next' directamente, sin '.handle'
        return next(clonedRequest); 
    }

    // CORRECCIÓN CLAVE: Llama a 'next' directamente, sin '.handle'
    return next(req);
};