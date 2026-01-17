import { Component, computed, inject, signal } from '@angular/core';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { Book } from '../../../core/models/Book';
import { BookPreviewComponent } from "../book-preview-component/book-preview-component";
import { BookService } from '../../../core/services/book-service';
import { Router } from '@angular/router';
import { SnackbarService } from '../../../core/services/snackbar-service';
import { Page } from '../../../core/models/Page';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, finalize, map, of, switchMap } from 'rxjs';
import { PaginationBar } from "../../../shared/components/pagination-bar/pagination-bar";
import { FilterPanelComponent } from '../../../shared/components/filter-panel/filter-panel.component';
import { Category } from '../../home/home-filter.types';

const EMPTY_BOOK_PAGE: Page<Book> = {
    content: [],
    page: { number: 0, totalPages: 0, totalElements: 0, size: 0 }
};

@Component({
    selector: 'app-manage-books-component',
    imports: [BookPreviewComponent, PaginationBar, FilterPanelComponent],
    templateUrl: './manage-books-component.html',
    styleUrl: './manage-books-component.css',
})
export class ManageBooksComponent {
    private bookService = inject(BookService);
    private router = inject(Router);
    snackBar = inject(SnackbarService);
    currentPage = signal(0);

    titleDraft = signal<string>('');
    authorDraft = signal<string>('');
    categoryDraft = signal<string>('');
    statusDraft = signal<'all' | 'active' | 'inactive'>('all');

    titleFilter = signal<string | null>(null);
    authorFilter = signal<string | null>(null);
    categoryFilter = signal<string | null>(null);
    statusFilter = signal<'all' | 'active' | 'inactive'>('all');

    private loading = signal<boolean>(false);

    private readonly filters$ = combineLatest([
        toObservable(this.currentPage),
        toObservable(this.titleFilter),
        toObservable(this.authorFilter),
        toObservable(this.categoryFilter),
        toObservable(this.statusFilter)
    ]).pipe(
        map(([page, title, author, category, status]) => ({
            page,
            title: title?.trim() || null,
            author: author?.trim() || null,
            category: category?.trim() || null,
            active: status === 'all' ? null : status === 'active'
        }))
    );

    booksPage = toSignal(
        this.filters$.pipe(
            switchMap((filters) => {
                this.loading.set(true);
                return this.bookService.searchAdminBooks(filters).pipe(
                    catchError(err => {
                        console.error(err);
                        this.snackBar.openErrorSnackBar('Error al cargar la lista de libros.');
                        return of(EMPTY_BOOK_PAGE);
                    }),
                    finalize(() => this.loading.set(false))
                );
            })
        ),
        { initialValue: EMPTY_BOOK_PAGE }
    );
    isLoading = computed(() => this.loading());

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

    onTitleDraftChange(value: string) {
        this.titleDraft.set(value ?? '');
    }

    onStatusDraftChange(value: string) {
        const v = value === 'active' ? 'active' : (value === 'inactive' ? 'inactive' : 'all');
        this.statusDraft.set(v as 'all' | 'active' | 'inactive');
    }

    onAuthorDraftChange(value: string) {
        this.authorDraft.set(value ?? '');
    }

    onCategoryDraftChange(value: string) {
        this.categoryDraft.set(value ?? '');
    }

    onApplyFilters() {
        const title = this.titleDraft().trim();
        this.titleFilter.set(title ? title : null);
        const author = this.authorDraft().trim();
        this.authorFilter.set(author ? author : null);
        const category = this.categoryDraft().trim();
        this.categoryFilter.set(category ? category : null);
        this.statusFilter.set(this.statusDraft());
        this.currentPage.set(0);
    }

    readonly availableCategories: string[] = Object.values(Category);
}