import { Environment } from '@delon/theme';
import {DelonMockModule} from "@delon/mock";
import * as MOCKDATA from "@_mock";

// @ts-ignore
let env = window['env'];
export const environment = {
  production: true,
  useHash: true,
  api: {
    baseUrl: './',
    refreshTokenEnabled: true,
    refreshTokenType: 'auth-refresh'
  },
  // @ts-ignore
  baseUrl: 'https://idg-api-gw.onsmartcloud.com',
  cms_baseUrl: 'https://cms.onsmartcloud.com',
  cms_token: '6cb31a40836230e87730e36a150860fd22482b0458dedb8e5e42fb332048b475335bbe1debd1b3d1bea5604ff8d2049ebb78765c0fd62fd7058285bb1051d2cf333f3e10a0f722c7dfe4125246f9761312afd6b8b6370c5ea346f24c4dcb6047472b568e21dc9ce75ed458150cd91a72e72adc088d69fe96430fb8cf981cc51d',
  cloud_baseUrl: 'https://vnptcloud.onsmartcloud.com/',
  sso: {
    issuer: 'https://identity.onsmartcloud.com',
    clientId: 'frontend-client',
    callback: 'https://oneportal.onsmartcloud.com/passport/callback/oneportal',
    logout_callback: 'https://oneportal.onsmartcloud.com',
    scope: 'openid email roles offline_access',
    domain: '.onsmartcloud.com',
    issuerDomain: 'identity.onsmartcloud.com'
  },
  recaptcha: {
    siteKey: '6LfueB8cAAAAAD74PxsPKL7-GVr0T7dUoxuBL4iR',
  },
  modules: [DelonMockModule.forRoot({ data: MOCKDATA })]
} as Environment;

