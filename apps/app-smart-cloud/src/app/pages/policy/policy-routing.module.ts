import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import {PolicyListComponent} from "./policy-list/policy-list.component";
import {PolicyCreateComponent} from "./policy-create/policy-create.component";

const routes: Routes = [
  {
    path: '',
    component: PolicyListComponent,
    data: { title: 'Policy', key: 'policy-list' },
  },
  {
    path: 'create',
    component: PolicyCreateComponent,
    data: { title: 'Policy Create', key: 'policy-create' },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PolicyRoutingModule {}
