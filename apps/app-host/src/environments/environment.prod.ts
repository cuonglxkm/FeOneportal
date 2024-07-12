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
  baseUrl: 'https://api-cloud.vnpt.vn',
  sso: {
    issuer: 'https://identity-cloud.vnpt.vn',
    clientId: 'frontend-client',
    callback: 'https://cloud.vnpt.vn/passport/callback/oneportal',
    logout_callback: 'https://cloud.vnpt.vn',
    scope: 'openid email roles offline_access',
  },
  recaptcha: {
    siteKey: '6LfueB8cAAAAAD74PxsPKL7-GVr0T7dUoxuBL4iR',
  },
  modules: [DelonMockModule.forRoot({ data: MOCKDATA })]
} as Environment;

