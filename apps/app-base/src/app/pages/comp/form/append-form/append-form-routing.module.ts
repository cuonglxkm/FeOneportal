import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppendFormComponent } from '@app/pages/comp/form/append-form/append-form.component';

const routes: Routes = [{ path: '', component: AppendFormComponent, data: { title: 'Editable form', key: 'append-form' } }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppendFormRoutingModule {}
