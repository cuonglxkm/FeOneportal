import { ModuleFederationConfig } from '@nx/webpack';

const config: ModuleFederationConfig = {
  name: 'app-mongodb-replicaset',
  exposes: {
    './Module':
      'apps/app-mongodb-replicaset/src/app/remote-entry/entry.module.ts',
  },
};

export default config;
