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
  sso: {
    issuer: 'https://identity.onsmartcloud.com',
    clientId: 'frontend-client',
    callback: 'https://oneportal.onsmartcloud.com/passport/callback/oneportal',
    logout_callback: 'https://oneportal.onsmartcloud.com',
    domain: '.onsmartcloud.com',
    scope: 'openid email roles offline_access',
  },
  recaptcha: {
    siteKey: '6LfueB8cAAAAAD74PxsPKL7-GVr0T7dUoxuBL4iR',
  },
  modules: [DelonMockModule.forRoot({ data: MOCKDATA })]
} as Environment;

