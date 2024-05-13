import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ListPackagesSnapshotComponent } from "./list/list-packages-snapshot.component";
import { CreatePackageSnapshotComponent } from "./create/create-package-snapshot.component";
import { DetailSnapshotComponent } from "./detail/detail-package-snapshot.component";
import { ResizeSnapshotPackageComponent } from "./resize/resize-snapshot-package.component";

const routes: Routes = [
  {
    path: '',
    component: ListPackagesSnapshotComponent,
  },
  {
    path: 'create',
    component: CreatePackageSnapshotComponent,
  },
  {
    path: ':id',
    component: DetailSnapshotComponent,
  },
  {
    path: 'edit/:id',
    component: ResizeSnapshotPackageComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PackageSnapshotRoutingModule {}
