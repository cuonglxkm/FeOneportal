import { NgModule } from '@angular/core';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';

import { RoleManageRoutingModule } from '@app/pages/system/role-manager/role-manage-routing.module';
import { RoleService } from '@core/services/firebase/role.service';
import { environment } from '@env/environment';
import { SharedModule } from '@shared/shared.module';
import { RoleManageModalModule } from '@widget/biz-widget/system/role-manage-modal/role-manage-modal.module';

import { RoleManageComponent } from './role-manage.component';
import { SetRoleComponent } from './set-role/set-role.component';

@NgModule({
  declarations: [RoleManageComponent, SetRoleComponent],
  imports: [SharedModule, RoleManageModalModule, RoleManageRoutingModule],
  providers: [
    { provide: FIREBASE_OPTIONS, useValue: environment.firebase },
    RoleService
  ]
})
export class RoleManageModule { }
