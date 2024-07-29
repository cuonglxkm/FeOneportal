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
  baseUrl: 'https://idg-api-gw-dev.onsmartcloud.com',
  cms_baseUrl: 'https://cms.onsmartcloud.com',
  cms_token: '6cb31a40836230e87730e36a150860fd22482b0458dedb8e5e42fb332048b475335bbe1debd1b3d1bea5604ff8d2049ebb78765c0fd62fd7058285bb1051d2cf333f3e10a0f722c7dfe4125246f9761312afd6b8b6370c5ea346f24c4dcb6047472b568e21dc9ce75ed458150cd91a72e72adc088d69fe96430fb8cf981cc51d',
  cloud_baseUrl: 'https://vnptcloud.onsmartcloud.com/',
  sso: {
    issuer: 'https://identity-dev.onsmartcloud.com',
    clientId: 'frontend-client',
    callback: 'https://oneportal-dev.onsmartcloud.com/passport/callback/oneportal',
    logout_callback: 'https://oneportal-dev.onsmartcloud.com',
    scope: 'openid email roles offline_access',
    domain: '.onsmartcloud.com',
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
