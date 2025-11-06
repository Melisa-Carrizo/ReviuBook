import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserService } from '../../../core/services/user-service';
import { SnackbarService } from '../../../core/services/snackbar-service';
import { catchError, Observable, of } from 'rxjs';
import { User } from '../../../core/models/User';
import { UserRow } from '../user-row/user-row';

@Component({
  selector: 'app-manage-users-component',
  imports: [UserRow],
  templateUrl: './manage-users-component.html',
  styleUrl: './manage-users-component.css',
})
export class ManageUsersComponent {
  private _userService = inject(UserService);
  private _snackbarService = inject(SnackbarService); // Inyecta el servicio de notificaciones

  // 1. Define el Observable de usuarios con la lógica de manejo de errores.
  users$: Observable<User[]> = this._userService.getAll().pipe(
    // 2. Usamos 'catchError' para interceptar el error.
    catchError((error) => {
      // 3. Muestra el snackbar aquí, antes de que el Observable termine.
      console.error("Fallo la carga de datos:", error);
      this._snackbarService.openErrorSnackBar('No se pudieron cargar los datos. Intente de nuevo más tarde.');
      
      // 4. Retorna un Observable con un valor por defecto (ej. array vacío) 
      //    para que la Signal no falle y termine su ejecución.
      return of([]); 
    })
  );

  // 5. Convierte el Observable modificado (con el catchError) a Signal.
  //    Si falla, 'users' será un array vacío ([]), y no un error.
  users = toSignal(this.users$, { initialValue: [] });
}
