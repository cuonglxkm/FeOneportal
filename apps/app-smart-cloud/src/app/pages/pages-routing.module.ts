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
    path: "ip-public/detail/:id",
    component: DetailIpPublicComponent
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
    path: 'billing/payments/detail/:id',
    component: PaymentDetailComponent
  },
  {
    path: 'paymentSuccess',
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
  }
  ]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule {
}
