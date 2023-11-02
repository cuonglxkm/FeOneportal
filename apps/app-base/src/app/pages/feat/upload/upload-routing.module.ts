import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UploadComponent } from '@app/pages/feat/upload/upload.component';

const routes: Routes = [{ path: '', component: UploadComponent, data: { title: 'Upload', key: 'upload' } }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UploadRoutingModule {}
