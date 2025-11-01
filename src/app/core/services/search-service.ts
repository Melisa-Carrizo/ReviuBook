import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  public searchTerm = signal<string>(''); // guarda el termino de busqueda

  // actualiza el termino de busqueda
  setSearchTerm(term: string) {
    this.searchTerm.set(term);
  }
}
