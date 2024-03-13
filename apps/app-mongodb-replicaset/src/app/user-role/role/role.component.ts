import { Component } from '@angular/core';
import { CustomRoleComponent } from './custom-role/custom-role.component';
import { NzDrawerService } from 'ng-zorro-antd/drawer';

interface Person {
  name: string;
  age: number;
}

@Component({
  selector: 'one-portal-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css'],
})
export class RoleComponent {
  roleName?: string | undefined;
  visible = false;

  constructor(private drawerService : NzDrawerService) {}

  listOfData: Person[] = [
    {
      name: 'John Brown',
      age: 32
    },
    {
      name: 'Jim Green',
      age: 42
    },
    {
      name: 'Joe Black',
      age: 32
    }
  ];

  openFormCreateRole() {
    // console.log('create role')
    // this.visible = true

    const drawerRef = this.drawerService.create<CustomRoleComponent, { description: string }, string>({
      nzTitle: 'Thêm mới quyền',
      nzSize: 'large',
      nzContent: CustomRoleComponent,
      nzContentParams: {
        description: 'This is a description passed to Drawer'
      }
    });

  }

  closeFormCreateRole() {
    this.visible = false
  }

  updateRole() {
    console.log('update role')
    
  }

  deleteRole() {
    console.log('delete role')
  }
}
