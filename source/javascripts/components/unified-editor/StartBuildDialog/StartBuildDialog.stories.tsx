import { Meta, StoryObj } from '@storybook/react-vite';

import BuildApiMocks from '@/core/api/BuildApi.mswMocks';

import StartBuildDialog from './StartBuildDialog';

export default {
  component: StartBuildDialog,
  args: {
    isOpen: true,
    workflowId: 'primary-workflow',
  },
  argTypes: {
    pipelineId: { type: 'string' },
    workflowId: { type: 'string' },
    isOpen: { type: 'boolean', control: { type: 'boolean' } },
    onClose: { type: 'function' },
  },
} as Meta<typeof StartBuildDialog>;

type Story = StoryObj<typeof StartBuildDialog>;

export const Pipeline: Story = {
  args: {
    pipelineId: 'pipeline-1',
    workflowId: undefined,
  },

  beforeEach({ msw }) {
    msw.use(BuildApiMocks.startBuild('success'));
  },
};

export const Workflow: Story = {
  beforeEach({ msw }) {
    msw.use(BuildApiMocks.startBuild('success'));
  },
};

export const Error: Story = {
  beforeEach({ msw }) {
    msw.use(BuildApiMocks.startBuild('error'));
  },
};
