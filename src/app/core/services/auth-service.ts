import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { Observable, switchMap, tap } from 'rxjs';
import { LoginRequest } from '../models/login-request';
import { RegisterRequest } from '../models/register-request';
import { Token } from '../models/token';
import { User } from '../models/User';
import { jwtDecode } from 'jwt-decode';
import { UserService } from './user-service';

@Injectable({
  providedIn: 'root'
})
export class ApiConnectionAuth {

  private apiUrl = 'http://localhost:8080/auth';
  private http = inject(HttpClient);
  private userService = inject(UserService);
  currentUser = signal<User | null>(this.getUserFromStorage());
  isLoggedIn = computed(() => this.currentUser() !== null);

  login(credentials: LoginRequest): Observable<User> { 
    return this.http.post<Token>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('authToken', response.token);
        }
      }),
      switchMap(() => this.userService.getUserProfileByToken()),
      tap(user => {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUser.set(user);
      })
    );
}

  register(data: Partial<RegisterRequest>): Observable<string> {
    return this.http.post(`${this.apiUrl}/register`, data, {
      responseType: 'text'
    });
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.currentUser.set(null);
  }

  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? (JSON.parse(userJson) as User) : null;
  }

  private decodeToken(token: string): User {
    try {
      const decoded: any = jwtDecode(token);
      return {
        username: decoded.username || decoded.sub || 'Usuario',
        email: decoded.email || ''
      };
    } catch (error) {
      console.error('Error decodificando el token:', error);
      return { username: 'Usuario', email: 'error@mail.com' };
    }
  }
}
