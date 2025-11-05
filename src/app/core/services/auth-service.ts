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
  private authToken = signal<string | null>(localStorage.getItem('authToken'));
  private forcedLogout = false;

  currentUser = signal<User | null>(this.getUserFromStorage());
  isLoggedIn = computed(() => this.isTokenValid(this.authToken()));
  isAdmin = computed(()=>this.currentUser()?.role==='ADMIN');

  constructor() {
    this.validateStoredSession();
  }
  
  login(credentials: LoginRequest): Observable<User> { 
    return this.http.post<Token>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('authToken', response.token);
          this.authToken.set(response.token);
        }
      }),
      switchMap(() => this.userService.getUserProfileByToken()),
      tap(user => {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUser.set(user);
          this.forcedLogout = false;
      })
    );
  }

  register(data: Partial<RegisterRequest>): Observable<string> {
    return this.http.post(`${this.apiUrl}/register`, data, {
      responseType: 'text'
    });
  }

  logout(options?: { forced?: boolean }): void {
    const forced = options?.forced ?? false;
    this.forcedLogout = forced;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.authToken.set(null);
    this.currentUser.set(null);
  }

  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? (JSON.parse(userJson) as User) : null;
  }

  private validateStoredSession(): void {
    const token = this.authToken();
    if (!this.isTokenValid(token)) {
      this.logout({ forced: true });
    }
  }

  syncSessionFromStorage(): void {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken !== this.authToken()) {
      this.authToken.set(storedToken);
    }

    if (!this.isTokenValid(storedToken)) {
      if (storedToken) {
        this.logout({ forced: true });
      } else {
        this.currentUser.set(null);
      }
      return;
    }

    const storedUser = this.getUserFromStorage();
    this.currentUser.set(storedUser);
  }

  private isTokenValid(token: string | null): boolean {
    if (!token) {
      return false;
    }
    try {
      const decoded = jwtDecode<{ exp?: number | string }>(token);
      const expirationRaw = decoded?.exp;

      if (expirationRaw === undefined || expirationRaw === null) {
        return true;
      }

      const expirationNumber = typeof expirationRaw === 'string'
        ? Number(expirationRaw)
        : expirationRaw;

      if (Number.isNaN(expirationNumber)) {
        return false;
      }

      const expirationTime = expirationNumber > 1_000_000_000_000
        ? expirationNumber
        : expirationNumber * 1000;

      return expirationTime > Date.now();
    } catch (error) {
      return false;
    }
  }

  refreshCurrentUser(): void {
    this.userService.getUserProfileByToken().subscribe(user => {
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUser.set(user);
    });
  }

  wasForcedLogout(): boolean {
    return this.forcedLogout;
  }
  
}
