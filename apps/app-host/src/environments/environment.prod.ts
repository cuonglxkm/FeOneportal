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
  baseUrl: 'https://api.cloud.vnpt.vn',
  sso: {
    issuer: 'https://identity.cloud.vnpt.vn',
    clientId: 'frontend-client',
    callback: 'https://console.cloud.vnpt.vn/passport/callback/oneportal',
    logout_callback: 'https://console.cloud.vnpt.vn',
    scope: 'openid email roles offline_access',
    domain: '.cloud.vnpt.vn',
    cms_baseUrl: 'https://cms..cloud.vnpt.vn',
    vnpt_cloud_baseUrl: 'https://cloud.vnpt.vn',
    cloud_baseUrl: 'https://cloud.vnpt.vn/'
  },
  recaptcha: {
    siteKey: '6LciGRgqAAAAAPvyRuPN5hcUa9LSuvwss7Iv11lE',
  },
  modules: [DelonMockModule.forRoot({ data: MOCKDATA })]
} as Environment;

