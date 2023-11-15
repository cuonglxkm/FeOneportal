import {NgModule} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {UserProfileComponent} from './user-profile/user-profile.component';
import {V1Component} from './test/v1.component';
import {G2MiniBarModule} from '@delon/chart/mini-bar';
import {PagesRoutingModule} from './pages-routing.module';
import {SharedModule} from '@shared';
import {SecurityGroupComponent} from './security-group/list-security-group/security-group.component';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {CreateSecurityGroupComponent} from './security-group/create-security-group/create-security-group.component';
import {CreateInboundComponent} from './security-group/inbound/create/create-inbound.component';
import {ListAllowAddressPairComponent} from './allow-address-pair/list/list-allow-address-pair.component';
import {IconDefinition} from '@ant-design/icons-angular';
import {SettingOutline} from '@ant-design/icons-angular/icons';
import {DeleteSecurityGroupComponent} from './security-group/delete-security-group/delete-security-group.component';
import {DeleteRuleComponent} from './security-group/delete-rule/delete-rule.component';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {InboundListComponent} from './security-group/inbound/list/inbound-list.component';
import {ListOutboundComponent} from './security-group/outbound/list/list-outbound.component';
import {CreateOutboundComponent} from './security-group/outbound/create/create-outbound.component';
import {CreateAllowAddressPairComponent} from './allow-address-pair/create/create-allow-address-pair.component';
import {ListVirtualMachineComponent} from './security-group/vm/list/list-virtual-machine.component';
import {BlankSecurityGroupComponent} from './security-group/blank-security-group/blank-security-group.component';
import {NzResultModule} from 'ng-zorro-antd/result';
import {NzImageModule} from 'ng-zorro-antd/image';
import {FormRuleComponent} from './security-group/form-rule/form-rule.component';
import {NzPaginationModule} from 'ng-zorro-antd/pagination';

const icons: IconDefinition[] = [SettingOutline];

@NgModule({

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
    ],
    imports: [
        CommonModule,
        G2MiniBarModule,
        PagesRoutingModule,
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
    ],
})
export class PagesModule {
}
