import { Component, inject, OnInit, signal } from '@angular/core';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { Book } from '../../../core/models/Book';
import { BookPreviewComponent } from "../book-preview-component/book-preview-component";
import { BookService } from '../../../core/services/book-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-books-component',
  imports: [BookPreviewComponent],
  templateUrl: './manage-books-component.html',
  styleUrl: './manage-books-component.css',
})
export class ManageBooksComponent implements OnInit{
  private bookService = inject(BookService);
  private router = inject(Router);
  snackBar = inject(MatSnackBar);
  public books: Book[] = [];
  isLoading: boolean = true;
  hasBooks: boolean = false;

    ngOnInit(): void {
        this.loadBooks();
    }

    loadBooks(): void {
        this.isLoading = true;
        this.bookService.getAll().subscribe({
            next: (data) => {
                this.books = data;
                this.isLoading = false;
                this.hasBooks = this.books && this.books.length > 0;
            },
            error: (err) => {
                console.error('Error al cargar libros:', err);
                this.isLoading = false;
                this.snackBar.open('Error al cargar la lista de libros.', 'Cerrar', { duration: 5000 });
            }
        });
    }

    onEditBook(book: Book){
      this.router.navigate(['admin/libros/editar/', book.id]);
    }

    onDeleteBook(book: Book) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: '¡No podrás revertir esto!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, ¡eliminar!',
            cancelButtonText: 'Cancelar'
        }).then((result: SweetAlertResult<any>) => { // Añadir SweetAlertResult<any> para tipado
            if (result.isConfirmed) {
                this.bookService.delete(book.id).subscribe(
                    {
                        next: () => {
                            this.snackBar.open('¡Libro borrado!', '', {
                                duration: 3000,
                                horizontalPosition: 'center',
                                verticalPosition: 'top',
                                panelClass: ['success-snackbar']
                            });

                            // 🚨 ACTUALIZACIÓN CLAVE: Actualización local del estado
                            const index = this.books.findIndex(b => b.id === book.id);
                            if (index !== -1) {
                                // Crea una copia del objeto para activar la detección de cambios de Angular
                                this.books[index] = { ...this.books[index], status: false };
                            }
                        },
                        error: (err) => {
                            let errorMessage = 'Error desconocido al borrar el libro.';
                            if (err.status === 403) {
                                errorMessage = 'No tienes permisos (403) para realizar esta acción.';
                            } else if (err.status === 404) {
                                errorMessage = 'El libro no fue encontrado (404).';
                            } else if (err.error && err.error.message) {
                                errorMessage = `Error: ${err.error.message}`;
                            }

                            this.snackBar.open(errorMessage, '', {
                                duration: 5000,
                                horizontalPosition: 'center',
                                verticalPosition: 'top',
                                panelClass: ['error-snackbar']
                            });
                        }
                    }
                );
            }
        });
    }
}