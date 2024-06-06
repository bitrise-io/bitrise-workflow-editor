import { Meta, StoryObj } from '@storybook/react';

import EnvVarsPage from './SecretsPage';

export default {
  component: EnvVarsPage,
  args: {
    envVars: [
      { key: 'key1', value: 'value1', id: '1' },
      { key: 'key2', value: 'value2', id: '2' },
      { key: 'key3', value: 'value3', id: '3' },
    ],
    secrets: [],
  },
} as Meta<typeof EnvVarsPage>;

export const EnvVarsPageEmptyState: StoryObj<typeof EnvVarsPage> = {};

export const EnvVarsPageWithTriggerMap: StoryObj<typeof EnvVarsPage> = {
  args: {},
};
