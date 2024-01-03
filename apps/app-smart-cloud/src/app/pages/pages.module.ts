import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { V1Component } from './test/v1.component';
import { G2MiniBarModule } from '@delon/chart/mini-bar';
import { PagesRoutingModule } from './pages-routing.module';
import { SharedModule } from '@shared';
import { SecurityGroupComponent } from './security-group/list-security-group/security-group.component';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { CreateSecurityGroupComponent } from './security-group/create-security-group/create-security-group.component';
import { CreateInboundComponent } from './security-group/inbound/create/create-inbound.component';
import { ListAllowAddressPairComponent } from './allow-address-pair/list/list-allow-address-pair.component';
import { IconDefinition } from '@ant-design/icons-angular';
import { SearchOutline, SettingOutline } from '@ant-design/icons-angular/icons';
import { DeleteSecurityGroupComponent } from './security-group/delete-security-group/delete-security-group.component';
import { DeleteRuleComponent } from './security-group/delete-rule/delete-rule.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { InboundListComponent } from './security-group/inbound/list/inbound-list.component';
import { ListOutboundComponent } from './security-group/outbound/list/list-outbound.component';
import { CreateOutboundComponent } from './security-group/outbound/create/create-outbound.component';
import { CreateAllowAddressPairComponent } from './allow-address-pair/create/create-allow-address-pair.component';
import { ListVirtualMachineComponent } from './security-group/vm/list/list-virtual-machine.component';
import { BlankSecurityGroupComponent } from './security-group/blank-security-group/blank-security-group.component';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzImageModule } from 'ng-zorro-antd/image';
import { FormRuleComponent } from './security-group/form-rule/form-rule.component';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { SshKeyComponent } from './ssh-key/ssh-key.component';
import { DeleteAllowAddressPairComponent } from './allow-address-pair/delete/delete-allow-address-pair.component';
import { HeaderVolumeComponent } from './volume/component/header-volume/header-volume.component';
import { PopupAddVolumeComponent } from './volume/component/popup-volume/popup-add-volume.component';
import { PopupDeleteVolumeComponent } from './volume/component/popup-volume/popup-delete-volume.component';
import { CreateVolumeComponent } from './volume/component/create-volume/create-volume.component';
import { DetailVolumeComponent } from './volume/component/detail-volume/detail-volume.component';
import { PopupExtendVolumeComponent } from './volume/component/popup-volume/popup-extend-volume.component';
import { EditVolumeComponent } from './volume/component/edit-volume/edit-volume.component';
import { VolumeComponent } from './volume/component/list-volume/volume.component';
import { SHARED_ZORRO_MODULES } from '../shared/shared-zorro.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SEModule } from '@delon/abc/se';
import { IpPublicComponent } from './ip-public/ip-public.component';
import { CreateUpdateIpPublicComponent } from './ip-public/create-update-ip-public/create-update-ip-public.component';
import { DetailIpPublicComponent } from './ip-public/detail-ip-public/detail-ip-public.component';
import { HeaderComponent } from './header/header.component';
import { PopupCancelVolumeComponent } from './volume/component/popup-volume/popup-cancel-volume.component';
import { SnapshotVolumeListComponent } from './snapshot-volume/snapshotvl-list/snapshotvl-list.component';
import { SnappshotvlDetailComponent } from './snapshot-volume/snapshotvl-detail/snappshotvl-detail.component';
import { BlankBackupVmComponent } from './backup-vm/blank/blank-backup-vm.component';
import { ListBackupVmComponent } from './backup-vm/list/list-backup-vm.component';
import { LayoutDefaultModule } from '@delon/theme/layout-default';
import { RestoreBackupVmComponent } from './backup-vm/restore/restore-backup-vm.component';
import { DeleteBackupVmComponent } from './backup-vm/delete/delete-backup-vm.component';
import { ActionHistoryComponent } from './action-history/action-history.component';
import { DetailBackupVmComponent } from './backup-vm/detail/detail-backup-vm.component';
import { CreateBackupVmComponent } from './backup-vm/create/create-backup-vm.component';
import { AttachOrDetachComponent } from './security-group/vm/attach-or-detach/attach-or-detach.component';
import { CurrentVirtualMachineComponent } from './backup-vm/restore/current-virtual-machine/current-virtual-machine.component';
import { NewVirtualMachineComponent } from './backup-vm/restore/new-virtual-machine/new-virtual-machine.component';
import { PopupDeleteSnapshotVolumeComponent } from './snapshot-volume/popup-snapshot/popup-delete-snapshot-volume.component';
import { PopupEditSnapshotVolumeComponent } from './snapshot-volume/popup-snapshot/popup-edit-snapshot-volume.component';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { CreateBackupVolumeComponent } from './volume/component/backup-volume/create-backup-volume/create-backup-volume.component';
import { DetailBackupVolumeComponent } from './volume/component/backup-volume/detail-backup-volume/detail-backup-volume.component';
import { ListBackupVolumeComponent } from './volume/component/backup-volume/list-backup-volume/list-backup-volume.component';
import { UserComponent } from './users/user.component';
import { UserCreateComponent } from './users/user-create/user-create.component';
import { UserDetailComponent } from './users/user-detail/user-detail.component';
import { AddPoliciesComponent } from './users/user-detail/add-policies/add-policies.component';
import { AddToGroupComponent } from './users/user-detail/add-to-group/add-to-group.component';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { AngJsoneditorModule } from '@maaxgr/ang-jsoneditor';
import { PolicyAttachComponent } from './policy/policy-attach/policy-attach.component';
import { PopupAttachPolicyComponent } from './policy/popup-policy/popup-attach-policy.component';
import { PolicyDetachComponent } from './policy/policy-detach/policy-detach.component';
import { PopupDetachPolicyComponent } from './policy/popup-policy/popup-detach-policy.component';
import { PolicyDetailComponent } from './policy/policy-detail/policy-detail.component';
import { PolicyUpdateComponent } from './policy/policy-update/policy-update.component';
import { IamDashboardComponent } from './iam/dashboard/iam-dashboard.component';
import { CreateUserGroupComponent } from './iam/user-group/create/create-user-group.component';
import { DeleteUserGroupComponent } from './iam/user-group/delete/delete-many-group/delete-user-group.component';
import { DeleteOneUserGroupComponent } from './iam/user-group/delete/delete-one/delete-one-user-group.component';
import { DetailUserGroupComponent } from './iam/user-group/detail/detail-user-group.component';
import { EditUserGroupComponent } from './iam/user-group/edit/edit-user-group.component';
import { ListUserGroupComponent } from './iam/user-group/list/list-user-group.component';
import { JsonViewerComponent } from './iam/user-group/detail/json-viewer.component';
import { UsersTableComponent } from './iam/user-group/create/users-table.component';
import { PolicyTableComponent } from './iam/user-group/create/policy-table.component';
import { ClipboardModule } from 'ngx-clipboard';
import { AttachPermissionPolicyComponent } from './users/attach-permission-policy/attach-permission-policy.component';
import { CreatePolicyComponent } from './iam/user-group/policy/create/create-policy.component';
import { CreateUserComponent } from './iam/user-group/user/create/create-user.component';
import { PrettyPrintPipe } from './iam/user-group/create/pretty-print.pipe';
import { BlankScheduleBackupComponent } from './schedule-backup/blank/blank-schedule-backup.component';
import { ListScheduleBackupComponent } from './schedule-backup/list/list-schedule-backup.component';
import { CreateScheduleBackupComponent } from './schedule-backup/create/create-schedule-backup.component';
import { ScheduleBackupVmComponent } from './schedule-backup/create/backup-vm/schedule-backup-vm.component';
import { ScheduleBackupVolumeComponent } from './schedule-backup/create/backup-volume/schedule-backup-volume.component';
import { EditScheduleBackupVolumeComponent } from './schedule-backup/edit/schedule-backup-volume/edit-schedule-backup-volume.component';
import { EditScheduleBackupVmComponent } from './schedule-backup/edit/schedule-backup-vm/edit-schedule-backup-vm.component';
import { DeleteScheduleComponent } from './schedule-backup/delete/delete-schedule.component';
import { SnapshotScheduleListComponent } from './snapshot-schedule/snapshot-schedule-list/snapshot-schedule-list.component';
import { SnapshotScheduleCreateComponent } from './snapshot-schedule/snapshot-schedule-create/snapshot-schedule-create.component';
import { SnapshotScheduleDetailComponent } from './snapshot-schedule/snapshot-schedule-detai/snapshotp-schedule-detail.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PaymentDetailComponent } from './payment/payment-detail.component';
import { OrderListComponent } from './order/order-list/order-list.component';
import { ListPaymentComponent } from './billing/payment/list/list-payment.component';

const icons: IconDefinition[] = [SettingOutline, SearchOutline];

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    UserProfileComponent,
    V1Component,
    SecurityGroupComponent,
    CreateSecurityGroupComponent,
    CreateInboundComponent,
    ListOutboundComponent,
    CreateOutboundComponent,
    ListAllowAddressPairComponent,
    DeleteSecurityGroupComponent,
    DeleteSecurityGroupComponent,
    DeleteRuleComponent,
    InboundListComponent,
    ListOutboundComponent,
    CreateAllowAddressPairComponent,
    ListVirtualMachineComponent,
    BlankSecurityGroupComponent,
    FormRuleComponent,
    SshKeyComponent,
    VolumeComponent,
    PopupAddVolumeComponent,
    PopupDeleteVolumeComponent,
    CreateVolumeComponent,
    DetailVolumeComponent,
    PopupExtendVolumeComponent,
    EditVolumeComponent,
    HeaderVolumeComponent,
    DeleteAllowAddressPairComponent,
    IpPublicComponent,
    CreateUpdateIpPublicComponent,
    DetailIpPublicComponent,
    HeaderComponent,
    PopupCancelVolumeComponent,
    SnapshotVolumeListComponent,
    SnappshotvlDetailComponent,
    BlankBackupVmComponent,
    ListBackupVmComponent,
    RestoreBackupVmComponent,
    DeleteBackupVmComponent,
    PopupDeleteSnapshotVolumeComponent,
    PopupEditSnapshotVolumeComponent,
    ActionHistoryComponent,
    DetailBackupVmComponent,
    CreateBackupVmComponent,
    CreateBackupVolumeComponent,
    ListBackupVolumeComponent,
    DetailBackupVolumeComponent,
    AttachOrDetachComponent,
    CurrentVirtualMachineComponent,
    NewVirtualMachineComponent,
    IamDashboardComponent,
    CreateUserGroupComponent,
    DeleteUserGroupComponent,
    DeleteOneUserGroupComponent,
    DetailUserGroupComponent,
    EditUserGroupComponent,
    ListUserGroupComponent,
    JsonViewerComponent,
    UsersTableComponent,
    PolicyTableComponent,
    PolicyAttachComponent,
    PopupAttachPolicyComponent,
    PolicyDetachComponent,
    PopupDetachPolicyComponent,
    PolicyDetailComponent,
    PolicyUpdateComponent,
    UserComponent,
    UserCreateComponent,
    UserDetailComponent,
    AddPoliciesComponent,
    AddToGroupComponent,
    AttachPermissionPolicyComponent,
    CreatePolicyComponent,
    CreateUserComponent,
    PrettyPrintPipe,
    BlankScheduleBackupComponent,
    ListScheduleBackupComponent,
    CreateScheduleBackupComponent,
    ScheduleBackupVmComponent,
    ScheduleBackupVolumeComponent,
    EditScheduleBackupVolumeComponent,
    EditScheduleBackupVmComponent,
    DeleteScheduleComponent,
    SnapshotScheduleListComponent,
    SnapshotScheduleCreateComponent,
    SnapshotScheduleDetailComponent,
    PaymentDetailComponent,
    DashboardComponent,
    OrderListComponent,
    ListPaymentComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    G2MiniBarModule,
    PagesRoutingModule,
    NzResultModule,
    SHARED_ZORRO_MODULES,
    SEModule,
    SharedModule,
    NzPaginationModule,
    NzResultModule,
    SharedModule,
    PagesRoutingModule,
    NzLayoutModule,
    SharedModule,
    NzSpaceModule,
    NzPageHeaderModule,
    NzIconModule.forRoot(icons),
    NzResultModule,
    NgOptimizedImage,
    NzImageModule,
    NzImageModule,
    LayoutDefaultModule,
    DragDropModule,
    NgxJsonViewerModule,
    // Starting Angular 13
    AngJsoneditorModule,
    ClipboardModule,
  ],
})
export class PagesModule {}
