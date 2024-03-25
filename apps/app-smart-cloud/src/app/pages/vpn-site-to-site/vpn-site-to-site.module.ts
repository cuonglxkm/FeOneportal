import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { SharedModule } from '@shared';


import {NguCarousel, NguCarouselDefDirective, NguTileComponent} from "@ngu/carousel";
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
import { CreateIkePoliciesComponent } from './manage/ike-policies/create/create-ike-policies.component';

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
    CreateIkePoliciesComponent
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
