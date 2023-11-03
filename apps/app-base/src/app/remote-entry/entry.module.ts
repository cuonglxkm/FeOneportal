import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';

import {RemoteEntryComponent} from './entry.component';
import {NxWelcomeComponent} from './nx-welcome.component';
import {remoteRoutes} from './entry.routes';
import {LockScreenModule} from "@shared/components/lock-screen/lock-screen.module";
import {NzBackTopModule} from "ng-zorro-antd/back-top";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzIconModule} from "ng-zorro-antd/icon";
import {NzSpinModule} from "ng-zorro-antd/spin";
import {NzWaveModule} from "ng-zorro-antd/core/wave";
import {ModalWrapService} from "@widget/base-modal";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {TranslationLoader} from "@app/translation-loader";
import {HttpClient} from "@angular/common/http";
import {DefLayoutContentModule} from "@app/layout/admin/def-layout-content/def-layout-content.module";
import {
  LayoutHeadRightMenuModule
} from "@shared/biz-components/layout-components/layout-head-right-menu/layout-head-right-menu.module";
import {AdminModule} from "@app/layout/admin/admin.module";

@NgModule({
  declarations: [RemoteEntryComponent, NxWelcomeComponent],
  imports: [CommonModule,
    RouterModule.forChild(remoteRoutes),
    LockScreenModule, NzBackTopModule,
    NzButtonModule, NzIconModule, NzSpinModule,
    NzWaveModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: TranslationLoader,
        deps: [HttpClient]
      }
    }),
  ],
  providers: [ModalWrapService]
})
export class RemoteEntryModule {
}
