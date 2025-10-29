import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AuthModalComponent } from '../../../../pages/auth/auth-modal-component/auth-modal-component';

@Component({
  selector: 'app-navbar',
  imports: [ MatButtonModule ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {

  readonly #dialog = inject(MatDialog);

  openLoginModal(): void {
    
    const dialogRef = this.#dialog.open(AuthModalComponent, {
      width: '450px',
      autoFocus: false, // Evita que enfoque el primer campo automáticamente

      //    Añade la 'panelClass' que definimos en styles.css
      //    Esto es clave para que el diseño (sin padding) funcione
      panelClass: 'auth-dialog-container' 
    });

    //    Así es como tu Header "escucha" cuando el login es exitoso
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Login/Registro exitoso, datos:', result);
        // Aquí podrías actualizar la UI del header según el estado de autenticación
      } else {
        console.log('Modal cerrado sin acción');
      }
    });
  }
}
