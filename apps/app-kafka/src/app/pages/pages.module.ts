import { NgModule } from '@angular/core';
import { DetailComponent } from './detail/detail.component';
import { PagesRoutingModule } from './pages-routing.module';
import { SharedModule } from '../shared/shared.module';
import { SummaryServiceComponent } from './detail/summary-service/summary-service.component';
import { G2MiniBarModule } from '@delon/chart/mini-bar';
import { G2CustomModule } from '@delon/chart/custom';
import { G2BarModule } from '@delon/chart/bar';
import { G2TimelineModule } from '@delon/chart/timeline';
import { G2MiniAreaModule } from '@delon/chart/mini-area';
import { DashboardComponent } from './detail/dashboard/dashboard.component';

@NgModule({
  declarations: [
    DetailComponent,
    DashboardComponent,
    SummaryServiceComponent
  ],
  imports: [
    PagesRoutingModule,
    SharedModule,
    G2MiniBarModule,
    G2CustomModule,
    G2BarModule,
    G2TimelineModule,
    G2MiniAreaModule,
  ],
})
export class PagesModule {}
