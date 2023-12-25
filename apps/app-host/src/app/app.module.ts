import {APP_INITIALIZER, LOCALE_ID, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { NxWelcomeComponent } from './nx-welcome.component';
import {NzMenuModule} from "ng-zorro-antd/menu";
import {NzLayoutModule} from "ng-zorro-antd/layout";
import {IconsProviderModule} from "./icons-provider.module";
import {FormsModule} from "@angular/forms";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {NzNotificationModule} from "ng-zorro-antd/notification";
import {STWidgetModule} from "./shared/st-widget/st-widget.module";
import {RoutesModule} from "./routes/routes.module";
import {LayoutModule} from "./layout/layout.module";
import {JsonSchemaModule, SharedModule} from "./shared";
import {CoreModule} from "./core/core.module";
import {DatePipe, registerLocaleData} from "@angular/common";
import {NZ_DATE_LOCALE, provideNzI18n,  zh_CN as zorroLang} from "ng-zorro-antd/i18n";
import {DELON_LOCALE, zh_CN as delonLang, ALAIN_I18N_TOKEN} from "@delon/theme";
import {zhCN as dateLang} from "date-fns/locale";
import { default as ngLang } from '@angular/common/locales/zh';
import {DefaultInterceptor, I18NService} from "./core";
import {SimpleInterceptor} from "@delon/auth";



const LANG = {
  abbr: 'zh',
  ng: ngLang,
  zorro: zorroLang,
  date: dateLang,
  delon: delonLang
};

registerLocaleData(LANG.ng, LANG.abbr);
const LANG_PROVIDES = [
  { provide: LOCALE_ID, useValue: LANG.abbr },
  provideNzI18n(LANG.zorro),
  { provide: NZ_DATE_LOCALE, useValue: LANG.date },
  { provide: DELON_LOCALE, useValue: LANG.delon }
];

const I18NSERVICE_PROVIDES = [{ provide: ALAIN_I18N_TOKEN, useClass: I18NService, multi: false }];

const INTERCEPTOR_PROVIDES = [
  { provide: HTTP_INTERCEPTORS, useClass: SimpleInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: DefaultInterceptor, multi: true }
];
// #endregion
const FORM_MODULES = [JsonSchemaModule];

// #region Startup Service
import { StartupService } from '@core';
import {Observable} from "rxjs";
import {GlobalConfigModule} from "../../../app-smart-cloud/src/app/global-config.module";
export function StartupServiceFactory(startupService: StartupService): () => Observable<void> {
  return () => startupService.load();
}
const APPINIT_PROVIDES = [
  StartupService,
  {
    provide: APP_INITIALIZER,
    useFactory: StartupServiceFactory,
    deps: [StartupService],
    multi: true
  }
];
// #endregion

@NgModule({
  declarations: [AppComponent, NxWelcomeComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
    GlobalConfigModule.forRoot(),
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    IconsProviderModule,
    NzLayoutModule,
    NzMenuModule,
    CoreModule,
    SharedModule,
    LayoutModule,
    RoutesModule,
    STWidgetModule,
    NzNotificationModule,
    // ...GLOBAL_THIRD_MODULES,
    ...FORM_MODULES
  ],
  providers: [...LANG_PROVIDES, ...INTERCEPTOR_PROVIDES, ...I18NSERVICE_PROVIDES, ...APPINIT_PROVIDES, DatePipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
