import { Route } from '@angular/router';
import { RemoteEntryComponent } from './entry.component';
import { ClusterComponent } from '../cluster/cluster.component';
import { DetailClusterComponent } from '../detail-cluster/detail-cluster.component';
import { OrderedPaymentComponent } from '../ordered-payment/ordered-payment.component';

export const remoteRoutes: Route[] = [
  { path: '', component: RemoteEntryComponent },
  { path: 'create', component: ClusterComponent },
  // { path: 'ordered-payment', component: OrderedPaymentComponent },
  { path: ':id', component: DetailClusterComponent },
];
