import {RouterModule, Routes} from "@angular/router";
import {UserProfileComponent} from "./user-profile/user-profile.component";
import {NgModule} from "@angular/core";
import {V1Component} from "./test/v1.component";
import {SecurityGroupComponent} from "./security-group/list-security-group/security-group.component";
import {CreateSecurityGroupComponent} from "./security-group/create-security-group/create-security-group.component";
import {CreateInboundComponent} from "./security-group/inbound/create/create-inbound.component";
import {CreateOutboundComponent} from "./security-group/outbound/create/create-outbound.component";
import {ListAllowAddressPairComponent} from "./allow-address-pair/list/list-allow-address-pair.component";
import {BlankSecurityGroupComponent} from "./security-group/blank-security-group/blank-security-group.component";
import {PreloadOptionalModules} from "@delon/theme";
import {environment} from "@env/environment";
import { SshKeyComponent } from "./ssh-key/ssh-key.component";
import { IpPublicComponent } from "./ip-public/ip-public.component";
import {CreateUpdateIpPublicComponent} from "./ip-public/create-update-ip-public/create-update-ip-public.component";
import {VolumeComponent} from "./volume/component/list-volume/volume.component";
import {CreateVolumeComponent} from "./volume/component/create-volume/create-volume.component";
import {DetailVolumeComponent} from "./volume/component/detail-volume/detail-volume.component";
import {EditVolumeComponent} from "./volume/component/edit-volume/edit-volume.component";
import {SnapshotVolumeListComponent} from "./snapshot-volume/snapshotvl-list/snapshotvl-list.component";
import {SnappshotvlDetailComponent} from "./snapshot-volume/snapshotvl-detail/snappshotvl-detail.component";
import {BlankBackupVmComponent} from "./backup-vm/blank/blank-backup-vm.component";
import {ListBackupVmComponent} from "./backup-vm/list/list-backup-vm.component";
import {RestoreBackupVmComponent} from "./backup-vm/restore/restore-backup-vm.component";
import {DetailBackupVmComponent} from "./backup-vm/detail/detail-backup-vm.component";
import {CreateBackupVmComponent} from "./backup-vm/create/create-backup-vm.component";

const routes: Routes = [
  {path: '', redirectTo: 'instances', pathMatch: 'full'},
  {
    path: 'user-profile',
    component: UserProfileComponent
  },
  {
    path: 'test',
    component: V1Component
  },
  {
    path: 'volume',
    component: VolumeComponent
  },
  {
    path: 'volume/create',
    component: CreateVolumeComponent
  },
  {
    path: 'volume/detail/:id',
    component: DetailVolumeComponent
  },
  {
    path: 'volume/edit/:id',
    component: EditVolumeComponent
  },
  {
    path: "ssh-key",
    component: SshKeyComponent
  },
  {
    path: 'instances',
    loadChildren: () => import('../pages/instances/instances.module').then(m => m.InstancesModule)
  },
  {
    path: "ip-public",
    component: IpPublicComponent
  },
  {
    path: "ip-public/create",
    component: CreateUpdateIpPublicComponent
  },
  {
    path: 'security-group',
    component: SecurityGroupComponent
  },
  {
    path: 'create-security-group',
    component: CreateSecurityGroupComponent
  },
  {
    path: 'create-security-group-inbound',
    component: CreateInboundComponent
  },
  {
    path: 'create-security-group-outbound',
    component: CreateOutboundComponent
  },
  {
    path: 'allow-address-pair',
    component: ListAllowAddressPairComponent
  },
  {
    path: 'blank-security-group',
    component: BlankSecurityGroupComponent
  },
  {
    path: 'snapshotvls',
    component: SnapshotVolumeListComponent
  },
  {
    path: 'snapshotvls/detail/:id',
    component: SnappshotvlDetailComponent
  },
  {
    path: 'blank-backup-vm',
    component: BlankBackupVmComponent
  },
  {
    path: 'backup-vm',
    component: ListBackupVmComponent
  },
  {
    path: 'backup-vm/restore-backup-vm',
    component: RestoreBackupVmComponent
  },
  {
    path: 'backup-vm/detail-backup-vm/:id',
    component: DetailBackupVmComponent
  },
  {
    path: 'instance/:id/create-backup-vm',
    component: CreateBackupVmComponent
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule {
}
