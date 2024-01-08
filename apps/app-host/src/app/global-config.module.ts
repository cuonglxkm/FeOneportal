// /* eslint-disable import/order */
// import {EnvironmentProviders, ModuleWithProviders, NgModule, Optional, Provider, SkipSelf} from '@angular/core';
// import {DelonACLModule} from '@delon/acl';
// import {AlainThemeModule, provideAlain} from '@delon/theme';
// import {AlainConfig, ALAIN_CONFIG} from '@delon/util/config';
//
// import {I18NService, throwIfAlreadyLoaded} from '@core';
//
// import {environment} from '@env/environment';
//
// // Please refer to: https://ng-alain.com/docs/global-config
// // #region NG-ALAIN Config
//
//
// const alainConfig: AlainConfig = {
//   st: {modal: {size: 'lg'}},
//   pageHeader: {homeI18n: 'home'},
//   lodop: {
//     license: `A59B099A586B3851E0F0D7FDBF37B603`,
//     licenseA: `C94CEE276DB2187AE6B65D56B3FC2848`
//   },
//   auth: {
//     // @ts-ignore
//     login_url: `${environment.sso.issuer}/connect/authorize?response_type=code&client_id=${environment.sso.clientId}&scope=${decodeURIComponent(environment.sso.scope)}&redirect_uri=${decodeURIComponent(environment.sso.callback)}`,
//     token_send_place: 'header',
//     token_send_template: 'Bearer ${token}',
//     token_send_key: 'Authorization',
//     ignores: [/\/login/, /assets\//, /passport\//],
//   },
// };
//
// const alainModules: any[] = [AlainThemeModule.forRoot(), DelonACLModule];
//
// // #region reuse-tab
// /**
//  * 若需要[路由复用](https://ng-alain.com/components/reuse-tab)需要：
//  * 1、在 `shared-delon.module.ts` 导入 `ReuseTabModule` 模块
//  * 2、注册 `RouteReuseStrategy`
//  * 3、在 `src/app/layout/default/default.component.html` 修改：
//  *  ```html
//  *  <section class="alain-default__content">
//  *    <reuse-tab #reuseTab></reuse-tab>
//  *    <router-outlet (activate)="reuseTab.activate($event)"></router-outlet>
//  *  </section>
//  *  ```
//  */
// // import { RouteReuseStrategy } from '@angular/router';
// // import { ReuseTabService, ReuseTabStrategy } from '@delon/abc/reuse-tab';
// // alainProvides.push({
// //   provide: RouteReuseStrategy,
// //   useClass: ReuseTabStrategy,
// //   deps: [ReuseTabService],
// // } as any);
//
// // #endregion
//
// // #endregion
//
// // Please refer to: https://ng.ant.design/docs/global-config/en#how-to-use
// // #region NG-ZORRO Config
//
// import {NzConfig, provideNzConfig} from 'ng-zorro-antd/core/config';
// import {provideHttpClient, withInterceptors} from "@angular/common/http";
// import {authSimpleInterceptor, provideAuth} from "@delon/auth";
// import {provideAnimations} from "@angular/platform-browser/animations";
// import {ICONS_AUTO} from "../style-icons-auto";
// import {ICONS} from "../style-icons";
// // import {DelonMockModule} from "@delon/mock";
//
// const ngZorroConfig: NzConfig = {};
//
// const zorroProvides = [provideNzConfig(ngZorroConfig)];
//
// // #endregion
//
// const providers: Array<Provider | EnvironmentProviders> = [
//   provideAnimations(),
//   // provideRouter(routes, ...routerFeatures),
//   provideAlain({config: alainConfig, i18nClass: I18NService, icons: [...ICONS_AUTO, ...ICONS]}),
//   provideNzConfig(ngZorroConfig),
//   provideAuth()
// ];
//
//
// @NgModule({
//   imports: [...alainModules, ...(environment.modules || [])]
// })
// export class GlobalConfigModule {
//   constructor(@Optional() @SkipSelf() parentModule: GlobalConfigModule) {
//     throwIfAlreadyLoaded(parentModule, 'GlobalConfigModule');
//   }
//
//   static forRoot(): ModuleWithProviders<GlobalConfigModule> {
//     return {
//       ngModule: GlobalConfigModule,
//       providers: [...zorroProvides]
//     };
//   }
// }
