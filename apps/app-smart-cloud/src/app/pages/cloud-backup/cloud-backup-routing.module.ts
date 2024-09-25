import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import { CloudBackupCreateComponent } from "./create/cloud-backup-create.component";
import { CloudBackupComponent } from "./cloud-backup.component";
import { CloudBackupResizeComponent } from "./resize/cloud-backup-resize.component";
import { CloudBackupExtendComponent } from "./extend/cloud-backup-extend.component";
import { CloudBackupCreateVpcComponent } from "./create-vpc/cloud-backup-create-vpc.component";
const routes: Routes = [
  {
    path: '',
    component: CloudBackupComponent,
  },
  {
    path: 'create',
    component: CloudBackupCreateComponent,
  },
  {
    path: 'vpc/create',
    component: CloudBackupCreateVpcComponent,
  },
  {
    path: 'extend/:id',
    component: CloudBackupExtendComponent,
  },
  {
    path: 'resize/:id',
    component: CloudBackupResizeComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CloudBackupRoutingModule {}
