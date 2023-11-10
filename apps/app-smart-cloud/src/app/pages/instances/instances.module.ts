import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { InstancesRoutingModule } from './instances-routing.module';
import { InstancesComponent } from './instances-list/instances.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { InstancesCreateComponent } from './instances-create/instances-create.component';
import { InstancesDetailComponent } from './instances-detail/instances-detail.component';

@NgModule({
  declarations: [
    InstancesComponent,
    InstancesCreateComponent,
    InstancesDetailComponent,
  ],
  imports: [InstancesRoutingModule, SharedModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class InstancesModule {}
