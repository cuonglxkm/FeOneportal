import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';

import { RouteRoutingModule } from './routes-routing.module';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { FullContentModule } from '@delon/abc/full-content';
import { WelcomeComponent } from './welcome/welcome.component';
import { ModalResetPassComponent } from '../layout/basic/widgets/modal-resetpass.component';
import { PhoneValidatorDirective } from '../shared/directive/PhoneValidatorDirective';
import { CreateUserComponent } from './user-profile/create-user/create-user.component';

const COMPONENTS: Array<Type<null>> = [];

@NgModule({
  imports: [SharedModule, RouteRoutingModule, NzSpaceModule, FullContentModule, PhoneValidatorDirective],
  declarations: [
    ...COMPONENTS,
    UserProfileComponent,
    WelcomeComponent,
    ModalResetPassComponent,
    CreateUserComponent,
  ],
})
export class RoutesModule {}
