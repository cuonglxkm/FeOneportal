import { RouterModule, Routes } from "@angular/router";
import { UserProfileComponent } from "./user-profile/user-profile.component";
import { NgModule } from "@angular/core";
import { V1Component } from "./test/v1.component";
import { SshKeyComponent } from "./ssh-key/ssh-key.component";

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
    path: 'vm',
    component: V1Component
  },
  {
    path: "ssh-key",
    component: SshKeyComponent
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
