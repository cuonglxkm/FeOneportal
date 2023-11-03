import { ModuleFederationConfig } from '@nx/webpack';

const config: ModuleFederationConfig = {
  name: 'app-smart-cloud',
  exposes: {
    './Module': './apps/app-smart-cloud/src/app/remote-entry/entry.module.ts',
  },
};

export default config;
