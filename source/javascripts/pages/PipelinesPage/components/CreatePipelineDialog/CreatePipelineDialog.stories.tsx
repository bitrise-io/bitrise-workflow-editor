import { Meta, StoryObj } from '@storybook/react-webpack5';

import CreatePipelineDialog from './CreatePipelineDialog';

export default {
  component: CreatePipelineDialog,
  args: {
    isOpen: true,
  },
  argTypes: {
    isOpen: { type: 'boolean' },
    onClose: { type: 'function' },
    onCreatePipeline: { type: 'function' },
  },
} as Meta<typeof CreatePipelineDialog>;

export const Default: StoryObj = {};
