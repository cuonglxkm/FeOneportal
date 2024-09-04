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
  // baseUrl: 'https://idg-api-gw-dev.onsmartcloud.com',
  //baseUrl: 'http://localhost:3000',
  // issuer: 'https://identity-dev.onsmartcloud.com',
  // baseUrl: 'https://test-api.cloud.vnpt.vn',
  // issuer: 'https://test-identity.cloud.vnpt.vn',
  baseUrl: 'https://test-api.cloud.vnpt.vn',
  issuer: 'https://test-identity.cloud.vnpt.vn',
  //issuer: 'https://localhost:1000',
  unitOfMeasureVpn: 'vpns2s',
  domain: '.onsmartcloud.com',
  cms_baseUrl: 'https://cms.onsmartcloud.com',
  cloud_baseUrl: 'https://vnptcloud.onsmartcloud.com',
  // modules: [DelonMockModule.forRoot({ data: MOCKDATA })]
} as Environment;

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
