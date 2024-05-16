import { Environment } from '@delon/theme';

export const environment = {
  production: true,
  useHash: true,
  api: {
    baseUrl: './',
    refreshTokenEnabled: true,
    refreshTokenType: 'auth-refresh'
  },
  baseUrl: 'https://api-dev.onsmartcloud.com',
  unitOfMeasureVpn: 'vpns2s',
} as Environment;
