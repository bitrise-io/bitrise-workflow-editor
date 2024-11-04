import { Meta, StoryObj } from '@storybook/react';
import { withBitriseYml } from '@/contexts/BitriseYmlProvider';
import { MockYml } from '@/core/models/BitriseYml.mocks';
import DeletePipelineDialog from './DeletePipelineDialog';

export default {
  component: DeletePipelineDialog,
  args: {
    isOpen: true,
  },
  argTypes: {
    isOpen: { type: 'boolean' },
    onClose: { type: 'function' },
    onDeletePipeline: { type: 'function' },
  },
  parameters: {
    query: {
      pipeline_id: 'pl-1',
    },
  },
  decorators: (Story) => withBitriseYml(MockYml, Story),
} as Meta<typeof DeletePipelineDialog>;

export const Default: StoryObj = {};
