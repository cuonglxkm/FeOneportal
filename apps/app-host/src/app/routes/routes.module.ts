import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';

import { RouteRoutingModule } from './routes-routing.module';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { FullContentModule } from '@delon/abc/full-content';
import { WelcomeComponent } from './welcome/welcome.component';

const COMPONENTS: Array<Type<null>> = [];

@NgModule({
  imports: [SharedModule, RouteRoutingModule, NzSpaceModule, FullContentModule],
  declarations: [...COMPONENTS, UserProfileComponent, WelcomeComponent],
})
export class RoutesModule {}
