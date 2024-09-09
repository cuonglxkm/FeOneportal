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
  baseUrl: 'https://test-api.cloud.vnpt.vn',
  cms_baseUrl: 'https://test-cms.cloud.vnpt.vn',
  cms_token: '7800a01d4ae4b24528bfacb1fb44c31ebf4a61bbc19d5d743013f2f7a310e3e569c2e947632ef77305cf26ad4b045a83a1644eead134e95cc8357eba6dac57ba3b21303ff2e863a85ffe536b9c374885096735502aa52670ac12cc8b23e58814b414d385e947fa90499234e09c960414096d181b8fb47c3ef48468a41f224406',
  cloud_baseUrl: 'https://test.cloud.vnpt.vn/',
  sso: {
    issuer: 'https://test-identity.cloud.vnpt.vn',
    clientId: 'frontend-client',
    callback: 'https://test-console.cloud.vnpt.vn/passport/callback/oneportal',
    logout_callback: 'https://test-console.cloud.vnpt.vn',
    scope: 'openid email roles offline_access',
    domain: '.cloud.vnpt.vn',
    issuerDomain: 'test-identity.cloud.vnpt.vn'
  },
  recaptcha: {
    siteKey: '6LcDjSAqAAAAAIdOslfhii4AGpWxIkT3tmaCDEDL',
  },
  modules: [DelonMockModule.forRoot({ data: MOCKDATA })]
} as Environment;

