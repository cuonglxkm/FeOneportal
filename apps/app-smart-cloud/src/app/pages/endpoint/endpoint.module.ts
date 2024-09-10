import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import {
  NguCarousel,
  NguCarouselDefDirective,
  NguTileComponent,
} from '@ngu/carousel';
import { TrimDirective } from '../file-storage/TrimDirective';
import { NgxEchartsModule } from 'ngx-echarts';
import { EndpointRoutingModule } from './endpoint-routing.module';
import { CommonModule } from '@angular/common';
import { EndpointListComponent } from './list/endpoint-list.component';
import { EndpointCreateComponent } from './create/endpoint-create.component';

@NgModule({
  declarations: [
    EndpointListComponent,
    EndpointCreateComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    NguCarousel,
    NguCarouselDefDirective,
    NguTileComponent,
    EndpointRoutingModule,
    TrimDirective,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EndpointModule {}
