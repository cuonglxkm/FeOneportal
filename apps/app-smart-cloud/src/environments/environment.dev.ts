import { Environment } from '@delon/theme';

export const environment = {
  production: false,
  useHash: true,
  api: {
    baseUrl: './',
    refreshTokenEnabled: true,
    refreshTokenType: 'auth-refresh'
  },
  baseUrl: 'https://idg-api-gw-dev.onsmartcloud.com',
  issuer: 'https://identity-dev.onsmartcloud.com',
  unitOfMeasureVpn: 'vpns2s',
} as Environment;