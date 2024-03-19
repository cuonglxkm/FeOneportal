import { SettingOutline, SearchOutline } from '@ant-design/icons-angular/icons';
import { IconDefinition } from '@ant-design/icons-angular';
import { SEModule } from '@delon/abc/se';
import { NzResultModule } from 'ng-zorro-antd/result';
import { G2MiniBarModule } from '@delon/chart/mini-bar';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';

import { RemoteEntryComponent } from './entry.component';
import { NxWelcomeComponent } from './nx-welcome.component';
import { remoteRoutes } from './entry.routes';
import { KubernetesDetailComponent } from '../list-cluster/list-cluster.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzImageModule } from 'ng-zorro-antd/image';
import { LayoutDefaultModule } from '@delon/theme/layout-default';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { ClusterComponent } from '../cluster/cluster.component';
import { SharedModule } from '../shared';
import { SHARED_ZORRO_MODULES } from '../shared/shared-zorro.module';
import { Status2ColorPipe } from '../pipes/status2color.pipe';
import { DetailClusterComponent, RowDetailData } from '../detail-cluster/detail-cluster.component';
import { Network2Label } from '../pipes/network-type.pipe';
import { TruncateLabel } from '../pipes/truncate-label.pipe';
import { CalculateDate } from '../pipes/calculate-date.pipe';
import { ShareService } from '../services/share.service';
import { ProgressPipe } from '../pipes/progress.pipe';

const icons: IconDefinition[] = [SettingOutline, SearchOutline];

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    RemoteEntryComponent,
    NxWelcomeComponent,
    KubernetesDetailComponent,
    ClusterComponent,
    DetailClusterComponent,
    RowDetailData,
    Status2ColorPipe,
    Network2Label,
    TruncateLabel,
    CalculateDate,
    ProgressPipe,

  ],
  imports: [
    CommonModule,
    RouterModule.forChild(remoteRoutes),
    ReactiveFormsModule,
    G2MiniBarModule,
    NzResultModule,
    SEModule,
    NzPaginationModule,
    NzResultModule,
    NzLayoutModule,
    NzSpaceModule,
    NzPageHeaderModule,
    NzIconModule.forRoot(icons),
    NzResultModule,
    NgOptimizedImage,
    NzImageModule,
    LayoutDefaultModule,
    DragDropModule,
    NgxJsonViewerModule,
    SHARED_ZORRO_MODULES,
    SharedModule,

  ],
  providers: [ShareService],
})
export class RemoteEntryModule {}
