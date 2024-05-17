import { RouterModule, Routes } from '@angular/router';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { NgModule } from '@angular/core';
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
import { ListBackupVmComponent } from './backup-vm/list/list-backup-vm.component';
import { DetailBackupVmComponent } from './backup-vm/detail/detail-backup-vm.component';
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
import { PermissionGuard } from '../shared/guard/PermissionGuard';
import { CreateBackupVmNormalComponent } from './backup-vm/create/no-vpc/create-backup-vm-normal.component';
import { CreateBackupVmVpcComponent } from './backup-vm/create/vpc/create-backup-vm-vpc.component';
import { RestoreBackupVmComponent } from './backup-vm/restore/restore-backup-vm.component';
import {
  CreateBackupVolumeVpcComponent
} from './volume/component/backup-volume/create-backup-volume/vpc/create-backup-volume-vpc.component';
import {
  CreateBackupVolumeNormalComponent
} from './volume/component/backup-volume/create-backup-volume/no-vpc/create-backup-volume-normal.component';
// import { BlankVolumeComponent } from './volume/component/blank/blank-volume.component';

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
    canActivate: [PermissionGuard],
    data: {
      permission: 'volume:List'
    }
  },
  {
    path: 'volume/create',
    component: CreateVolumeComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'order:create'
    }
  },
  {
    path: 'volume/detail/:id',
    component: DetailVolumeComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'volume:Get'
    }
  },
  {
    path: 'volume/edit/:id',
    component: EditVolumeComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'volume:Update'
    }
  },
  {
    path: 'keypair',
    component: SshKeyComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'keypair:List'
    }
  },
  {
    path: 'instances',
    loadChildren: () =>
      import('../pages/instances/instances.module').then(
        (m) => m.InstancesModule
      ),
    canActivate: [PermissionGuard],
    data: {
      permission: 'instance:List'
    }

  },
  {
    path: 'ip-public',
    component: IpPublicComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'ippublic:List'
    }

  },
  {
    path: 'ip-public/create',
    component: CreateUpdateIpPublicComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'order:create'
    }

  },
  {
    path: 'ip-public/detail/:id',
    component: DetailIpPublicComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'ippublic:Get'
    }

  },
  {
    path: 'ip-public/extend/:id',
    component: ExtendIpPublicComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'order:create'
    }

  },
  {
    path: 'instance/:instanceId/allow-address-pair/:portId',
    component: ListAllowAddressPairComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'instance:InstanceListAllowAddressPair'
    }
  },
  {
    path: 'action-history',
    component: ActionHistoryComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'actionlogs:List'
    }

  },
  {
    path: 'snapshotvls',
    component: SnapshotVolumeListComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'volumesnapshot:List'
    }
  },
  {
    path: 'snapshotvls/detail/:id',
    component: SnappshotvlDetailComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'volumesnapshot:Get'
    }
  },
  {
    path: 'backup-vm',
    component: ListBackupVmComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'backup:List'
    }

  },
  {
    path: 'backup-vm/restore-backup-vm/:id',
    component: RestoreBackupVmComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'backup:InstanceBackupRestore'
    }
  },
  {
    path: 'backup-vm/detail-backup-vm/:id',
    component: DetailBackupVmComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'backup:Get'
    }

  },
  // {
  //   path: 'instance/:id/create-backup-vm',
  //   component: CreateBackupVmComponent,
  //   canActivate: [PermissionGuard],
  //   data: {
  //     permission: 'order:create'
  //   }
  //
  // },
  {
    path: 'backup-vm/create/no-vpc',
    component: CreateBackupVmNormalComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'order:create'
    }
  },
  {
    path: 'backup-vm/create/vpc',
    component: CreateBackupVmVpcComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'order:create'
    }
  },
  {
    path: 'backup-volume/create/vpc',
    component: CreateBackupVolumeVpcComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'order:create'
    }

  },
  {
    path: 'backup-volume/create/normal',
    component: CreateBackupVolumeNormalComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'order:create'
    }

  },
  {
    path: 'backup-volume/detail',
    component: DetailBackupVolumeComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'backup:Get'
    }

  },
  {
    path: 'backup-volume',
    component: ListBackupVolumeComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'backup:List'
    }

  },
  {
    path: 'iam/dashboard',
    component: IamDashboardComponent
  },
  {
    path: 'iam/user-group',
    component: ListUserGroupComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'iamgroup:List'
    }

  },
  {
    path: 'iam/user-group/create',
    component: CreateUserGroupComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'iamgroup:Create'
    }

  },
  {
    path: 'iam/user-group/:name',
    component: DetailUserGroupComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'iamgroup:Get'
    }

  },
  {
    path: 'policy/attach/:name',
    component: PolicyAttachComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'iampolicy:IamPolicyAttachOrDetach'
    }
  },
  {
    path: 'policy/detach/:name',
    component: PolicyDetachComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'iampolicy:IamPolicyAttachOrDetach'
    }
  },
  {
    path: 'policy/detail/:name',
    component: PolicyDetailComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'iampolicy:Get'
    }

  },
  {
    path: 'policy/update/:name',
    component: PolicyUpdateComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'iampolicy:Create'
    }
  },
  {
    path: 'policy',
    loadChildren: () =>
      import('../pages/policy/policy.module').then((m) => m.PolicyModule),
    canActivate: [PermissionGuard],
    data: {
      permission: 'iampolicy:List'
    }

  },
  {
    path: 'users',
    component: UserComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'iamuser:List'
    }

  },
  {
    path: 'users/create',
    component: UserCreateComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'iamuser:Create'
    }

  },
  {
    path: 'users/detail/:userName',
    component: UserDetailComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'iamuser:Get'
    }

  },
  {
    path: 'users/detail/:userName/add-policies',
    component: AddPoliciesComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'iamuser:Create'
    }

  },
  {
    path: 'users/detail/:userName/add-to-group',
    component: AddToGroupComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'AddToGroupComponent'
    }
  },
  {
    path: 'iam/user-group/:groupName/add-user',
    component: CreateUserComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'iamgroup:Create'
    }

  },
  {
    path: 'iam/user-group/:groupName/add-policy',
    component: CreatePolicyComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'iamgroup:Create'
    }

  },
  {
    path: 'schedule/backup/blank',
    component: BlankScheduleBackupComponent
  },
  {
    path: 'schedule/backup/list',
    component: ListScheduleBackupComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'backupschedule:Search'
    }
  },
  {
    path: 'schedule/backup/create',
    component: CreateScheduleBackupComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'order:create'
    }

  },
  {
    path: 'schedule/backup/edit/vm/:id',
    component: EditScheduleBackupVmComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'backupschedule:Update'
    }
  },
  {
    path: 'schedule/backup/edit/volume/:id',
    component: EditScheduleBackupVolumeComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'backupschedule:Update'
    }
  },
  {
    path: 'schedule/snapshot/list',
    component: SnapshotScheduleListComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'volumesnapshotschedule:List'
    }
  },
  {
    path: 'schedule/snapshot/create',
    component: SnapshotScheduleCreateComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'volumesnapshotschedule:Create'
    }
  },
  {
    path: 'schedule/snapshot/detail/:id',
    component: SnapshotScheduleDetailComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'volumesnapshotschedule:Get'
    }
  },
  {
    path: 'schedule/snapshot/edit/:id',
    component: SnapshotScheduleEditComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'volumesnapshotschedule:Update'
    }
  },
  {
    path: 'billing/payments/detail/:id/:orderNumber',
    component: PaymentDetailComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'payment:Get'
    }

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
    canActivate: [PermissionGuard],
    data: {
      permission: 'payment:List'
    }

  },
  {
    path: 'order/list',
    component: OrderListComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'order:List'
    }

  },
  {
    path: 'order/detail/:id',
    component: OrderDetailComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'order:Get'
    }

  },
  {
    path: 'volumes/renew/:id',
    component: RenewVolumeComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'order:Create'
    }

  },
  {
    path: 'backup/packages',
    component: ListPackagesBackupComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'backup:ListBackupPacket'
    }
  },
  {
    path: 'backup/packages/detail/:id',
    component: DetailPackageBackupComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'backup:BackupPacketGet'
    }
  },
  {
    path: 'backup/packages/create',
    component: CreatePackageBackupComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'order:Create'
    }

  },
  {
    path: 'backup/packages/edit/:id',
    component: EditBackupPackageComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'backup:BackupPacketUpdate'
    }
  },
  {
    path: 'backup/packages/extend/:id',
    component: ExtendBackupPackageComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'order:Create'
    }

  },
  {
    path: 'order/cart',
    component: PaymentSummaryComponent
  },
  {
    path: 'volume/vpc/create',
    component: CreateVolumeVpcComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'order:Create'
    }

  },
  {
    path: 'volume/vpc/resize/:id',
    component: ResizeVolumeVpcComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'order:Create'
    }

  },
  // {
  //   path: 'volume/blank',
  //   component: BlankVolumeComponent
  // },
  {
    path: 'vlan/network/list',
    component: ListVlanComponent
  },
  {
    path: 'vlan/network/detail/:id',
    component: VlanDetailComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'vlan:List'
    }

  },
  {
    path: 'project',
    loadChildren: () =>
      import('../pages/project/project.module').then((m) => m.ProjectModule),

    canActivate: [PermissionGuard],
    data: {
      permission: 'project:List'
    }
  },
  {
    path: 'network/router',
    component: RouterListComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'router:List'
    }

  },
  {
    path: 'network/router/detail/:name/:id',
    component: RouterDetailComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'router:Get'
    }

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
    canActivate: [PermissionGuard],
    data: {
      permission: 'ipfloating:List'
    }

  },
  {
    path: 'networks/ip-floating-normal/create',
    component: CreateIpFloatingNormalComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'order:Create'
    }

  },
  {
    path: 'networks/ip-floating-normal/:id/extend',
    component: ExtendIpFloatingComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'order:Create'
    }

  },
  {
    path: 'networks/ip-wan/list',
    component: ListWanComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'ipwan:List'
    }

  },
  {
    path: 'file-storage/file-system/create',
    component: CreateFileSystemComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'order:Create'
    }

  },
  {
    path: 'file-storage/file-system/create/:snapshotId',
    component: CreateFileSystemComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'order:Create'
    }

  },
  {
    path: 'file-storage/file-system/list',
    component: ListFileSystemComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'fileStorages:GetListShareFileStorage'
    }
  },
  {
    path: 'file-storage/file-system/detail/:id',
    component: DetailFileSystemComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'fileStorages:GetShareFileStorage'
    }
  },
  {
    path: 'file-storage/file-system/resize/:id',
    component: ResizeFileSystemComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'order:Create'
    }

  },
  {
    path: 'file-storage/file-system/:idFileSystem/access-rule/list',
    component: ListAccessRuleComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'fileStorages:GetListShareRule'
    }
  },
  {
    path: 'object-storage/sub-user/list',
    component: ListSubUserComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'objectstorages:ObjectStorageUser'
    }
  },
  {
    path: 'object-storage/sub-user/create',
    component: CreateSubUserComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'objectstorages:ObjectStorageUser'
    }
  },
  {
    path: 'object-storage/dashboard',
    component: DashboardObjectStorageComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'objectstorages:ObjectStorageMonitor'
    }
  },
  {
    path: 'networks/ip-floating/list',
    component: ListIpFloatingComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'ipfloating:List'
    }

  },
  {
    path: 'file-system-snapshot/list',
    component: FileSystemSnapshotComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'fileStorages:GetListShareSnapshotFileStorage'
    }
  },
  {
    path: 'file-system-snapshot/create',
    component: CreateFileSystemSnapshotComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'fileStorages:CreateShareSnapshotFileStorage'
    }
  },
  {
    path: 'file-system-snapshot/create/:fileSystemId',
    component: CreateFileSystemSnapshotComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'fileStorages:CreateShareSnapshotFileStorage'
    }
  },
  {
    path: 'file-system-snapshot/detail/:id',
    component: FileSystemSnapshotDetailComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'fileStorages:GetShareSnapshotFileStorage'
    }
  },
  {
    path: 'file-system-snapshot-schedule/list',
    component: FileSystemSnapshotScheduleComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'fileStorages:GetListScheduleShareSnapshot'
    }
  },
  {
    path: 'file-system-snapshot-schedule/create',
    component: CreateFileSystemSnapshotScheduleComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'fileStorages:CreateScheduleShareSnapshot'
    }
  },
  {
    path: 'file-system-snapshot-schedule/edit/:id',
    component: EditFileSystemSnapshotScheduleComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'fileStorages:UpdateScheduleShareSnapshot'
    }
  },
  {
    path: 'object-storage/bucket',
    component: BucketListComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'objectstorages:ObjectStorageUser'
    }
  },
  {
    path: 'object-storage/bucket/create',
    component: BucketCreateComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'objectstorages:CreateBucket'
    }
  },
  {
    path: 'object-storage/bucket/configure/:bucketName',
    component: BucketConfigureComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'objectstorages:GetBucket'
    }
  },
  {
    path: 'object-storage',
    component: ObjectStorageComponent
  },
  {
    path: 'object-storage/create',
    component: ObjectStorageCreateComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'order:Create'
    }

  },
  {
    path: 'object-storage/extend/:id',
    component: ObjectStorageExtendComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'order:Create'
    }

  },
  {
    path: 'object-storage/edit/:id',
    component: ObjectStorageEditComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'order:Create'
    }

  },
  {
    path: 'object-storage/bucket/:name',
    component: BucketDetailComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'objectstorages:GetBucket'
    }
  },
  {
    path: 'vpn-site-to-site',
    loadChildren: () =>
      import('../pages/vpn-site-to-site/vpn-site-to-site.module').then(
        (m) => m.VpnSiteToSiteModule
      ),
    canActivate: [PermissionGuard],
    data: {
      permission: 'vpnsitetosites:List'
    }
  },
  {
    path: 'object-storage/s3-key',
    component: S3KeyComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'objectstorages:Search'
    }
  },
  {
    path: 'snapshot/packages',
    loadChildren: () =>
      import('../pages/snapshot-package/packages-snapshot.module').then(
        (m) => m.PackageSnapshotModule
      ),
    canActivate: [PermissionGuard],
    data: {
      permission: 'SnapshotPackage:List'
    }
  },
  {
    path: 'security-group/list',
    component: ListSecurityGroupComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'securitygroup:List'
    }
  },
  {
    path: 'load-balancer/list',
    component: ListLoadBalancerComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'loadbalancer:List'
    }
  },
  {
    path: 'load-balancer/create',
    component: CreateLbNovpcComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'order:Create'
    }

  },
  {
    path: 'load-balancer/create/vpc',
    component: CreateLbVpcComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'order:Create'
    }

  },
  {
    path: 'load-balancer/detail/:id',
    component: DetailLoadBalancerComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'loadbalancer:Get'
    }
  },
  {
    path: 'load-balancer/:lbId/listener/create',
    component: ListenerCreateComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'blsdnlistener:Create'
    }
  },
  {
    path: 'load-balancer/:lbId/listener/detail/:id',
    component: ListenerDetailComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'blsdnlistener:Get'
    }
  },
  {
    path: 'load-balancer/:lbId/listener/update/:id',
    component: ListenerUpdateComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'blsdnlistener:Update'
    }

  },
  {
    path: 'security',
    component: SecurityComponent
  },
  {
    path: 'load-balancer/update/vpc/:id',
    component: EditLoadBalancerVpcComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'loadbalancer:Update'
    }
  },
  {
    path: 'load-balancer/extend/normal/:id',
    component: ExtendLoadBalancerNormalComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'order:Create'
    }

  },
  {
    path: 'load-balancer/pool-detail/:id',
    component: PoolDetailComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'lbsdn:LoadBalancer'
    }
  },
  {
    path: 'load-balancer/:idLoadBalancer/listener/:idListener/create/l7-policy',
    component: CreateL7PolicyComponent
  },
  {
    path: 'load-balancer/:idLoadBalancer/listener/:idListener/l7-policy/:idL7',
    component: DetailL7PolicyComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'lbsdn:LoadBalancer'
    }
  },
  {
    path: 'load-balancer/:idLoadBalancer/listener/:idListener/l7-policy/edit/:idL7',
    component: EditL7PolicyComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'lbsdn:LoadBalancer'
    }
  },
  {
    path: 'file-storage/file-system/create/normal',
    component: CreateFileSystemNormalComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'order:Create'
    }

  },
  {
    path: 'file-storage/file-system/create/normal/:snapshotId',
    component: CreateFileSystemNormalComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'order:Create'
    }

  },
  {
    path: 'file-storage/file-system/:idFileSystem/extend',
    component: ExtendFileSystemNormalComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'order:Create'
    }

  },
  {
    path: 'file-storage/file-system/:idFileSystem/resize',
    component: ResizeFileSystemNormalComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'order:Create'
    }

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule {
}
