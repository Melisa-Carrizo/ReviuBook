import { Routes } from '@angular/router';
import { BookSheetComponent } from './pages/booksheet/book-sheet/book-sheet';

export const routes: Routes = [
    {path: 'libro/:id', component: BookSheetComponent}
];
