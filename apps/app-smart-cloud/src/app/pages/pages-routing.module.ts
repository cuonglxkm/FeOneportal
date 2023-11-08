import {RouterModule, Routes} from "@angular/router";
import {UserProfileComponent} from "./user-profile/user-profile.component";
import {NgModule} from "@angular/core";
import {V1Component} from "./test/v1.component";
import {SecurityGroupComponent} from "./security-group/list/security-group.component";
import {CreateSecurityGroupComponent} from "./security-group/create/create-security-group.component";
import {CreateInboundComponent} from "./security-group/inbound/create-inbound.component";
import {OutboundComponent} from "./security-group/outbound/outbound.component";
import {ListAllowAddressPairComponent} from "./allow-address-pair/list/list-allow-address-pair.component";

const routes: Routes = [
  {path: '', redirectTo: 'user-profile', pathMatch: 'full'},
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
    path: 'create-security-group',
    component: CreateSecurityGroupComponent
  },
  {
    path: 'create-inbound',
    component: CreateInboundComponent
  },
  {
    path: 'create-outbound',
    component: OutboundComponent
  },
  {
    path: 'allow-address-pair',
    component: ListAllowAddressPairComponent
  }

]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule {
}
