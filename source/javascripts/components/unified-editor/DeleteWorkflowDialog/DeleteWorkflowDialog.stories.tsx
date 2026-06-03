import { Meta, StoryObj } from '@storybook/react-vite';

import DeleteWorkflowDialog from './DeleteWorkflowDialog';

export default {
  component: DeleteWorkflowDialog,
  args: {
    isOpen: true,
    workflowId: 'wf-1',
  },
  argTypes: {
    isOpen: { type: 'boolean' },
    onClose: { type: 'function' },
    onDeleteWorkflow: { type: 'function' },
  },
} as Meta<typeof DeleteWorkflowDialog>;

export const Default: StoryObj = {};
