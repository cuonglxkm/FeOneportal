import { Component, Input } from '@angular/core';

@Component({
  selector: 'one-portal-user-role',
  templateUrl: './user-role.component.html',
  styleUrls: ['./user-role.component.css'],
})
export class UserRoleComponent {
  @Input() serviceCode : string;
}
