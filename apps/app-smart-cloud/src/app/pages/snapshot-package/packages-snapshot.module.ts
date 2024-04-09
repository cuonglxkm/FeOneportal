import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { ListPackagesSnapshotComponent } from './list/list-packages-snapshot.component';
import { PackageSnapshotRoutingModule } from './packages-snapshot-routing.module';
import { CommonModule } from '@angular/common';
import { CreatePackageSnapshotComponent } from './create/create-package-snapshot.component';


@NgModule({
  declarations: [
    ListPackagesSnapshotComponent,
    CreatePackageSnapshotComponent
  ],
  imports: [
    PackageSnapshotRoutingModule,
    CommonModule,
    SharedModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PackageSnapshotModule {}