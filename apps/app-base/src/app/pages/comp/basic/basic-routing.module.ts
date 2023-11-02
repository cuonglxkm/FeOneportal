import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BasicComponent } from '@app/pages/comp/basic/basic.component';

const routes: Routes = [{ path: '', component: BasicComponent, data: { title: 'Basic Components', key: 'basic' } }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BasicRoutingModule {}
