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
import { WAFResizeComponent } from './resize/waf-resize.component';
import { WafComponent } from './waf.component';
import { WafListComponent } from './waf-list/waf-list.component';
import { DeleteWafComponent } from './waf-list/delete-volume/delete-waf.component';
import { WafDomainListComponent } from './domain-list/domain-list.component';

@NgModule({
  declarations: [
   WAFCreateComponent,
   CreateSSLCertPopupComponent,
   WAFResizeComponent,
   WafComponent,
   WafListComponent,
   WafDomainListComponent,
   DeleteWafComponent,
   CreateSSLCertPopupComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    NguCarousel,
    NguCarouselDefDirective,
    NguTileComponent,
    WAFRoutingModule,
    TrimDirective
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class WAFModule {}
