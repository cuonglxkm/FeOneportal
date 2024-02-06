import { Route } from '@angular/router';
import { RemoteEntryComponent } from './entry.component';
import { ClusterComponent } from '../cluster/cluster.component';

export const remoteRoutes: Route[] = [
  { path: '', component: RemoteEntryComponent },
  { path: 'create', component: ClusterComponent }
];
