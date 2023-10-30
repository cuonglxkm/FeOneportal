import { ModuleFederationConfig } from '@nx/webpack';

const config: ModuleFederationConfig = {
  name: 'app-dashboard',
  exposes: {
    './Routes': 'apps/app-dashboard/src/app/remote-entry/entry.routes.ts',
  },
};

export default config;
