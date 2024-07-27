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

@NgModule({
  declarations: [
   WAFCreateComponent,
   CreateSSLCertPopupComponent,
   WAFResizeComponent
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
