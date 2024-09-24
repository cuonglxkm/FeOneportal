import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import { CloudBackupCreateComponent } from "./create/cloud-backup-create.component";
import { CloudBackupComponent } from "./cloud-backup.component";
const routes: Routes = [
  {
    path: '',
    component: CloudBackupComponent,
  },
  {
    path: 'create',
    component: CloudBackupCreateComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CloudBackupRoutingModule {}
