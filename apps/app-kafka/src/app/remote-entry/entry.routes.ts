import { Route } from '@angular/router';
import { RemoteEntryComponent } from './entry.component';
import { DetailComponent } from '../pages/detail/detail.component';

export const remoteRoutes: Route[] = [
  { path: '', component: RemoteEntryComponent },
  { path: ':id', component: DetailComponent }
];
