import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ActionCode } from '@config/actionCode';

import { RoleManageComponent } from './role-manage.component';
import { SetRoleComponent } from './set-role/set-role.component';

const routes: Routes = [
  {
    path: '',
    component: RoleManageComponent,
    data: { title: 'Role', key: 'role-manage' }
  },
  {
    path: 'set-role',
    component: SetRoleComponent,
    data: {
      title: 'Role',
      key: 'set-role',
      authCode: ActionCode.RoleManagerSetRole
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoleManageRoutingModule {}
