import { RouterModule, Routes } from '@angular/router';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { inject, NgModule } from '@angular/core';
import { V1Component } from './test/v1.component';
import { ListAllowAddressPairComponent } from './allow-address-pair/list/list-allow-address-pair.component';
import { SshKeyComponent } from './ssh-key/ssh-key.component';
import { IpPublicComponent } from './ip-public/ip-public.component';
import { CreateUpdateIpPublicComponent } from './ip-public/create-update-ip-public/create-update-ip-public.component';
import { VolumeComponent } from './volume/component/list-volume/volume.component';
import { CreateVolumeComponent } from './volume/component/create-volume/create-volume.component';
import { DetailVolumeComponent } from './volume/component/detail-volume/detail-volume.component';
import { EditVolumeComponent } from './volume/component/edit-volume/edit-volume.component';
import { ActionHistoryComponent } from './action-history/action-history.component';
import { SnapshotVolumeListComponent } from './snapshot-volume/snapshotvl-list/snapshotvl-list.component';
import { SnappshotvlDetailComponent } from './snapshot-volume/snapshotvl-detail/snappshotvl-detail.component';
import { BlankBackupVmComponent } from './backup-vm/blank/blank-backup-vm.component';
import { ListBackupVmComponent } from './backup-vm/list/list-backup-vm.component';
import { RestoreBackupVmComponent } from './backup-vm/restore/restore-backup-vm.component';
import { DetailBackupVmComponent } from './backup-vm/detail/detail-backup-vm.component';
import { CreateBackupVmComponent } from './backup-vm/create/create-backup-vm.component';
import {
  CreateBackupVolumeComponent
} from './volume/component/backup-volume/create-backup-volume/create-backup-volume.component';
import {
  DetailBackupVolumeComponent
} from './volume/component/backup-volume/detail-backup-volume/detail-backup-volume.component';
import {
  ListBackupVolumeComponent
} from './volume/component/backup-volume/list-backup-volume/list-backup-volume.component';
import { PolicyAttachComponent } from './policy/policy-attach/policy-attach.component';
import { IamDashboardComponent } from './iam/dashboard/iam-dashboard.component';
import { ListUserGroupComponent } from './iam/user-group/list/list-user-group.component';
import { DetailUserGroupComponent } from './iam/user-group/detail/detail-user-group.component';
import { CreateUserGroupComponent } from './iam/user-group/create/create-user-group.component';
import { UserComponent } from './users/user.component';
import { UserCreateComponent } from './users/user-create/user-create.component';
import { PolicyDetachComponent } from './policy/policy-detach/policy-detach.component';
import { PolicyDetailComponent } from './policy/policy-detail/policy-detail.component';
import { UserDetailComponent } from './users/user-detail/user-detail.component';
import { AddPoliciesComponent } from './users/user-detail/add-policies/add-policies.component';
import { AddToGroupComponent } from './users/user-detail/add-to-group/add-to-group.component';
import { CreateUserComponent } from './iam/user-group/user/create/create-user.component';
import { CreatePolicyComponent } from './iam/user-group/policy/create/create-policy.component';
import { PolicyUpdateComponent } from './policy/policy-update/policy-update.component';
import { BlankScheduleBackupComponent } from './schedule-backup/blank/blank-schedule-backup.component';
import { ListScheduleBackupComponent } from './schedule-backup/list/list-schedule-backup.component';
import { CreateScheduleBackupComponent } from './schedule-backup/create/create-schedule-backup.component';
import {
  EditScheduleBackupVmComponent
} from './schedule-backup/edit/schedule-backup-vm/edit-schedule-backup-vm.component';
import {
  SnapshotScheduleListComponent
} from './snapshot-schedule/snapshot-schedule-list/snapshot-schedule-list.component';
import {
  SnapshotScheduleCreateComponent
} from './snapshot-schedule/snapshot-schedule-create/snapshot-schedule-create.component';
import {
  SnapshotScheduleDetailComponent
} from './snapshot-schedule/snapshot-schedule-detai/snapshotp-schedule-detail.component';
import {
  EditScheduleBackupVolumeComponent
} from './schedule-backup/edit/schedule-backup-volume/edit-schedule-backup-volume.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DetailIpPublicComponent } from './ip-public/detail-ip-public/detail-ip-public.component';
import { PaymentDetailComponent } from './billing/payment/detail/payment-detail.component';
import { PaymentSuccessComponent } from '../shared/components/payment-success/payment-success.component';
import { PaymentFailedComponent } from '../shared/components/payment-failed/payment-failed.component';
import { OrderListComponent } from './order/order-list/order-list.component';
import { ListPaymentComponent } from './billing/payment/list/list-payment.component';
import { OrderDetailComponent } from './order/order-detail/order-detail.component';
import { RenewVolumeComponent } from './volume/component/renew-volume/renew-volume.component';
import { ExtendIpPublicComponent } from './ip-public/extend-ip-public/extend-ip-public.component';
import {
  SnapshotScheduleEditComponent
} from './snapshot-schedule/snapshot-schedule-edit/snapshot-schedule-edit.component';
import { ListPackagesBackupComponent } from './backup-package/list/list-packages-backup.component';
import { CreatePackageBackupComponent } from './backup-package/create/create-package-backup.component';
import { DetailPackageBackupComponent } from './backup-package/detail/detail-package-backup.component';
import { EditBackupPackageComponent } from './backup-package/edit/edit-backup-package.component';
import { ExtendBackupPackageComponent } from './backup-package/extend/extend-backup-package.component';
import { PaymentSummaryComponent } from '../shared/components/payment-summary/payment-summary.component';
import { CreateVolumeVpcComponent } from './volume/component/create-volume-vpc/create-volume-vpc.component';
import { ResizeVolumeVpcComponent } from './volume/component/resize-volume-vpc/resize-volume-vpc.component';
import { ListVlanComponent } from './vlan/list/list-vlan.component';
import { VlanDetailComponent } from './vlan/detail/vlan-detail.component';
import { RouterListComponent } from './routers/router-list.component';
import { RouterDetailComponent } from './routers/router-detail/router-detail.component';
import { CreateNetworkComponent } from './vlan/create/create-network/create-network.component';
import { VlanCreateSubnetComponent } from './vlan/create/create-subnet/vlan-create-subnet.component';
import { VlanEditSubnetComponent } from './vlan/edit/edit-subnet/vlan-edit-subnet.component';
import { ListIpFloatingComponent } from './ip-floating/list-ip-floating.component';
import { BucketDetailComponent } from './bucket/bucket-detail/bucket-detail.component';
import { BucketListComponent } from './bucket/bucket-list.component';
import { BucketCreateComponent } from './bucket/bucket-create/bucket-create.component';
import { BucketConfigureComponent } from './bucket/bucket-configure/bucket-configure.component';
import { CreateFileSystemComponent } from './file-storage/file-system/action/create/create-file-system.component';
import { DetailFileSystemComponent } from './file-storage/detail/detail-file-system.component';
import { ResizeFileSystemComponent } from './file-storage/file-system/action/resize/resize-file-system.component';
import { ListAccessRuleComponent } from './file-storage/access-rule/list/list-access-rule.component';
import { ListSubUserComponent } from './sub-user/list/list-sub-user.component';
import { ListWanComponent } from './wan/list/list-wan.component';
import { ListFileSystemComponent } from './file-storage/list/list-file-system.component';
import { CreateSubUserComponent } from './sub-user/action/create/create-sub-user.component';
import { FileSystemSnapshotComponent } from './file-system-snapshot/file-system-snapshot.component';
import {
  CreateFileSystemSnapshotComponent
} from './file-system-snapshot/create-file-system-snapshot/create-file-system-snapshot.component';
import {
  FileSystemSnapshotDetailComponent
} from './file-system-snapshot/file-system-snapshot-detail/file-system-snapshot-detai.component';
import {
  FileSystemSnapshotScheduleComponent
} from './file-system-snapshot-schedule/file-system-snapshot-schedule.component';
import {
  CreateFileSystemSnapshotScheduleComponent
} from './file-system-snapshot-schedule/create-file-system-snapshot-schedule/create-file-system-snapshot-schedule.component';
import {
  EditFileSystemSnapshotScheduleComponent
} from './file-system-snapshot-schedule/edit-file-system-snapshot-schedule/edit-file-system-snapshot-schedule.component';
import { DashboardObjectStorageComponent } from './dashboard-object-storage/dashboard-object-storage.component';
import { ObjectStorageComponent } from './object-storage/object-storage.component';
import { ObjectStorageCreateComponent } from './object-storage/object-storage-create/object-storage-create.component';
import { ObjectStorageEditComponent } from './object-storage/object-storage-edit/object-storage-edit.component';
import { PolicyService } from '../shared/services/policy.service';
import { S3KeyComponent } from './object-storage/s3-key/s3-key.component';
import { ListSecurityGroupComponent } from './security-group/list/list-security-group.component';
import { SecurityComponent } from './security/security.component';
import { ListLoadBalancerComponent } from './load-balancer/list/list-load-balancer.component';
import { CreateLbNovpcComponent } from './load-balancer/normal/create/create-lb-novpc.component';
import { CreateLbVpcComponent } from './load-balancer/vpc/create/create-lb-vpc.component';
import { DetailLoadBalancerComponent } from './load-balancer/detail/detail-load-balancer.component';
import { EditLoadBalancerVpcComponent } from './load-balancer/vpc/edit/edit-load-balancer-vpc.component';
import { ListenerCreateComponent } from './load-balancer/listener/create/listener-create.component';
import { ListenerDetailComponent } from './load-balancer/listener/detail/listener-detail.component';
import { ListenerUpdateComponent } from './load-balancer/listener/update/listener-update.component';
import { ObjectStorageExtendComponent } from './object-storage/object-storage-extend/object-storage-extend.component';
import { ExtendLoadBalancerNormalComponent } from './load-balancer/normal/extend/extend-load-balancer-normal.component';
import { CreateL7PolicyComponent } from './load-balancer/listener/L7-policy/create/create-l7-policy.component';
import { DetailL7PolicyComponent } from './load-balancer/listener/L7-policy/detail/detail-l7-policy.component';
import { PoolDetailComponent } from './load-balancer/pool-detail/pool-detail.component';
import { EditL7PolicyComponent } from './load-balancer/listener/L7-policy/edit/edit-l7-policy.component';
import { CreateFileSystemNormalComponent } from './file-storage/no-vpc/create/create-file-system-normal.component';
import { ExtendFileSystemNormalComponent } from './file-storage/no-vpc/extend/extend-file-system-normal.component';
import { ResizeFileSystemNormalComponent } from './file-storage/no-vpc/resize/resize-file-system-normal.component';
import { CreateIpFloatingNormalComponent } from './ip-floating/create-ip-floating-normal.component';
import { ExtendIpFloatingComponent } from './ip-floating/extend-ip-floating/extend-ip-floating.component';


const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
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
    component: VolumeComponent,
    canMatch: [() => inject(PolicyService).hasPermission('volume:List')]
  },
  {
    path: 'volume/create',
    component: CreateVolumeComponent,
    canMatch: [() => inject(PolicyService).hasPermission('order:create')]
  },
  {
    path: 'volume/detail/:id',
    component: DetailVolumeComponent,
    canMatch: [() => inject(PolicyService).hasPermission('volume:Get')]
  },
  {
    path: 'volume/edit/:id',
    component: EditVolumeComponent,
    canMatch: [() => inject(PolicyService).hasPermission('volume:Update')]
  },
  {
    path: 'keypair',
    component: SshKeyComponent,
    canMatch: [() => inject(PolicyService).hasPermission('keypair:List')]
  },
  {
    path: 'instances',
    loadChildren: () => import('../pages/instances/instances.module').then(m => m.InstancesModule),
    canMatch: [() => inject(PolicyService).hasPermission('instance:List')]
  },
  {
    path: 'ip-public',
    component: IpPublicComponent,
    canMatch: [() => inject(PolicyService).hasPermission('ippublic:List')]
  },
  {
    path: 'ip-public/create',
    component: CreateUpdateIpPublicComponent,
    canMatch: [() => inject(PolicyService).hasPermission('order:create')]
  },
  {
    path: 'ip-public/detail/:id',
    component: DetailIpPublicComponent,
    canMatch: [() => inject(PolicyService).hasPermission('ippublic:Get')]
  },
  {
    path: 'ip-public/extend/:id',
    component: ExtendIpPublicComponent,
    canMatch: [() => inject(PolicyService).hasPermission('order:create')]
  },
  {
    path: 'instance/:instanceId/allow-address-pair/:portId',
    component: ListAllowAddressPairComponent,
    canMatch: [() => inject(PolicyService).hasPermission('instance:InstanceListAllowAddressPair')]
  },
  {
    path: 'action-history',
    component: ActionHistoryComponent,
    canMatch: [() => inject(PolicyService).hasPermission('actionlogs:List')]
  },
  {
    path: 'snapshotvls',
    component: SnapshotVolumeListComponent,
    canMatch: [() => inject(PolicyService).hasPermission('volumesnapshot:List')]
  },
  {
    path: 'snapshotvls/detail/:id',
    component: SnappshotvlDetailComponent,
    canMatch: [() => inject(PolicyService).hasPermission('volumesnapshot:Get')]
  },
  {
    path: 'blank-backup-vm',
    component: BlankBackupVmComponent
  },
  {
    path: 'backup-vm',
    component: ListBackupVmComponent,
    canMatch: [() => inject(PolicyService).hasPermission('backup:List')]
  },
  {
    path: 'backup-vm/restore-backup-vm/:id',
    component: RestoreBackupVmComponent,
    canMatch: [() => inject(PolicyService).hasPermission('backup:InstanceBackupRestore')]
  },
  {
    path: 'backup-vm/detail-backup-vm/:id',
    component: DetailBackupVmComponent,
    canMatch: [() => inject(PolicyService).hasPermission('backup:Get')]
  },
  {
    path: 'instance/:id/create-backup-vm',
    component: CreateBackupVmComponent,
    canMatch: [() => inject(PolicyService).hasPermission('order:create')]
  },
  {
    path: 'backup-volume/create',
    component: CreateBackupVolumeComponent,
    canMatch: [() => inject(PolicyService).hasPermission('order:create')]
  },
  {
    path: 'backup-volume/detail',
    component: DetailBackupVolumeComponent,
    canMatch: [() => inject(PolicyService).hasPermission('backup:Get')]
  },
  {
    path: 'backup-volume',
    component: ListBackupVolumeComponent,
    canMatch: [() => inject(PolicyService).hasPermission('backup:List')]
  },
  {
    path: 'iam/dashboard',
    component: IamDashboardComponent
  },
  {
    path: 'iam/user-group',
    component: ListUserGroupComponent,
    canMatch: [() => inject(PolicyService).hasPermission('iamgroup:List')]
  },
  {
    path: 'iam/user-group/create',
    component: CreateUserGroupComponent,
    canMatch: [() => inject(PolicyService).hasPermission('iamgroup:Create')]
  },
  {
    path: 'iam/user-group/:name',
    component: DetailUserGroupComponent,
    canMatch: [() => inject(PolicyService).hasPermission('iamgroup:Get')]
  },
  {
    path: 'policy/attach/:name',
    component: PolicyAttachComponent,
    canMatch: [() => inject(PolicyService).hasPermission('iampolicy:IamPolicyAttachOrDetach')]
  },
  {
    path: 'policy/detach/:name',
    component: PolicyDetachComponent,
    canMatch: [() => inject(PolicyService).hasPermission('iampolicy:IamPolicyAttachOrDetach')]
  },
  {
    path: 'policy/detail/:name',
    component: PolicyDetailComponent,
    canMatch: [() => inject(PolicyService).hasPermission('iampolicy:Get')]
  },
  {
    path: 'policy/update/:name',
    component: PolicyUpdateComponent,
    canMatch: [() => inject(PolicyService).hasPermission('iampolicy:Create')]
  },
  {
    path: 'policy',
    loadChildren: () => import('../pages/policy/policy.module').then(m => m.PolicyModule),
    canMatch: [() => inject(PolicyService).hasPermission('iampolicy:List')]
  },
  {
    path: 'users',
    component: UserComponent,
    canMatch: [() => inject(PolicyService).hasPermission('iamuser:List')]
  },
  {
    path: 'users/create',
    component: UserCreateComponent,
    canMatch: [() => inject(PolicyService).hasPermission('iamuser:Create')]
  },
  {
    path: 'users/detail/:userName',
    component: UserDetailComponent,
    canMatch: [() => inject(PolicyService).hasPermission('iamuser:Get')]
  },
  {
    path: 'users/detail/:userName/add-policies',
    component: AddPoliciesComponent,
    canMatch: [() => inject(PolicyService).hasPermission('iamuser:Create')]
  },
  {
    path: 'users/detail/:userName/add-to-group',
    component: AddToGroupComponent,
    canMatch: [() => inject(PolicyService).hasPermission('AddToGroupComponent')]
  },
  {
    path: 'iam/user-group/:groupName/add-user',
    component: CreateUserComponent,
    canMatch: [() => inject(PolicyService).hasPermission('iamgroup:Create')]
  },
  {
    path: 'iam/user-group/:groupName/add-policy',
    component: CreatePolicyComponent,
    canMatch: [() => inject(PolicyService).hasPermission('iamgroup:Create')]
  },
  {
    path: 'schedule/backup/blank',
    component: BlankScheduleBackupComponent
  },
  {
    path: 'schedule/backup/list',
    component: ListScheduleBackupComponent,
    canMatch: [() => inject(PolicyService).hasPermission('backupschedule:Search')]
  },
  {
    path: 'schedule/backup/create',
    component: CreateScheduleBackupComponent,
    canMatch: [() => inject(PolicyService).hasPermission('order:create')]
  },
  {
    path: 'schedule/backup/edit/vm/:id',
    component: EditScheduleBackupVmComponent,
    canMatch: [() => inject(PolicyService).hasPermission('backupschedule:Update')]
  },
  {
    path: 'schedule/backup/edit/volume/:id',
    component: EditScheduleBackupVolumeComponent,
    canMatch: [() => inject(PolicyService).hasPermission('backupschedule:Update')]
  },
  {
    path: 'schedule/snapshot/list',
    component: SnapshotScheduleListComponent,
    canMatch: [() => inject(PolicyService).hasPermission('volumesnapshotschedule:List')]
  },
  {
    path: 'schedule/snapshot/create',
    component: SnapshotScheduleCreateComponent,
    canMatch: [() => inject(PolicyService).hasPermission('volumesnapshotschedule:Create')]
  },
  {
    path: 'schedule/snapshot/detail/:id',
    component: SnapshotScheduleDetailComponent,
    canMatch: [() => inject(PolicyService).hasPermission('volumesnapshotschedule:Get')]
  },
  {
    path: 'schedule/snapshot/edit/:id',
    component: SnapshotScheduleEditComponent,
    canMatch: [() => inject(PolicyService).hasPermission('volumesnapshotschedule:Update')]
  },
  {
    path: 'billing/payments/detail/:id/:orderNumber',
    component: PaymentDetailComponent,
    canMatch: [() => inject(PolicyService).hasPermission('payment:Get')]
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
    component: ListPaymentComponent,
    canMatch: [() => inject(PolicyService).hasPermission('payment:List')]
  },
  {
    path: 'order/list',
    component: OrderListComponent,
    canMatch: [() => inject(PolicyService).hasPermission('order:List')]
  },
  {
    path: 'order/detail/:id',
    component: OrderDetailComponent,
    canMatch: [() => inject(PolicyService).hasPermission('order:Get')]
  },
  {
    path: 'volumes/renew/:id',
    component: RenewVolumeComponent,
    canMatch: [() => inject(PolicyService).hasPermission('order:Create')]
  },
  {
    path: 'backup/packages',
    component: ListPackagesBackupComponent,
    canMatch: [() => inject(PolicyService).hasPermission('backup:ListBackupPacket')]
  },
  {
    path: 'backup/packages/detail/:id',
    component: DetailPackageBackupComponent,
    canMatch: [() => inject(PolicyService).hasPermission('backup:BackupPacketGet')]
  },
  {
    path: 'backup/packages/create',
    component: CreatePackageBackupComponent,
    canMatch: [() => inject(PolicyService).hasPermission('order:Create')]
  },
  {
    path: 'backup/packages/edit/:id',
    component: EditBackupPackageComponent,
    canMatch: [() => inject(PolicyService).hasPermission('backup:BackupPacketUpdate')]
  },
  {
    path: 'backup/packages/extend/:id',
    component: ExtendBackupPackageComponent,
    canMatch: [() => inject(PolicyService).hasPermission('order:Create')]
  },
  {
    path: 'order/cart',
    component: PaymentSummaryComponent
  },
  {
    path: 'volume/vpc/create',
    component: CreateVolumeVpcComponent,
    canMatch: [() => inject(PolicyService).hasPermission('order:Create')]
  },
  {
    path: 'volume/vpc/resize/:id',
    component: ResizeVolumeVpcComponent,
    canMatch: [() => inject(PolicyService).hasPermission('order:Create')]
  },
  {
    path: 'vlan/network/list',
    component: ListVlanComponent
  },
  {
    path: 'vlan/network/detail/:id',
    component: VlanDetailComponent,
    canMatch: [() => inject(PolicyService).hasPermission('vlan:List')]
  },
  {
    path: 'vpc',
    loadChildren: () => import('../pages/vpc/vpc.module').then(m => m.VpcModule),
    canMatch: [() => inject(PolicyService).hasPermission('vpc:List')]
  },
  {
    path: 'network/router',
    component: RouterListComponent,
    canMatch: [() => inject(PolicyService).hasPermission('router:List')]
  },
  {
    path: 'network/router/detail/:id',
    component: RouterDetailComponent,
    canMatch: [() => inject(PolicyService).hasPermission('router:Get')]
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
  // {
  //   path: 'vlan/:id/network/extend/subnet/:subnetId',
  //   component: VlanEditSubnetComponent
  // },
  {
    path: 'networks/ip-floating/list',
    component: ListIpFloatingComponent,
    canMatch: [() => inject(PolicyService).hasPermission('ipfloating:List')]
  },
  {
    path: 'networks/ip-floating-normal/create',
    component: CreateIpFloatingNormalComponent,
    canMatch: [() => inject(PolicyService).hasPermission('order:Create')]
  },
  {
    path: 'networks/ip-floating-normal/:id/extend',
    component: ExtendIpFloatingComponent,
    canMatch: [() => inject(PolicyService).hasPermission('order:Create')]
  },
  {
    path: 'networks/ip-wan/list',
    component: ListWanComponent,
    canMatch: [() => inject(PolicyService).hasPermission('ipwan:List')]
  },
  {
    path: 'file-storage/file-system/create',
    component: CreateFileSystemComponent,
    canMatch: [() => inject(PolicyService).hasPermission('order:Create')]
  },
  {
    path: 'file-storage/file-system/list',
    component: ListFileSystemComponent,
    canMatch: [() => inject(PolicyService).hasPermission('fileStorages:GetListShareFileStorage')]
  },
  {
    path: 'file-storage/file-system/detail/:id',
    component: DetailFileSystemComponent,
    canMatch: [() => inject(PolicyService).hasPermission('fileStorages:GetShareFileStorage')]
  },
  {
    path: 'file-storage/file-system/resize/:id',
    component: ResizeFileSystemComponent,
    canMatch: [() => inject(PolicyService).hasPermission('order:Create')]
  },
  {
    path: 'file-storage/file-system/:idFileSystem/access-rule/list',
    component: ListAccessRuleComponent,
    canMatch: [() => inject(PolicyService).hasPermission('fileStorages:GetListShareRule')]
  },
  {
    path: 'object-storage/sub-user/list',
    component: ListSubUserComponent,
    canMatch: [() => inject(PolicyService).hasPermission('objectstorages:ObjectStorageUser')]
  },
  {
    path: 'object-storage/sub-user/create',
    component: CreateSubUserComponent,
    canMatch: [() => inject(PolicyService).hasPermission('objectstorages:ObjectStorageUser')]
  },
  {
    path: 'object-storage/dashboard',
    component: DashboardObjectStorageComponent,
    canMatch: [() => inject(PolicyService).hasPermission('objectstorages:ObjectStorageMonitor')]
  },
  {
    path: 'networks/ip-floating/list',
    component: ListIpFloatingComponent,
    canMatch: [() => inject(PolicyService).hasPermission('ipfloating:List')]
  },
  {
    path: 'file-system-snapshot/list',
    component: FileSystemSnapshotComponent,
    canMatch: [() => inject(PolicyService).hasPermission('fileStorages:GetListShareSnapshotFileStorage')]
  },
  {
    path: 'file-system-snapshot/create',
    component: CreateFileSystemSnapshotComponent,
    canMatch: [() => inject(PolicyService).hasPermission('fileStorages:CreateShareSnapshotFileStorage')]
  },
  {
    path: 'file-system-snapshot/detail/:id',
    component: FileSystemSnapshotDetailComponent,
    canMatch: [() => inject(PolicyService).hasPermission('fileStorages:GetShareSnapshotFileStorage')]
  },
  {
    path: 'file-system-snapshot-schedule/list',
    component: FileSystemSnapshotScheduleComponent,
    canMatch: [() => inject(PolicyService).hasPermission('fileStorages:GetListScheduleShareSnapshot')]
  },
  {
    path: 'file-system-snapshot-schedule/create',
    component: CreateFileSystemSnapshotScheduleComponent,
    canMatch: [() => inject(PolicyService).hasPermission('fileStorages:CreateScheduleShareSnapshot')]
  },
  {
    path: 'file-system-snapshot-schedule/edit/:id',
    component: EditFileSystemSnapshotScheduleComponent,
    canMatch: [() => inject(PolicyService).hasPermission('fileStorages:UpdateScheduleShareSnapshot')]
  },
  {
    path: 'object-storage/bucket',
    component: BucketListComponent,
    canMatch: [() => inject(PolicyService).hasPermission('objectstorages:ObjectStorageUser')]
  },
  {
    path: 'object-storage/bucket/create',
    component: BucketCreateComponent,
    canMatch: [() => inject(PolicyService).hasPermission('objectstorages:CreateBucket')]
  },
  {
    path: 'object-storage/bucket/configure/:bucketName',
    component: BucketConfigureComponent,
    canMatch: [() => inject(PolicyService).hasPermission('objectstorages:GetBucket')]
  },
  {
    path: 'object-storage',
    component: ObjectStorageComponent
  },
  {
    path: 'object-storage/create',
    component: ObjectStorageCreateComponent,
    canMatch: [() => inject(PolicyService).hasPermission('order:Create')]
  },
  {
    path: 'object-storage/extend/:id',
    component: ObjectStorageExtendComponent,
    canMatch: [() => inject(PolicyService).hasPermission('order:Create')]
  },
  {
    path: 'object-storage/edit/:id',
    component: ObjectStorageEditComponent,
    canMatch: [() => inject(PolicyService).hasPermission('order:Create')]
  },
  {
    path: 'object-storage/bucket/:name',
    component: BucketDetailComponent,
    canMatch: [() => inject(PolicyService).hasPermission('objectstorages:GetBucket')]
  },
  {
    path: 'vpn-site-to-site',
    loadChildren: () => import('../pages/vpn-site-to-site/vpn-site-to-site.module').then(m => m.VpnSiteToSiteModule),
    canMatch: [() => inject(PolicyService).hasPermission('vpnsitetosites:List')]
  },
  {
    path: 'object-storage/s3-key',
    component: S3KeyComponent,
    canMatch: [() => inject(PolicyService).hasPermission('objectstorages:Search')]
  },
  {
    path: 'snapshot/packages',
    loadChildren: () => import('../pages/snapshot-package/packages-snapshot.module').then(m => m.PackageSnapshotModule),
    canMatch: [() => inject(PolicyService).hasPermission('SnapshotPackage:List')]
  },
  {
    path: 'security-group/list',
    component: ListSecurityGroupComponent,
    canMatch: [() => inject(PolicyService).hasPermission('securitygroup:List')]
  },
  {
    path: 'load-balancer/list',
    component: ListLoadBalancerComponent,
    canMatch: [() => inject(PolicyService).hasPermission('loadbalancer:List')]
  },
  {
    path: 'load-balancer/create',
    component: CreateLbNovpcComponent,
    canMatch: [() => inject(PolicyService).hasPermission('order:Create')]
  },
  {
    path: 'load-balancer/create/vpc',
    component: CreateLbVpcComponent,
    canMatch: [() => inject(PolicyService).hasPermission('order:Create')]
  },
  {
    path: 'load-balancer/detail/:id',
    component: DetailLoadBalancerComponent,
    canMatch: [() => inject(PolicyService).hasPermission('loadbalancer:Get')]
  },
  {
    path: 'load-balancer/:lbId/listener/create',
    component: ListenerCreateComponent,
    canMatch: [() => inject(PolicyService).hasPermission('blsdnlistener:Create')]
  },
  {
    path: 'load-balancer/:lbId/listener/detail/:id',
    component: ListenerDetailComponent,
    canMatch: [() => inject(PolicyService).hasPermission('blsdnlistener:Get')]
  },
  {
    path: 'load-balancer/:lbId/listener/update/:id',
    component: ListenerUpdateComponent,
    canMatch: [() => inject(PolicyService).hasPermission('blsdnlistener:Update')]
  },
  {
    path: 'security',
    component: SecurityComponent
  },
  {
    path: 'load-balancer/update/vpc/:id',
    component: EditLoadBalancerVpcComponent,
    canMatch: [() => inject(PolicyService).hasPermission('loadbalancer:Update')]
  },
  {
    path: 'load-balancer/extend/normal/:id',
    component: ExtendLoadBalancerNormalComponent,
    canMatch: [() => inject(PolicyService).hasPermission('order:Create')]
  },
  {
    path: 'load-balancer/pool-detail/:id',
    component: PoolDetailComponent,
    canMatch: [() => inject(PolicyService).hasPermission('lbsdn:LoadBalancer')]
  },
  {
    path: 'load-balancer/:idLoadBalancer/listener/:idListener/create/l7-policy',
    component: CreateL7PolicyComponent
  },
  {
    path: 'load-balancer/:idLoadBalancer/listener/:idListener/l7-policy/:idL7',
    component: DetailL7PolicyComponent,
    canMatch: [() => inject(PolicyService).hasPermission('lbsdn:LoadBalancer')]
  },
  {
    path: 'load-balancer/:idLoadBalancer/listener/:idListener/l7-policy/edit/:idL7',
    component: EditL7PolicyComponent,
    canMatch: [() => inject(PolicyService).hasPermission('lbsdn:LoadBalancer')]
  },
  {
    path: 'file-storage/file-system/create/normal',
    component: CreateFileSystemNormalComponent,
    canMatch: [() => inject(PolicyService).hasPermission('order:Create')]
  },
  {
    path: 'file-storage/file-system/:idFileSystem/extend',
    component: ExtendFileSystemNormalComponent,
    canMatch: [() => inject(PolicyService).hasPermission('order:Create')]
  },
  {
    path: 'file-storage/file-system/:idFileSystem/resize',
    component: ResizeFileSystemNormalComponent,
    canMatch: [() => inject(PolicyService).hasPermission('order:Create')]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule {
}
