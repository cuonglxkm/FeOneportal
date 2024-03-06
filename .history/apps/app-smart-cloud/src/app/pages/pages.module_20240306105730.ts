import { CommonModule, NgOptimizedImage } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IconDefinition } from '@ant-design/icons-angular';
import { SearchOutline, SettingOutline } from '@ant-design/icons-angular/icons';
import { SEModule } from '@delon/abc/se';
import { G2MiniBarModule } from '@delon/chart/mini-bar';
import { LayoutDefaultModule } from '@delon/theme/layout-default';
import { SharedModule } from '@shared';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { SHARED_ZORRO_MODULES } from '../shared/shared-zorro.module';
import { ActionHistoryComponent } from './action-history/action-history.component';
import { CreateAllowAddressPairComponent } from './allow-address-pair/create/create-allow-address-pair.component';
import { DeleteAllowAddressPairComponent } from './allow-address-pair/delete/delete-allow-address-pair.component';
import { ListAllowAddressPairComponent } from './allow-address-pair/list/list-allow-address-pair.component';
import { BlankBackupVmComponent } from './backup-vm/blank/blank-backup-vm.component';
import { CreateBackupVmComponent } from './backup-vm/create/create-backup-vm.component';
import { DeleteBackupVmComponent } from './backup-vm/delete/delete-backup-vm.component';
import { DetailBackupVmComponent } from './backup-vm/detail/detail-backup-vm.component';
import { ListBackupVmComponent } from './backup-vm/list/list-backup-vm.component';
import { CurrentVirtualMachineComponent } from './backup-vm/restore/current-virtual-machine/current-virtual-machine.component';
import { NewVirtualMachineComponent } from './backup-vm/restore/new-virtual-machine/new-virtual-machine.component';
import { RestoreBackupVmComponent } from './backup-vm/restore/restore-backup-vm.component';
import { HeaderComponent } from './header/header.component';
import { CreateUpdateIpPublicComponent } from './ip-public/create-update-ip-public/create-update-ip-public.component';
import { DetailIpPublicComponent } from './ip-public/detail-ip-public/detail-ip-public.component';
import { IpPublicComponent } from './ip-public/ip-public.component';
import { PagesRoutingModule } from './pages-routing.module';
import { BlankSecurityGroupComponent } from './security-group/blank-security-group/blank-security-group.component';
import { CreateSecurityGroupComponent } from './security-group/create-security-group/create-security-group.component';
import { DeleteRuleComponent } from './security-group/delete-rule/delete-rule.component';
import { DeleteSecurityGroupComponent } from './security-group/delete-security-group/delete-security-group.component';
import { FormRuleComponent } from './security-group/form-rule/form-rule.component';
import { CreateInboundComponent } from './security-group/inbound/create/create-inbound.component';
import { InboundListComponent } from './security-group/inbound/list/inbound-list.component';
import { SecurityGroupComponent } from './security-group/list-security-group/security-group.component';
import { CreateOutboundComponent } from './security-group/outbound/create/create-outbound.component';
import { ListOutboundComponent } from './security-group/outbound/list/list-outbound.component';
import { AttachOrDetachComponent } from './security-group/vm/attach-or-detach/attach-or-detach.component';
import { PopupDeleteSnapshotVolumeComponent } from './snapshot-volume/popup-snapshot/popup-delete-snapshot-volume.component';
import { PopupEditSnapshotVolumeComponent } from './snapshot-volume/popup-snapshot/popup-edit-snapshot-volume.component';
import { SnappshotvlDetailComponent } from './snapshot-volume/snapshotvl-detail/snappshotvl-detail.component';
import { SnapshotVolumeListComponent } from './snapshot-volume/snapshotvl-list/snapshotvl-list.component';
import { SshKeyComponent } from './ssh-key/ssh-key.component';
import { V1Component } from './test/v1.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { CreateVolumeComponent } from './volume/component/create-volume/create-volume.component';
import { DetailVolumeComponent } from './volume/component/detail-volume/detail-volume.component';
import { EditVolumeComponent } from './volume/component/edit-volume/edit-volume.component';
import { HeaderVolumeComponent } from './volume/component/header-volume/header-volume.component';
import { VolumeComponent } from './volume/component/list-volume/volume.component';
import { PopupAddVolumeComponent } from './volume/component/popup-volume/popup-add-volume.component';
import { PopupCancelVolumeComponent } from './volume/component/popup-volume/popup-cancel-volume.component';
import { PopupDeleteVolumeComponent } from './volume/component/popup-volume/popup-delete-volume.component';
import { PopupExtendVolumeComponent } from './volume/component/popup-volume/popup-extend-volume.component';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { AngJsoneditorModule } from '@maaxgr/ang-jsoneditor';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { ClipboardModule } from 'ngx-clipboard';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { CreatePackageBackupComponent } from './backup-package/create/create-package-backup.component';
import { DeleteBackupPackageComponent } from './backup-package/delete/delete-backup-package.component';
import { DetailPackageBackupComponent } from './backup-package/detail/detail-package-backup.component';
import { EditBackupPackageComponent } from './backup-package/edit/edit-backup-package.component';
import { ExtendBackupPackageComponent } from './backup-package/extend/extend-backup-package.component';
import { ListPackagesBackupComponent } from './backup-package/list/list-packages-backup.component';
import { PaymentDetailComponent } from './billing/payment/detail/payment-detail.component';
import { ListPaymentComponent } from './billing/payment/list/list-payment.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CreateFileSystemSnapshotComponent } from './file-system/create-file-system-snapshot/create-file-system.component-snapshot';
import { FileSystemSnapshotComponent } from './file-system/file-system-snapshot.component';
import { IamDashboardComponent } from './iam/dashboard/iam-dashboard.component';
import { CreateUserGroupComponent } from './iam/user-group/create/create-user-group.component';
import { PolicyTableComponent } from './iam/user-group/create/policy-table.component';
import { PrettyPrintPipe } from './iam/user-group/create/pretty-print.pipe';
import { UsersTableComponent } from './iam/user-group/create/users-table.component';
import { DeleteUserGroupComponent } from './iam/user-group/delete/delete-many-group/delete-user-group.component';
import { DeleteOneUserGroupComponent } from './iam/user-group/delete/delete-one/delete-one-user-group.component';
import { DetailUserGroupComponent } from './iam/user-group/detail/detail-user-group.component';
import { JsonViewerComponent } from './iam/user-group/detail/json-viewer.component';
import { EditUserGroupComponent } from './iam/user-group/edit/edit-user-group.component';
import { ListUserGroupComponent } from './iam/user-group/list/list-user-group.component';
import { CreatePolicyComponent } from './iam/user-group/policy/create/create-policy.component';
import { CreateUserComponent } from './iam/user-group/user/create/create-user.component';
import { AttachIpFloatingComponent } from './ip-floating/attach/attach-ip-floating.component';
import { CreateIpFloatingComponent } from './ip-floating/create-ip-floating/create-ip-floating.component';
import { ListIpFloatingComponent } from './ip-floating/list-ip-floating.component';
import { ExtendIpPublicComponent } from './ip-public/extend-ip-public/extend-ip-public.component';
import { OrderDetailComponent } from './order/order-detail/order-detail.component';
import { OrderListComponent } from './order/order-list/order-list.component';
import { PolicyAttachComponent } from './policy/policy-attach/policy-attach.component';
import { PolicyDetachComponent } from './policy/policy-detach/policy-detach.component';
import { PolicyDetailComponent } from './policy/policy-detail/policy-detail.component';
import { PolicyUpdateComponent } from './policy/policy-update/policy-update.component';
import { PopupAttachPolicyComponent } from './policy/popup-policy/popup-attach-policy.component';
import { PopupDetachPolicyComponent } from './policy/popup-policy/popup-detach-policy.component';
import { RouterDetailComponent } from './routers/router-detail/router-detail.component';
import { RouterListComponent } from './routers/router-list.component';
import { BlankScheduleBackupComponent } from './schedule-backup/blank/blank-schedule-backup.component';
import { ScheduleBackupVmComponent } from './schedule-backup/create/backup-vm/schedule-backup-vm.component';
import { ScheduleBackupVolumeComponent } from './schedule-backup/create/backup-volume/schedule-backup-volume.component';
import { CreateScheduleBackupComponent } from './schedule-backup/create/create-schedule-backup.component';
import { DeleteScheduleComponent } from './schedule-backup/delete/delete-schedule.component';
import { EditScheduleBackupVmComponent } from './schedule-backup/edit/schedule-backup-vm/edit-schedule-backup-vm.component';
import { EditScheduleBackupVolumeComponent } from './schedule-backup/edit/schedule-backup-volume/edit-schedule-backup-volume.component';
import { ListScheduleBackupComponent } from './schedule-backup/list/list-schedule-backup.component';
import { SnapshotScheduleCreateComponent } from './snapshot-schedule/snapshot-schedule-create/snapshot-schedule-create.component';
import { SnapshotScheduleDetailComponent } from './snapshot-schedule/snapshot-schedule-detai/snapshotp-schedule-detail.component';
import { SnapshotScheduleEditComponent } from './snapshot-schedule/snapshot-schedule-edit/snapshot-schedule-edit.component';
import { SnapshotScheduleListComponent } from './snapshot-schedule/snapshot-schedule-list/snapshot-schedule-list.component';
import { AttachPermissionPolicyComponent } from './users/attach-permission-policy/attach-permission-policy.component';
import { UserCreateComponent } from './users/user-create/user-create.component';
import { AddPoliciesComponent } from './users/user-detail/add-policies/add-policies.component';
import { AddToGroupComponent } from './users/user-detail/add-to-group/add-to-group.component';
import { UserDetailComponent } from './users/user-detail/user-detail.component';
import { UserComponent } from './users/user.component';
import { CreateNetworkComponent } from './vlan/create/create-network/create-network.component';
import { VlanCreatePortComponent } from './vlan/create/create-port/vlan-create-port.component';
import { VlanCreateSubnetComponent } from './vlan/create/create-subnet/vlan-create-subnet.component';
import { VlanDetailComponent } from './vlan/detail/vlan-detail.component';
import { VlanEditSubnetComponent } from './vlan/edit/vlan-edit-subnet.component';
import { SubnetFormComponent } from './vlan/form/subnet-form.component';
import { ListVlanComponent } from './vlan/list/list-vlan.component';
import { CreateBackupVolumeComponent } from './volume/component/backup-volume/create-backup-volume/create-backup-volume.component';
import { DetailBackupVolumeComponent } from './volume/component/backup-volume/detail-backup-volume/detail-backup-volume.component';
import { ListBackupVolumeComponent } from './volume/component/backup-volume/list-backup-volume/list-backup-volume.component';
import { BlankVolumeComponent } from './volume/component/blank/blank-volume.component';
import { CreateVolumeVpcComponent } from './volume/component/create-volume-vpc/create-volume-vpc.component';
import { RenewVolumeComponent } from './volume/component/renew-volume/renew-volume.component';
import { ResizeVolumeVpcComponent } from './volume/component/resize-volume-vpc/resize-volume-vpc.component';

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
    OrderDetailComponent,
    RenewVolumeComponent,
    ExtendIpPublicComponent,
    SnapshotScheduleEditComponent,
    ListPackagesBackupComponent,
    DetailPackageBackupComponent,
    CreatePackageBackupComponent,
    ExtendBackupPackageComponent,
    EditBackupPackageComponent,
    DeleteBackupPackageComponent,
    CreateVolumeVpcComponent,
    ResizeVolumeVpcComponent,
    ListVlanComponent,
    BlankVolumeComponent,
    VlanDetailComponent,
    RouterListComponent,
    RouterDetailComponent,
    CreateNetworkComponent,
    VlanCreatePortComponent,
    VlanCreateSubnetComponent,
    VlanEditSubnetComponent,
    SubnetFormComponent,
    ListIpFloatingComponent,
    CreateIpFloatingComponent,
    CreateIpFloatingComponent,
    AttachIpFloatingComponent,
    FileSystemSnapshotComponent,
    CreateFileSystemSnapshotComponent
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
    NzModalModule,
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
