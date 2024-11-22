import { Meta, StoryObj } from '@storybook/react';
import { withBitriseYml } from '@/contexts/BitriseYmlProvider';
import ChainWorkflowDrawer from './ChainWorkflowDrawer';

export default {
  component: ChainWorkflowDrawer,
  args: {
    workflowId: 'wf1',
    isOpen: true,
  },
  argTypes: {
    workflowId: { type: 'string' },
    isOpen: { control: 'boolean', type: 'boolean' },
    onOpen: { type: 'function' },
    onClose: { type: 'function' },
    onChainWorkflow: { type: 'function' },
  },
  decorators: (Story) => withBitriseYml(TEST_BITRISE_YML, Story),
} as Meta<typeof ChainWorkflowDrawer>;

export const Default: StoryObj = {};

export const Empty: StoryObj = {
  decorators: (Story) => withBitriseYml({ ...TEST_BITRISE_YML, workflows: {} }, Story),
};
