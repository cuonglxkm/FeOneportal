import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import {
  NguCarousel,
  NguCarouselDefDirective,
  NguTileComponent,
} from '@ngu/carousel';
import { TrimDirective } from '../file-storage/TrimDirective';
import { WAFCreateComponent } from './create/waf-create.component';
import { CommonModule } from '@angular/common';
import { WAFRoutingModule } from './waf-routing.module';
import { CreateSSLCertPopupComponent } from './pop-up/create-ssl-cert/create-ssl-cert.component';
import { AddDomainComponent } from './add-domain/add-domain.component';
import { ListSslCertComponent } from './ssl-cert/list-ssl-cert/list-ssl-cert.component';
import { DeleteDomainComponent } from './pop-up/delete-domain/delete-domain.component';
import { EditDomainComponent } from './pop-up/edit-domain/edit-domain.component';
import { HttpSettingComponent } from './pop-up/http-setting/http-setting.component';
import { WAFResizeComponent } from './resize/waf-resize.component';
import { WafComponent } from './waf.component';
import { WafListComponent } from './waf-list/waf-list.component';
import { DeleteWafComponent } from './waf-list/delete-volume/delete-waf.component';
import { WafDomainListComponent } from './domain-list/domain-list.component';
import { WAFExtendComponent } from './extend/waf-extend.component';
import { CreateSslCertWAFComponent } from './ssl-cert/create/create-ssl-cert.component';
import { WafDetailComponent } from './waf-detail/waf-detail.component';
import { DisablePolicyComponent } from './pop-up/disable-policy/disable-policy.component';
import { SslCertDetailComponent } from './ssl-cert-detail/ssl-cert-detail.component';
import { DeleteSslCertComponent } from './pop-up/delete-ssl-cert/delete-ssl-cert.component';
import { AssociateSslDomainComponent } from './pop-up/associate-ssl-domain/associate-ssl-domain.component';
import { DisassociateSslDomainComponent } from './pop-up/disassociate-ssl-domain/disassociate-ssl-domain.component';
import { AssociateSslBtnComponent } from './ssl-cert/list-ssl-cert/list-ssl-cert-action-btn/associate-ssl-btn/associate-ssl-btn.component';
import { DeleteSslBtnComponent } from './ssl-cert/list-ssl-cert/list-ssl-cert-action-btn/delete-ssl-btn/delete-ssl-btn.component';
import { DisassociateDomainBtnComponent } from './ssl-cert-detail/disassociate-domain-btn/disassociate-domain-btn.component';
import { EditSslCertWAFComponent } from './ssl-cert/edit/edit-ssl-cert.component';

@NgModule({
  declarations: [
    WAFCreateComponent,
    CreateSSLCertPopupComponent,
    AddDomainComponent,
    ListSslCertComponent,
    DeleteDomainComponent,
    EditDomainComponent,
    HttpSettingComponent,
    WAFResizeComponent,
    WafComponent,
    WafListComponent,
    WafDomainListComponent,
    DeleteWafComponent,
    CreateSSLCertPopupComponent,
    WAFExtendComponent,
    CreateSslCertWAFComponent,
    WafDetailComponent,
    DisablePolicyComponent,
    SslCertDetailComponent,
    DeleteSslCertComponent,
    AssociateSslDomainComponent,
    DisassociateSslDomainComponent,
    AssociateSslBtnComponent,
    DeleteSslBtnComponent,
    DisassociateDomainBtnComponent,
    EditSslCertWAFComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    NguCarousel,
    NguCarouselDefDirective,
    NguTileComponent,
    WAFRoutingModule,
    TrimDirective,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class WAFModule {}
