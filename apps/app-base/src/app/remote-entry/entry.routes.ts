import {Route} from '@angular/router';
import {RemoteEntryComponent} from './entry.component';

export const remoteRoutes: Route[] = [
  // {
  //   path: 'admin', data: {preload: true},
  //   loadChildren: () => import('./../layout/admin/admin.module').then(m => m.AdminModule)
  // },
  {path: '', component: RemoteEntryComponent},
  {
    path: 'login',
    // data: {preload: true},
    // loadChildren: () => import('./../pages/login/login.module').then(m => m.LoginModule)
    component: RemoteEntryComponent
  },

];
