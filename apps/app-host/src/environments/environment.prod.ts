import { Environment } from '@delon/theme';
import {DelonMockModule} from "@delon/mock";
import * as MOCKDATA from "@_mock";

export const environment = {
  production: true,
  useHash: true,
  api: {
    baseUrl: './',
    refreshTokenEnabled: true,
    refreshTokenType: 'auth-refresh'
  },
  baseUrl: 'https://api.onsmartcloud.com',
  sso: {
    issuer: 'https://identity.onsmartcloud.com',
    clientId: 'frontend-client',
    callback: 'https://oneportal.onsmartcloud.com/passport/callback/oneportal',
    logout_callback: 'https://oneportal.onsmartcloud.com',
    scope: 'openid email roles',
  },
} as Environment;

