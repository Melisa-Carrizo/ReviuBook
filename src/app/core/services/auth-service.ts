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
  // Señales de solo lectura para exponer estado sin permitir escrituras externas
  token = computed(() => this.authToken());
  user = computed(() => this.currentUser());

  constructor() {
    this.validateStoredSession();
    this.setupStorageSync();
  }
  
  // --- Helpers centralizados para estado de sesión ---
  private setSession(token: string, user: User): void {
    // Persistencia
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    // Signals
    this.authToken.set(token);
    this.currentUser.set(user);
    // Una vez logueado, ya no estamos en forced logout
    this.forcedLogout = false;
  }

  private clearSession(forced: boolean): void {
    this.forcedLogout = forced;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.authToken.set(null);
    this.currentUser.set(null);
  }

  private setupStorageSync(): void {
    // Mantiene la sesión sincronizada entre pestañas/ventanas del navegador
    window.addEventListener('storage', (e: StorageEvent) => {
      if (e.key === 'authToken' || e.key === 'currentUser') {
        this.syncSessionFromStorage();
      }
    });
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
          const token = this.authToken();
          if (token) {
            this.setSession(token, user);
          } else {
            // Fallback: si por alguna razón no hay token, al menos setear el usuario
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUser.set(user);
            this.forcedLogout = false;
          }
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
    this.clearSession(forced);
  }

  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? (JSON.parse(userJson) as User) : null;
  }

  private validateStoredSession(): void {
    const token = this.authToken();
    // No limpiamos sesión automáticamente si el token es inválido/expirado;
    // dejamos que el guard/interceptor muestren el modal de sesión expirada
    // cuando el usuario intente realizar una acción.
    if (!this.isTokenValid(token)) {
      return;
    }
    // Si es válido, asegurar que el usuario esté sincronizado desde storage
    const storedUser = this.getUserFromStorage();
    this.currentUser.set(storedUser);
  }

  syncSessionFromStorage(): void {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken !== this.authToken()) {
      this.authToken.set(storedToken);
    }

    if (!this.isTokenValid(storedToken)) {
      // Mantener el token (aunque esté expirado) para que el guard/interceptor
      // puedan detectar y disparar el modal de sesión expirada en el momento adecuado.
      this.authToken.set(storedToken);
      const storedUser = this.getUserFromStorage();
      this.currentUser.set(storedUser);
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

  // Métodos utilitarios públicos
  currentToken(): string | null {
    return this.authToken();
  }

  getAuthorizationHeader(): Record<string,string> | null {
    const token = this.authToken();
    return token ? { Authorization: `Bearer ${token}` } : null;
  }
  
}
