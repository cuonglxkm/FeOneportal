import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { InstancesRoutingModule } from './instances-routing.module';
import { InstancesComponent } from './instances-list/instances.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { InstancesCreateComponent } from './instances-create/instances-create.component';
import { InstancesDetailComponent } from './instances-detail/instances-detail.component';
import { InstancesEditInfoComponent } from './instances-edit-info/instances-edit-info.component';
import { InstancesEditComponent } from './instances-edit/instances-edit.component';
import { InstancesConsoleComponent } from './instances-console/instances-console.component';
import { BlockstorageDetailComponent } from './instances-common/blockstorage-detail/blockstorage-detail.component';
import { NetworkDetailComponent } from './instances-common/network-detail/network-detail.component';
import { FullContentModule } from '@delon/abc/full-content';
import { SafePipe } from '../../../../../../libs/common-utils/src';
import { InstancesBtnComponent } from './instances-common/instances-btn/instances-btn.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import {
  NguCarousel,
  NguCarouselDefDirective,
  NguCarouselNextDirective,
  NguCarouselPrevDirective,
  NguItemComponent,
  NguTileComponent,
} from '@ngu/carousel';
import { CommonModule } from '@angular/common';
import { InstancesExtendComponent } from './instances-extend/instances-extend.component';
import { InstancesCreateVpcComponent } from './instances-create-vpc/instances-create-vpc.component';
import { InstancesEditVpcComponent } from './instances-edit-vpc/instances-edit-vpc.component';
import { ChartModule } from 'angular-highcharts';

@NgModule({
  declarations: [
    InstancesComponent,
    InstancesCreateComponent,
    InstancesDetailComponent,
    InstancesEditInfoComponent,
    InstancesEditComponent,
    InstancesConsoleComponent,
    NetworkDetailComponent,
    BlockstorageDetailComponent,
    InstancesBtnComponent,
    InstancesExtendComponent,
    InstancesCreateVpcComponent,
    InstancesEditVpcComponent,
  ],
  imports: [
    InstancesRoutingModule,
    SharedModule,
    FullContentModule,
    SafePipe,
    CarouselModule,
    SafePipe,
    NguCarousel,
    NguTileComponent,
    NguCarousel,
    NguCarouselDefDirective,
    NguCarouselNextDirective,
    NguCarouselPrevDirective,
    NguItemComponent,
    CommonModule,
    ChartModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class InstancesModule {}
