import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { UpgradeClusterComponent } from './pages/detail/upgrade-cluster/upgrade-cluster.component';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { PageHeaderModule } from '@delon/abc/page-header';
import { SharedModule } from '@shared';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(
      [
        {
          path: '',
          loadChildren: () =>
            import('./remote-entry/entry.module').then(
              (m) => m.RemoteEntryModule
            )
        }
      ],
      { initialNavigation: 'enabledBlocking' }
    ),
    NzBreadCrumbModule,
    PageHeaderModule,
    SharedModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
