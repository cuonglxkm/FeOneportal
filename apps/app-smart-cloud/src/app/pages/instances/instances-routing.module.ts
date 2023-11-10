import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InstancesComponent } from './instances-list/instances.component';
import { InstancesCreateComponent } from './instances-create/instances-create.component';
import { InstancesDetailComponent } from './instances-detail/instances-detail.component';

const routes: Routes = [
  {
    path: '',
    component: InstancesComponent,
    data: { title: 'Máy ảo', key: 'instances-list' },
  },
  { path: '', redirectTo: '/instances-list', pathMatch: 'full' },
  {
    path: 'instances-create',
    component: InstancesCreateComponent,
    data: { title: 'Tạo máy ảo', key: 'instances-create' },
  },
  {
    path: 'instances-detail',
    component: InstancesDetailComponent,
    data: { title: 'Chi tiết máy ảo', key: 'instances-detail' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InstancesRoutingModule {}
