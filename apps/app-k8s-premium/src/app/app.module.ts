import { registerLocaleData } from "@angular/common";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { default as ngLang } from '@angular/common/locales/en';
import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { SimpleInterceptor } from "@delon/auth";
import { ALAIN_I18N_TOKEN, DELON_LOCALE, en_US as delonLang } from "@delon/theme";
import { SharedModule } from "@shared";
import { zhCN as dateLang } from "date-fns/locale";
import { NZ_DATE_LOCALE, provideNzI18n, vi_VN as zorroLang } from "ng-zorro-antd/i18n";
import { NzNotificationModule } from "ng-zorro-antd/notification";
import { Observable } from "rxjs";
import { AppComponent } from './app.component';
import { DefaultInterceptor, I18NService, StartupService } from "./core";
import { CoreModule } from "./core/core.module";
import { GlobalConfigModule } from "./global-config.module";
import { LayoutModule } from "./layout/layout.module";
import { RoutesModule } from "./routes/routes.module";
import { STWidgetModule } from "./shared/st-widget/st-widget.module";

const LANG = {
  abbr: 'en-US',
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
  { provide: HTTP_INTERCEPTORS, useClass: SimpleInterceptor, multi: true },
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

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    GlobalConfigModule.forRoot(),
    CoreModule,
    SharedModule,
    LayoutModule,
    RoutesModule,
    STWidgetModule,
    NzNotificationModule,
    // ...GLOBAL_THIRD_MODULES,
    HttpClientModule
  ],
  providers: [
    // ...LANG_PROVIDES,
    // ...INTERCEPTOR_PROVIDES,
    ...I18NSERVICE_PROVIDES,
    ...APPINIT_PROVIDES],
  bootstrap: [AppComponent],
})
export class AppModule {

}
