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
import { SshKeyComponent } from "./ssh-key/ssh-key.component";
import { IpPublicComponent } from "./ip-public/ip-public.component";
import {CreateUpdateIpPublicComponent} from "./ip-public/create-update-ip-public/create-update-ip-public.component";
import {VolumeComponent} from "./volume/component/list-volume/volume.component";
import {CreateVolumeComponent} from "./volume/component/create-volume/create-volume.component";
import {DetailVolumeComponent} from "./volume/component/detail-volume/detail-volume.component";
import {EditVolumeComponent} from "./volume/component/edit-volume/edit-volume.component";
import { ActionHistoryComponent } from "./action-history/action-history.component";
import {SnapshotVolumeListComponent} from "./snapshot-volume/snapshotvl-list/snapshotvl-list.component";
import {SnappshotvlDetailComponent} from "./snapshot-volume/snapshotvl-detail/snappshotvl-detail.component";
import {BlankBackupVmComponent} from "./backup-vm/blank/blank-backup-vm.component";
import {ListBackupVmComponent} from "./backup-vm/list/list-backup-vm.component";
import {RestoreBackupVmComponent} from "./backup-vm/restore/restore-backup-vm.component";
import {DetailBackupVmComponent} from "./backup-vm/detail/detail-backup-vm.component";
import {CreateBackupVmComponent} from "./backup-vm/create/create-backup-vm.component";
import {
  CreateBackupVolumeComponent
} from "./volume/component/backup-volume/create-backup-volume/create-backup-volume.component";
import {
  DetailBackupVolumeComponent
} from "./volume/component/backup-volume/detail-backup-volume/detail-backup-volume.component";
import {
  ListBackupVolumeComponent
} from "./volume/component/backup-volume/list-backup-volume/list-backup-volume.component";
import {PolicyAttachComponent} from "./policy/policy-attach/policy-attach.component";
import {IamDashboardComponent} from "./iam/dashboard/iam-dashboard.component";
import {ListUserGroupComponent} from "./iam/user-group/list/list-user-group.component";
import {DetailUserGroupComponent} from "./iam/user-group/detail/detail-user-group.component";
import {CreateUserGroupComponent} from "./iam/user-group/create/create-user-group.component";
import { UserComponent } from "./users/user.component";
import { UserCreateComponent } from "./users/user-create/user-create.component";
import {PolicyDetachComponent} from "./policy/policy-detach/policy-detach.component";
import {PolicyDetailComponent} from "./policy/policy-detail/policy-detail.component";
import { UserDetailComponent } from "./users/user-detail/user-detail.component";
import { AddPoliciesComponent } from "./users/user-detail/add-policies/add-policies.component";
import { AddToGroupComponent } from "./users/user-detail/add-to-group/add-to-group.component";
import {CreateUserComponent} from "./iam/user-group/user/create/create-user.component";
import {CreatePolicyComponent} from "./iam/user-group/policy/create/create-policy.component";
import {PolicyUpdateComponent} from "./policy/policy-update/policy-update.component";
import {BlankScheduleBackupComponent} from "./schedule-backup/blank/blank-schedule-backup.component";
import {ListScheduleBackupComponent} from "./schedule-backup/list/list-schedule-backup.component";
import {CreateScheduleBackupComponent} from "./schedule-backup/create/create-schedule-backup.component";
import {
  EditScheduleBackupVmComponent
} from "./schedule-backup/edit/schedule-backup-vm/edit-schedule-backup-vm.component";
import {
  SnapshotScheduleListComponent
} from "./snapshot-schedule/snapshot-schedule-list/snapshot-schedule-list.component";
import {
  SnapshotScheduleCreateComponent
} from "./snapshot-schedule/snapshot-schedule-create/snapshot-schedule-create.component";
import {
  SnapshotScheduleDetailComponent
} from "./snapshot-schedule/snapshot-schedule-detai/snapshotp-schedule-detail.component";
import {
  EditScheduleBackupVolumeComponent
} from "./schedule-backup/edit/schedule-backup-volume/edit-schedule-backup-volume.component";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {DetailIpPublicComponent} from "./ip-public/detail-ip-public/detail-ip-public.component";
import { PaymentDetailComponent } from "./billing/payment/detail/payment-detail.component";
import { PaymentSuccessComponent } from "../shared/components/payment-success/payment-success.component";
import { PaymentFailedComponent } from "../shared/components/payment-failed/payment-failed.component";
import {OrderListComponent} from "./order/order-list/order-list.component";
import {ListPaymentComponent} from "./billing/payment/list/list-payment.component";
import {OrderDetailComponent} from "./order/order-detail/order-detail.component";
import {RenewVolumeComponent} from "./volume/component/renew-volume/renew-volume.component";
import {ExtendIpPublicComponent} from "./ip-public/extend-ip-public/extend-ip-public.component";
import { SnapshotScheduleEditComponent } from "./snapshot-schedule/snapshot-schedule-edit/snapshot-schedule-edit.component";
import {ListPackagesBackupComponent} from "./backup-package/list/list-packages-backup.component";
import {CreatePackageBackupComponent} from "./backup-package/create/create-package-backup.component";
import {DetailPackageBackupComponent} from "./backup-package/detail/detail-package-backup.component";
import {EditBackupPackageComponent} from "./backup-package/edit/edit-backup-package.component";
import {ExtendBackupPackageComponent} from "./backup-package/extend/extend-backup-package.component";
import { PaymentSummaryComponent } from "../shared/components/payment-summary/payment-summary.component";
import {CreateVolumeVpcComponent} from "./volume/component/create-volume-vpc/create-volume-vpc.component";
import {ResizeVolumeVpcComponent} from "./volume/component/resize-volume-vpc/resize-volume-vpc.component";
import {ListVlanComponent} from "./vlan/list/list-vlan.component";
import {BlankVolumeComponent} from "./volume/component/blank/blank-volume.component";
import {VlanDetailComponent} from "./vlan/detail/vlan-detail.component";
import { RouterListComponent } from "./routers/router-list.component";
import { RouterDetailComponent } from "./routers/router-detail/router-detail.component";
import { CreateNetworkComponent } from './vlan/create/create-network/create-network.component';
import { VlanCreateSubnetComponent } from './vlan/create/create-subnet/vlan-create-subnet.component';
import { VlanEditSubnetComponent } from './vlan/edit/edit-subnet/vlan-edit-subnet.component';
import { ListIpFloatingComponent } from './ip-floating/list-ip-floating.component';
import {BucketDetailComponent} from "./bucket/bucket-detail/bucket-detail.component";
import { BucketListComponent } from "./bucket/bucket-list.component";
import { BucketCreateComponent } from "./bucket/bucket-create/bucket-create.component";
import { BucketConfigureComponent } from "./bucket/bucket-configure/bucket-configure.component";
import { CreateFileSystemComponent } from './file-storage/file-system/action/create/create-file-system.component';
import { DetailFileSystemComponent } from './file-storage/file-system/action/detail/detail-file-system.component';
import { ExtendFileSystemComponent } from './file-storage/file-system/action/extend/extend-file-system.component';
import { ListAccessRuleComponent } from './file-storage/access-rule/list/list-access-rule.component';
import { ListSubUserComponent } from './sub-user/list/list-sub-user.component';
import { ListWanComponent } from './wan/list/list-wan.component';
import { ListFileSystemComponent } from './file-storage/file-system/list/list-file-system.component';
import { CreateSubUserComponent } from './sub-user/action/create/create-sub-user.component';
import { FileSystemSnapshotComponent } from "./file-system-snapshot/file-system-snapshot.component";
import { CreateFileSystemSnapshotComponent } from "./file-system-snapshot/create-file-system-snapshot/create-file-system-snapshot.component";
import { FileSystemSnapshotDetailComponent } from "./file-system-snapshot/file-system-snapshot-detail/file-system-snapshot-detai.componentl";
import { FileSystemSnapshotScheduleComponent } from "./file-system-snapshot-schedule/file-system-snapshot-schedule.component";
import { CreateFileSystemSnapshotScheduleComponent } from "./file-system-snapshot-schedule/create-file-system-snapshot-schedule/create-file-system-snapshot-schedule.component";
import { DashboardObjectStorageComponent } from './dashboard-object-storage/dashboard-object-storage.component';
import { ObjectStorageComponent } from "./object-storage/object-storage.component";
import { ObjectStorageCreateComponent } from "./object-storage/object-storage-create/object-storage-create.component";
import { ObjectStorageExtendComponent } from "./object-storage/object-storage-extend/object-storage-extend.component";
import { ObjectStorageEditComponent } from "./object-storage/object-storage-edit/object-storage-edit.component";

const routes: Routes = [
  {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'user-profile',
    component: UserProfileComponent
  },
  {
    path: 'test',
    component: V1Component
  },
  {
    path: 'volumes',
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
    path: "ip-public/detail/:id",
    component: DetailIpPublicComponent
  },
  {
    path: "ip-public/extend/:id",
    component: ExtendIpPublicComponent
  },
  {
    path: 'security-group',
    component: SecurityGroupComponent
  },
  {
    path: 'blank-security-group',
    component: BlankSecurityGroupComponent
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
    path: 'instance/:instanceId/allow-address-pair/:portId',
    component: ListAllowAddressPairComponent
  },
  {
    path: 'action-history',
    component: ActionHistoryComponent
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
    path: 'backup-vm/restore-backup-vm/:id',
    component: RestoreBackupVmComponent
  },
  {
    path: 'backup-vm/detail-backup-vm/:id',
    component: DetailBackupVmComponent
  },
  {
    path: 'instance/:id/create-backup-vm',
    component: CreateBackupVmComponent
  },
  {
    path: 'backup-volume/create',
    component: CreateBackupVolumeComponent
  },
  {
    path: 'backup-volume/detail',
    component: DetailBackupVolumeComponent
  },
  {
    path: 'backup-volume',
    component: ListBackupVolumeComponent
  },
  {
    path: 'iam/dashboard',
    component: IamDashboardComponent
  },
  {
    path: 'iam/user-group',
    component: ListUserGroupComponent
  },
  {
    path: 'iam/user-group/create',
    component: CreateUserGroupComponent
  },
  {
    path: 'iam/user-group/:name',
    component: DetailUserGroupComponent
  },
  {
    path: 'policy/attach/:name',
    component: PolicyAttachComponent
  },
  {
    path: 'policy/detach/:name',
    component: PolicyDetachComponent
  },
  {
    path: 'policy/detail/:name',
    component: PolicyDetailComponent
  },
  {
    path: 'policy/update/:name',
    component: PolicyUpdateComponent
  },
  {
    path: 'policy',
    loadChildren: () => import('../pages/policy/policy.module').then(m => m.PolicyModule)
  },
  {
    path: 'users',
    component: UserComponent
  },
  {
    path: 'users/create',
    component: UserCreateComponent
  },
  {
    path: 'users/detail/:userName',
    component: UserDetailComponent
  },
  {
    path: 'users/detail/:userName/add-policies',
    component: AddPoliciesComponent
  },
  {
    path: 'users/detail/:userName/add-to-group',
    component: AddToGroupComponent
  },
  {
    path: 'iam/user-group/:groupName/add-user',
    component: CreateUserComponent
  },
  {
    path: 'iam/user-group/:groupName/add-policy',
    component: CreatePolicyComponent
  },
  {
    path: 'schedule/backup/blank',
    component: BlankScheduleBackupComponent
  },
  {
    path: 'schedule/backup/list',
    component: ListScheduleBackupComponent
  },
  {
    path: 'schedule/backup/create',
    component: CreateScheduleBackupComponent
  },
  {
    path: 'schedule/backup/edit/vm/:id',
    component: EditScheduleBackupVmComponent
  },
  {
    path: 'schedule/backup/edit/volume/:id',
    component: EditScheduleBackupVolumeComponent
  },
  {
    path: 'schedule/snapshot/list',
    component: SnapshotScheduleListComponent
  },
  {
    path: 'schedule/snapshot/create',
    component: SnapshotScheduleCreateComponent
  },
  {
    path: 'schedule/snapshot/detail/:id',
    component: SnapshotScheduleDetailComponent
  },
  {
    path: 'schedule/snapshot/edit/:id',
    component: SnapshotScheduleEditComponent
  },
  {
    path: 'billing/payments/detail/:id',
    component: PaymentDetailComponent
  },
  {
    path: 'billing/payments/success',
    component: PaymentSuccessComponent
  },
  {
    path: 'paymentFailed',
    component: PaymentFailedComponent
  },
  {
    path: 'billing/payments',
    component: ListPaymentComponent
  },
  {
    path: 'order/list',
    component: OrderListComponent
  },
  {
    path: 'order/detail/:id',
    component: OrderDetailComponent
  },
  {
    path: 'volumes/renew/:id',
    component: RenewVolumeComponent
  },
  {
    path: 'backup/packages',
    component: ListPackagesBackupComponent
  },
  {
    path: 'backup/packages/detail/:id',
    component: DetailPackageBackupComponent
  },
  {
    path: 'backup/packages/create',
    component: CreatePackageBackupComponent
  },
  {
    path: 'backup/packages/edit/:id',
    component: EditBackupPackageComponent
  },
  {
    path: 'backup/packages/extend/:id',
    component: ExtendBackupPackageComponent
  },
  {
    path: 'order/cart',
    component: PaymentSummaryComponent
  },
  {
    path: 'volume/vpc/create',
    component: CreateVolumeVpcComponent
  },
  {
    path: 'volume/vpc/resize/:id',
    component: ResizeVolumeVpcComponent
  },
  {
    path: 'volume/blank',
    component: BlankVolumeComponent
  },
  {
    path: 'vlan/network/list',
    component: ListVlanComponent
  },
  {
    path: 'vlan/network/detail/:id',
    component: VlanDetailComponent
  },
  {
    path: 'vpc',
    loadChildren: () => import('../pages/vpc/vpc.module').then(m => m.VpcModule)
  },
  {
    path: 'network/router',
    component: RouterListComponent
  },
  {
    path: 'network/router/detail/:id',
    component: RouterDetailComponent
  },
  {
    path: 'vlan/create/network',
    component: CreateNetworkComponent
  },
  {
    path: 'vlan/:id/create/subnet',
    component: VlanCreateSubnetComponent
  },
  {
    path: 'vlan/:id/network/edit/subnet/:subnetId',
    component: VlanEditSubnetComponent
  },
  {
    path:'networks/ip-floating/list',
    component: ListIpFloatingComponent
  },
  {
    path:'networks/ip-wan/list',
    component: ListWanComponent
  },
  {
    path: 'file-storage/file-system/create',
    component: CreateFileSystemComponent
  },
  {
    path: 'file-storage/file-system/list',
    component: ListFileSystemComponent
  },
  {
    path: 'file-storage/file-system/detail/:id',
    component: DetailFileSystemComponent
  },
  {
    path: 'file-storage/file-system/extend/:id',
    component: ExtendFileSystemComponent
  },
  {
    path: 'file-storage/file-system/:idFileSystem/access-rule/list',
    component: ListAccessRuleComponent
  },
  {
    path: 'object-storage/sub-user/list',
    component: ListSubUserComponent
  },
  {
    path: 'object-storage/sub-user/create',
    component: CreateSubUserComponent
  },
  {
    path: 'object-storage/dashboard',
    component: DashboardObjectStorageComponent
  },
  {
    path: 'networks/ip-floating/list',
    component: ListIpFloatingComponent,
  },
  {
    path: 'file-system-snapshot/list',
    component: FileSystemSnapshotComponent,
  },
  {
    path: 'file-system-snapshot/create',
    component: CreateFileSystemSnapshotComponent,
  },
  {
    path: 'file-system-snapshot/detail/:id',
    component: FileSystemSnapshotDetailComponent,
  },
  {
    path: 'file-system-snapshot-schedule/list',
    component: FileSystemSnapshotScheduleComponent,
  },
  {
    path: 'file-system-snapshot-schedule/create',
    component: CreateFileSystemSnapshotScheduleComponent,
  },
  {
    path: 'object-storage/bucket',
    component: BucketListComponent
  },
  {
    path: 'object-storage/bucket/create',
    component: BucketCreateComponent
  },
  {
    path: 'object-storage/bucket/configure/:bucketName',
    component: BucketConfigureComponent
  },
  {
    path: 'object-storage',
    component: ObjectStorageComponent
  },
  {
    path: 'object-storage/create',
    component: ObjectStorageCreateComponent
  },
  {
    path: 'object-storage/extend',
    component: ObjectStorageEditComponent
  },
  {
    path: 'object-storage/edit/:id',
    component: ObjectStorageEditComponent
  },
  {
    path:'object-storage/bucket/:name',
    component: BucketDetailComponent
  },
  ]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule {
}
