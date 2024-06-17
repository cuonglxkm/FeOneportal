import { Environment } from '@delon/theme';


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
  baseUrl: 'https://idg-api-gw-dev.onsmartcloud.com',
  baseUrlApiGw: 'https://idg-api-gw-dev.onsmartcloud.com',
  baseUrlWs: 'https://idg-api-gw-dev.onsmartcloud.com',
} as Environment;
