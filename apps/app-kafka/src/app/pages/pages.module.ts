import { NgModule } from '@angular/core';
import { DetailComponent } from './detail/detail.component';
import { PagesRoutingModule } from './pages-routing.module';
import { SharedModule } from '../shared/shared.module';
import { SummaryServiceComponent } from './detail/summary-service/summary-service.component';

@NgModule({
  declarations: [DetailComponent, SummaryServiceComponent],
  imports: [PagesRoutingModule, SharedModule],
})
export class PagesModule {}
