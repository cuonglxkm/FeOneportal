import { Environment } from '@delon/theme';

export const environment = {
  production: false,
  useHash: true,
  api: {
    baseUrl: './',
    refreshTokenEnabled: true,
    refreshTokenType: 'auth-refresh'
  },
  baseUrl: 'https://test-api.cloud.vnpt.vn',
  issuer: 'https://test-identity.cloud.vnpt.vn',
  unitOfMeasureVpn: 'vpns2s',
  domain: '.cloud.vnpt.vn',
  cms_baseUrl: 'https://test-cms.cloud.vnpt.vn',
  cloud_baseUrl: 'https://test.cloud.vnpt.vn',
} as Environment;