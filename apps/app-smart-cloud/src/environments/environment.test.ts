import { Environment } from '@delon/theme';

export const environment = {
  production: false,
  useHash: true,
  api: {
    baseUrl: './',
    refreshTokenEnabled: true,
    refreshTokenType: 'auth-refresh'
  },
  baseUrl: 'https://idg-api-gw.onsmartcloud.com',
  issuer: 'https://identity.onsmartcloud.com',
  unitOfMeasureVpn: 'vpns2s',
  domain: '.onsmartcloud.com',
  cms_baseUrl: 'https://cms.onsmartcloud.com',
  vnpt_cloud_baseUrl: 'https://vnptcloud.onsmartcloud.com',
} as Environment;