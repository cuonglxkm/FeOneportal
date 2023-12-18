import { Environment } from '@delon/theme';
import {DelonMockModule} from "@delon/mock";
import * as MOCKDATA from "@_mock";

// export const environment = {
//   production: true,
//   useHash: true,
//   api: {
//     baseUrl: './',
//     refreshTokenEnabled: true,
//     refreshTokenType: 'auth-refresh'
//   },
//   baseUrl: 'https://api.onsmartcloud.com',
//   sso: {
//     issuer: 'https://identity.onsmartcloud.com',
//     clientId: 'frontend-client',
//     callback: 'https://oneportal.onsmartcloud.com/passport/callback/oneportal',
//     logout_callback: 'https://oneportal.onsmartcloud.com',
//     scope: 'openid email roles',
//   },
// } as Environment;

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
  baseUrl: env['baseUrl'] || 'http://localhosst:5151/api/v1',
  sso: {
    issuer: env['sso']['issuer'] || 'https://identity.onsmartcloud.com',
    clientId: env['sso']['clientId'] || 'frontend-client',
    callback: env['sso']['callback'] || 'https://oneportal.onsmartcloud.com/passport/callback/oneportal',
    logout_callback: env['sso']['logout_callback'] || 'https://oneportal.onsmartcloud.com',
    scope: env['sso']['scope'] || 'openid email roles',
  },
  modules: [DelonMockModule.forRoot({ data: MOCKDATA })]
} as Environment;

