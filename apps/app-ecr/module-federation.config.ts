import { ModuleFederationConfig } from '@nx/webpack';

const config: ModuleFederationConfig = {
  name: 'app-ecr',
  exposes: {
    './Module': 'apps/app-ecr/src/app/remote-entry/entry.module.ts',
  },
};

export default config;
