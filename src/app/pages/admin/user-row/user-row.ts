import { Component, input } from '@angular/core';
import { User } from '../../../core/models/User';

@Component({
  selector: 'app-user-row',
  imports: [],
  templateUrl: './user-row.html',
  styleUrl: './user-row.css',
})
export class UserRow {
  user = input.required<User>();
}
