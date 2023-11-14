import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { InstancesRoutingModule } from './instances-routing.module';
import { InstancesComponent } from './instances-list/instances.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { InstancesCreateComponent } from './instances-create/instances-create.component';
import { InstancesDetailComponent } from './instances-detail/instances-detail.component';
import { InstancesEditInfoComponent } from './instances-edit-info/instances-edit-info.component';
import { InstancesEditComponent } from './instances-edit/instances-edit.component';
import { NetworkDetailComponent } from './network-detail/network-detail.component';
import { BlockstorageDetailComponent } from './blockstorage-detail/blockstorage-detail.component';

@NgModule({
  declarations: [
    InstancesComponent,
    InstancesCreateComponent,
    InstancesDetailComponent,
    InstancesEditInfoComponent,
    InstancesEditComponent,
    NetworkDetailComponent,
    BlockstorageDetailComponent,
  ],
  imports: [InstancesRoutingModule, SharedModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class InstancesModule {}
