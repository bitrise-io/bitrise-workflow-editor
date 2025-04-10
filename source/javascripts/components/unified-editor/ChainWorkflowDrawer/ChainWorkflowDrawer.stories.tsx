import { Meta, StoryObj } from '@storybook/react';
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
} as Meta<typeof ChainWorkflowDrawer>;

export const Default: StoryObj = {};

export const Empty: StoryObj = {
  parameters: {
    bitriseYml: {
      ...TEST_BITRISE_YML,
      workflows: {},
    },
  },
};
