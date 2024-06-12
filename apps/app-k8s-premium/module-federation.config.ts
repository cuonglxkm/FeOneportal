import { ModuleFederationConfig } from '@nx/webpack';

const config: ModuleFederationConfig = {
  name: 'app-k8s-premium',
  exposes: {
    './Module': './apps/app-k8s-premium/src/app/remote-entry/entry.module.ts',
  },
};

export default config;
