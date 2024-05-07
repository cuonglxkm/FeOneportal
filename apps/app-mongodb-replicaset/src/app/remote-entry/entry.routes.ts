import { Route } from '@angular/router';
import { PagesComponent } from '../pages/detail/pages.component';
import { ListMongodbrepComponent } from '../pages/list-service/list-mongodbrep.component';
import { CreateClusterComponent } from '../pages/detail/create-cluster/create-cluster.component';
import { UpgradeClusterComponent } from '../pages/detail/upgrade-cluster/upgrade-cluster.component';
import { EditMongodbrepComponent } from '../pages/list-service/edit-mongodbrep/edit-mongodbrep.component';

export const remoteRoutes: Route[] = [
  { path: '', component: ListMongodbrepComponent},
  { path: 'create', component: CreateClusterComponent},
  { path: 'upgrade/:id', component: UpgradeClusterComponent},
  { path: ':id', component: PagesComponent},
  { path: 'edit/:id', component: EditMongodbrepComponent},
];
