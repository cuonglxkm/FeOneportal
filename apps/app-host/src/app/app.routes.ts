import { NxWelcomeComponent } from './nx-welcome.component';
import { Route } from '@angular/router';
import { loadRemoteModule } from '@nx/angular/mf';

export const appRoutes: Route[] = [
  {
    path: 'app-ecr',
    loadChildren: () =>
      loadRemoteModule('app-ecr', './Module').then((m) => m.RemoteEntryModule),
  },
  {
    path: 'app-k8s-premium',
    loadChildren: () =>
      loadRemoteModule('app-k8s-premium', './Module').then(
        (m) => m.RemoteEntryModule
      ),
  },
  {
    path: 'app-mongodb-replicaset',
    loadChildren: () =>
      loadRemoteModule('app-mongodb-replicaset', './Module').then(
        (m) => m.RemoteEntryModule
      ),
  },
  {
    path: 'app-kafka',
    loadChildren: () =>
      loadRemoteModule('app-kafka', './Module').then(
        (m) => m.RemoteEntryModule
      ),
  },
  {
    path: 'app-smart-cloud',
    loadChildren: () =>
      loadRemoteModule('app-smart-cloud', './Module').then(
        (m) => m.RemoteEntryModule
      ),
  },
  {
    path: 'app-base',
    loadChildren: () =>
      loadRemoteModule('app-base', './Module').then((m) => m.RemoteEntryModule),
  },
  {
    path: 'app-dashboard',
    loadChildren: () =>
      loadRemoteModule('app-dashboard', './Routes').then((m) => m.remoteRoutes),
  },
];
