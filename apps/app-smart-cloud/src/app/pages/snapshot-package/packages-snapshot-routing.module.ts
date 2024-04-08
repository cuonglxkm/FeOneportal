import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ListPackagesSnapshotComponent } from "./list/list-packages-snapshot.component";
import { CreatePackageSnapshotComponent } from "./create/create-package-snapshot.component";
import { DetailSnapshotComponent } from "./detail/detail-package-snapshot.component";

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
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PackageSnapshotRoutingModule {}
