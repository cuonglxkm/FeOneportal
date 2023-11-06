import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { V1Component } from './test/v1.component';
import { G2MiniBarModule } from '@delon/chart/mini-bar';
import { PagesRoutingModule } from './pages-routing.module';
import { SecurityGroupComponent } from './security-group/list/security-group.component';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { SharedModule } from '@shared';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { CreateSecurityGroupComponent } from './security-group/create/create-security-group.component';
import { CreateInboundComponent } from './security-group/inbound/create-inbound.component';
import { OutboundComponent } from './security-group/outbound/outbound.component';

@NgModule({
  declarations: [
    UserProfileComponent,
    V1Component,
    SecurityGroupComponent,
    CreateSecurityGroupComponent,
    CreateInboundComponent,
    OutboundComponent,
    OutboundComponent,
  ],
  imports: [
    CommonModule,
    G2MiniBarModule,
    PagesRoutingModule,
    NzLayoutModule,
    SharedModule,
    NzSpaceModule,
    NzPageHeaderModule,
  ],
})
export class PagesModule {}
