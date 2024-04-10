import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import {
  NguCarousel,
  NguCarouselDefDirective,
  NguTileComponent,
} from '@ngu/carousel';
import { VpnSiteToSiteManage } from './manage/vpn-site-to-site-manage.component';
import { VpnConnection } from './manage/vpn-connection/vpn-connection.component';
import { IpsecPoliciesComponent } from './manage/ipsec-policies/ipsec-policies.component';
import { IkePoliciesComponent } from './manage/ike-policies/ike-policies.component';
import { VpnService } from './manage/vpn-service/vpn-service.component';
import { EndpointGroupComponent } from './manage/endpoint-group/endpoint-group.component';
import { BlankVpnSiteToSiteComponent } from './blank/blank-vpn-site-to-site.component';
import { CommonModule } from '@angular/common';
import { VpnSiteToSiteRoutingModule } from './vpn-site-to-site-routing.module';
import { DeleteIpsecPoliciesComponent } from './manage/ipsec-policies/delete/ipsec-policies.component';
import { CreateIpsecPoliciesComponent } from './manage/ipsec-policies/create/create-ipsec-policies.component';
import { EditIpsecPoliciesComponent } from './manage/ipsec-policies/edit/edit-ipsec-policies.component';
import { DetailIpsecPoliciesComponent } from './manage/ipsec-policies/detail/detail-ipsec-policies.component';
import { CreateVpnConnectionComponent } from './manage/vpn-connection/create/create-vpn-connection.component';
import { EditVpnConnectionComponent } from './manage/vpn-connection/edit/edit-vpn-connection.component';
import { DeleteVpnConnectionComponent } from './manage/vpn-connection/delete/delete-vpn-connection.component';
import { DetailVpnConnectionComponent } from './manage/vpn-connection/detail/detail-vpn-connection.component';
import { CreateIkePoliciesComponent } from './manage/ike-policies/create/create-ike-policies.component';
import { VpnS2sCreateComponent } from './manage/vpn-s2s-create/vpn-s2s-create.component';
import { DetailVpnServiceComponent } from './manage/vpn-service/detail/detail-vpn-service.component';
import { EditIkePoliciesComponent } from './manage/ike-policies/edit/edit-ike-policies.component';
import { DeleteIkePoliciesComponent } from './manage/ike-policies/delete/delete-ike-policies.component';
import { DetailIkePoliciesComponent } from './manage/ike-policies/detail/detail-ike-policies.component';
import { VpnS2sExtendComponent } from './manage/vpn-s2s-extend/vpn-s2s-extend.component';
import { VpnS2sResizeComponent } from './manage/vpn-s2s-resize/vpn-s2s-resize.component';
import { CreateVpnServiceComponent } from './manage/vpn-service/create/create-vpn-service.component';
import { DeleteVpnServiceComponent } from './manage/vpn-service/delete/delete-vpn-service.component';
import { EditVpnServiceComponent } from './manage/vpn-service/edit/edit-vpn-service.component';
import { CreateEndpointGroupComponent } from './manage/endpoint-group/create/create-endpoint-group.component';
import { DetailEndpointGroupComponent } from './manage/endpoint-group/detail/detail-endpoint-group.component';
import { DeleteEndpointGroupComponent } from './manage/endpoint-group/delete/delete-endpoint-group.component';
import { EditEndpointGroupComponent } from './manage/endpoint-group/edit/edit-endpoint-group.component';

@NgModule({
  declarations: [
    VpnSiteToSiteManage,
    VpnConnection,
    IpsecPoliciesComponent,
    IkePoliciesComponent,
    VpnService,
    EndpointGroupComponent,
    BlankVpnSiteToSiteComponent,
    DeleteIpsecPoliciesComponent,
    CreateIpsecPoliciesComponent,
    EditIpsecPoliciesComponent,
    DetailIpsecPoliciesComponent,
    CreateVpnConnectionComponent,
    EditVpnConnectionComponent,
    DeleteVpnConnectionComponent,
    DetailVpnConnectionComponent,
    CreateIkePoliciesComponent,
    EditIkePoliciesComponent,
    DetailVpnServiceComponent,
    DeleteIkePoliciesComponent,
    DetailIkePoliciesComponent,
    VpnS2sCreateComponent,
    DetailVpnServiceComponent,
    VpnS2sExtendComponent,
    VpnS2sResizeComponent,
    CreateVpnServiceComponent,
    DeleteVpnServiceComponent,
    EditVpnServiceComponent,
    DetailVpnServiceComponent,
    CreateEndpointGroupComponent,
    DetailEndpointGroupComponent,
    DeleteEndpointGroupComponent,
    EditEndpointGroupComponent
  ],
  imports: [
    VpnSiteToSiteRoutingModule,
    CommonModule,
    SharedModule,
    NguCarousel,
    NguCarouselDefDirective,
    NguTileComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class VpnSiteToSiteModule {}
