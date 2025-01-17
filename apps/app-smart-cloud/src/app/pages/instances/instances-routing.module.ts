import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InstancesComponent } from './instances-list/instances.component';
import { InstancesCreateComponent } from './instances-create/instances-create.component';
import { InstancesDetailComponent } from './instances-detail/instances-detail.component';
import { InstancesEditInfoComponent } from './instances-edit-info/instances-edit-info.component';
import { InstancesEditComponent } from './instances-edit/instances-edit.component';
import { InstancesConsoleComponent } from './instances-console/instances-console.component';
import { InstancesExtendComponent } from './instances-extend/instances-extend.component';
import { InstancesCreateVpcComponent } from './instances-create-vpc/instances-create-vpc.component';
import { InstancesEditVpcComponent } from './instances-edit-vpc/instances-edit-vpc.component';

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
    path: 'instances-create-vpc',
    component: InstancesCreateVpcComponent,
    data: { title: 'Tạo máy ảo', key: 'instances-create-vpc' },
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
  {
    path: 'instances-edit/:id',
    component: InstancesEditComponent,
    data: { title: 'Chỉnh sửa máy ảo', key: 'instances-edit' },
  },
  {
    path: 'instances-edit-vpc/:id',
    component: InstancesEditVpcComponent,
    data: { title: 'Chỉnh sửa máy ảo', key: 'instances-edit-vpc' },
  },
  {
    path: 'instances-console/:id',
    component: InstancesConsoleComponent,
    data: { title: 'Console máy ảo', key: 'instances-console' },
  },
  {
    path: 'instances-extend/:id',
    component: InstancesExtendComponent,
    data: { title: 'Gia hạn máy ảo', key: 'instances-extend' },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InstancesRoutingModule {}
