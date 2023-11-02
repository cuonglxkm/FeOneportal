import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LazyBasicComponent } from '@app/pages/comp/lazy/lazy-basic/lazy-basic.component';

const routes: Routes = [{ path: '', component: LazyBasicComponent, data: { title: 'Lazy Basic', key: 'lazy-basic' } }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LazyBasicRoutingModule {}
