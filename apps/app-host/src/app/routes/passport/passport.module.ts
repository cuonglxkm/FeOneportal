import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { CallbackComponent } from './callback.component';
import { UserLockComponent } from './lock/lock.component';
import { UserLoginComponent } from './login/login.component';
import { PassportRoutingModule } from './passport-routing.module';
import { UserRegisterComponent } from './register/register.component';
import { UserRegisterResultComponent } from './register-result/register-result.component';
import {NzCollapseModule} from "ng-zorro-antd/collapse";

const COMPONENTS = [UserLoginComponent, UserRegisterResultComponent, UserRegisterComponent, UserLockComponent, CallbackComponent];

@NgModule({
  imports: [SharedModule, PassportRoutingModule, NzCollapseModule],
  declarations: [...COMPONENTS]
})
export class PassportModule {}
