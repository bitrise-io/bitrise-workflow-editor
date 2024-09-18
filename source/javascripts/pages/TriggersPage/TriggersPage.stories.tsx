import { Meta, StoryObj } from '@storybook/react';

import { makeNotificationMetadataEndpoint } from '@/components/ConfigurationYmlSource/ConfigurationYmlSource.mswMocks';
import { MockYml, MockYmlWithTriggers } from '@/core/models/BitriseYml.mocks';
import TriggersPage from './TriggersPage';

export default {
  component: TriggersPage,
  args: {
    onChange: () => {},
    yml: MockYml,
  },
  argTypes: {
    onChange: { type: 'function' },
  },
  parameters: {
    msw: [...makeNotificationMetadataEndpoint()],
  },
} as Meta<typeof TriggersPage>;

export const TriggersPageEmptyState: StoryObj<typeof TriggersPage> = {};

export const TriggersPageWithTriggerMap: StoryObj<typeof TriggersPage> = {
  args: {
    yml: MockYmlWithTriggers,
  },
};
