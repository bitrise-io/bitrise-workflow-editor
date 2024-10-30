import { Meta, StoryObj } from '@storybook/react';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';
import { MockYml } from '@/core/models/BitriseYml.mocks';
import CreatePipelineDialog from './CreatePipelineDialog';

export default {
  component: CreatePipelineDialog,
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
      <BitriseYmlProvider yml={MockYml}>
        <Story />
      </BitriseYmlProvider>
    ),
  ],
} as Meta<typeof CreatePipelineDialog>;

export const Default: StoryObj = {};
