import { ModuleFederationConfig } from '@nx/webpack';

const config: ModuleFederationConfig = {
  name: 'app-k8s',
  exposes: {
    './Module': './apps/app-k8s/src/app/remote-entry/entry.module.ts',
  },
};

export default config;
