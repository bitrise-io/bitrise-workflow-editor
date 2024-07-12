import { Meta, StoryObj } from '@storybook/react';
import DeleteWorkflowDialog from './DeleteWorkflowDialog';

export default {
  component: DeleteWorkflowDialog,
  args: {
    workflowId: 'unused-workflow',
    isOpen: true,
  },
  argTypes: {
    workflowId: { type: 'string' },
    isOpen: { type: 'boolean' },
    onClose: { type: 'function' },
    onDelete: { type: 'function' },
  },
} as Meta<typeof DeleteWorkflowDialog>;

export const Default: StoryObj = {};
