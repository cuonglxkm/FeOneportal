import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import { VpnSiteToSiteManage } from "./manage/vpn-site-to-site-manage.component";

const routes: Routes = [
  {
    path: 'manage',
    component: VpnSiteToSiteManage,
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VpnSiteToSiteRoutingModule {}
