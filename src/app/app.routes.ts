import { Routes } from '@angular/router';
import { BookSheetComponent } from './pages/booksheet/book-sheet/book-sheet';
import { HomeComponent } from './pages/home/home-component/home-component';
import { UserProfile } from './pages/userProfile/user-profile/user-profile';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    {path:'', redirectTo:'home', pathMatch:'full'},
    {path:'home', component:HomeComponent},
    {path: 'libro/:id', component: BookSheetComponent},
    {path: 'profile', component: UserProfile, canActivate: [authGuard]}
];
