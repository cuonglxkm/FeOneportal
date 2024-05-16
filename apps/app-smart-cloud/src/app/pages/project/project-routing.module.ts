import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import {ProjectCreateComponent} from "./project-create/project-create.component";
import {ProjectListComponent} from "./project-list/project-list.component";
import {ProjectDetailComponent} from "./project-detail/project-detail.component";
import {ProjectUpdateComponent} from "./project-update/project-update.component";
import {ProjectExtendComponent} from "./project-extend/project-extend.component";

const routes: Routes = [
  {
    path: '',
    component: ProjectListComponent,
    data: { title: 'Project', key: 'policy-list' },
  },
  {
    path: 'create',
    component: ProjectCreateComponent,
    data: { title: 'Project Create', key: 'policy-create' },
  },
  {
    path: 'detail/:id',
    component: ProjectDetailComponent,
    data: { title: 'Project Detail', key: 'policy-detail' },
  },
  {
    path: 'update/:id',
    component: ProjectUpdateComponent,
    data: { title: 'Project Update', key: 'policy-update' },
  },
  {
    path: 'extend/:id',
    component: ProjectExtendComponent,
    data: { title: 'Project Extend', key: 'policy-update' },
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectRoutingModule {}
