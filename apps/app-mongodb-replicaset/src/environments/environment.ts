// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { DelonMockModule } from '@delon/mock';
import { Environment } from '@delon/theme';

export const environment = {
  production: false,
  useHash: true,
  api: {
    baseUrl: './',
    refreshTokenEnabled: true,
    refreshTokenType: 'auth-refresh'
  },
  baseUrl: "http://localhost:16008",
  // baseUrl: 'https://idg-api-gw.onsmartcloud.com'
  // baseUrl: 'https://api.onsmartcloud.com',
  // modules: [DelonMockModule.forRoot({ data: MOCKDATA })]
  baseUrlApiGw: 'https://idg-api-gw.onsmartcloud.com',
  baseUrlWs: "http://localhost:16011",
} as Environment;

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
