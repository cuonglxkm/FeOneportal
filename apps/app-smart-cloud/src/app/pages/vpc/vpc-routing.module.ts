import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import {VpcCreateComponent} from "./vpc-create/vpc-create.component";
import {VpcListComponent} from "./vpc-list/vpc-list.component";

const routes: Routes = [
  {
    path: '',
    component: VpcListComponent,
    data: { title: 'Vpc', key: 'policy-list' },
  },
  {
    path: 'create',
    component: VpcCreateComponent,
    data: { title: 'Vpc Create', key: 'policy-create' },
  },
  {
    path: 'detail/:id',
    component: VpcCreateComponent,
    data: { title: 'Vpc Create', key: 'policy-create' },
  },
  {
    path: 'update/:id',
    component: VpcCreateComponent,
    data: { title: 'Vpc Create', key: 'policy-create' },
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VpcRoutingModule {}
