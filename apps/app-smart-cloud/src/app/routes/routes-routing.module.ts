import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {startPageGuard} from '@core';
import {authSimpleCanActivate, authSimpleCanActivateChild} from '@delon/auth';
import {PreloadOptionalModules} from '@delon/theme';
import {environment} from '@env/environment';

// layout
import {LayoutBasicComponent} from '../layout/basic/basic.component';
import {LayoutBlankComponent} from '../layout/blank/blank.component';

const routes: Routes = [

  {
    path: '',
    component: LayoutBlankComponent,
    canActivate: [startPageGuard, authSimpleCanActivate],
    canActivateChild: [authSimpleCanActivateChild],
    data: {},
    children: [
      {path: '', redirectTo: 'pages', pathMatch: 'full'},
      {
        path: 'pages',
        loadChildren: () => import('./../pages/pages.module').then(m => m.PagesModule),
        data: {preload: true}
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
        data: {preload: true}
      },
    ]
  },
  {
    path: 'entry',
    loadChildren: () =>
      import('./../remote-entry/entry.module').then(
        (m) => m.RemoteEntryModule
      ),
  },
  {path: '**', redirectTo: 'exception/404'}
];

@NgModule({
  providers: [PreloadOptionalModules],
  imports: [
    RouterModule.forRoot(routes, {
      // useHash: environment.useHash,
      // // NOTICE: If you use `reuse-tab` component and turn on keepingScroll you can set to `disabled`
      // // Pls refer to https://ng-alain.com/components/reuse-tab
      // scrollPositionRestoration: 'top',
      // preloadingStrategy: PreloadOptionalModules,
      // bindToComponentInputs: true
    })
  ],
  exports: [RouterModule]
})
export class RouteRoutingModule {
}
