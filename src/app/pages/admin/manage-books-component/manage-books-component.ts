import { Component, computed, inject, OnInit, signal } from '@angular/core';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { Book } from '../../../core/models/Book';
import { BookPreviewComponent } from "../book-preview-component/book-preview-component";
import { BookService } from '../../../core/services/book-service';
import { Router } from '@angular/router';
import { SnackbarService } from '../../../core/services/snackbar-service';
import { Page } from '../../../core/models/Page';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { PaginationBar } from "../../../shared/components/pagination-bar/pagination-bar";

@Component({
    selector: 'app-manage-books-component',
    imports: [BookPreviewComponent, PaginationBar],
    templateUrl: './manage-books-component.html',
    styleUrl: './manage-books-component.css',
})
export class ManageBooksComponent {
    private bookService = inject(BookService);
    private router = inject(Router);
    snackBar = inject(SnackbarService);
    currentPage = signal(0);
    booksPage = toSignal(
        toObservable(this.currentPage).pipe(
            switchMap(page =>
            this.bookService.getAll(page).pipe(
                catchError(err => {
                console.error(err);
                this.snackBar.openErrorSnackBar('Error al cargar la lista de libros.');
                return of({
                    content: [],
                    page: { number: 0, totalPages: 0, totalElements: 0, size: 0 }
                });
                })
            )
            )
        ),
        { initialValue: { content: [], page: { number: 0, totalPages: 0, totalElements: 0, size: 0 } } }
    );
    isLoading = computed(() => {
        return this.booksPage().content.length === 0
        && this.booksPage().page.totalElements === 0;
    });

    hasBooks = computed(() => {
        return this.booksPage().content.length > 0;
    });
    
    pageMetaData = computed(() => {
        const page = this.booksPage().page;

        return {
            number: page.number,
            totalPages: page.totalPages,
            totalElements: page.totalElements,
            size: page.size
        };
    });

    onPageChange(page: number) {
        this.currentPage.set(page);
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
                            this.currentPage.set(this.currentPage()); // fuerza recarga
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