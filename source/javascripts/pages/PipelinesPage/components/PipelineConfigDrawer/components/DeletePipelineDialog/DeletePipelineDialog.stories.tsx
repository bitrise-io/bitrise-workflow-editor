import { Meta, StoryObj } from '@storybook/react';
import DeletePipelineDialog from './DeletePipelineDialog';

export default {
  component: DeletePipelineDialog,
  args: {
    isOpen: true,
    pipelineId: 'graph-pipeline',
  },
  argTypes: {
    onClose: { type: 'function' },
    onDeletePipeline: { type: 'function' },
  },
} as Meta<typeof DeletePipelineDialog>;

export const Default: StoryObj = {};
