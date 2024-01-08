import { Route } from '@angular/router';
import { loadRemoteModule } from '@nx/angular/mf';

export const appRoutes: Route[] = [
  {
    path: 'app-smart-cloud',
    loadChildren: () =>
      loadRemoteModule('app-smart-cloud', './Module').then(
        (m) => m.RemoteEntryModule
      ),
  }
];
