import { Meta, StoryObj } from '@storybook/react';
import { mockYml } from '../../WorkflowsPage.mocks';
import DeleteWorkflowDialog from './DeleteWorkflowDialog';
import { withBitriseYml } from '@/contexts/BitriseYmlProvider';

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
