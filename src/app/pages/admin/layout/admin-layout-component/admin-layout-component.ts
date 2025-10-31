import { toSignal } from '@angular/core/rxjs-interop';
import { UserService } from './../../../../core/services/user-service';

import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-admin-layout-component',
  imports: [RouterLink],
  templateUrl: './admin-layout-component.html',
  styleUrl: './admin-layout-component.css',
})
export class AdminLayoutComponent {
  private userService = inject(UserService);

  user = toSignal(this.userService.getUserProfileByToken());
}
