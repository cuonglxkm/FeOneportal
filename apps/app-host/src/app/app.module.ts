import {APP_INITIALIZER, LOCALE_ID, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import {NzMenuModule} from "ng-zorro-antd/menu";
import {NzLayoutModule} from "ng-zorro-antd/layout";
import {IconsProviderModule} from "./icons-provider.module";
import {FormsModule} from "@angular/forms";
import {HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withInterceptors} from "@angular/common/http";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {NzNotificationModule} from "ng-zorro-antd/notification";
import {STWidgetModule} from "./shared/st-widget/st-widget.module";
import {RoutesModule} from "./routes/routes.module";
import {LayoutModule} from "./layout/layout.module";
import {JsonSchemaModule, SharedModule} from "./shared";
import {CoreModule} from "./core/core.module";
import {DatePipe, registerLocaleData} from "@angular/common";
import {NZ_DATE_LOCALE, provideNzI18n,  zh_CN as zorroLang} from "ng-zorro-antd/i18n";
import {DELON_LOCALE, zh_CN as delonLang, ALAIN_I18N_TOKEN, provideAlain} from "@delon/theme";
import {defaultInterceptor, I18NService, provideStartup} from "./core";
import {authSimpleInterceptor, provideAuth} from "@delon/auth";
import {AlainConfig} from "@delon/util/config";
import {environment} from "@env/environment";

// #endregion
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
    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
    // GlobalConfigModule.forRoot(),
    FormsModule,
    // HttpClientModule,
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
  // providers: [...LANG_PROVIDES, ...INTERCEPTOR_PROVIDES, ...I18NSERVICE_PROVIDES, ...APPINIT_PROVIDES, DatePipe, ...],
  bootstrap: [AppComponent],
  providers: [
    provideHttpClient(withInterceptors([...(environment.interceptorFns ?? []), authSimpleInterceptor, defaultInterceptor])),
    provideAlain({
      i18nClass: I18NService,
      config: alainConfig
    }),
    provideStartup(),
    provideAuth(),
  ]
})
export class AppModule {}

