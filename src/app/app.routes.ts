import { Routes } from '@angular/router';
import { BookSheetComponent } from './pages/booksheet/book-sheet/book-sheet';
import { HomeComponent } from './pages/home/home-component/home-component';
import { UserProfile } from './pages/userProfile/user-profile/user-profile';
import { authGuard } from './core/guards/auth-guard';
import { AdminLayoutComponent } from './pages/admin/layout/admin-layout-component/admin-layout-component';
import { adminGuardGuard } from './core/guards/admin-guard-guard';
import { ManageBooksComponent } from './pages/admin/manage-books-component/manage-books-component';
import { ManageUsersComponent } from './pages/admin/manage-users-component/manage-users-component';
import { EditBookComponent } from './pages/admin/edit-book-component/edit-book-component';

export const routes: Routes = [
    {path:'', redirectTo:'home', pathMatch:'full'},
    {path:'home', component:HomeComponent},
    {path: 'libro/:id', component: BookSheetComponent},
    {path: 'profile', component: UserProfile, canActivate: [authGuard]},
    {path: 'admin',component: AdminLayoutComponent, canActivate: [adminGuardGuard]},
    {path: 'admin/libros', component: ManageBooksComponent, canActivate: [adminGuardGuard] },
    {path: 'admin/libros/editar/:id', component: EditBookComponent, canActivate: [adminGuardGuard] },
    {path: 'admin/usuarios', component: ManageUsersComponent, canActivate: [adminGuardGuard] },
];
