import { Meta, StoryObj } from '@storybook/react-vite';
import { set } from 'es-toolkit/compat';

import {
  deleteSecretError,
  getProtectedSecretPeek,
  getSecrets,
  getSecretsFromLocal,
  upsertSecretError,
} from '@/core/api/SecretApi.mswMocks';

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

// Add or edit a Secret and save it to see the alert.
export const SecretsSaveSizeLimit: Story = {
  beforeEach({ msw }) {
    msw.use(
      ...upsertSecretError(422, {
        code: 'secrets_size_limit_exceeded',
        error_msg:
          "Validation failed: This project's Secrets and its workspace's Secrets can take up 100KB in total. Delete Secrets you no longer use, or contact support to raise the limit.",
      }),
    );
  },
};

// Add a Secret named `opts` and save it to see the alert.
export const SecretsSaveValidationError: Story = {
  beforeEach({ msw }) {
    msw.use(
      ...upsertSecretError(422, {
        error_msg: 'Validation failed: Name opts is reserved. Choose a different name.',
      }),
    );
  },
};

export const SecretsSaveServerError: Story = {
  beforeEach({ msw }) {
    msw.use(...upsertSecretError(500, { error_msg: 'Internal Server Error' }));
  },
};

export const SecretsDeleteNotFound: Story = {
  beforeEach({ msw }) {
    msw.use(deleteSecretError(404, { error_msg: 'Not Found' }));
  },
};
