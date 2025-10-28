<<<<<<< HEAD
import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
=======
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { LoginForm } from '../../../../features/auth/components/login-form/login-form';
import { AuthModalComponent } from '../../../../features/auth/components/auth-modal-component/auth-modal-component';

@Component({
  selector: 'app-navbar',
  imports: [ MatButtonModule ],
>>>>>>> ea04707 (coding login with Angular Materials and implements in the navbar)
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {

  // 3. Inyecta el servicio MatDialog
  readonly #dialog = inject(MatDialog);

  // 4. Función para abrir el modal
  openLoginModal(): void {
    
    // 2. Abre 'AuthModalComponent', no 'LoginForm'
    const dialogRef = this.#dialog.open(AuthModalComponent, {
      width: '450px',
      autoFocus: false, // Evita que enfoque el primer campo automáticamente

      // 3. ¡IMPORTANTE! 
      //    Añade la 'panelClass' que definimos en styles.scss.
      //    Esto es clave para que el diseño (sin padding) funcione.
      panelClass: 'auth-dialog-container' 
    });

    // 4. (Opcional pero recomendado)
    //    Así es como tu Header "escucha" cuando el login es exitoso.
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Login/Registro exitoso, datos:', result);
        // Aquí podrías actualizar la UI del header 
        // (ej. cambiar "Login" por "Mi Perfil")
      } else {
        console.log('Modal cerrado sin acción');
      }
    });
  }
}
