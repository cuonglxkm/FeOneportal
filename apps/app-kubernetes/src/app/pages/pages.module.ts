import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { G2MiniBarModule } from '@delon/chart/mini-bar';
import { PagesRoutingModule } from './pages-routing.module';
import { SharedModule } from '@shared';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { IconDefinition } from '@ant-design/icons-angular';
import { SearchOutline, SettingOutline } from '@ant-design/icons-angular/icons';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { SHARED_ZORRO_MODULES } from '../shared/shared-zorro.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SEModule } from '@delon/abc/se';
import { LayoutDefaultModule } from '@delon/theme/layout-default';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { AngJsoneditorModule } from '@maaxgr/ang-jsoneditor';
import { ClipboardModule } from 'ngx-clipboard';
import { IsPermissionPipe } from '../shared/pipes/is-permission.pipe';
import { LogsComponent } from './logs/logs.component';
import {
  DetailClusterComponent,
  RowDetailData,
} from './detail-cluster/detail-cluster.component';
import { ListClusterComponent } from './list-cluster/list-cluster.component';
import { Status2ColorPipe } from '../pipes/status2color.pipe';
import { Network2Label } from '../pipes/network-type.pipe';
import { TruncateLabel } from '../pipes/truncate-label.pipe';
import { CalculateDate } from '../pipes/calculate-date.pipe';
import { ProgressPipe } from '../pipes/progress.pipe';
import { CheckUpgradeVersionPipe } from '../pipes/check-version.pipe';
import { ClusterComponent } from './cluster/cluster.component';
import { OverallComponent } from './overall/overall.component';
import { Action2Label } from '../pipes/action2label.pipe';
import { NguCarousel, NguCarouselDefDirective, NguCarouselNextDirective, NguCarouselPrevDirective, NguItemComponent, NguTileComponent } from '@ngu/carousel';
import { CustomCurrencyPipe } from '../pipes/custom-currency.pipe';
import { GetWorkerGroupValue } from '../pipes/worker-group-value.pipe';

const icons: IconDefinition[] = [SettingOutline, SearchOutline];

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    IsPermissionPipe,
    ListClusterComponent,
    ClusterComponent,
    DetailClusterComponent,
    RowDetailData,
    Status2ColorPipe,
    Network2Label,
    TruncateLabel,
    CalculateDate,
    ProgressPipe,
    Action2Label,
    CheckUpgradeVersionPipe,
    LogsComponent,
    OverallComponent,
    CustomCurrencyPipe,
    GetWorkerGroupValue,

  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    G2MiniBarModule,
    PagesRoutingModule,
    NzResultModule,
    SHARED_ZORRO_MODULES,
    SEModule,
    SharedModule,
    NzPaginationModule,
    NzResultModule,
    SharedModule,
    PagesRoutingModule,
    NzLayoutModule,
    SharedModule,
    NzSpaceModule,
    NzPageHeaderModule,
    NzIconModule.forRoot(icons),
    NzResultModule,
    NgOptimizedImage,
    NzImageModule,
    NzImageModule,
    LayoutDefaultModule,
    DragDropModule,
    NgxJsonViewerModule,
    // Starting Angular 13
    AngJsoneditorModule,
    ClipboardModule,
    NguCarousel,
    NguCarouselDefDirective,
    NguCarouselNextDirective,
    NguCarouselPrevDirective,
    NguItemComponent,
    NguTileComponent,
    NzImageModule,

  ],
})
export class PagesModule { }
