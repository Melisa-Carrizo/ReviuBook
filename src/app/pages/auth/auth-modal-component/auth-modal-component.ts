import { Component, inject, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LoginForm } from '../login-form/login-form';
import { RegisterForm } from '../register-form/register-form';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule, MatTabGroup } from '@angular/material/tabs';


@Component({
  selector: 'app-auth-modal-component',
  imports: [ LoginForm, RegisterForm, MatDialogModule,
    MatTabsModule,   
    MatIconModule,   
    MatButtonModule, ],
  templateUrl: './auth-modal-component.html',
  styleUrl: './auth-modal-component.css',
})
export class AuthModalComponent implements AfterViewInit {

  public dialogRef = inject(MatDialogRef<AuthModalComponent>);
  public data = inject(MAT_DIALOG_DATA, { optional: true });
  
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  
  // Inicializar selectedTabIndex basado en los datos si están disponibles
  selectedTabIndex = this.data?.selectedTab ?? 0;

  ngAfterViewInit(): void {
    // Asegurar que la pestaña correcta esté seleccionada después de que la vista se inicialice
    if (this.data?.selectedTab !== undefined && this.tabGroup) {
      // Usar setTimeout para asegurar que el tabGroup esté completamente inicializado
      setTimeout(() => {
        if (this.tabGroup) {
          this.tabGroup.selectedIndex = this.data.selectedTab;
          this.selectedTabIndex = this.data.selectedTab;
        }
      }, 0);
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  onLoginSuccess(responseData: any): void {
    this.dialogRef.close(responseData);
  }

  onRegisterSuccess(responseData: any): void {
    this.dialogRef.close(responseData);
  }
}
