import { Environment } from '@delon/theme';

export const environment = {
  production: true,
  useHash: true,
  api: {
    baseUrl: './',
    refreshTokenEnabled: true,
    refreshTokenType: 'auth-refresh'
  },
  baseUrl: 'https://idg-api-gw-dev.onsmartcloud.com',
  baseSCUrl: 'https://api-dev.onsmartcloud.com'
} as Environment;
