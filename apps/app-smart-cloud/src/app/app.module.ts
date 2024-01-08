import {APP_INITIALIZER, LOCALE_ID, NgModule, Type} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {DefaultInterceptor, I18NService, StartupService} from "./core";
import {Observable} from "rxjs";
import {registerLocaleData} from "@angular/common";
import {NZ_DATE_LOCALE, provideNzI18n,  zh_CN as zorroLang } from "ng-zorro-antd/i18n";
import {ALAIN_I18N_TOKEN, DELON_LOCALE, provideAlain, zh_CN as delonLang} from "@delon/theme";
import {zhCN as dateLang} from "date-fns/locale";
import { default as ngLang } from '@angular/common/locales/zh';
import {LayoutModule} from "./layout/layout.module";
import {JsonSchemaModule, SharedModule} from "@shared";
import {STWidgetModule} from "./shared/st-widget/st-widget.module";
import {NzNotificationModule} from "ng-zorro-antd/notification";
import {CoreModule} from "./core/core.module";
// import {GlobalConfigModule} from "./global-config.module";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {RoutesModule} from "./routes/routes.module";
import {AlainConfig} from "@delon/util/config";
import {provideAuth} from "@delon/auth";
import {IconsProviderModule} from "./core/icons-provider.module";

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
// #endregion

// #region i18n services

const I18NSERVICE_PROVIDES = [{ provide: ALAIN_I18N_TOKEN, useClass: I18NService, multi: false }];


const INTERCEPTOR_PROVIDES = [
  // { provide: HTTP_INTERCEPTORS, useClass: Inter, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: DefaultInterceptor, multi: true }
];
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

// const GLOBAL_THIRD_MODULES: Array<Type<any>> = [BidiModule];

const FORM_MODULES = [JsonSchemaModule];



const alainConfig: AlainConfig = {
  st: {modal: {size: 'lg'}},
  pageHeader: {homeI18n: 'home'},
  auth: {
    // @ts-ignore
    login_url: `${environment.sso.issuer}/connect/authorize?response_type=code&client_id=${environment.sso.clientId}&scope=${decodeURIComponent(environment.sso.scope)}&redirect_uri=${decodeURIComponent(environment.sso.callback)}`,
    token_send_place: 'header',
    token_send_template: 'Bearer ${token}',
    token_send_key: 'Authorization',
    ignores: [/\/login/, /assets\//, /passport\//],
  },
};



@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    // GlobalConfigModule.forRoot(),
    CoreModule,
    SharedModule,
    LayoutModule,
    RoutesModule,
    STWidgetModule,
    NzNotificationModule,
    // ...GLOBAL_THIRD_MODULES,
    ...FORM_MODULES,
    HttpClientModule,
    // IconsProviderModule
  ],
  providers: [
    ...LANG_PROVIDES,
    // ...INTERCEPTOR_PROVIDES,
    // ...I18NSERVICE_PROVIDES,
    // ...APPINIT_PROVIDES,

    provideAlain({
      i18nClass: I18NService,
      config: alainConfig
    }),
    // provideStartup(),
    provideAuth(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {

}
