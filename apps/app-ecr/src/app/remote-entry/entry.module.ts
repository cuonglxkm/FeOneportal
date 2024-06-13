import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { RemoteEntryComponent } from './entry.component';
import { NxWelcomeComponent } from './nx-welcome.component';
import { remoteRoutes } from './entry.routes';
import { ListServiceComponent } from '../pages/list-service/list-service.component';

@NgModule({
  declarations: [
    RemoteEntryComponent, 
    NxWelcomeComponent,
    ListServiceComponent
  ],
  imports: [
    CommonModule, 
    RouterModule.forChild(remoteRoutes),
  ],
  providers: [],
})
export class RemoteEntryModule {}
