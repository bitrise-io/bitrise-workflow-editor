import { Meta, StoryObj } from '@storybook/react';
import { withBitriseYml } from '@/contexts/BitriseYmlProvider';
import { mockYml } from '../../WorkflowsPage.mocks';
import DeleteWorkflowDialog from './DeleteWorkflowDialog';

export default {
  component: DeleteWorkflowDialog,
  args: {
    isOpen: true,
  },
  argTypes: {
    isOpen: { type: 'boolean' },
    onClose: { type: 'function' },
    onDelete: { type: 'function' },
  },
  decorators: (Story) => withBitriseYml(mockYml, Story),
} as Meta<typeof DeleteWorkflowDialog>;

export const Default: StoryObj = {};
