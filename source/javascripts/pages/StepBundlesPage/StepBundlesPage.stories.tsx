import { Box } from '@bitrise/bitkit';
import { Meta, StoryObj } from '@storybook/react';
import { set } from 'es-toolkit/compat';

import StepBundlesPage from './StepBundlesPage';

export default {
  component: StepBundlesPage,
  beforeEach: () => {
    set(window, 'parent.globalProps.featureFlags.account.enable-wfe-step-bundles-when-to-run', true);
  },
  parameters: {
    layout: 'fullscreen',
  },
  decorators: (Story) => (
    <Box h="100dvh">
      <Story />
    </Box>
  ),
} as Meta<typeof StepBundlesPage>;

type Story = StoryObj<typeof StepBundlesPage>;

export const Default: Story = {};
