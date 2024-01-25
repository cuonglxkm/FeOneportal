import { ModuleFederationConfig } from '@nx/webpack';

const config: ModuleFederationConfig = {
  name: 'app-kafka',
  exposes: {
    './Module': 'apps/app-kafka/src/app/remote-entry/entry.module.ts',
  },
};

export default config;
