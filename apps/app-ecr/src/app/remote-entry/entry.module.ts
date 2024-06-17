import { LoadingModule } from '@delon/abc/loading';
import { IconDefinition } from '@ant-design/icons-angular';
import { NguCarousel, NguCarouselDefDirective, NguCarouselNextDirective, NguCarouselPrevDirective, NguItemComponent, NguTileComponent } from '@ngu/carousel';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { RemoteEntryComponent } from './entry.component';
import { NxWelcomeComponent } from './nx-welcome.component';
import { remoteRoutes } from './entry.routes';
import { ListServiceComponent } from '../pages/list-service/list-service.component';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { ReactiveFormsModule } from '@angular/forms';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { PageHeaderModule } from '@delon/abc/page-header';
import { NzIconModule } from 'ng-zorro-antd/icon';
import * as AllIcons from '@ant-design/icons-angular/icons';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { SharedModule } from '../shared';
import { NzListModule } from 'ng-zorro-antd/list';
import { Status2ColorPipe } from '../pipes/status2color.pipe';

const antDesignIcons = AllIcons as {
  [key: string]: IconDefinition;
};
const icons: IconDefinition[] = Object.keys(antDesignIcons).map(
  (key) => antDesignIcons[key]
);
@NgModule({
  declarations: [
    RemoteEntryComponent, 
    NxWelcomeComponent,
    Status2ColorPipe,
    ListServiceComponent
  ],
  imports: [
    CommonModule, 
    RouterModule.forChild(remoteRoutes),
    NgApexchartsModule,
    NzDrawerModule,
    NzDescriptionsModule,
    ReactiveFormsModule,
    NzPageHeaderModule,
    PageHeaderModule,
    NzIconModule.forChild(icons),
    NguCarousel,
    NguCarouselDefDirective,
    NguCarouselNextDirective,
    NguCarouselPrevDirective,
    NguItemComponent,
    NguTileComponent,
    LoadingModule,
    NzNotificationModule,
    SharedModule,
    NzListModule,
  ],
  providers: [],
})
export class RemoteEntryModule {}
