import { Routes } from '@angular/router';
import { BookSheetComponent } from './pages/booksheet/book-sheet/book-sheet';
import { HomeComponent } from './pages/home/home-component/home-component';

export const routes: Routes = [
    {path:'', redirectTo:'home', pathMatch:'full'},
    {path:'home', component:HomeComponent},
    {path: 'libro/:id', component: BookSheetComponent}
];
