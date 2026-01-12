import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject, signal, computed } from '@angular/core';
import { map, Observable, switchMap, tap } from 'rxjs';
import { LoginRequest } from '../models/login-request';
import { RegisterRequest } from '../models/register-request';
import { Token } from '../models/token';
import { User } from '../models/User';
import { Book } from '../models/Book';
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

  // Obtiene la lista de favoritos de un usuario por su email
  getFavoriteListByEmail(email: string): Observable<Book[]> {
    type UserFavoritesResponse = {
      favoriteList?: unknown[];
      [key: string]: unknown;
    };

    return this.http.get<UserFavoritesResponse>(`${this.apiUrl}/email/${email}`).pipe(
      map((res) => this.normalizeFavoriteList(res.favoriteList))
    );
  }

  // Obtiene el objeto de usuario crudo por email (para acceder a IDs de reviews, etc.)
  getUserByEmailRaw(email: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/email/${email}`);
  }

  private normalizeFavoriteList(list: unknown): Book[] {
    if (!Array.isArray(list)) {
      return [];
    }

    return list
      .map((entry) => this.mapFavoriteEntry(entry))
      .filter((book): book is Book => !!book);
  }

  private mapFavoriteEntry(entry: any): Book | null {
    if (!entry) {
      return null;
    }

    if (typeof entry === 'string' || typeof entry === 'number') {
      return {
        id: Number(entry) || 0,
        category: '',
        description: '',
        releaseDate: new Date(),
        status: true,
        urlImage: '',
        ISBN: '',
        title: '',
        author: '',
        publishingHouse: ''
      };
    }

    const source = entry.book ?? entry.bookSheet ?? entry.bookDTO ?? entry;
    const releaseDateValue = source.releaseDate ?? entry.releaseDate ?? Date.now();

    return {
      id: source.id ?? entry.id ?? 0,
      category: source.category ?? entry.category ?? '',
      description: source.description ?? entry.description ?? '',
      releaseDate: new Date(releaseDateValue),
      status: source.status ?? entry.status ?? true,
      urlImage: source.urlImage ?? source.imageUrl ?? source.cover ?? entry.urlImage ?? entry.imageUrl ?? '',
      ISBN: source.ISBN ?? source.isbn ?? entry.ISBN ?? entry.isbn ?? '',
      title: source.title ?? source.bookTitle ?? entry.title ?? entry.bookTitle ?? '',
      author: source.author ?? entry.author ?? '',
      publishingHouse: source.publishingHouse ?? source.editorial ?? entry.publishingHouse ?? entry.editorial ?? ''
    };
  }
}