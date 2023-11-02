import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SuccessComponent } from './success.component';

const routes: Routes = [{ path: '', component: SuccessComponent, data: { title: 'Success', key: 'success' } }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuccessRoutingModule {}
