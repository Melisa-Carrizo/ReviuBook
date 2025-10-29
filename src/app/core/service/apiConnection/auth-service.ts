import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginRequest } from '../../../features/auth/models/login-request';
import { Token } from '../../../features/auth/models/token';
import { tap } from 'rxjs/operators';
import { RegisterRequest } from '../../../features/auth/models/register-request';

@Injectable({
  providedIn: 'root'
})
export class ApiConnectionAuth {

  private apiUrl = 'http://localhost:8080/auth'
  private http = inject(HttpClient);


  login(credentials : LoginRequest): Observable<Token> {

    return this.http.post<Token>(`${this.apiUrl}/login`, credentials).pipe(
      // aca puedes manejar la respuesta, guardar tokens, etc.
      tap(response =>{
        // si hay una respuesta y si la respuesta tiene un token
        if(response && response.token){

          // guardo el token en el localStorage
          localStorage.setItem('authToken',response.token)

        }
       })

    );

  }

  register(data: Partial<RegisterRequest>): Observable<RegisterRequest> {
    return this.http.post<RegisterRequest>(`${this.apiUrl}/register`, data)
  }


}
