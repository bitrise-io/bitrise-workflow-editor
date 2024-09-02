import { Meta, StoryObj } from '@storybook/react';
import RunWorkflowDialog from './RunWorkflowDialog';

export default {
  component: RunWorkflowDialog,
  args: {
    isOpen: true,
    defaultBranch: 'master',
    workflowId: 'primary-workflow',
  },
  argTypes: {
    isOpen: { type: 'boolean', control: { type: 'boolean' } },
    defaultBranch: { type: 'string' },
    workflowId: { type: 'string' },
    onClose: { type: 'function' },
    onAction: { type: 'function' },
  },
} as Meta<typeof RunWorkflowDialog>;

export const Default: StoryObj<typeof RunWorkflowDialog> = {};
