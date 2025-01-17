import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { V1Component } from './test/v1.component';
import { G2MiniBarModule } from '@delon/chart/mini-bar';
import { PagesRoutingModule } from './pages-routing.module';
import { SharedModule } from '@shared';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { ListAllowAddressPairComponent } from './allow-address-pair/list/list-allow-address-pair.component';
import { IconDefinition } from '@ant-design/icons-angular';
import { SearchOutline, SettingOutline } from '@ant-design/icons-angular/icons';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CreateAllowAddressPairComponent } from './allow-address-pair/create/create-allow-address-pair.component';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { SshKeyComponent } from './ssh-key/ssh-key.component';
import { DeleteAllowAddressPairComponent } from './allow-address-pair/delete/delete-allow-address-pair.component';
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
import { ListBackupVmComponent } from './backup-vm/list/list-backup-vm.component';
import { LayoutDefaultModule } from '@delon/theme/layout-default';
import { DeleteBackupVmComponent } from './backup-vm/delete/delete-backup-vm.component';
import { ActionHistoryComponent } from './action-history/action-history.component';
import { DetailBackupVmComponent } from './backup-vm/detail/detail-backup-vm.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
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
import { EditScheduleBackupVolumeComponent } from './schedule-backup/edit/schedule-backup-volume/edit-schedule-backup-volume.component';
import { EditScheduleBackupVmComponent } from './schedule-backup/edit/schedule-backup-vm/edit-schedule-backup-vm.component';
import { DeleteScheduleComponent } from './schedule-backup/action/delete/delete-schedule.component';
import { SnapshotScheduleListComponent } from './snapshot-schedule/snapshot-schedule-list/snapshot-schedule-list.component';
import { SnapshotScheduleCreateComponent } from './snapshot-schedule/snapshot-schedule-create/snapshot-schedule-create.component';
import { SnapshotScheduleDetailComponent } from './snapshot-schedule/snapshot-schedule-detai/snapshotp-schedule-detail.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PaymentDetailComponent } from './billing/payment/detail/payment-detail.component';
import { OrderListComponent } from './order/order-list/order-list.component';
import { ListPaymentComponent } from './billing/payment/list/list-payment.component';
import { OrderDetailComponent } from './order/order-detail/order-detail.component';
import { RenewVolumeComponent } from './volume/component/renew-volume/renew-volume.component';
import { SnapshotScheduleEditComponent } from './snapshot-schedule/snapshot-schedule-edit/snapshot-schedule-edit.component';
import { ListPackagesBackupComponent } from './backup-package/list/list-packages-backup.component';
import { DetailPackageBackupComponent } from './backup-package/detail/detail-package-backup.component';
import { CreatePackageBackupComponent } from './backup-package/create/create-package-backup.component';
import { ExtendBackupPackageComponent } from './backup-package/extend/extend-backup-package.component';
import { EditBackupPackageComponent } from './backup-package/edit/edit-backup-package.component';
import { DeleteBackupPackageComponent } from './backup-package/delete/delete-backup-package.component';
import { ExtendIpPublicComponent } from './ip-public/extend-ip-public/extend-ip-public.component';
import { CreateVolumeVpcComponent } from './volume/component/create-volume-vpc/create-volume-vpc.component';
import { ResizeVolumeVpcComponent } from './volume/component/resize-volume-vpc/resize-volume-vpc.component';
import { ListVlanComponent } from './vlan/list/list-vlan.component';
import { VlanDetailComponent } from './vlan/detail/vlan-detail.component';
import { RouterListComponent } from './routers/router-list.component';
import { RouterDetailComponent } from './routers/router-detail/router-detail.component';
import { CreateNetworkComponent } from './vlan/create/create-network/create-network.component';
import { VlanCreatePortComponent } from './vlan/create/create-port/vlan-create-port.component';
import { VlanCreateSubnetComponent } from './vlan/create/create-subnet/vlan-create-subnet.component';
import { VlanEditSubnetComponent } from './vlan/edit/edit-subnet/vlan-edit-subnet.component';
import { SubnetFormComponent } from './vlan/form/subnet-form.component';
import { ListIpFloatingComponent } from './ip-floating/list-ip-floating.component';
import { CreateIpFloatingComponent } from './ip-floating/create-ip-floating/create-ip-floating.component';
import { AttachIpFloatingComponent } from './ip-floating/attach/attach-ip-floating.component';
import { DetachIpFloatingComponent } from './ip-floating/detach/detach-ip-floating.component';
import { DeleteIpFloatingComponent } from './ip-floating/delete/delete-ip-floating.component';
import { DeleteVlanComponent } from './vlan/delete/delete-vlan/delete-vlan.component';
import { VlanEditComponent } from './vlan/edit/edit-vlan/vlan-edit.component';
import { DeleteSubnetComponent } from './vlan/delete/delete-subnet/delete-subnet.component';
import { AttachPortComponent } from './vlan/attach/attach-port.component';
import { DetachPortComponent } from './vlan/detach/detach-port.component';
import { DeletePortComponent } from './vlan/delete/delete-port/delete-port.component';
import { AttachVolumeComponent } from './volume/component/action/attach-volume/attach-volume.component';
import { DetachVolumeComponent } from './volume/component/action/detach-volume/detach-volume.component';
import { DeleteVolumeComponent } from './volume/component/action/delete-volume/delete-volume.component';
import { UpdateVolumeComponent } from './volume/component/action/update-volume/update-volume.component';
import { BucketListComponent } from './bucket/bucket-list.component';
import { BucketCreateComponent } from './bucket/bucket-create/bucket-create.component';
import { BucketConfigureComponent } from './bucket/bucket-configure/bucket-configure.component';
import { StaticWebHostingComponent } from './bucket/bucket-configure/static-web-hosting/static-web-hosting.component';
import { LifecycleConfigComponent } from './bucket/bucket-configure/lifecycle-config/lifecycle-config.component';
import { BucketPolicyComponent } from './bucket/bucket-configure/bucket-policy/bucket-policy.component';
import { BucketCorsComponent } from './bucket/bucket-configure/bucket-cors/bucket-cors.component';
import { BucketDetailComponent } from './bucket/bucket-detail/bucket-detail.component';
import { FileSystemSnapshotComponent } from './file-system-snapshot/file-system-snapshot.component';
import { FileSystemSnapshotDetailComponent } from './file-system-snapshot/file-system-snapshot-detail/file-system-snapshot-detai.component';
import { CreateFileSystemSnapshotComponent } from './file-system-snapshot/create-file-system-snapshot/create-file-system-snapshot.component';
import { CreateFileSystemSnapshotScheduleComponent } from './file-system-snapshot-schedule/create-file-system-snapshot-schedule/create-file-system-snapshot-schedule.component';
import { FileSystemSnapshotScheduleComponent } from './file-system-snapshot-schedule/file-system-snapshot-schedule.component';
import { ListFileSystemComponent } from './file-storage/list/list-file-system.component';
import { ListWanComponent } from './wan/list/list-wan.component';
import { DeleteWanComponent } from './wan/action/delete-wan/delete-wan.component';
import { DetachWanComponent } from './wan/action/detach-wan/detach-wan.component';
import { CreateWanComponent } from './wan/create/create-wan.component';
import { AttachWanComponent } from './wan/action/attach-wan/attach-wan.component';
import { CreateFileSystemComponent } from './file-storage/file-system/action/create/create-file-system.component';
import { DetailFileSystemComponent } from './file-storage/detail/detail-file-system.component';
import { ResizeFileSystemComponent } from './file-storage/file-system/action/resize/resize-file-system.component';
import { DeleteFileSystemComponent } from './file-storage/delete/delete-file-system.component';
import { EditFileSystemComponent } from './file-storage/file-system/edit/edit-file-system.component';
import { ListAccessRuleComponent } from './file-storage/access-rule/list/list-access-rule.component';
import { CreateAccessRuleComponent } from './file-storage/access-rule/action/create/create-access-rule.component';
import { DeleteAccessRuleComponent } from './file-storage/access-rule/action/delete/delete-access-rule.component';
import { ListSubUserComponent } from './sub-user/list/list-sub-user.component';
import { CreateSubUserComponent } from './sub-user/action/create/create-sub-user.component';
import { DeleteSubUserComponent } from './sub-user/action/delete/delete-sub-user.component';
import { EditSubUserComponent } from './sub-user/action/edit/edit-sub-user.component';
import { DeleteFileSystemSnapshotScheduleComponent } from './file-system-snapshot-schedule/delete-file-system-snapshot-schedule-file-system-snapshot-schedule/delete-file-system-snapshot-schedule.component';
import { EditFileSystemSnapshotScheduleComponent } from './file-system-snapshot-schedule/edit-file-system-snapshot-schedule/edit-file-system-snapshot-schedule.component';
import { PauseFileSystemSnapshotScheduleComponent } from './file-system-snapshot-schedule/pause-file-system-snapshot-schedule-file-system-snapshot-schedule/pause-file-system-snapshot-schedule.component';
import { DeleteFileSystemSnapshotComponent } from './file-system-snapshot/delete-create-file-system-snapshot/delete-file-system-snapshot.component';
import { EditFileSystemSnapshotComponent } from './file-system-snapshot/edit-file-system-snapshot/edit-file-system-snapshot.component';
import { ObjectStorageComponent } from './object-storage/object-storage.component';
import { ObjectStorageCreateComponent } from './object-storage/object-storage-create/object-storage-create.component';
import { ObjectStorageExtendComponent } from './object-storage/object-storage-extend/object-storage-extend.component';
import { ObjectStorageEditComponent } from './object-storage/object-storage-edit/object-storage-edit.component';
import { DashboardObjectStorageComponent } from './dashboard-object-storage/dashboard-object-storage.component';
import { ChartComponent } from './dashboard-object-storage/chart/chart.component';
import { S3KeyComponent } from './object-storage/s3-key/s3-key.component';
import { TreeFolderComponent } from './bucket/bucket-detail/share/tree-folder.component';
import { SafePipe } from '../../../../../libs/common-utils/src';
// import { ChartModule } from '@syncfusion/ej2-angular-charts';
import { StopScheduleComponent } from './schedule-backup/action/stop/stop-schedule.component';
import { RestoreScheduleComponent } from './schedule-backup/action/restore/restore-schedule.component';
import { ReplayScheduleComponent } from './schedule-backup/action/replay/replay-schedule.component';
import { ListSecurityGroupComponent } from './security-group/list/list-security-group.component';
import { CreateSecurityGroupComponent } from './security-group/action/sg/create/create-security-group.component';
import { DeleteSecurityGroupComponent } from './security-group/action/sg/delete/delete-security-group.component';
import { ListInboundComponent } from './security-group/rule/inbound/List-Inbound.component';
import { DeleteInboundComponent } from './security-group/action/rule/inbound/delete/delete-inbound.component';
import { CreateInboundComponent } from './security-group/action/rule/inbound/create/create-inbound.component';
import { DeleteOutboundComponent } from './security-group/action/rule/outbound/delete/delete-outbound.component';
import { ListOutboundComponent } from './security-group/rule/outbound/list-outbound.component';
import { DetachVmComponent } from './security-group/action/vm/detach/detach-vm.component';
import { AttachVmComponent } from './security-group/action/vm/attach/attach-vm.component';
import { FormRuleComponent } from './security-group/action/rule/form/form-rule.component';
import { CreateOutboundComponent } from './security-group/action/rule/outbound/create/create-outbound.component';
import { SecurityComponent } from './security/security.component';
import { ListLoadBalancerComponent } from './load-balancer/list/list-load-balancer.component';
import { CreateLbNovpcComponent } from './load-balancer/normal/create/create-lb-novpc.component';
import { CreateLbVpcComponent } from './load-balancer/vpc/create/create-lb-vpc.component';
import { DetailLoadBalancerComponent } from './load-balancer/detail/detail-load-balancer.component';
import { EditLoadBalancerVpcComponent } from './load-balancer/vpc/edit/edit-load-balancer-vpc.component';
import { ExtendLoadBalancerNormalComponent } from './load-balancer/normal/extend/extend-load-balancer-normal.component';
import { UpdateLoadBalancerNormalComponent } from './load-balancer/normal/update/update-load-balancer-normal.component';
import { DeleteLoadBalancerComponent } from './load-balancer/delete/delete-load-balancer.component';
import { ListListenerInLbComponent } from './load-balancer/detail/listener/list/list-listener-in-lb.component';
import { ListPoolLoadBalancerComponent } from './load-balancer/detail/pool/list/list-pool-load-balancer.component';
import { ListenerCreateComponent } from './load-balancer/listener/create/listener-create.component';
import { ListenerDetailComponent } from './load-balancer/listener/detail/listener-detail.component';
import { ListenerUpdateComponent } from './load-balancer/listener/update/listener-update.component';
import { PoolDetailComponent } from './load-balancer/pool-detail/pool-detail.component';
import { EllipsisModule } from '@delon/abc/ellipsis';
import { AutofocusDirective } from './volume/autofocus-directive.component';
import { CreateL7PolicyComponent } from './load-balancer/listener/L7-policy/create/create-l7-policy.component';
import { DetailL7PolicyComponent } from './load-balancer/listener/L7-policy/detail/detail-l7-policy.component';
import { EditL7PolicyComponent } from './load-balancer/listener/L7-policy/edit/edit-l7-policy.component';
import { CreatePoolInLbComponent } from './load-balancer/detail/pool/create/create-pool-in-lb.component';
import { EditPoolInLbComponent } from './load-balancer/detail/pool/edit/edit-pool-in-lb.component';
import { DeletePoolInLbComponent } from './load-balancer/detail/pool/delete/delete-pool-in-lb.component';
import { CreateL7RuleComponent } from './load-balancer/listener/L7-policy/detail/l7-rule/create/create-l7-rule.component';
import { DeleteL7RuleComponent } from './load-balancer/listener/L7-policy/detail/l7-rule/delete/delete-l7-rule.component';
import { DeleteL7PolicyComponent } from './load-balancer/listener/L7-policy/delete/delete-l7-policy.component';
import { HttpClientModule } from '@angular/common/http';
import { CreateFileSystemNormalComponent } from './file-storage/no-vpc/create/create-file-system-normal.component';
import { ExtendFileSystemNormalComponent } from './file-storage/no-vpc/extend/extend-file-system-normal.component';
import { ResizeFileSystemNormalComponent } from './file-storage/no-vpc/resize/resize-file-system-normal.component';
import { CreateIpFloatingNormalComponent } from './ip-floating/create-ip-floating-normal.component';
import { ExtendIpFloatingComponent } from './ip-floating/extend-ip-floating/extend-ip-floating.component';
import { AttachIpFloatingLbComponent } from './load-balancer/list/attach/attach-ip-floating-lb.component';
import { DetachIpFloatingLbComponent } from './load-balancer/list/detach/detach-ip-floating-lb.component';
import { CreateBackupVmNormalComponent } from './backup-vm/create/no-vpc/create-backup-vm-normal.component';
import { CreateBackupVmVpcComponent } from './backup-vm/create/vpc/create-backup-vm-vpc.component';
import { RestoreBackupVolumeComponent } from './volume/component/backup-volume/restore-backup-volume/restore-backup-volume.component';
import { UpdateBackupVmComponent } from './backup-vm/update/update-backup-vm.component';
import { NetworkTopologyComponent } from './network-topology/network-topology.component';
import { CreateBackupVolumeVpcComponent } from './volume/component/backup-volume/create-backup-volume/vpc/create-backup-volume-vpc.component';
import { CreateBackupVolumeNormalComponent } from './volume/component/backup-volume/create-backup-volume/no-vpc/create-backup-volume-normal.component';
import { UpdateBackupVolumeComponent } from './volume/component/backup-volume/update-backup-volume/update-backup-volume.component';
import { SslCertListComponent } from './ssl-cert/ssl-cert-list.component';
import { CreateSslCertComponent } from './ssl-cert/create/create-ssl-cert.component';
import { ExtendFileSystemSnapshotComponent } from './file-system-snapshot/extend-file-system-snapshot/extend-file-system-snapshot.component';
import { DeleteSslCertComponent } from './ssl-cert/delete/delete-ssl-cert.component';

import { TrimDirective } from './file-storage/TrimDirective';
import { DeleteBackupVolumeComponent } from './volume/component/backup-volume/delete-backup-volume/delete-backup-volume.component';
import { RestoreBackupVmComponent } from './backup-vm/restore-backup-vm/restore-backup-vm.component';
import {
  NguCarousel,
  NguCarouselDefDirective,
  NguCarouselNextDirective,
  NguCarouselPrevDirective,
  NguItemComponent,
  NguTileComponent,
} from '@ngu/carousel';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { UpdateBackupPackageComponent } from './backup-package/update/update-backup-package.component';
import { SnapshotCreateComponent } from './snapshot/create/snapshot-create.component';
import { SnapshotListComponent } from './snapshot/list/snapshot-list.component';
import { RestoreBackupVmVpcComponent } from './backup-vm/restore-backup-vm-vpc/restore-backup-vm-vpc.component';
import { RestoreBackupVolumeVpcComponent } from './volume/component/backup-volume/restore-backup-volume-vpc/restore-backup-volume-vpc.component';
import { SnapshotDetailComponent } from './snapshot/detail/snapshot-detail.component';
import { QRCodeModule } from 'angularx-qrcode';
import { InvoiceDetailComponent } from './billing/payment/invoice-detail/invoice-detail.component';
import { CreateScheduleBackupVpcComponent } from './schedule-backup/create-vpc/create-schedule-backup-vpc.component';
import { ChartModule } from 'angular-highcharts';
// import { BaseChartDirective } from 'ng2-charts';

const icons: IconDefinition[] = [SettingOutline, SearchOutline];

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    UserProfileComponent,
    V1Component,
    ListAllowAddressPairComponent,
    CreateAllowAddressPairComponent,
    SshKeyComponent,
    VolumeComponent,
    PopupAddVolumeComponent,
    PopupDeleteVolumeComponent,
    CreateVolumeComponent,
    DetailVolumeComponent,
    PopupExtendVolumeComponent,
    EditVolumeComponent,
    DeleteAllowAddressPairComponent,
    IpPublicComponent,
    CreateUpdateIpPublicComponent,
    DetailIpPublicComponent,
    HeaderComponent,
    PopupCancelVolumeComponent,
    SnapshotVolumeListComponent,
    SnappshotvlDetailComponent,
    ListBackupVmComponent,
    DeleteBackupVmComponent,
    ActionHistoryComponent,
    DetailBackupVmComponent,
    ListBackupVolumeComponent,
    DetailBackupVolumeComponent,
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
    DetachIpFloatingComponent,
    DeleteIpFloatingComponent,
    DeleteVlanComponent,
    VlanEditComponent,
    DeleteSubnetComponent,
    AttachPortComponent,
    DetachPortComponent,
    DeletePortComponent,
    AttachVolumeComponent,
    AttachVolumeComponent,
    DetachVolumeComponent,
    DeleteVolumeComponent,
    UpdateVolumeComponent,
    BucketListComponent,
    BucketCreateComponent,
    BucketConfigureComponent,
    StaticWebHostingComponent,
    LifecycleConfigComponent,
    BucketPolicyComponent,
    BucketCorsComponent,
    BucketDetailComponent,
    FileSystemSnapshotComponent,
    FileSystemSnapshotDetailComponent,
    CreateFileSystemSnapshotComponent,
    CreateFileSystemSnapshotScheduleComponent,
    FileSystemSnapshotScheduleComponent,
    ListFileSystemComponent,
    ListWanComponent,
    DeleteWanComponent,
    DetachWanComponent,
    CreateWanComponent,
    AttachWanComponent,
    CreateFileSystemComponent,
    DetailFileSystemComponent,
    ResizeFileSystemComponent,
    DeleteFileSystemComponent,
    EditFileSystemComponent,
    ListAccessRuleComponent,
    CreateAccessRuleComponent,
    DeleteAccessRuleComponent,
    ListSubUserComponent,
    CreateSubUserComponent,
    DeleteSubUserComponent,
    EditSubUserComponent,
    DeleteFileSystemSnapshotScheduleComponent,
    EditFileSystemSnapshotScheduleComponent,
    PauseFileSystemSnapshotScheduleComponent,
    DeleteFileSystemSnapshotComponent,
    EditFileSystemSnapshotComponent,
    DashboardObjectStorageComponent,
    ObjectStorageComponent,
    ObjectStorageCreateComponent,
    ObjectStorageExtendComponent,
    ObjectStorageEditComponent,
    ChartComponent,
    S3KeyComponent,
    TreeFolderComponent,
    StopScheduleComponent,
    RestoreScheduleComponent,
    ReplayScheduleComponent,
    ListSecurityGroupComponent,
    CreateSecurityGroupComponent,
    DeleteSecurityGroupComponent,
    ListInboundComponent,
    DeleteInboundComponent,
    CreateInboundComponent,
    DeleteOutboundComponent,
    ListOutboundComponent,
    FormRuleComponent,
    DetachVmComponent,
    AttachVmComponent,
    CreateOutboundComponent,
    SecurityComponent,
    ListLoadBalancerComponent,
    CreateLbNovpcComponent,
    CreateLbVpcComponent,
    DetailLoadBalancerComponent,
    EditLoadBalancerVpcComponent,
    ExtendLoadBalancerNormalComponent,
    UpdateLoadBalancerNormalComponent,
    DeleteLoadBalancerComponent,
    ListListenerInLbComponent,
    ListPoolLoadBalancerComponent,
    ListenerCreateComponent,
    ListenerDetailComponent,
    ListenerUpdateComponent,
    ListenerUpdateComponent,
    PoolDetailComponent,
    CreateL7PolicyComponent,
    DetailL7PolicyComponent,
    EditL7PolicyComponent,
    CreatePoolInLbComponent,
    EditPoolInLbComponent,
    DeletePoolInLbComponent,
    CreateL7RuleComponent,
    DeleteL7RuleComponent,
    DeleteL7PolicyComponent,
    CreateFileSystemNormalComponent,
    ExtendFileSystemNormalComponent,
    ResizeFileSystemNormalComponent,
    CreateIpFloatingNormalComponent,
    ExtendIpFloatingComponent,
    AttachIpFloatingLbComponent,
    DetachIpFloatingLbComponent,
    CreateBackupVmNormalComponent,
    CreateBackupVmVpcComponent,
    RestoreBackupVolumeComponent,
    UpdateBackupVmComponent,
    NetworkTopologyComponent,
    CreateBackupVolumeVpcComponent,
    CreateBackupVolumeNormalComponent,
    SslCertListComponent,
    CreateSslCertComponent,
    UpdateBackupVolumeComponent,
    CreateSslCertComponent,
    ExtendFileSystemSnapshotComponent,
    DeleteSslCertComponent,
    DeleteBackupVolumeComponent,
    RestoreBackupVmComponent,
    UpdateBackupPackageComponent,
    SnapshotCreateComponent,
    SnapshotCreateComponent,
    SnapshotCreateComponent,
    SnapshotListComponent,
    RestoreBackupVmVpcComponent,
    RestoreBackupVolumeVpcComponent,
    SnapshotDetailComponent,
    SnapshotDetailComponent,
    InvoiceDetailComponent,
    CreateScheduleBackupVpcComponent,
    CreateScheduleBackupVpcComponent,
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
    NzLayoutModule,
    NzSpaceModule,
    NzPageHeaderModule,
    NzIconModule.forRoot(icons),
    NgOptimizedImage,
    NzImageModule,
    LayoutDefaultModule,
    DragDropModule,
    NgxJsonViewerModule,
    // Starting Angular 13
    AngJsoneditorModule,
    ClipboardModule,
    SafePipe,
    EllipsisModule,
    AutofocusDirective,
    // NgChartsModule,
    HttpClientModule,
    TrimDirective,
    CarouselModule,
    NguCarousel,
    NguTileComponent,
    NguCarouselDefDirective,
    NguCarouselNextDirective,
    NguCarouselPrevDirective,
    NguItemComponent, 
    QRCodeModule,
    ChartModule
  ]
})
export class PagesModule {}
