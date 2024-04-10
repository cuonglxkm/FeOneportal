import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { CommonModule } from '@angular/common';
import { CreatePackageSnapshotComponent } from './create/create-package-snapshot.component';
import { DetailSnapshotComponent } from './detail/detail-package-snapshot.component';
import { ListPackagesSnapshotComponent } from './list/list-packages-snapshot.component';
import { PackageSnapshotRoutingModule } from './packages-snapshot-routing.module';
import { ResizeSnapshotPackageComponent } from './resize/resize-snapshot-package.component';


@NgModule({
  declarations: [
    ListPackagesSnapshotComponent,
    CreatePackageSnapshotComponent,
    DetailSnapshotComponent,
    ResizeSnapshotPackageComponent
  ],
  imports: [
    PackageSnapshotRoutingModule,
    CommonModule,
    SharedModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PackageSnapshotModule {}
