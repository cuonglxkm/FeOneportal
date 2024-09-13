import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DelonACLModule } from '@delon/acl';
import { DelonFormModule } from '@delon/form';
import { AlainThemeModule } from '@delon/theme';

import { SHARED_DELON_MODULES } from './shared-delon.module';
import { SHARED_ZORRO_MODULES } from './shared-zorro.module';
import { RegionSelectDropdownComponent } from './components/region-select-dropdown/region-select-dropdown.component';
import { ProjectSelectDropdownComponent } from './components/project-select-dropdown/project-select-dropdown.component';

import * as AllIcons from '@ant-design/icons-angular/icons';
import { NZ_ICONS } from 'ng-zorro-antd/icon';
import { FlavorSelectComponent } from './components/flavor-select/flavor-select.component';
import { ImageSelectComponent } from './components/image-select/image-select.component';
import { SecurityGroupSelectComponent } from './components/security-group-select/security-group-select.component';
import { PaymentSuccessComponent } from './components/payment-success/payment-success.component';
import { PaymentFailedComponent } from './components/payment-failed/payment-failed.component';
import { PaymentSummaryComponent } from './components/payment-summary/payment-summary.component';
import { IsPermissionPipe } from './pipes/is-permission.pipe';
import { ShareUsersComboboxComponent } from './components/share-users-combobox/share-users-combobox.component';
import { SvgIconComponent } from './components/svg-icon/svg-icon.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { ServiceStatusPipe } from './pipes/status.pipe';
import { formatPrice } from './pipes/formatPrice.pipe';
import { ServiceUsagePeriodComponent } from './components/service-usage-period/service-usage-period.component';
import { GuideFormulaComponent } from './components/guide-formula/guide-formula.component';
import { TimeUsedResizeComponent } from './components/time-used-resize/time-used-resize.component';
import { PopupListErrorComponent } from './components/popup-list-error/popup-list-error.component';
import { ServiceTimeExtendComponent } from './components/service-time-extend/service-time-extend.component';
import { TrimDirective } from '../pages/file-storage/TrimDirective';
import { PhoneValidatorDirective } from './directive/PhoneValidatorDirective';
import { ServiceTaskStatePipe } from './pipes/task-state.pipe';
import { SuspendStatusPipe } from './pipes/suspend-status.pipe';
import { CDNStatusPipe } from './pipes/cdnetwork-status.pipe';
import { ServiceUsagePeriodYearComponent } from './components/service-usage-period-year/service-usage-period-year.component';
import { EndpointStatusPipe } from './pipes/endpoint-status.pipe';

const antDesignIcons = AllIcons as {
  [key: string]: any;
};
const icons: any[] = Object.keys(antDesignIcons).map(
  (key) => antDesignIcons[key]
);

// #region third libs
// import { NgxTinymceModule } from 'ngx-tinymce';

const THIRDMODULES: Array<Type<any>> = [];
// #endregion

// #region your componets & directives
const COMPONENTS: Array<Type<any>> = [
  RegionSelectDropdownComponent,
  ProjectSelectDropdownComponent,
  ServiceUsagePeriodComponent,
  ServiceUsagePeriodYearComponent,
  GuideFormulaComponent,
  PopupListErrorComponent,
  FlavorSelectComponent,
  ImageSelectComponent,
  SecurityGroupSelectComponent,
  PaymentSuccessComponent,
  PaymentFailedComponent,
  ShareUsersComboboxComponent,
  SvgIconComponent,
  BreadcrumbComponent,
  TimeUsedResizeComponent,
  ServiceTimeExtendComponent,
];
const DIRECTIVES: Array<Type<any>> = [];

// #endregion

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    AlainThemeModule.forChild(),
    DelonACLModule,
    DelonFormModule,
    TrimDirective,
    PhoneValidatorDirective,
    ...SHARED_DELON_MODULES,
    ...SHARED_ZORRO_MODULES,
    // third libs
    ...THIRDMODULES,
  ],
  declarations: [
    // your components
    ...COMPONENTS,
    ...DIRECTIVES,
    PaymentSummaryComponent,
    IsPermissionPipe,
    ServiceStatusPipe,
    CDNStatusPipe,
    EndpointStatusPipe,
    SuspendStatusPipe,
    ServiceTaskStatePipe,
    formatPrice,

  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AlainThemeModule,
    DelonACLModule,
    DelonFormModule,
    ...SHARED_DELON_MODULES,
    ...SHARED_ZORRO_MODULES,
    // third libs
    ...THIRDMODULES,
    // your components
    ...COMPONENTS,
    ...DIRECTIVES,
    IsPermissionPipe,
    ServiceStatusPipe,
    CDNStatusPipe,
    EndpointStatusPipe,
    SuspendStatusPipe,
    ServiceTaskStatePipe,
    formatPrice,
  ],
  providers: [{ provide: NZ_ICONS, useValue: icons }],
})
export class SharedModule {}
