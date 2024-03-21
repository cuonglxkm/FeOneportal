import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import { VpnSiteToSiteManage } from "./manage/vpn-site-to-site-manage.component";
import { CreateIpsecPoliciesComponent } from "./manage/ipsec-policies/create/create-ipsec-policies.component";
import { EditIpsecPoliciesComponent } from "./manage/ipsec-policies/edit/edit-ipsec-policies.component";
import { DetailIpsecPoliciesComponent } from "./manage/ipsec-policies/detail/detail-ipsec-policies.component";
import { CreateVpnConnectionComponent } from "./manage/vpn-connection/create/create-vpn-connection.component";

const routes: Routes = [
  {
    path: 'manage',
    component: VpnSiteToSiteManage,
  },
  {
    path: 'ipsec-policies/create',
    component: CreateIpsecPoliciesComponent,
  },
  {
    path: 'ipsec-policies/edit/:id',
    component: EditIpsecPoliciesComponent,
  },
  {
    path: 'ipsec-policies/:id',
    component: DetailIpsecPoliciesComponent,
  },
  {
    path: 'vpn-connection/create',
    component: CreateVpnConnectionComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VpnSiteToSiteRoutingModule {}
