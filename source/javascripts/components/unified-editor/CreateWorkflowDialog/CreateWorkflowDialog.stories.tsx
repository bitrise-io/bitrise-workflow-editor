import { Meta, StoryObj } from '@storybook/react-webpack5';

import CreateWorkflowDialog from './CreateWorkflowDialog';

export default {
  component: CreateWorkflowDialog,
  args: {
    isOpen: true,
  },
  argTypes: {
    isOpen: { type: 'boolean' },
    onClose: { type: 'function' },
    onCreateWorkflow: { type: 'function' },
  },
} as Meta<typeof CreateWorkflowDialog>;

export const Default: StoryObj = {};
