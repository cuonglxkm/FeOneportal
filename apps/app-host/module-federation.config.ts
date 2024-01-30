import { ModuleFederationConfig } from '@nx/webpack';

const config: ModuleFederationConfig = {
  name: 'app-host',
  remotes: ['app-kafka'],
};

export default config;
