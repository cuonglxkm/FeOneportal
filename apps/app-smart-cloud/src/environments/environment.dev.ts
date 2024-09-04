import { Environment } from '@delon/theme';

export const environment = {
  production: false,
  useHash: true,
  api: {
    baseUrl: './',
    refreshTokenEnabled: true,
    refreshTokenType: 'auth-refresh'
  },
  // baseUrl: 'https://idg-api-gw-dev.onsmartcloud.com',
  // issuer: 'https://identity-dev.onsmartcloud.com',
  baseUrl: 'https://test-api.cloud.vnpt.vn',
  issuer: 'https://test-identity.cloud.vnpt.vn',
  unitOfMeasureVpn: 'vpns2s',
  domain: '.onsmartcloud.com',
  cms_baseUrl: 'https://cms.onsmartcloud.com',
  cloud_baseUrl: 'https://vnptcloud.onsmartcloud.com',
} as Environment;