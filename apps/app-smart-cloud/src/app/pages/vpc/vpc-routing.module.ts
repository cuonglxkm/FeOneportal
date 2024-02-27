import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import {VpcCreateComponent} from "./vpc-create/vpc-create.component";
import {VpcListComponent} from "./vpc-list/vpc-list.component";
import {VpcDetailComponent} from "./vpc-detail/vpc-detail.component";
import {VpcUpdateComponent} from "./vpc-update/vpc-update.component";

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
    component: VpcDetailComponent,
    data: { title: 'Vpc Detail', key: 'policy-detail' },
  },
  {
    path: 'update/:id',
    component: VpcUpdateComponent,
    data: { title: 'Vpc Update', key: 'policy-update' },
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VpcRoutingModule {}
