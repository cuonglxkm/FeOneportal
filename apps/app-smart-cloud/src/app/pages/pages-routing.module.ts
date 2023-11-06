import {RouterModule, Routes} from "@angular/router";
import {UserProfileComponent} from "./user-profile/user-profile.component";
import {NgModule} from "@angular/core";
import {PreloadOptionalModules} from "@delon/theme";
import {environment} from "@env/environment";
import {V1Component} from "./test/v1.component";
import {SecurityGroupComponent} from "./security-group/list/security-group.component";
import {CreateSecurityGroupComponent} from "./security-group/create/create-security-group.component";
import {CreateInboundComponent} from "./security-group/inbound/create-inbound.component";
import {OutboundComponent} from "./security-group/outbound/outbound.component";

const routes: Routes = [
  { path: '', redirectTo: 'user-profile', pathMatch: 'full' },
  {
    path: 'user-profile',
    component: UserProfileComponent
  },
  {
    path: 'vm',
    component: V1Component
  },
  {
    path: 'security-group',
    component: SecurityGroupComponent
  },
  {
    path:'create-security-group',
    component: CreateSecurityGroupComponent
  },
  {
    path: 'create-inbound',
    component: CreateInboundComponent
  },
  {
    path: 'create-outbound',
    component: OutboundComponent
  }

]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule {}
