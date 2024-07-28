import { Environment } from '@delon/theme';

export const environment = {
  production: false,
  useHash: true,
  api: {
    baseUrl: './',
    refreshTokenEnabled: true,
    refreshTokenType: 'auth-refresh'
  },
  baseUrl: 'https://api.cloud.vnpt.vn',
  issuer: 'https://identity.cloud.vnpt.vn',
  unitOfMeasureVpn: 'vpns2s',
  domain: '.cloud.vnpt.vn',
  cms_baseUrl: 'https://cms.cloud.vnpt.vn',
  cloud_baseUrl: 'https://cloud.vnpt.vn',
} as Environment;