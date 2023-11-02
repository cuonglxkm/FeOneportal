import { NgModule } from '@angular/core';
import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user.component';
import { DeptTreeComponent } from './dept-tree/dept-tree.component';
import { SharedModule } from '@shared/shared.module';
import { NzHighlightModule } from 'ng-zorro-antd/core/highlight';
import { UserModalModule } from '@widget/biz-widget/system/user-modal/user-modal.module';

@NgModule({
  declarations: [UserComponent, DeptTreeComponent],
  imports: [UserModalModule, SharedModule, UserRoutingModule, NzHighlightModule]
})
export class UserModule { }
