import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject, signal, computed } from '@angular/core';
import { map, Observable, switchMap, tap } from 'rxjs';
import { LoginRequest } from '../models/login-request';
import { RegisterRequest } from '../models/register-request';
import { Token } from '../models/token';
import { User } from '../models/User';
//import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:8080/user';
  private http = inject(HttpClient);

  getUserProfileByToken(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}`).pipe(
      map(user => {
        // Eliminar información sensible
        const publicUserData: User = {
          username: user.username,
          email: user.email,
          role: user.role,
          status: user.status
          // Agregar otros campos públicos según sea necesario
        };
        return publicUserData;
      })
    );  
  }

  getById(id: number) {
    return this.http.get<User>(`${this.apiUrl}/${id}`)
  }

  /*
  Este queda en desuso por que precisa autenticacion desde el back
  getUsernameById(id: number): Observable<string> {
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
        // solo traea el nombre de usuario
        map(user => user.username) 
    );
  }
  */

  // Devuelve directamente el Username,
  // Se usa responseType para que Angular no intente parsearlo a JSON
  getUsernameById(id: number) {
    return this.http.get(`${this.apiUrl}/username/${id}`, {
      responseType: 'text'
    });
  }

  getAll(){
    return this.http.get<User[]>(`${this.apiUrl}/all`);
  }

  updateUserProfile(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}`, user);
  }

}