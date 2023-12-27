import {CommonModule} from '@angular/common';
import {NgModule, Type} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {DelonACLModule} from '@delon/acl';
import {DelonFormModule} from '@delon/form';
import {AlainThemeModule} from '@delon/theme';

import {SHARED_DELON_MODULES} from './shared-delon.module';
import {SHARED_ZORRO_MODULES} from './shared-zorro.module';
import {RegionSelectDropdownComponent} from "./components/region-select-dropdown/region-select-dropdown.component";
import {ProjectSelectDropdownComponent} from "./components/project-select-dropdown/project-select-dropdown.component";

import * as AllIcons from '@ant-design/icons-angular/icons';
import {NZ_ICONS} from 'ng-zorro-antd/icon';
import {FlavorSelectComponent} from './components/flavor-select/flavor-select.component';
import {ImageSelectComponent} from './components/image-select/image-select.component';
import {SecurityGroupSelectComponent} from './components/security-group-select/security-group-select.component';
import { PaymentSuccessComponent } from './components/payment-success/payment-success.component';
import { PaymentFailedComponent } from './components/payment-failed/payment-failed.component';

const antDesignIcons = AllIcons as {
    [key: string]: any;
};
const icons: any[] = Object.keys(antDesignIcons).map(key => antDesignIcons[key])


// #region third libs
// import { NgxTinymceModule } from 'ngx-tinymce';

const THIRDMODULES: Array<Type<any>> = [];
// #endregion

// #region your componets & directives
const COMPONENTS: Array<Type<any>> = [
    RegionSelectDropdownComponent,
    ProjectSelectDropdownComponent,
    FlavorSelectComponent,
    ImageSelectComponent,
    SecurityGroupSelectComponent,
    PaymentSuccessComponent,
    PaymentFailedComponent,
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
        ...SHARED_DELON_MODULES,
        ...SHARED_ZORRO_MODULES,
        // third libs
        ...THIRDMODULES
    ],
    declarations: [
        // your components
        ...COMPONENTS,
        ...DIRECTIVES
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
        ...DIRECTIVES
    ],
    providers: [{provide: NZ_ICONS, useValue: icons}]
})
export class SharedModule {
}
