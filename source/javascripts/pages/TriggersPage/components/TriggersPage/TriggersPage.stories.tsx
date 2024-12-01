import { Meta, StoryObj } from '@storybook/react';

import { makeNotificationMetadataEndpoint } from '@/components/ConfigurationYmlSource/ConfigurationYmlSource.mswMocks';
import TriggersPage from './TriggersPage';

export default {
  component: TriggersPage,
  args: {
    yml: TEST_BITRISE_YML,
  },
  argTypes: {
    onChange: { type: 'function' },
  },
  parameters: {
    msw: [...makeNotificationMetadataEndpoint()],
  },
} as Meta<typeof TriggersPage>;

export const TriggersPageEmptyState: StoryObj<typeof TriggersPage> = {
  args: {
    yml: { ...TEST_BITRISE_YML, trigger_map: undefined },
  },
};

export const TriggersPageWithTriggerMap: StoryObj<typeof TriggersPage> = {};
