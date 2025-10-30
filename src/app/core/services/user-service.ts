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

  private apiUrl = 'http://localhost:8080/user/logged';
  private http = inject(HttpClient);

  getUserProfileByToken(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}`).pipe(
      map(user => {
        // Eliminar información sensible
        const publicUserData: User = {
          username: user.username,
          email: user.email,
          // Agregar otros campos públicos según sea necesario
        };
        return publicUserData;
      })
    );  
  }
}
