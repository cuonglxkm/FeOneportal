import { NgModule } from '@angular/core';
import { G2BarModule } from '@delon/chart/bar';
import { G2CustomModule } from '@delon/chart/custom';
import { G2MiniAreaModule } from '@delon/chart/mini-area';
import { G2MiniBarModule } from '@delon/chart/mini-bar';
import { G2TimelineModule } from '@delon/chart/timeline';
import { NgApexchartsModule } from 'ng-apexcharts';
import { SharedModule } from '../shared/shared.module';
import { CredentialsComponent } from './detail/credentials/credentials.component';
import { DashboardComponent } from './detail/dashboard/dashboard.component';
import { DetailComponent } from './detail/detail.component';
import { SummaryServiceComponent } from './detail/summary-service/summary-service.component';
import { PagesRoutingModule } from './pages-routing.module';



@NgModule({
  declarations: [
    DetailComponent,
    DashboardComponent,
    SummaryServiceComponent,
    CredentialsComponent,
  ],
  imports: [
    PagesRoutingModule,
    SharedModule,
    G2MiniBarModule,
    G2CustomModule,
    G2BarModule,
    G2TimelineModule,
    G2MiniAreaModule,
    NgApexchartsModule,
  ],
})
export class PagesModule {}
