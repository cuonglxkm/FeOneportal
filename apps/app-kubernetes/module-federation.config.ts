import { ModuleFederationConfig } from '@nx/webpack';

const config: ModuleFederationConfig = {
  name: 'app-kubernetes',
  exposes: {
    './Module': './apps/app-kubernetes/src/app/remote-entry/entry.module.ts',
  },
};

export default config;
