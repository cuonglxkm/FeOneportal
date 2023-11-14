import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { InstancesRoutingModule } from './instances-routing.module';
import { InstancesComponent } from './instances-list/instances.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { InstancesCreateComponent } from './instances-create/instances-create.component';
import { InstancesDetailComponent } from './instances-detail/instances-detail.component';
import { InstancesEditInfoComponent } from './instances-edit-info/instances-edit-info.component';
import { InstancesEditComponent } from './instances-edit/instances-edit.component';
import {InstancesConsoleComponent} from "./instances-console/instances-console.component";
import {FullContentModule} from "@delon/abc/full-content";
import {SafePipe} from "../../../../../../libs/common-utils/src";

@NgModule({
  declarations: [
    InstancesComponent,
    InstancesCreateComponent,
    InstancesDetailComponent,
    InstancesEditInfoComponent,
    InstancesEditComponent,
    InstancesConsoleComponent,
  ],
  imports: [InstancesRoutingModule, SharedModule, FullContentModule, SafePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class InstancesModule {}
