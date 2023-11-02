import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SelectivePreloadingStrategyService } from './core/services/common/strategy/selective-preloading-strategy.service';

//import { SelectivePreloadingStrategyService } from '@app/core/services/common/strategy/selective-preloading-strategy.service';

const routes: Routes = [
  { path: '', redirectTo: '/login/login-form', pathMatch: 'full' },
  { path: 'blank', loadChildren: () => import('./layout/blank/blank.module').then(m => m.BlankModule) },
  { path: 'login', data: { preload: true }, loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule) },
  { path: 'admin', data: { preload: true }, loadChildren: () => import('./layout/admin/admin.module').then(m => m.AdminModule) },
  { path: '**', redirectTo: '/login/login-form' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: SelectivePreloadingStrategyService,
      scrollPositionRestoration: 'top',
      // initialNavigation: 'enabledBlocking',
      useHash: true
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
