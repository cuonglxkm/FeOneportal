import {RouterModule, Routes} from "@angular/router";
import {NgModule, inject} from "@angular/core";
import { VpnSiteToSiteManage } from "./manage/vpn-site-to-site-manage.component";
import { CreateIpsecPoliciesComponent } from "./manage/ipsec-policies/create/create-ipsec-policies.component";
import { EditIpsecPoliciesComponent } from "./manage/ipsec-policies/edit/edit-ipsec-policies.component";
import { DetailIpsecPoliciesComponent } from "./manage/ipsec-policies/detail/detail-ipsec-policies.component";
import { CreateVpnConnectionComponent } from "./manage/vpn-connection/create/create-vpn-connection.component";
import { CreateIkePoliciesComponent } from "./manage/ike-policies/create/create-ike-policies.component";
import { EditVpnConnectionComponent } from "./manage/vpn-connection/edit/edit-vpn-connection.component";
import { DetailVpnConnectionComponent } from "./manage/vpn-connection/detail/detail-vpn-connection.component";
import { VpnS2sCreateComponent } from "./manage/vpn-s2s-create/vpn-s2s-create.component";
import { CreateEndpointGroupComponent } from "./manage/endpoint-group/create/create-endpoint-group.component";
import { DetailEndpointGroupComponent } from "./manage/endpoint-group/detail/detail-endpoint-group.component";

import { DetailVpnServiceComponent } from "./manage/vpn-service/detail/detail-vpn-service.component";
import { EditIkePoliciesComponent } from "./manage/ike-policies/edit/edit-ike-policies.component";
import { DetailIkePoliciesComponent } from "./manage/ike-policies/detail/detail-ike-policies.component";
import { VpnS2sExtendComponent } from "./manage/vpn-s2s-extend/vpn-s2s-extend.component";
import { VpnS2sResizeComponent } from "./manage/vpn-s2s-resize/vpn-s2s-resize.component";
import { PolicyService } from "src/app/shared/services/policy.service";
import { CreateVpnServiceComponent } from "./manage/vpn-service/create/create-vpn-service.component";
import { PermissionGuard } from "src/app/shared/guard/PermissionGuard";

const routes: Routes = [
  {
    path: 'manage',
    component: VpnSiteToSiteManage,
  },
  {
    path: 'create',
    component: VpnS2sCreateComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'order:Create'
    }
  },
  {
    path: 'extend/:vpcId',
    component: VpnS2sExtendComponent,
  },
  {
    path: 'resize/:vpcId',
    component: VpnS2sResizeComponent,
     canActivate: [PermissionGuard],
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
  {
    path: 'vpn-connection/edit/:id',
    component: EditVpnConnectionComponent,
  },
  {
    path: 'vpn-connection/:id',
    component: DetailVpnConnectionComponent,
  },
  {
    path: 'ike-policies/create',
    component: CreateIkePoliciesComponent,
  },
  {
    path: 'vpn-service/create',
    component: CreateVpnServiceComponent,
  },
  {
    path: 'ike-policies/edit/:id',
    component: EditIkePoliciesComponent,
  },
  {
    path: 'endpoint-group/create',
    component: CreateEndpointGroupComponent,
  },
  {
    path: 'endpoint-group/:id',
    component: DetailEndpointGroupComponent,
  },
  {
    path: 'vpn-service/:id',
    component: DetailVpnServiceComponent,
  },
  {
    path: 'ike-policies/:id',
    component: DetailIkePoliciesComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VpnSiteToSiteRoutingModule {}
