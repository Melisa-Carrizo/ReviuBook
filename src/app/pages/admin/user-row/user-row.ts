import { Component, input, inject, output } from '@angular/core';
import { User } from '../../../core/models/User';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserProfileModalComponent } from '../../../shared/components/user-profile-modal/user-profile-modal';

@Component({
  selector: 'app-user-row',
  imports: [MatDialogModule],
  templateUrl: './user-row.html',
  styleUrl: './user-row.css',
})
export class UserRow {
  user = input.required<User>();
  private dialog = inject(MatDialog);
  statusChanged = output<{ email: string; status: boolean }>();

  openEditModal() {
    const u = this.user();
    const userId = (u as any)?.id;
    const dialogRef = this.dialog.open(UserProfileModalComponent, {
      maxWidth: '900px',
      width: '100%',
      maxHeight: '90vh',
      autoFocus: false,
      hasBackdrop: true,
      data: {
        email: u.email,
        username: u.username,
        id: userId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.statusChanged.emit(result);
    });
  }
}
