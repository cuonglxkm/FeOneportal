import {RouterModule, Routes} from "@angular/router";
import {UserProfileComponent} from "./user-profile/user-profile.component";
import {NgModule} from "@angular/core";
import {PreloadOptionalModules} from "@delon/theme";
import {environment} from "@env/environment";
import {DashboardV1Component} from "./test/v1.component";

const routes: Routes = [
  { path: '', redirectTo: 'user-profile', pathMatch: 'full' },
  {
    path: 'user-profile',
    component: UserProfileComponent
  },

]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule {}
