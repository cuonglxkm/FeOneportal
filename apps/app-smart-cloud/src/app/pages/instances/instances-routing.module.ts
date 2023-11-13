import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InstancesComponent } from './instances-list/instances.component';
import { InstancesCreateComponent } from './instances-create/instances-create.component';
import { InstancesDetailComponent } from './instances-detail/instances-detail.component';
import { InstancesEditInfoComponent } from './instances-edit-info/instances-edit-info.component';

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
    path: 'instances-detail/:id',
    component: InstancesDetailComponent,
    data: { title: 'Chi tiết máy ảo', key: 'instances-detail' },
  },
  {
    path: 'instances-edit-info/:id',
    component: InstancesEditInfoComponent,
    data: { title: 'Chỉnh sửa thông tin máy ảo', key: 'instances-edit-info' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InstancesRoutingModule {}
