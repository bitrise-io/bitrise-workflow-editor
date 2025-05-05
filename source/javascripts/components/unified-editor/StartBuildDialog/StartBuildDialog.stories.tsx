import { Meta } from '@storybook/react';

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

export const Pipeline = {
  args: {
    pipelineId: 'pipeline-1',
    workflowId: undefined,
  },
  parameters: {
    msw: {
      handlers: [BuildApiMocks.startBuild('success')],
    },
  },
};

export const Workflow = {
  parameters: {
    msw: {
      handlers: [BuildApiMocks.startBuild('success')],
    },
  },
};

export const Error = {
  parameters: {
    msw: {
      handlers: [BuildApiMocks.startBuild('error')],
    },
  },
};
