import {RouterModule, Routes} from "@angular/router";
import {UserProfileComponent} from "./user-profile/user-profile.component";
import {NgModule} from "@angular/core";
import {PreloadOptionalModules} from "@delon/theme";
import {environment} from "@env/environment";
import {V1Component} from "./test/v1.component";
import {VolumeComponent} from "./volume/volume.component";
import {CreateVolumeComponent} from "./volume/create-volume/create-volume.component";
import {DetailVolumeComponent} from "./volume/detail-volume/detail-volume.component";

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




]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule {
}
