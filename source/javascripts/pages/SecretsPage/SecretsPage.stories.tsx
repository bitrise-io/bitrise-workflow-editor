import { Meta } from '@storybook/react';
import { getSecrets, getSecretsFromLocal } from '@/core/api/SecretApi.mswMocks';
import SecretsPage from './SecretsPage';

export default {
  component: SecretsPage,
  parameters: {
    msw: {
      handlers: [getSecrets(), getSecretsFromLocal()],
    },
  },
} as Meta<typeof SecretsPage>;

export const SecretsPageEmptyState = {
  parameters: {
    msw: { handlers: [getSecretsFromLocal([])] },
  },
};

export const Secrets = {};

export const SecretsShared = {
  beforeEach: () => {
    window.parent.globalProps = {
      account: {
        sharedResourcesAvailable: true,
      },
    } as any;

    return () => {
      window.parent.globalProps = undefined;
    };
  },
};
