import { Route } from '@angular/router';
import { ClusterComponent } from '../cluster/cluster.component';
import { DetailClusterComponent } from '../detail-cluster/detail-cluster.component';
import { LogsComponent } from '../logs/logs.component';
import { RemoteEntryComponent } from './entry.component';

export const remoteRoutes: Route[] = [
  { path: '', component: RemoteEntryComponent },
  { path: 'create', component: ClusterComponent },
  // { path: 'ordered-payment', component: OrderedPaymentComponent },
  { path: ':id', component: DetailClusterComponent },
  { path: 'logs/:id', component: LogsComponent },
];
