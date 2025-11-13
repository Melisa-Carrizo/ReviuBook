import { Component, inject, OnInit, signal } from '@angular/core';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { Book } from '../../../core/models/Book';
import { BookPreviewComponent } from "../book-preview-component/book-preview-component";
import { BookService } from '../../../core/services/book-service';
import { Router } from '@angular/router';
import { SnackbarService } from '../../../core/services/snackbar-service';

@Component({
    selector: 'app-manage-books-component',
    imports: [BookPreviewComponent],
    templateUrl: './manage-books-component.html',
    styleUrl: './manage-books-component.css',
})
export class ManageBooksComponent implements OnInit{
    private bookService = inject(BookService);
    private router = inject(Router);
    snackBar = inject(SnackbarService);
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
                this.snackBar.openErrorSnackBar('Error al cargar la lista de libros.');
            }
        });
    }

    goToAddBook(){
        this.router.navigate(['admin/libros/agregar']);
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
                            this.snackBar.openSuccessSnackBar('¡Libro borrado!');

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

                            this.snackBar.openErrorSnackBar(errorMessage);
                        }
                    }
                );
            }
        });
    }
}