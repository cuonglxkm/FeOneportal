import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import {PolicyListComponent} from "./policy-list/policy-list.component";

const routes: Routes = [
  {
    path: '',
    component: PolicyListComponent,
    data: { title: 'Policy', key: 'policy-list' },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PolicyRoutingModule {}
