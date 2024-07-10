// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { DelonMockModule } from '@delon/mock';
import { Environment } from '@delon/theme';

import * as MOCKDATA from '@_mock';

export const environment = {
  production: false,
  useHash: true,
  api: {
    baseUrl: './',
    refreshTokenEnabled: true,
    refreshTokenType: 'auth-refresh'
  },
  baseUrl: 'https://api-dev.onsmartcloud.com',
  sso: {
    issuer: 'https://identity-dev.onsmartcloud.com',
    clientId: 'frontend-client',
    callback: 'https://oneportal-dev.onsmartcloud.com/passport/callback/oneportal',
    logout_callback: 'https://oneportal-dev.onsmartcloud.com',
    scope: 'openid email roles offline_access',
  },
  recaptcha: {
    siteKey: '6LfueB8cAAAAAD74PxsPKL7-GVr0T7dUoxuBL4iR',
  },
  modules: [DelonMockModule.forRoot({ data: MOCKDATA })]
} as Environment;

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
