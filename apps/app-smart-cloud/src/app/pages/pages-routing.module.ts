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
import {PreloadOptionalModules} from "@delon/theme";
import {environment} from "@env/environment";
import { SshKeyComponent } from "./ssh-key/ssh-key.component";
import { IpPublicComponent } from "./ip-public/ip-public.component";
import {CreateUpdateIpPublicComponent} from "./ip-public/create-update-ip-public/create-update-ip-public.component";
import {VolumeComponent} from "./volume/component/list-volume/volume.component";
import {CreateVolumeComponent} from "./volume/component/create-volume/create-volume.component";
import {DetailVolumeComponent} from "./volume/component/detail-volume/detail-volume.component";
import {EditVolumeComponent} from "./volume/component/edit-volume/edit-volume.component";

const routes: Routes = [
  {path: '', redirectTo: 'user-profile', pathMatch: 'full'},
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
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule {
}
