import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { RemoteEntryComponent } from './entry.component';
import { NxWelcomeComponent } from './nx-welcome.component';
import { remoteRoutes } from './entry.routes';
import { MngtDatabaseComponent } from '../mngt-database/mngt-database.component';
import { OverviewComponent } from '../overview/overview.component';
import { PagesComponent } from '../pages/pages.component';
import { UserRoleComponent } from '../user-role/user-role.component';
import { UserComponent } from '../user-role/user/user.component';
import { RoleComponent } from '../user-role/role/role.component';
import { SHARED_ZORRO_MODULES } from '../shared/shared-zorro.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CustomRoleComponent } from '../user-role/role/custom-role/custom-role.component';

@NgModule({
  declarations: [
    NxWelcomeComponent,    
    RemoteEntryComponent, 
    MngtDatabaseComponent,
    OverviewComponent,
    PagesComponent,
    UserRoleComponent,
    UserComponent,
    RoleComponent,
    CustomRoleComponent,
  ],
  imports: [
    CommonModule, 
    RouterModule.forChild(remoteRoutes),
    SHARED_ZORRO_MODULES,
    NgApexchartsModule,
  ],
  providers: [],
})
export class RemoteEntryModule {}
