import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [

  {
    path: '',
    data: {},
    children: [
      {path: '', redirectTo: 'pages', pathMatch: 'full'},
      {
        path: 'pages',
        loadChildren: () => import('./../pages/pages.module').then(m => m.PagesModule),
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
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class RoutesRoutingModule { }
