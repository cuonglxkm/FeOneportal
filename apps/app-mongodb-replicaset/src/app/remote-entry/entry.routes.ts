import { Route } from '@angular/router';
import { RemoteEntryComponent } from './entry.component';
import { PagesComponent } from '../pages/pages.component';
import { MngtDatabaseComponent } from '../mngt-database/mngt-database.component';
// import { LoggingComponent } from '../logging/logging.component';
import { OverviewComponent } from '../overview/overview.component';
import { RoleComponent } from '../user-role/role/role.component';
import { UserComponent } from '../user-role/user/user.component';
import { UserRoleComponent } from '../user-role/user-role.component';
import { CustomRoleComponent } from '../user-role/role/custom-role/custom-role.component';

export const remoteRoutes: Route[] = [
  { path: '', component: RemoteEntryComponent },
  { path: 'mongodb', component: PagesComponent},
  { path: 'mngt-database', component: MngtDatabaseComponent},
  // { path: 'mongodb/log', component: LoggingComponent  },
  { path: 'mongodb/info', component: OverviewComponent },
  { path: 'user-role', component: UserRoleComponent },
  { path: 'role', component: RoleComponent },
  { path: 'user', component: UserComponent },
  { path: 'custome-role', component: CustomRoleComponent },
];
