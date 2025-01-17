import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {startPageGuard} from '@core';
import {authSimpleCanActivate, authSimpleCanActivateChild} from '@delon/auth';
import {PreloadOptionalModules} from '@delon/theme';
import {environment} from '@env/environment';

// layout
import {LayoutBasicComponent} from '../layout/basic/basic.component';
import {LayoutBlankComponent} from '../layout/blank/blank.component';
import {loadRemoteModule} from "@nx/angular/mf";
import {UserProfileComponent} from "./user-profile/user-profile.component";
import {WelcomeComponent} from "./welcome/welcome.component";

const routes: Routes = [
  {
    path: '',
    component: LayoutBasicComponent,
    canActivate: [startPageGuard, authSimpleCanActivate],
    canActivateChild: [authSimpleCanActivateChild],
    data: {},
    children: [
      {path: '', redirectTo: 'app-smart-cloud', pathMatch: 'full'},
      {path: 'profile', component: UserProfileComponent},
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
        data: {preload: true}
      },
      {
        path: 'widgets',
        loadChildren: () => import('./widgets/widgets.module').then(m => m.WidgetsModule)
      },
      {path: 'style', loadChildren: () => import('./style/style.module').then(m => m.StyleModule)},
      {path: 'delon', loadChildren: () => import('./delon/delon.module').then(m => m.DelonModule)},
      {path: 'extras', loadChildren: () => import('./extras/extras.module').then(m => m.ExtrasModule)},
      {path: 'pro', loadChildren: () => import('./pro/pro.module').then(m => m.ProModule)},
      {
        path: 'app-smart-cloud',
        loadChildren: () =>
          loadRemoteModule('app-smart-cloud', './Module').then(
            (m) => m.RemoteEntryModule
          ),
      },
      {
        path: 'app-kafka',
        loadChildren: () =>
          loadRemoteModule('app-kafka', './Module').then((m) => m.RemoteEntryModule),
      },
      {
        path: 'app-kubernetes',
        loadChildren: () =>
          loadRemoteModule('app-kubernetes', './Module').then(
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
        path: 'app-k8s-premium',
        loadChildren: () =>
          loadRemoteModule('app-k8s-premium', './Module').then(
            (m) => m.RemoteEntryModule
          ),
      },
      {
        path: 'app-ecr',
        loadChildren: () =>
          loadRemoteModule('app-ecr', './Module').then(
            (m) => m.RemoteEntryModule
          ),
      },
    ]
  },
  // Blak Layout 空白布局
  {
    path: 'data-v',
    component: LayoutBlankComponent,
    children: [{path: '', loadChildren: () => import('./data-v/data-v.module').then(m => m.DataVModule)}]
  },
  // passport
  {
    path: '',
    loadChildren: () => import('./passport/passport.module').then(m => m.PassportModule),
    data: {preload: true}
  },
  {
    path: 'exception',
    loadChildren: () => import('./exception/exception.module').then(m => m.ExceptionModule)
  },

  {
    path: 'welcome',
    component: WelcomeComponent,
  },
  {path: '**', redirectTo: 'exception/404'},

];

@NgModule({
  providers: [PreloadOptionalModules],
  imports: [
    RouterModule.forRoot(routes, {
      useHash: environment.useHash,
      // NOTICE: If you use `reuse-tab` component and turn on keepingScroll you can set to `disabled`
      // Pls refer to https://ng-alain.com/components/reuse-tab
      scrollPositionRestoration: 'top',
      preloadingStrategy: PreloadOptionalModules,
      bindToComponentInputs: true
    })
  ],
  exports: [RouterModule]
})
export class RouteRoutingModule {
}
