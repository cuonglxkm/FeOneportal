import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PersonalSettingComponent } from './personal-setting.component';

const routes: Routes = [{ path: '', component: PersonalSettingComponent, data: { title: 'Personal Settings', key: 'personal-setting' } }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PersonalSettingRoutingModule {}
