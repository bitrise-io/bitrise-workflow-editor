import { Meta, StoryObj } from '@storybook/react';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';
import { mockYml } from '../ChainWorkflowDrawer/ChainWorkflowDrawer.mocks';
import CreateWorkflowDialog from './CreateWorkflowDialog';

export default {
  component: CreateWorkflowDialog,
  args: {
    isOpen: true,
  },
  argTypes: {
    isOpen: { type: 'boolean' },
    onClose: { type: 'function' },
    onCreate: { type: 'function' },
  },
  decorators: [
    (Story) => (
      <BitriseYmlProvider yml={mockYml}>
        <Story />
      </BitriseYmlProvider>
    ),
  ],
} as Meta<typeof CreateWorkflowDialog>;

export const Default: StoryObj = {};
