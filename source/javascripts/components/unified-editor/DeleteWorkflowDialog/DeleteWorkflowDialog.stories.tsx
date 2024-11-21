import { Meta, StoryObj } from '@storybook/react';
import { withBitriseYml } from '@/contexts/BitriseYmlProvider';
import { MockYml } from '@/core/models/BitriseYml.mocks';
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
  decorators: (Story) => withBitriseYml(MockYml, Story),
} as Meta<typeof DeleteWorkflowDialog>;

export const Default: StoryObj = {};
