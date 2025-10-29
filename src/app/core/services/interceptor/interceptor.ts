import { HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-interceptor',
  imports: [],
  templateUrl: './interceptor.html',
  styleUrl: './interceptor.css',
})
export class Interceptor {

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Obtén el token de autenticación desde el servicio
    const authToken = localStorage.getItem('authToken');

    // Si el token existe, clona la petición y añade el header de autorización
    if (authToken) {
      // Clona la petición para agregar el nuevo encabezado.
      const authReq = request.clone({
        headers: request.headers.set('Authorization', `Bearer ${authToken}`)
      });

      // Envía la petición clonada con el encabezado.
      return next.handle(authReq);
    }

    // Si no hay token, deja pasar la petición original sin modificar.
    return next.handle(request);
  }

}
