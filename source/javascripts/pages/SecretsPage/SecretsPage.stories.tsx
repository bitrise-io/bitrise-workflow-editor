import { Meta, StoryObj } from '@storybook/react-vite';
import { set } from 'es-toolkit/compat';

import { getProtectedSecretPeek, getSecrets, getSecretsFromLocal } from '@/core/api/SecretApi.mswMocks';

import SecretsPage from './SecretsPage';

export default {
  component: SecretsPage,

  beforeEach({ msw }) {
    msw.use(getSecrets(), getSecretsFromLocal());
  },
} as Meta<typeof SecretsPage>;

type Story = StoryObj<typeof SecretsPage>;

export const SecretsPageEmptyState: Story = {
  beforeEach({ msw }) {
    msw.use(getSecretsFromLocal([]));
  },
};

export const Secrets: Story = {};

export const SecretsProtectedPeek: Story = {
  beforeEach({ msw }) {
    msw.use(
      getSecrets([
        {
          id: crypto.randomUUID(),
          name: 'OPENAI_API_KEY',
          scope: 'app',
          is_protected: true,
          expand_in_step_inputs: false,
          exposed_for_pull_requests: false,
        },
      ]),
      getProtectedSecretPeek(),
    );
    set(window, 'localFeatureFlags.protected-secret-peek', true);
    return () => set(window, 'localFeatureFlags.protected-secret-peek', false);
  },
};

export const SecretsShared: Story = {
  beforeEach: () => {
    set(window, 'parent.globalProps.account.sharedResourcesAvailable', true);
    return () => {
      window.parent.globalProps = undefined;
    };
  },
};
